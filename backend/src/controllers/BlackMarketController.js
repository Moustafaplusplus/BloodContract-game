import { BlackMarketService } from '../services/BlackMarketService.js';

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
} 