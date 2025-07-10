import { Weapon, Armor } from '../models/Shop.js';
import { Character } from '../models/Character.js';
import { InventoryItem } from '../models/Inventory.js';

export class ShopService {
  // Get all weapons
  static async getAllWeapons() {
    return await Weapon.findAll();
  }

  // Get all armors
  static async getAllArmors() {
    return await Armor.findAll();
  }

  // Purchase an item
  static async purchaseItem(userId, slot, itemId, price) {
    const char = await Character.findOne({ where: { userId } });
    if (!char || char.money < price) {
      throw new Error('لا تملك مالاً كافياً');
    }

    const exists = await InventoryItem.findOne({ 
      where: { userId, itemType: slot, itemId } 
    });
    if (exists) {
      throw new Error('العنصر موجود لديك بالفعل');
    }

    await Promise.all([
      char.update({ money: char.money - price }),
      InventoryItem.create({ userId, itemType: slot, itemId }),
    ]);

    return { message: 'تم شراء العنصر', itemId };
  }

  // Purchase weapon
  static async purchaseWeapon(userId, weaponId) {
    const weapon = await Weapon.findByPk(weaponId);
    if (!weapon) {
      throw new Error('السلاح غير موجود');
    }

    return await this.purchaseItem(userId, 'weapon', weapon.id, weapon.price);
  }

  // Purchase armor
  static async purchaseArmor(userId, armorId) {
    const armor = await Armor.findByPk(armorId);
    if (!armor) {
      throw new Error('الدرع غير موجود');
    }

    return await this.purchaseItem(userId, 'armor', armor.id, armor.price);
  }

  // Seed shop items
  static async seedShopItems() {
    const [wCnt, aCnt] = await Promise.all([Weapon.count(), Armor.count()]);
    if (wCnt || aCnt) { 
      console.log('🛒  Shop already seeded'); 
      return; 
    }

    await Weapon.bulkCreate([
      { name: 'خنجر صدئ',       type: 'melee',  damage: 4,  energyBonus: 0,  price: 150,  rarity: 'common' },
      { name: 'عصا حديدية',      type: 'melee',  damage: 6,  energyBonus: 1,  price: 300,  rarity: 'common' },
      { name: 'مسدس 9mm',        type: 'pistol', damage: 9,  energyBonus: 0,  price: 800,  rarity: 'uncommon' },
      { name: 'بندقية صيد',      type: 'rifle',  damage: 12, energyBonus: 0,  price: 1200, rarity: 'uncommon' },
      { name: 'كاتانا فولاذية',  type: 'melee',  damage: 16, energyBonus: 2,  price: 2200, rarity: 'rare' },
      { name: 'قناص قصير',       type: 'sniper', damage: 20, energyBonus: 0,  price: 3000, rarity: 'rare' },
      { name: 'مطرقة الحرب',     type: 'melee',  damage: 24, energyBonus: 3,  price: 3800, rarity: 'epic' },
      { name: 'رشاش آلي',        type: 'rifle',  damage: 28, energyBonus: 0,  price: 4500, rarity: 'epic' },
      { name: 'قناصة متقدمة',    type: 'sniper', damage: 34, energyBonus: 0,  price: 5500, rarity: 'legend' },
      { name: 'سيف أسطوري',      type: 'melee',  damage: 40, energyBonus: 5,  price: 7000, rarity: 'legend' },
    ]);

    await Armor.bulkCreate([
      { name: 'سترة قماش',          def: 2,  hpBonus: 0,  price: 200,  rarity: 'common' },
      { name: 'سترة جلدية',         def: 4,  hpBonus: 10, price: 400,  rarity: 'common' },
      { name: 'درع كيفلر خفيف',     def: 7,  hpBonus: 15, price: 900,  rarity: 'uncommon' },
      { name: 'درع كيفلر متوسط',    def: 9,  hpBonus: 20, price: 1300, rarity: 'uncommon' },
      { name: 'درع كيفلر ثقيل',     def: 12, hpBonus: 25, price: 1800, rarity: 'rare' },
      { name: 'درع تكتيكي',         def: 15, hpBonus: 35, price: 2400, rarity: 'rare' },
      { name: 'درع التيتانيوم',     def: 19, hpBonus: 45, price: 3200, rarity: 'epic' },
      { name: 'درع مركب متقدم',     def: 23, hpBonus: 55, price: 4000, rarity: 'epic' },
      { name: 'درع نانوي خفيف',     def: 27, hpBonus: 65, price: 5200, rarity: 'legend' },
      { name: 'درع نانوي معزز',     def: 32, hpBonus: 80, price: 6500, rarity: 'legend' },
    ]);

    console.log('✅  Shop items seeded');
  }
} 