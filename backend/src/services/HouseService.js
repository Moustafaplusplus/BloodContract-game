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
    try {
      // Check ownership
      const userHouse = await UserHouse.findOne({ where: { userId, houseId } });
      if (!userHouse) {
        throw new Error('You do not own this house');
      }
      
      const character = await Character.findOne({ where: { userId } });
      if (!character) {
        throw new Error('Character not found');
      }
      
      character.equippedHouseId = houseId;
      await character.save();
      
      const house = await House.findByPk(houseId);
      if (!house) {
        throw new Error('House not found');
      }
      
      return house;
    } catch (error) {
      console.error('Equip house error:', error);
      throw error;
    }
  }

  // Unequip current house
  static async unequipHouse(userId) {
    try {
      const character = await Character.findOne({ where: { userId } });
      if (!character) {
        throw new Error('Character not found');
      }
      
      if (!character.equippedHouseId) {
        throw new Error('No house is currently equipped');
      }
      
      character.equippedHouseId = null;
      await character.save();
      
      return { message: 'House unequipped successfully' };
    } catch (error) {
      console.error('Unequip house error:', error);
      throw error;
    }
  }

  // Buy a house (can own multiple)
  static async buyHouse(userId, houseId) {
    const t = await sequelize.transaction();
    try {
      const [character, house] = await Promise.all([
        Character.findOne({ where: { userId }, transaction: t, lock: t.LOCK.UPDATE }),
        House.findByPk(houseId, { transaction: t })
      ]);
      
      if (!character) {
        await t.rollback();
        throw new Error('Character not found');
      }
      
      if (!house) {
        await t.rollback();
        throw new Error('House not found');
      }
      
      // Check if already owned
      const alreadyOwned = await UserHouse.findOne({ where: { userId, houseId }, transaction: t });
      if (alreadyOwned) {
        await t.rollback();
        throw new Error('You already own this house');
      }
      
      // Check currency and deduct appropriate amount
      if (house.currency === 'blackcoin') {
        if (character.blackcoins < house.cost) {
          await t.rollback();
          throw new Error('Not enough blackcoins');
        }
        character.blackcoins -= house.cost;
      } else {
        if (character.money < house.cost) {
          await t.rollback();
          throw new Error('Not enough money');
        }
        character.money -= house.cost;
      }
      
      // Create user house record
      await UserHouse.create({ userId, houseId }, { transaction: t });
      
      // Optionally auto-equip if no house equipped
      if (!character.equippedHouseId) {
        character.equippedHouseId = houseId;
      }
      
      await character.save({ transaction: t });
      await t.commit();
      
      // Update task progress outside transaction
      try {
        const houses = await UserHouse.findAll({ where: { userId } });
        await TaskService.updateProgress(userId, 'houses_owned', houses.length);
      } catch (taskError) {
        console.error('Task progress update failed:', taskError);
        // Don't fail the main operation if task update fails
      }
      
      return house;
    } catch (error) {
      await t.rollback();
      console.error('Buy house error:', error);
      throw error;
    }
  }

  // Sell any owned house for 80% of its price
  static async sellHouse(userId, houseId) {
    const t = await sequelize.transaction();
    try {
      // First check if the user owns the house
      const userHouse = await UserHouse.findOne({ 
        where: { userId, houseId }, 
        include: [House],
        transaction: t 
      });
      
      if (!userHouse) {
        await t.rollback();
        throw new Error('You do not own this house');
      }
      
      const house = userHouse.House;
      if (!house) {
        await t.rollback();
        throw new Error('House data not found');
      }
      
      const refund = Math.round(house.cost * 0.8);
      
      // Get character with lock
      const character = await Character.findOne({ 
        where: { userId }, 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      
      if (!character) {
        await t.rollback();
        throw new Error('Character not found');
      }
      
      // Add refund to appropriate currency
      if (house.currency === 'blackcoin') {
        character.blackcoins += refund;
      } else {
        character.money += refund;
      }
      
      // If selling equipped house, unequip
      if (character.equippedHouseId === houseId) {
        character.equippedHouseId = null;
      }
      
      // Save character changes
      await character.save({ transaction: t });
      
      // Delete the user house record
      await userHouse.destroy({ transaction: t });
      
      // Commit transaction
      await t.commit();
      
      // Update task progress outside transaction
      try {
        const housesAfter = await UserHouse.findAll({ where: { userId } });
        await TaskService.updateProgress(userId, 'houses_owned', housesAfter.length);
      } catch (taskError) {
        console.error('Task progress update failed:', taskError);
        // Don't fail the main operation if task update fails
      }
      
      return { refund, houseId, currency: house.currency };
    } catch (error) {
      await t.rollback();
      console.error('Sell house error:', error);
      throw error;
    }
  }
} 