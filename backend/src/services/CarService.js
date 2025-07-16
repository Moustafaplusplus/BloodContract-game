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
  static async getAllCars() {
    return await Car.findAll({
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

      if (!character || !car) {
        throw new Error('Character or car not found');
      }

      if (character.money < car.cost) {
        throw new Error('Not enough money');
      }

      // Check if user already owns this car
      const existingCar = await UserCar.findOne({
        where: { userId, carId },
        transaction: t
      });

      if (existingCar) {
        throw new Error('Already own this car');
      }

      // Purchase the car
      character.money -= car.cost;
      await character.save({ transaction: t });

      const userCar = await UserCar.create({
        userId,
        carId,
        isActive: false
      }, { transaction: t });

      await t.commit();
      return { userCar, car, remainingMoney: character.money };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Activate a car
  static async activateCar(userId, carId) {
    const t = await sequelize.transaction();
    try {
      // Check if user owns this car
      const userCar = await UserCar.findOne({
        where: { userId, carId },
        transaction: t
      });
      if (!userCar) {
        throw new Error('Car not owned');
      }
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
  }

  // Deactivate current car
  static async deactivateCar(userId) {
    const t = await sequelize.transaction();
    try {
      const activeCar = await UserCar.findOne({
        where: { userId, isActive: true },
        include: [{ model: Car }],
        transaction: t
      });
      if (!activeCar) {
        throw new Error('No active car to deactivate');
      }
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
  }

  // Sell a car
  static async sellCar(userId, carId) {
    const t = await sequelize.transaction();
    try {
      const userCar = await UserCar.findOne({
        where: { userId, carId },
        include: [{ model: Car }],
        transaction: t
      });
      if (!userCar) {
        throw new Error('Car not owned');
      }
      if (userCar.isActive) {
        throw new Error('Cannot sell active car. Deactivate it first.');
      }
      const character = await Character.findOne({ where: { userId }, transaction: t });
      // Sell for 25% of original cost
      const refund = Math.round(userCar.Car.cost * 0.25);
      character.money += refund;
      await character.save({ transaction: t });
      await userCar.destroy({ transaction: t });
      await t.commit();
      return { refund, remainingMoney: character.money };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
} 