import { BlackMarketItem, BlackMarketTransaction } from '../models/BlackMarket.js';
import { Character } from '../models/Character.js';
import { InventoryItem } from '../models/Inventory.js';
import { User } from '../models/User.js';
import { sequelize } from '../config/db.js';
import { TaskService } from './TaskService.js';
import { emitNotification } from '../socket.js';
import { NotificationService } from './NotificationService.js';

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
      if (item.currency === 'blackcoin') {
        if (character.blackcoins < totalCost) {
          throw new Error('Not enough blackcoins');
        }
      } else {
        if (character.money < totalCost) {
          throw new Error('Not enough money');
        }
      }

      // Check stock if limited
      if (item.stock !== -1) {
        if (item.stock < quantity) {
          throw new Error('Not enough stock');
        }
        item.stock -= quantity;
        await item.save({ transaction: t });
      }

      // Deduct currency from character
      if (item.currency === 'blackcoin') {
        character.blackcoins -= totalCost;
      } else {
        character.money -= totalCost;
      }
      await character.save({ transaction: t });

      // Add item to inventory
      const inventoryItem = await InventoryItem.findOne({
        where: { userId, itemId: itemId, itemType: item.type },
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
          itemType: item.type
        }, { transaction: t });
      }

      // Record transaction
      await BlackMarketTransaction.create({
        userId,
        itemId,
        quantity,
        totalCost
      }, { transaction: t });

      await TaskService.updateProgress(userId, 'blackmarket_items_bought', quantity);
      await t.commit();
      
      // Create notification for black market purchase
      try {
        const notification = await NotificationService.createBlackMarketSoldNotification(
          userId,
          item.name,
          totalCost
        );
        emitNotification(userId, notification);
      } catch (notificationError) {
        console.error('[BlackMarketService] Notification error:', notificationError);
        // Continue even if notifications fail
      }
      
      return { item, quantity, totalCost, remainingMoney: character.money, remainingBlackcoins: character.blackcoins };
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

  // Create notification for black market listing posted
  static async createListingPostedNotification(userId, itemName, price) {
    console.log(`[BlackMarketService] Creating listing posted notification for user ${userId}, item: ${itemName}, price: ${price}`);
    try {
      const notification = await NotificationService.createNotification(
        userId,
        'BLACKMARKET_LISTING_POSTED',
        'تم نشر إعلان في السوق السوداء',
        `تم نشر إعلان لـ ${itemName} بسعر ${price.toLocaleString()} ريال`,
        { itemName, price }
      );
      console.log(`[BlackMarketService] Listing posted notification created successfully:`, notification);
      return notification;
    } catch (error) {
      console.error(`[BlackMarketService] Error creating listing posted notification:`, error);
      throw error;
    }
  }

  // Create notification for black market listing sold
  static async createListingSoldNotification(userId, itemName, price) {
    console.log(`[BlackMarketService] Creating listing sold notification for user ${userId}, item: ${itemName}, price: ${price}`);
    try {
      const notification = await NotificationService.createNotification(
        userId,
        'BLACKMARKET_LISTING_SOLD',
        'تم بيع إعلانك في السوق السوداء',
        `تم بيع ${itemName} بسعر ${price.toLocaleString()} ريال`,
        { itemName, price }
      );
      console.log(`[BlackMarketService] Listing sold notification created successfully:`, notification);
      return notification;
    } catch (error) {
      console.error(`[BlackMarketService] Error creating listing sold notification:`, error);
      throw error;
    }
  }

  // Create notification for black market listing cancelled
  static async createListingCancelledNotification(userId, itemName) {
    console.log(`[BlackMarketService] Creating listing cancelled notification for user ${userId}, item: ${itemName}`);
    try {
      const notification = await NotificationService.createNotification(
        userId,
        'BLACKMARKET_LISTING_CANCELLED',
        'تم إلغاء إعلانك في السوق السوداء',
        `تم إلغاء إعلان ${itemName} واستعادة العنصر`,
        { itemName }
      );
      console.log(`[BlackMarketService] Listing cancelled notification created successfully:`, notification);
      return notification;
    } catch (error) {
      console.error(`[BlackMarketService] Error creating listing cancelled notification:`, error);
      throw error;
    }
  }

  // Create notification for black market item purchased
  static async createItemPurchasedNotification(userId, itemName, price) {
    console.log(`[BlackMarketService] Creating item purchased notification for user ${userId}, item: ${itemName}, price: ${price}`);
    try {
      const notification = await NotificationService.createNotification(
        userId,
        'BLACKMARKET_ITEM_PURCHASED',
        'تم شراء عنصر من السوق السوداء',
        `تم شراء ${itemName} بسعر ${price.toLocaleString()} ريال`,
        { itemName, price }
      );
      console.log(`[BlackMarketService] Item purchased notification created successfully:`, notification);
      return notification;
    } catch (error) {
      console.error(`[BlackMarketService] Error creating item purchased notification:`, error);
      throw error;
    }
  }
} 