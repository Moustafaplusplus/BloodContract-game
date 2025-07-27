import { Weapon, Armor, VIPPackage } from '../models/Shop.js';
import { Character } from '../models/Character.js';
import { InventoryItem } from '../models/Inventory.js';
import { User } from '../models/User.js';
import { BlackcoinPackage, BlackcoinTransaction } from '../models/Blackcoin.js';
import { SpecialItem } from '../models/SpecialItem.js';
import { sequelize } from '../config/db.js';

export class SpecialShopService {
  static async getAllWeapons(filter = {}) {
    return await Weapon.findAll({ where: filter });
  }
  static async getAllArmors(filter = {}) {
    return await Armor.findAll({ where: filter });
  }
  
  static async getAllSpecialItems(filter = {}) {
    return await SpecialItem.findAll({ where: { ...filter, isAvailable: true } });
  }
  static async purchaseVIP(userId, packageId) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('المستخدم غير موجود');
    const char = await Character.findOne({ where: { userId } });
    if (!char) throw new Error('الشخصية غير موجودة');
    const pkg = await VIPPackage.findByPk(packageId);
    if (!pkg || !pkg.isActive) throw new Error('باقة VIP غير متاحة');
    if (char.blackcoins < pkg.price) throw new Error('لا تملك عملة سوداء كافية');
    char.blackcoins -= pkg.price;
    // VIP expiry logic now on character
    const now = new Date();
    let newExpiry = now;
    const durationMs = pkg.durationDays * 24 * 60 * 60 * 1000;
    if (char.vipExpiresAt && char.vipExpiresAt > now) {
      newExpiry = new Date(char.vipExpiresAt.getTime() + durationMs);
    } else {
      newExpiry = new Date(now.getTime() + durationMs);
    }
    char.vipExpiresAt = newExpiry;
    await char.save();
    return { vipExpiresAt: char.vipExpiresAt, blackcoinsSpent: pkg.price, newBlackcoinBalance: char.blackcoins };
  }
  static async getBlackcoinPackages() {
    return await BlackcoinPackage.findAll({
      where: { isActive: true },
      order: [['usdPrice', 'ASC']]
    });
  }
  static async purchaseBlackcoin(userId, packageId) {
    const t = await sequelize.transaction();
    try {
      let user = await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
      let char = await Character.findOne({ where: { userId }, transaction: t, lock: t.LOCK.UPDATE });
      if (!user) {
        throw new Error('المستخدم غير موجود');
      }
      if (!char) {
        throw new Error('الشخصية غير موجودة');
      }
      let pkg = await BlackcoinPackage.findByPk(packageId, { transaction: t });
      let totalBlackcoins = 100;
      let pkgName = 'افتراضي';
      let pkgId = packageId ?? 'default';
      if (pkg && pkg.isActive) {
        totalBlackcoins = pkg.blackcoinAmount + (pkg.bonus || 0);
        pkgName = pkg.name;
        pkgId = pkg.id;
      }
      char.blackcoins += totalBlackcoins;
      await char.save({ transaction: t });
      await BlackcoinTransaction.create({
        userId,
        amount: totalBlackcoins,
        type: 'PURCHASE',
        description: `شراء باقة ${pkgName}`,
        transactionId: 'mock-' + Date.now() + '-' + userId
      }, { transaction: t });
      await t.commit();
      return {
        package: { id: pkgId, name: pkgName, blackcoinAmount: totalBlackcoins },
        blackcoinsGranted: totalBlackcoins,
        newBlackcoinBalance: char.blackcoins
      };
    } catch (error) {
      await t.rollback();
      console.error('purchaseBlackcoin error:', error);
      throw new Error('فشل شراء البلاك كوين');
    }
  }
  static async purchaseSpecialItem(userId, itemId, quantity = 1) {
    const char = await Character.findOne({ where: { userId } });
    if (!char) throw new Error('المستخدم غير موجود');
    let item = await Weapon.findOne({ where: { id: itemId, currency: 'blackcoin' } });
    let slot = 'weapon';
    if (!item) {
      item = await Armor.findOne({ where: { id: itemId, currency: 'blackcoin' } });
      slot = 'armor';
    }
    if (!item) throw new Error('العنصر غير موجود');
    const totalPrice = item.price * quantity;
    if (char.blackcoins < totalPrice) throw new Error('لا تملك عملة سوداء كافية');
    char.blackcoins -= totalPrice;
    await char.save();
    const invItem = await InventoryItem.findOne({ where: { userId, itemType: slot, itemId } });
    if (invItem) {
      await invItem.update({ quantity: invItem.quantity + quantity });
    } else {
      await InventoryItem.create({ userId, itemType: slot, itemId, quantity });
    }
    return { message: 'تم شراء العنصر الخاص', itemId, quantity, remainingBlackcoins: char.blackcoins };
  }
} 