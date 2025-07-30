import { InventoryService } from '../services/InventoryService.js';

export class InventoryController {
  static async getInventory(req, res) {
    try {
      const inventory = await InventoryService.getUserInventory(req.user.id);
      res.json(inventory);
    } catch (error) {
      console.error('[Inventory] GET failed', error);
      res.sendStatus(500);
    }
  }

  static async equipItem(req, res) {
    try {
      const { type, itemId, slot } = req.body;
      if (!slot) {
        return res.status(400).json({ message: 'slot is required' });
      }
      const result = await InventoryService.equipItem(req.user.id, type, itemId, slot);
      res.json(result);
    } catch (error) {
      if (error.message === 'invalid type') {
        return res.status(400).json({ message: error.message });
      }
      if (error.message === 'invalid weapon slot' || error.message === 'invalid armor slot') {
        return res.status(400).json({ message: error.message });
      }
      if (error.message === 'item not owned') {
        return res.status(404).json({ message: error.message });
      }
      console.error('[Inventory] Equip failed', error);
      res.sendStatus(500);
    }
  }

  static async unequipItem(req, res) {
    try {
      const { type, slot } = req.body;
      const result = await InventoryService.unequipItem(req.user.id, type, slot);
      res.json(result);
    } catch (error) {
      if (error.message === 'invalid type') {
        return res.status(400).json({ message: error.message });
      }
      console.error('[Inventory] Unequip failed', error);
      res.sendStatus(500);
    }
  }

  static async sellItem(req, res) {
    try {
      const { type, itemId, sellOption = 'quick' } = req.body;
      if (!type || !itemId) {
        return res.status(400).json({ error: 'Type and itemId are required' });
      }
      
      const result = await InventoryService.sellItem(req.user.id, type, itemId, sellOption);
      res.json(result);
    } catch (error) {
      console.error('Sell item error:', error);
      if (error.message === 'item not owned') {
        return res.status(404).json({ error: 'Item not found or not owned' });
      }
      if (error.message === 'invalid type') {
        return res.status(400).json({ error: 'Invalid item type' });
      }
      if (error.message === 'invalid sell option') {
        return res.status(400).json({ error: 'Invalid sell option' });
      }
      res.status(500).json({ error: 'Failed to sell item' });
    }
  }

  static async useSpecialItem(req, res) {
    try {
      console.log('useSpecialItem controller called with body:', req.body);
      const { itemId } = req.body;
      console.log('itemId from body:', itemId);
      const result = await InventoryService.useSpecialItem(req.user.id, itemId);
      console.log('useSpecialItem result:', result);
      res.json(result);
    } catch (error) {
      if (error.message === 'item not owned') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message.includes('cooldown') || error.message.includes('يجب أن تكون المستوى')) {
        return res.status(400).json({ message: error.message });
      }
      console.error('[Inventory] Use special item failed', error);
      res.sendStatus(500);
    }
  }
} 