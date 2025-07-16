import { Dog, UserDog } from '../models/Dog.js';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';

export class DogService {
  static async getAllDogs() {
    return await Dog.findAll({ order: [['cost', 'ASC']] });
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
      if (!character || !dog) throw new Error('Character or dog not found');
      if (character.money < dog.cost) throw new Error('Not enough money');
      const alreadyOwned = await UserDog.findOne({ where: { userId, dogId }, transaction: t });
      if (alreadyOwned) throw new Error('You already own this dog');
      await UserDog.create({ userId, dogId, isActive: false }, { transaction: t });
      character.money -= dog.cost;
      // Optionally auto-activate if no dog active
      const activeDog = await UserDog.findOne({ where: { userId, isActive: true }, transaction: t });
      if (!activeDog) {
        await UserDog.update({ isActive: true }, { where: { userId, dogId }, transaction: t });
      }
      await character.save({ transaction: t });
      await t.commit();
      return dog;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async activateDog(userId, dogId) {
    const t = await sequelize.transaction();
    try {
      const userDog = await UserDog.findOne({ where: { userId, dogId }, transaction: t });
      if (!userDog) throw new Error('Dog not owned');
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
  }

  static async deactivateDog(userId) {
    const t = await sequelize.transaction();
    try {
      const activeDog = await UserDog.findOne({ where: { userId, isActive: true }, transaction: t });
      if (!activeDog) throw new Error('No active dog to deactivate');
      activeDog.isActive = false;
      await activeDog.save({ transaction: t });
      await t.commit();
      return { message: 'Dog deactivated successfully' };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  static async sellDog(userId, dogId) {
    const t = await sequelize.transaction();
    try {
      const userDog = await UserDog.findOne({ where: { userId, dogId }, include: [Dog], transaction: t });
      if (!userDog) throw new Error('Dog not owned');
      if (userDog.isActive) throw new Error('Cannot sell active dog. Deactivate it first.');
      const character = await Character.findOne({ where: { userId }, transaction: t });
      const refund = Math.round(userDog.Dog.cost * 0.25);
      character.money += refund;
      await character.save({ transaction: t });
      await userDog.destroy({ transaction: t });
      await t.commit();
      return { refund, remainingMoney: character.money };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
} 