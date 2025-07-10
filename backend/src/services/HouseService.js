import { House, UserHouse } from '../models/House.js';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';

export class HouseService {
  // Seed default houses
  static async seedHouses() {
    const defaults = [
      { name: 'غرفة في السطح',          cost:  100,  energyRegen:  5, defenseBonus:  1, description: 'مكان متواضع للراحة بعد أول مهمة.' },
      { name: 'شقة في حي شعبي',          cost:  300,  energyRegen: 10, defenseBonus:  3, description: 'أفضل من لا شيء، لكنها ليست آمنة بالكامل.' },
      { name: 'دور أرضي منعزل',         cost:  700,  energyRegen: 15, defenseBonus:  5, description: 'هدوء وراحة نسبية.' },
      { name: 'فيلا صغيرة',             cost: 1500,  energyRegen: 20, defenseBonus:  7, description: 'مكان أنيق يوفر الحماية والطاقة.' },
      { name: 'قصر في ضواحي المدينة',    cost: 3000,  energyRegen: 30, defenseBonus: 10, description: 'قصر واسع وآمن في مكان بعيد.' },
      { name: 'ملجأ تحت الأرض',         cost: 5000,  energyRegen: 40, defenseBonus: 15, description: 'مكان مجهز بالكامل للبقاء والاختباء.' },
      { name: 'يخت خاص',                cost: 8000,  energyRegen: 50, defenseBonus: 18, description: 'موقعك متغير دوماً — حماية عالية وراحة فاخرة.' },
      { name: 'بنتهاوس في ناطحة سحاب',  cost:12000,  energyRegen: 60, defenseBonus: 20, description: 'مستوى النخبة. الأفضل من كل شيء.' },
      { name: 'مخبأ في الجبال',         cost:20000,  energyRegen: 70, defenseBonus: 25, description: 'عزلة تامة، حماية قصوى.' },
      { name: 'قاعدة عمليات سرية',      cost:30000,  energyRegen: 80, defenseBonus: 30, description: 'مجهزة بأحدث تقنيات الأمان والبقاء.' },
    ];
    
    await House.destroy({ where: {} });
    await House.bulkCreate(defaults);
    console.log(`✅ Seeded ${defaults.length} houses`);
  }

  // Get all available houses
  static async getAllHouses() {
    return await House.findAll();
  }

  // Get user's current house
  static async getUserHouse(userId) {
    return await UserHouse.findOne({
      where: { userId },
      include: [{ model: House }]
    });
  }

  // Buy a house
  static async buyHouse(userId, houseId) {
    const t = await sequelize.transaction();
    
    try {
      const [character, house] = await Promise.all([
        Character.findOne({ 
          where: { userId }, 
          transaction: t, 
          lock: t.LOCK.UPDATE 
        }),
        House.findByPk(houseId, { transaction: t })
      ]);

      if (!character || !house) {
        throw new Error('Character or house not found');
      }

      if (character.money < house.cost) {
        throw new Error('Not enough money');
      }

      const existing = await UserHouse.findOne({ 
        where: { userId }, 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      
      if (existing) {
        throw new Error('Already owns a house');
      }

      // Create user house record
      await UserHouse.create({ 
        userId, 
        houseId 
      }, { transaction: t });

      // Update character stats
      character.money -= house.cost;
      character.maxEnergy += house.energyRegen;
      character.defense += house.defenseBonus;
      await character.save({ transaction: t });

      await t.commit();
      return house;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Sell current house
  static async sellHouse(userId) {
    const t = await sequelize.transaction();
    
    try {
      const userHouse = await UserHouse.findOne({ 
        where: { userId }, 
        transaction: t, 
        lock: t.LOCK.UPDATE,
        include: [House]
      });

      if (!userHouse) {
        throw new Error('No house to sell');
      }

      const house = userHouse.House;
      const refund = Math.round(house.cost * 0.7);

      const character = await Character.findOne({ 
        where: { userId }, 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });

      character.money += refund;
      character.maxEnergy -= house.energyRegen;
      character.defense -= house.defenseBonus;
      await character.save({ transaction: t });

      await userHouse.destroy({ transaction: t });
      await t.commit();

      return { refund, house };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
} 