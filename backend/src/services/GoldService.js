import { GoldTransaction, GoldPackage, VIPMembership } from '../models/Gold.js';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';

export class GoldService {
  // VIP tier prices
  static VIP_PRICES = {
    SILVER: 500,
    GOLD: 1000,
    PLATINUM: 2000
  };

  // Seed default gold packages
  static async seedGoldPackages() {
    const defaults = [
      {
        name: 'Starter Pack',
        usdPrice: 5.00,
        goldAmount: 50,
        bonus: 0
      },
      {
        name: 'Small Pack',
        usdPrice: 10.00,
        goldAmount: 110,
        bonus: 10
      },
      {
        name: 'Medium Pack',
        usdPrice: 25.00,
        goldAmount: 300,
        bonus: 50
      },
      {
        name: 'Large Pack',
        usdPrice: 50.00,
        goldAmount: 650,
        bonus: 150
      },
      {
        name: 'Whale Pack',
        usdPrice: 100.00,
        goldAmount: 1400,
        bonus: 400
      }
    ];

    await GoldPackage.destroy({ where: {} });
    await GoldPackage.bulkCreate(defaults);
    console.log(`✅ Seeded ${defaults.length} gold packages`);
  }

  // Get all available gold packages
  static async getGoldPackages() {
    return await GoldPackage.findAll({
      where: { isActive: true },
      order: [['usdPrice', 'ASC']]
    });
  }

  // Get package by ID
  static async getPackageById(packageId) {
    return await GoldPackage.findByPk(packageId);
  }

  // Process gold purchase
  static async purchaseGold(userId, packageId, transactionId) {
    const t = await sequelize.transaction();

    try {
      const [character, goldPackage] = await Promise.all([
        Character.findOne({
          where: { userId },
          transaction: t,
          lock: t.LOCK.UPDATE
        }),
        GoldPackage.findByPk(packageId, { transaction: t })
      ]);

      if (!character || !goldPackage) {
        throw new Error('Character or package not found');
      }

      if (!goldPackage.isActive) {
        throw new Error('Package not available');
      }

      const totalGold = goldPackage.goldAmount + goldPackage.bonus;

      // Add gold to character
      character.gold = (character.gold || 0) + totalGold;
      await character.save({ transaction: t });

      // Record transaction
      await GoldTransaction.create({
        userId,
        amount: totalGold,
        type: 'PURCHASE',
        description: `Purchased ${goldPackage.name}`,
        transactionId
      }, { transaction: t });

      await t.commit();
      return { 
        package: goldPackage, 
        goldGranted: totalGold, 
        transactionId,
        newGoldBalance: character.gold 
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Purchase VIP membership
  static async purchaseVIP(userId, tier) {
    const t = await sequelize.transaction();

    try {
      const character = await Character.findOne({
        where: { userId },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!character) {
        throw new Error('Character not found');
      }

      const price = this.VIP_PRICES[tier];
      if (!price) {
        throw new Error('Invalid VIP tier');
      }

      if ((character.gold || 0) < price) {
        throw new Error('Not enough gold');
      }

      // Deduct gold
      character.gold -= price;
      await character.save({ transaction: t });

      // Deactivate any existing VIP membership
      await VIPMembership.update(
        { isActive: false },
        { where: { userId, isActive: true }, transaction: t }
      );

      // Create new VIP membership
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const vipMembership = await VIPMembership.create({
        userId,
        tier,
        startDate,
        endDate,
        isActive: true
      }, { transaction: t });

      // Record transaction
      await GoldTransaction.create({
        userId,
        amount: price,
        type: 'SPEND',
        description: `VIP ${tier} membership`
      }, { transaction: t });

      await t.commit();
      return { vipMembership, goldSpent: price, newGoldBalance: character.gold };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Get user's VIP status
  static async getUserVIPStatus(userId) {
    const vipMembership = await VIPMembership.findOne({
      where: { userId, isActive: true },
      order: [['endDate', 'DESC']]
    });

    if (!vipMembership) {
      return null;
    }

    // Check if VIP is still valid
    if (new Date() > vipMembership.endDate) {
      vipMembership.isActive = false;
      await vipMembership.save();
      return null;
    }

    return vipMembership;
  }

  // Get user's gold transaction history
  static async getUserTransactionHistory(userId) {
    return await GoldTransaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  // Get gold statistics
  static async getGoldStats() {
    const totalTransactions = await GoldTransaction.count();
    const totalGoldPurchased = await GoldTransaction.sum('amount', {
      where: { type: 'PURCHASE' }
    }) || 0;
    const totalGoldSpent = await GoldTransaction.sum('amount', {
      where: { type: 'SPEND' }
    }) || 0;
    const activeVIPMembers = await VIPMembership.count({
      where: { isActive: true }
    });

    return {
      totalTransactions,
      totalGoldPurchased,
      totalGoldSpent,
      activeVIPMembers
    };
  }

  // Mock payment processing (replace with real payment gateway in production)
  static async processPayment(userId, amountUSD) {
    console.log(`💳 Mock payment: $${amountUSD} from user ${userId}`);
    return { 
      success: true, 
      transactionId: 'mock-' + Date.now() + '-' + userId 
    };
  }
} 