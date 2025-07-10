import { BlackMarketItem, BlackMarketTransaction } from '../models/BlackMarket.js';
import { Character } from '../models/Character.js';
import { InventoryItem } from '../models/Inventory.js';
import { sequelize } from '../config/db.js';

export class BlackMarketService {
  // Seed default black market items
  static async seedBlackMarketItems() {
    const defaults = [
      {
        name: 'مسدس صامت',
        description: 'مسدس صامت للعمليات السرية',
        cost: 5000,
        type: 'WEAPON',
        rarity: 'RARE',
        stats: { damage: 25, stealth: true }
      },
      {
        name: 'سترة واقية من الرصاص',
        description: 'سترة واقية متطورة',
        cost: 8000,
        type: 'ARMOR',
        rarity: 'RARE',
        stats: { defense: 15, weight: 3 }
      },
      {
        name: 'مخدر قوي',
        description: 'مخدر قوي للعمليات الخاصة',
        cost: 3000,
        type: 'CONSUMABLE',
        rarity: 'RARE',
        stats: { effect: 'sleep', duration: 30 }
      },
      {
        name: 'قناع متطور',
        description: 'قناع يخفي الهوية تماماً',
        cost: 12000,
        type: 'SPECIAL',
        rarity: 'EPIC',
        stats: { stealth: 50, disguise: true }
      }
    ];

    await BlackMarketItem.destroy({ where: {} });
    await BlackMarketItem.bulkCreate(defaults);
    console.log(`✅ Seeded ${defaults.length} black market items`);
  }

  // Get all available black market items
  static async getAvailableItems() {
    return await BlackMarketItem.findAll({
      where: { isAvailable: true },
      order: [['cost', 'ASC']]
    });
  }

  // Get item by ID
  static async getItemById(itemId) {
    return await BlackMarketItem.findByPk(itemId);
  }

  // Buy item from black market
  static async buyItem(userId, itemId, quantity = 1) {
    const t = await sequelize.transaction();

    try {
      const [character, item] = await Promise.all([
        Character.findOne({
          where: { userId },
          transaction: t,
          lock: t.LOCK.UPDATE
        }),
        BlackMarketItem.findByPk(itemId, { transaction: t })
      ]);

      if (!character || !item) {
        throw new Error('Character or item not found');
      }

      if (!item.isAvailable) {
        throw new Error('Item not available');
      }

      const totalCost = item.cost * quantity;

      if (character.money < totalCost) {
        throw new Error('Not enough money');
      }

      // Check stock if limited
      if (item.stock !== -1) {
        if (item.stock < quantity) {
          throw new Error('Not enough stock');
        }
        item.stock -= quantity;
        await item.save({ transaction: t });
      }

      // Deduct money from character
      character.money -= totalCost;
      await character.save({ transaction: t });

      // Add item to inventory
      const inventoryItem = await InventoryItem.findOne({
        where: { userId, itemId: itemId },
        transaction: t
      });

      if (inventoryItem) {
        inventoryItem.quantity += quantity;
        await inventoryItem.save({ transaction: t });
      } else {
        await InventoryItem.create({
          userId,
          itemId: itemId,
          quantity,
          type: item.type
        }, { transaction: t });
      }

      // Record transaction
      await BlackMarketTransaction.create({
        userId,
        itemId,
        quantity,
        totalCost
      }, { transaction: t });

      await t.commit();
      return { item, quantity, totalCost, remainingMoney: character.money };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  // Get user's purchase history
  static async getUserPurchaseHistory(userId) {
    return await BlackMarketTransaction.findAll({
      where: { userId },
      include: [{ model: BlackMarketItem }],
      order: [['purchasedAt', 'DESC']]
    });
  }

  // Get black market statistics
  static async getMarketStats() {
    const totalItems = await BlackMarketItem.count();
    const availableItems = await BlackMarketItem.count({
      where: { isAvailable: true }
    });
    const totalTransactions = await BlackMarketTransaction.count();
    const totalRevenue = await BlackMarketTransaction.sum('totalCost') || 0;

    return {
      totalItems,
      availableItems,
      totalTransactions,
      totalRevenue
    };
  }

  // Update item availability
  static async updateItemAvailability(itemId, isAvailable) {
    const item = await BlackMarketItem.findByPk(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    item.isAvailable = isAvailable;
    await item.save();
    return item;
  }

  // Update item stock
  static async updateItemStock(itemId, stock) {
    const item = await BlackMarketItem.findByPk(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    item.stock = stock;
    await item.save();
    return item;
  }
} 