import { House, UserHouse } from '../models/House.js';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';
import { TaskService } from './TaskService.js';

export class HouseService {
  // Seed default houses
  static async seedHouses() {
    // No longer used. Seeding is now handled in seedAll.js
    return;
  }

  // Get all available houses
  static async getAllHouses(filter = {}) {
    return await House.findAll({ where: filter });
  }

  // Get user's current house
  static async getUserHouse(userId) {
    return await UserHouse.findOne({
      where: { userId },
      include: [{ model: House }]
    });
  }

  // Get all houses owned by a user
  static async getUserHouses(userId) {
    return await UserHouse.findAll({
      where: { userId },
      include: [House],
      order: [['purchasedAt', 'ASC']],
      attributes: ['id', 'userId', 'houseId', 'purchasedAt'], // Ensure id is included
    });
  }

  // Equip a house (set as current)
  static async equipHouse(userId, houseId) {
    // Check ownership
    const userHouse = await UserHouse.findOne({ where: { userId, houseId } });
    if (!userHouse) throw new Error('You do not own this house');
    const character = await Character.findOne({ where: { userId } });
    if (!character) throw new Error('Character not found');
    character.equippedHouseId = houseId;
    await character.save();
    return await House.findByPk(houseId);
  }

  // Buy a house (can own multiple)
  static async buyHouse(userId, houseId) {
    const t = await sequelize.transaction();
    try {
      const [character, house] = await Promise.all([
        Character.findOne({ where: { userId }, transaction: t, lock: t.LOCK.UPDATE }),
        House.findByPk(houseId, { transaction: t })
      ]);
      if (!character || !house) throw new Error('Character or house not found');
      
      // Check if already owned
      const alreadyOwned = await UserHouse.findOne({ where: { userId, houseId }, transaction: t });
      if (alreadyOwned) throw new Error('You already own this house');
      
      // Check currency and deduct appropriate amount
      if (house.currency === 'blackcoin') {
        if (character.blackcoins < house.cost) throw new Error('Not enough blackcoins');
        character.blackcoins -= house.cost;
      } else {
        if (character.money < house.cost) throw new Error('Not enough money');
        character.money -= house.cost;
      }
      
      // Create user house record
      await UserHouse.create({ userId, houseId }, { transaction: t });
      
      // Optionally auto-equip if no house equipped
      if (!character.equippedHouseId) character.equippedHouseId = houseId;
      await character.save({ transaction: t });
      await t.commit();
      const houses = await UserHouse.findAll({ where: { userId } });
      await TaskService.updateProgress(userId, 'houses_owned', houses.length);
      return house;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Sell any owned house for 25% of its price
  static async sellHouse(userId, houseId) {
    const t = await sequelize.transaction();
    try {
      const userHouse = await UserHouse.findOne({ where: { userId, houseId }, transaction: t, lock: t.LOCK.UPDATE, include: [House] });
      if (!userHouse) throw new Error('You do not own this house');
      const house = userHouse.House;
      const refund = Math.round(house.cost * 0.25);
      const character = await Character.findOne({ where: { userId }, transaction: t, lock: t.LOCK.UPDATE });
      character.money += refund;
      // If selling equipped house, unequip
      if (character.equippedHouseId === houseId) character.equippedHouseId = null;
      await character.save({ transaction: t });
      await userHouse.destroy({ transaction: t });
      await t.commit();
      const housesAfter = await UserHouse.findAll({ where: { userId } });
      await TaskService.updateProgress(userId, 'houses_owned', housesAfter.length);
      return { refund, houseId };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
} 