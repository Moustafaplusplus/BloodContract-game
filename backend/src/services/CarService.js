import { Car, UserCar } from '../models/Car.js';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';

export class CarService {
  // Seed default cars
  static async seedCars() {
    // No longer used. Seeding is now handled in seedAll.js
    return;
  }

  // Get all available cars
  static async getAllCars(filter = {}) {
    return await Car.findAll({
      where: filter,
      order: [['cost', 'ASC']]
    });
  }

  // Get user's cars
  static async getUserCars(userId) {
    return await UserCar.findAll({
      where: { userId },
      include: [{ model: Car }],
      order: [['purchasedAt', 'DESC']]
    });
  }

  // Get user's active car
  static async getUserActiveCar(userId) {
    return await UserCar.findOne({
      where: { userId, isActive: true },
      include: [{ model: Car }]
    });
  }

  // Buy a car
  static async buyCar(userId, carId) {
    const t = await sequelize.transaction();

    try {
      const [character, car] = await Promise.all([
        Character.findOne({
          where: { userId },
          transaction: t,
          lock: t.LOCK.UPDATE
        }),
        Car.findByPk(carId, { transaction: t })
      ]);

      if (!character) {
        await t.rollback();
        throw new Error('Character not found');
      }

      if (!car) {
        await t.rollback();
        throw new Error('Car not found');
      }

      // Check if user already owns this car
      const existingCar = await UserCar.findOne({
        where: { userId, carId },
        transaction: t
      });

      if (existingCar) {
        await t.rollback();
        throw new Error('You already own this car');
      }

      // Check currency and deduct appropriate amount
      if (car.currency === 'blackcoin') {
        if (character.blackcoins < car.cost) {
          await t.rollback();
          throw new Error('Not enough blackcoins');
        }
        character.blackcoins -= car.cost;
      } else {
        if (character.money < car.cost) {
          await t.rollback();
          throw new Error('Not enough money');
        }
        character.money -= car.cost;
      }

      await character.save({ transaction: t });

      const userCar = await UserCar.create({
        userId,
        carId,
        isActive: false
      }, { transaction: t });

      await t.commit();
      return { 
        userCar, 
        car, 
        remainingMoney: character.money,
        remainingBlackcoins: character.blackcoins
      };
    } catch (error) {
      await t.rollback();
      console.error('Buy car error:', error);
      throw error;
    }
  }

  // Activate a car (equip)
  static async activateCar(userId, carId) {
    try {
      const userCar = await UserCar.findOne({ where: { userId, carId } });
      if (!userCar) {
        throw new Error('You do not own this car');
      }
      
      const t = await sequelize.transaction();
      try {
        // Deactivate all other cars
        await UserCar.update(
          { isActive: false },
          { where: { userId }, transaction: t }
        );
        // Activate this car
        userCar.isActive = true;
        await userCar.save({ transaction: t });
        // Update character stats
        const character = await Character.findOne({ where: { userId }, transaction: t });
        const car = await Car.findByPk(carId, { transaction: t });
        character.defense += car.defenseBonus;
        character.strength += car.attackBonus;
        await character.save({ transaction: t });
        await t.commit();
        return { userCar, car };
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Activate car error:', error);
      throw error;
    }
  }

  // Deactivate current car (unequip)
  static async deactivateCar(userId) {
    try {
      const activeCar = await UserCar.findOne({
        where: { userId, isActive: true },
        include: [Car]
      });
      if (!activeCar) {
        throw new Error('No active car to deactivate');
      }
      
      const t = await sequelize.transaction();
      try {
        // Deactivate the car
        activeCar.isActive = false;
        await activeCar.save({ transaction: t });
        // Remove car bonuses from character
        const character = await Character.findOne({ where: { userId }, transaction: t });
        character.defense -= activeCar.Car.defenseBonus;
        character.strength -= activeCar.Car.attackBonus;
        await character.save({ transaction: t });
        await t.commit();
        return { message: 'Car deactivated successfully' };
      } catch (error) {
        await t.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Deactivate car error:', error);
      throw error;
    }
  }

  // Sell any owned car for 80% of its price
  static async sellCar(userId, carId) {
    const t = await sequelize.transaction();
    try {
      // First check if the user owns the car
      const userCar = await UserCar.findOne({ 
        where: { userId, carId }, 
        include: [Car],
        transaction: t 
      });
      
      if (!userCar) {
        await t.rollback();
        throw new Error('You do not own this car');
      }
      
      const car = userCar.Car;
      if (!car) {
        await t.rollback();
        throw new Error('Car data not found');
      }
      
      if (userCar.isActive) {
        await t.rollback();
        throw new Error('Cannot sell active car. Deactivate it first.');
      }
      
      const refund = Math.round(car.cost * 0.8);
      
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
      if (car.currency === 'blackcoin') {
        character.blackcoins += refund;
      } else {
        character.money += refund;
      }
      
      // Save character changes
      await character.save({ transaction: t });
      
      // Delete the user car record
      await userCar.destroy({ transaction: t });
      
      // Commit transaction
      await t.commit();
      
      return { refund, carId, currency: car.currency };
    } catch (error) {
      await t.rollback();
      console.error('Sell car error:', error);
      throw error;
    }
  }
} 