import { BlackMarketService } from '../services/BlackMarketService.js';
import { BlackMarketListing } from '../models/BlackMarketListing.js';
import { InventoryService } from '../services/InventoryService.js';
import { Character } from '../models/Character.js';
import { emitNotification } from '../socket.js';

export class BlackMarketController {
  // Get all available items
  static async getAvailableItems(req, res) {
    try {
      const items = await BlackMarketService.getAvailableItems();
      res.json(items);
    } catch (error) {
      console.error('Get black market items error:', error);
      res.status(500).json({ error: 'Failed to get black market items' });
    }
  }

  // Get item by ID
  static async getItemById(req, res) {
    try {
      const { id } = req.params;
      const item = await BlackMarketService.getItemById(id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      console.error('Get black market item error:', error);
      res.status(500).json({ error: 'Failed to get item' });
    }
  }

  // Buy item
  static async buyItem(req, res) {
    try {
      const { itemId, quantity = 1 } = req.body;
      if (!itemId) {
        return res.status(400).json({ error: 'Item ID required' });
      }

      const result = await BlackMarketService.buyItem(req.user.id, itemId, quantity);
      
      // Create notification for purchase
      try {
        const notification = await BlackMarketService.createItemPurchasedNotification(
          req.user.id,
          result.item.name,
          result.totalCost
        );
        emitNotification(req.user.id, notification);
      } catch (notificationError) {
        console.error('[BlackMarketController] Purchase notification error:', notificationError);
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Buy black market item error:', error);
      if (error.message === 'Character or item not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Item not available') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Not enough money') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Not enough stock') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to buy item' });
    }
  }

  // Get user's purchase history
  static async getUserPurchaseHistory(req, res) {
    try {
      const history = await BlackMarketService.getUserPurchaseHistory(req.user.id);
      res.json(history);
    } catch (error) {
      console.error('Get purchase history error:', error);
      res.status(500).json({ error: 'Failed to get purchase history' });
    }
  }

  // Get market statistics (admin only)
  static async getMarketStats(req, res) {
    try {
      const stats = await BlackMarketService.getMarketStats();
      res.json(stats);
    } catch (error) {
      console.error('Get market stats error:', error);
      res.status(500).json({ error: 'Failed to get market statistics' });
    }
  }

  // Update item availability (admin only)
  static async updateItemAvailability(req, res) {
    try {
      const { id } = req.params;
      const { isAvailable } = req.body;
      
      if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({ error: 'isAvailable must be a boolean' });
      }

      const item = await BlackMarketService.updateItemAvailability(id, isAvailable);
      res.json(item);
    } catch (error) {
      console.error('Update item availability error:', error);
      if (error.message === 'Item not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update item availability' });
    }
  }

  // Update item stock (admin only)
  static async updateItemStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      
      if (typeof stock !== 'number' || stock < -1) {
        return res.status(400).json({ error: 'Stock must be a number >= -1' });
      }

      const item = await BlackMarketService.updateItemStock(id, stock);
      res.json(item);
    } catch (error) {
      console.error('Update item stock error:', error);
      if (error.message === 'Item not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update item stock' });
    }
  }

  // USER-TO-USER LISTINGS
  static async getAllListings(req, res) {
    try {
      const listings = await BlackMarketListing.findAll({
        where: { status: 'active' },
        order: [['createdAt', 'DESC']],
        include: [{ model: Character, as: 'seller', attributes: ['id', 'name', 'avatarUrl'] }],
      });
      res.json(listings);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch listings' });
    }
  }

  static async getMyListings(req, res) {
    try {
      const userId = req.user.id;
      const char = await Character.findOne({ where: { userId } });
      if (!char) return res.status(404).json({ error: 'Character not found' });
      const listings = await BlackMarketListing.findAll({
        where: { sellerId: char.id },
        order: [['createdAt', 'DESC']],
      });
      res.json(listings);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch my listings' });
    }
  }

  static async postListing(req, res) {
    try {
      const userId = req.user.id;
      const { itemType, itemId, price, quantity = 1 } = req.body;
      if (!itemType || !itemId || !price || price < 1) return res.status(400).json({ error: 'Invalid data' });
      const char = await Character.findOne({ where: { userId } });
      if (!char) return res.status(404).json({ error: 'Character not found' });
      // Remove from inventory (only unequipped)
      const inv = await InventoryService.getUserInventory(userId);
      const item = inv.items.find(i => i.itemId === itemId && i.type === itemType && !i.equipped && i.quantity >= quantity);
      if (!item) return res.status(400).json({ error: 'Item not found or not enough quantity' });
      await InventoryService.sellItem(userId, itemType, itemId); // Remove 1 (simulate, adjust for quantity if needed)
      // Create listing (snapshot details)
      const listing = await BlackMarketListing.create({
        sellerId: char.id,
        itemType,
        itemId,
        quantity,
        price,
        status: 'active',
        name: item.name,
        imageUrl: item.imageUrl,
        rarity: item.rarity,
        stats: {
          damage: item.damage,
          def: item.def,
          hpBonus: item.hpBonus,
          energyBonus: item.energyBonus,
        },
      });

      // Create notification for listing posted
      try {
        const notification = await BlackMarketService.createListingPostedNotification(userId, item.name, price);
        emitNotification(userId, notification);
      } catch (notificationError) {
        console.error('[BlackMarketController] Notification error:', notificationError);
      }

      res.status(201).json(listing);
    } catch (err) {
      console.error('[BlackMarketController] Post listing error:', err);
      res.status(500).json({ error: 'Failed to post listing' });
    }
  }

  static async buyListing(req, res) {
    try {
      const userId = req.user.id;
      const { listingId } = req.body;
      if (!listingId) return res.status(400).json({ error: 'No listingId' });
      const listing = await BlackMarketListing.findByPk(listingId);
      if (!listing || listing.status !== 'active') return res.status(404).json({ error: 'Listing not found or not active' });
      if (listing.sellerId === userId) return res.status(400).json({ error: 'Cannot buy your own listing' });
      const buyerChar = await Character.findOne({ where: { userId } });
      if (!buyerChar) return res.status(404).json({ error: 'Character not found' });
      if (buyerChar.money < listing.price) return res.status(400).json({ error: 'Not enough money' });
      // Transfer money
      const sellerChar = await Character.findByPk(listing.sellerId);
      if (!sellerChar) return res.status(404).json({ error: 'Seller not found' });
      buyerChar.money -= listing.price;
      sellerChar.money += listing.price;
      await buyerChar.save();
      await sellerChar.save();
      // Add item to buyer inventory
      await InventoryService.addItemToInventory(userId, listing.itemType, listing.itemId, 1);
      // Mark listing as sold
      listing.status = 'sold';
      listing.buyerId = buyerChar.id;
      listing.soldAt = new Date();
      await listing.save();

      // Create notifications for both buyer and seller
      try {
        // Notification for buyer
        const buyerNotification = await BlackMarketService.createItemPurchasedNotification(
          userId,
          listing.name,
          listing.price
        );
        emitNotification(userId, buyerNotification);

        // Notification for seller
        const sellerNotification = await BlackMarketService.createListingSoldNotification(
          sellerChar.userId,
          listing.name,
          listing.price
        );
        emitNotification(sellerChar.userId, sellerNotification);
      } catch (notificationError) {
        console.error('[BlackMarketController] Buy listing notification error:', notificationError);
      }

      res.json({ message: 'Item bought', listing });
    } catch (err) {
      res.status(500).json({ error: 'Failed to buy listing' });
    }
  }

  static async cancelListing(req, res) {
    try {
      const userId = req.user.id;
      const { listingId } = req.body;
      if (!listingId) return res.status(400).json({ error: 'No listingId' });
      const listing = await BlackMarketListing.findByPk(listingId);
      if (!listing || listing.status !== 'active') return res.status(404).json({ error: 'Listing not found or not active' });
      // Only seller can cancel
      const char = await Character.findOne({ where: { userId } });
      if (!char || listing.sellerId !== char.id) return res.status(403).json({ error: 'Not your listing' });
      // Return item to inventory
      await InventoryService.addItemToInventory(userId, listing.itemType, listing.itemId, 1);
      listing.status = 'cancelled';
      await listing.save();

      // Create notification for listing cancelled
      try {
        const notification = await BlackMarketService.createListingCancelledNotification(
          userId,
          listing.name
        );
        emitNotification(userId, notification);
      } catch (notificationError) {
        console.error('[BlackMarketController] Listing cancelled notification error:', notificationError);
      }

      res.json({ message: 'Listing cancelled', listing });
    } catch (err) {
      res.status(500).json({ error: 'Failed to cancel listing' });
    }
  }
} 