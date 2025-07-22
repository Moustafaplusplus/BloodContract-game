import { Weapon, Armor } from '../models/Shop.js';
import { Character } from '../models/Character.js';
import { InventoryItem } from '../models/Inventory.js';
import { User } from '../models/User.js';

export class ShopService {
  // Get all weapons (optionally filtered)
  static async getAllWeapons(filter = {}) {
    return await Weapon.findAll({ where: { ...filter, currency: 'money' } });
  }

  // Get all armors (optionally filtered)
  static async getAllArmors(filter = {}) {
    return await Armor.findAll({ where: { ...filter, currency: 'money' } });
  }

  // Get all weapons for admin (with full details)
  static async getAllWeaponsForAdmin() {
    const weapons = await Weapon.findAll();
    return weapons.map(weapon => ({
      id: weapon.id,
      name: weapon.name,
      damage: weapon.damage,
      energyBonus: weapon.energyBonus,
      price: weapon.price,
      rarity: weapon.rarity,
      imageUrl: weapon.imageUrl,
      currency: weapon.currency,
    }));
  }

  // Purchase an item (money only)
  static async purchaseItem(userId, slot, itemId, price, quantity = 1) {
    const char = await Character.findOne({ where: { userId } });
    const user = await User.findByPk(userId);
    if (!char || !user) {
      throw new Error('المستخدم غير موجود');
    }
    // Find the item (Weapon or Armor)
    let shopItem;
    if (slot === 'weapon') {
      shopItem = await Weapon.findByPk(itemId);
    } else if (slot === 'armor') {
      shopItem = await Armor.findByPk(itemId);
    }
    if (!shopItem) {
      throw new Error('العنصر غير موجود');
    }
    const totalPrice = price * quantity;
    if (shopItem.currency === 'money') {
      if (char.money < totalPrice) {
        throw new Error('لا تملك مالاً كافياً');
      }
    } else {
      throw new Error('نوع العملة غير صالح');
    }
    // Deduct currency
    if (shopItem.currency === 'money') {
      await char.update({ money: char.money - totalPrice });
    }
    // Inventory logic
    const item = await InventoryItem.findOne({ 
      where: { userId, itemType: slot, itemId } 
    });
    if (item) {
      await item.update({ quantity: item.quantity + quantity });
    } else {
      await InventoryItem.create({ userId, itemType: slot, itemId, quantity });
    }
    return { message: 'تم شراء العنصر', itemId, quantity, remainingMoney: char.money };
  }

  // Purchase weapon
  static async purchaseWeapon(userId, weaponId, quantity = 1) {
    const weapon = await Weapon.findByPk(weaponId);
    if (!weapon) {
      throw new Error('السلاح غير موجود');
    }
    return await this.purchaseItem(userId, 'weapon', weapon.id, weapon.price, quantity);
  }

  // Purchase armor
  static async purchaseArmor(userId, armorId, quantity = 1) {
    const armor = await Armor.findByPk(armorId);
    if (!armor) {
      throw new Error('الدرع غير موجود');
    }
    return await this.purchaseItem(userId, 'armor', armor.id, armor.price, quantity);
  }

  // Admin methods for weapon management
  static async createWeapon(data) {
    // Only allow fields defined in the model
    const allowedFields = [
      'name', 'damage', 'energyBonus', 'price', 'rarity', 'imageUrl', 'currency'
    ];
    const weaponData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) weaponData[field] = data[field];
    }
    const weapon = await Weapon.create(weaponData);
    return weapon;
  }

  static async updateWeapon(weaponId, data) {
    const weapon = await Weapon.findByPk(weaponId);
    if (!weapon) return null;

    // Only allow fields defined in the model
    const allowedFields = [
      'name', 'damage', 'energyBonus', 'price', 'rarity', 'imageUrl', 'currency'
    ];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        weapon[field] = data[field];
      }
    }
    
    await weapon.save();
    return weapon;
  }

  static async deleteWeapon(weaponId) {
    const weapon = await Weapon.findByPk(weaponId);
    if (!weapon) return false;
    
    await weapon.destroy();
    return true;
  }

  // Admin methods for armor management
  static async getAllArmorsForAdmin() {
    const armors = await Armor.findAll();
    return armors.map(armor => ({
      id: armor.id,
      name: armor.name,
      def: armor.def,
      hpBonus: armor.hpBonus,
      price: armor.price,
      rarity: armor.rarity,
      imageUrl: armor.imageUrl,
      currency: armor.currency,
    }));
  }

  static async createArmor(data) {
    // Only allow fields defined in the model
    const allowedFields = [
      'name', 'def', 'hpBonus', 'price', 'rarity', 'imageUrl', 'currency'
    ];
    const armorData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) armorData[field] = data[field];
    }
    const armor = await Armor.create(armorData);
    return armor;
  }

  static async updateArmor(armorId, data) {
    const armor = await Armor.findByPk(armorId);
    if (!armor) return null;

    // Only allow fields defined in the model
    const allowedFields = [
      'name', 'def', 'hpBonus', 'price', 'rarity', 'imageUrl', 'currency'
    ];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        armor[field] = data[field];
      }
    }
    
    await armor.save();
    return armor;
  }

  static async deleteArmor(armorId) {
    const armor = await Armor.findByPk(armorId);
    if (!armor) return false;
    
    await armor.destroy();
    return true;
  }
} 