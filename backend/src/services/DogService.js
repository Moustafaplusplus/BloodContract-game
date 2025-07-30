import { Dog, UserDog } from '../models/Dog.js';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';
import { TaskService } from './TaskService.js';

export class DogService {
  static async getAllDogs(filter = {}) {
    return await Dog.findAll({ where: filter });
  }

  static async getUserDogs(userId) {
    return await UserDog.findAll({
      where: { userId },
      include: [Dog],
      order: [['purchasedAt', 'ASC']]
    });
  }

  static async getUserActiveDog(userId) {
    return await UserDog.findOne({
      where: { userId, isActive: true },
      include: [Dog]
    });
  }

  static async buyDog(userId, dogId) {
    const t = await sequelize.transaction();
    try {
      const [character, dog] = await Promise.all([
        Character.findOne({ where: { userId }, transaction: t, lock: t.LOCK.UPDATE }),
        Dog.findByPk(dogId, { transaction: t })
      ]);
      
      if (!character) {
        await t.rollback();
        throw new Error('Character not found');
      }
      
      if (!dog) {
        await t.rollback();
        throw new Error('Dog not found');
      }
      
      const alreadyOwned = await UserDog.findOne({ where: { userId, dogId }, transaction: t });
      if (alreadyOwned) {
        await t.rollback();
        throw new Error('You already own this dog');
      }
      
      // Check currency and deduct appropriate amount
      if (dog.currency === 'blackcoin') {
        if (character.blackcoins < dog.cost) {
          await t.rollback();
          throw new Error('Not enough blackcoins');
        }
        character.blackcoins -= dog.cost;
      } else {
        if (character.money < dog.cost) {
          await t.rollback();
          throw new Error('Not enough money');
        }
        character.money -= dog.cost;
      }
      
      await UserDog.create({ userId, dogId, isActive: false }, { transaction: t });
      
      // Optionally auto-activate if no dog active
      const activeDog = await UserDog.findOne({ where: { userId, isActive: true }, transaction: t });
      if (!activeDog) {
        await UserDog.update({ isActive: true }, { where: { userId, dogId }, transaction: t });
      }
      
      await character.save({ transaction: t });
      await t.commit();
      
      // Update task progress outside transaction
      try {
        const dogs = await UserDog.findAll({ where: { userId } });
        await TaskService.updateProgress(userId, 'dogs_owned', dogs.length);
      } catch (taskError) {
        console.error('Task progress update failed:', taskError);
        // Don't fail the main operation if task update fails
      }
      
      return dog;
    } catch (error) {
      await t.rollback();
      console.error('Buy dog error:', error);
      throw error;
    }
  }

  static async activateDog(userId, dogId) {
    try {
      const userDog = await UserDog.findOne({ where: { userId, dogId } });
      if (!userDog) {
        throw new Error('You do not own this dog');
      }
      
      const t = await sequelize.transaction();
      try {
        // Deactivate all other dogs
        await UserDog.update({ isActive: false }, { where: { userId }, transaction: t });
        // Activate this dog
        userDog.isActive = true;
        await userDog.save({ transaction: t });
        await t.commit();
        return userDog;
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Activate dog error:', error);
      throw error;
    }
  }

  static async deactivateDog(userId) {
    try {
      const activeDog = await UserDog.findOne({ where: { userId, isActive: true } });
      if (!activeDog) {
        throw new Error('No active dog to deactivate');
      }
      
      const t = await sequelize.transaction();
      try {
        activeDog.isActive = false;
        await activeDog.save({ transaction: t });
        await t.commit();
        return { message: 'Dog deactivated successfully' };
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Deactivate dog error:', error);
      throw error;
    }
  }

  // Sell any owned dog for 80% of its price
  static async sellDog(userId, dogId) {
    const t = await sequelize.transaction();
    try {
      // First check if the user owns the dog
      const userDog = await UserDog.findOne({ 
        where: { userId, dogId }, 
        include: [Dog],
        transaction: t 
      });
      
      if (!userDog) {
        await t.rollback();
        throw new Error('You do not own this dog');
      }
      
      const dog = userDog.Dog;
      if (!dog) {
        await t.rollback();
        throw new Error('Dog data not found');
      }
      
      if (userDog.isActive) {
        await t.rollback();
        throw new Error('Cannot sell active dog. Deactivate it first.');
      }
      
      const refund = Math.round(dog.cost * 0.8);
      
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
      if (dog.currency === 'blackcoin') {
        character.blackcoins += refund;
      } else {
        character.money += refund;
      }
      
      // Save character changes
      await character.save({ transaction: t });
      
      // Delete the user dog record
      await userDog.destroy({ transaction: t });
      
      // Commit transaction
      await t.commit();
      
      // Update task progress outside transaction
      try {
        const dogsAfter = await UserDog.findAll({ where: { userId } });
        await TaskService.updateProgress(userId, 'dogs_owned', dogsAfter.length);
      } catch (taskError) {
        console.error('Task progress update failed:', taskError);
        // Don't fail the main operation if task update fails
      }
      
      return { refund, dogId, currency: dog.currency };
    } catch (error) {
      await t.rollback();
      console.error('Sell dog error:', error);
      throw error;
    }
  }
} 