import { SpecialItemService } from '../services/SpecialItemService.js';

export class SpecialItemController {
  static async getSpecialItems(req, res) {
    try {
      const filters = {};
      if (req.query.currency) filters.currency = req.query.currency;
      if (req.query.type) filters.type = req.query.type;
      
      const items = await SpecialItemService.getAllSpecialItems(filters);
      res.json(items);
    } catch (error) {
      console.error('Get special items error:', error);
      res.sendStatus(500);
    }
  }

  static async buySpecialItem(req, res) {
    try {
      const quantity = parseInt(req.body.quantity) || 1;
      const result = await SpecialItemService.purchaseSpecialItem(req.user.id, req.params.id, quantity);
      res.json(result);
    } catch (error) {
      console.error('Buy special item error:', error);
      if (error.message === 'العنصر غير موجود') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'لا تملك مالاً كافياً' || error.message === 'لا تملك عملة سوداء كافية') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'فشل شراء العنصر الخاص' });
    }
  }

  static async useSpecialItem(req, res) {
    try {
      const result = await SpecialItemService.useSpecialItem(req.user.id, req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Use special item error:', error);
      if (error.message === 'العنصر غير موجود' || error.message === 'لا تملك هذا العنصر') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('يجب الانتظار')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'فشل استخدام العنصر' });
    }
  }

  static async sellSpecialItem(req, res) {
    try {
      const result = await SpecialItemService.sellSpecialItem(req.user.id, req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Sell special item error:', error);
      if (error.message === 'العنصر غير موجود' || error.message === 'لا تملك هذا العنصر') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'فشل بيع العنصر' });
    }
  }

  // Admin methods
  static async getAllSpecialItemsForAdmin(req, res) {
    try {
      const items = await SpecialItemService.getAllSpecialItemsForAdmin();
      res.json(items);
    } catch (error) {
      console.error('Admin get special items error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async createSpecialItem(req, res) {
    try {
      // Basic validation
      const requiredFields = [
        'name', 'description', 'type', 'effect', 'price', 'currency'
      ];
      for (const field of requiredFields) {
        if (req.body[field] === undefined) {
          return res.status(400).json({ error: `Missing field: ${field}` });
        }
      }

      const item = await SpecialItemService.createSpecialItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error('Create special item error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  static async updateSpecialItem(req, res) {
    try {
      const itemId = parseInt(req.params.id, 10);
      if (!itemId) {
        return res.status(400).json({ error: 'Invalid item ID' });
      }

      const item = await SpecialItemService.updateSpecialItem(itemId, req.body);
      if (!item) {
        return res.status(404).json({ error: 'Special item not found' });
      }
      res.json(item);
    } catch (error) {
      console.error('Update special item error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  static async deleteSpecialItem(req, res) {
    try {
      const itemId = parseInt(req.params.id, 10);
      if (!itemId) {
        return res.status(400).json({ error: 'Invalid item ID' });
      }

      const success = await SpecialItemService.deleteSpecialItem(itemId);
      if (!success) {
        return res.status(404).json({ error: 'Special item not found' });
      }
      res.json({ message: 'Special item deleted successfully' });
    } catch (error) {
      console.error('Delete special item error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const imageUrl = `/special-items/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error('Upload special item image error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
} 