import { InventoryService } from '../services/InventoryService.js';
import jwt from 'jsonwebtoken';

export class InventoryController {
  // Helper to get userId from token
  static getUserId(req) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    try { 
      return jwt.verify(token, process.env.JWT_SECRET).id; 
    } catch { 
      return null; 
    }
  }

  static async getInventory(req, res) {
    const userId = this.getUserId(req);
    if (!userId) return res.sendStatus(401);

    try {
      const inventory = await InventoryService.getUserInventory(userId);
      res.json(inventory);
    } catch (error) {
      console.error('[Inventory] GET failed', error);
      res.sendStatus(500);
    }
  }

  static async equipItem(req, res) {
    const userId = this.getUserId(req);
    if (!userId) return res.sendStatus(401);

    try {
      const { type, itemId } = req.body;
      const result = await InventoryService.equipItem(userId, type, itemId);
      res.json(result);
    } catch (error) {
      if (error.message === 'invalid type') {
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
    const userId = this.getUserId(req);
    if (!userId) return res.sendStatus(401);

    try {
      const { type } = req.body;
      const result = await InventoryService.unequipItem(userId, type);
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
    const userId = this.getUserId(req);
    if (!userId) return res.sendStatus(401);

    try {
      const { type, itemId } = req.body;
      const result = await InventoryService.sellItem(userId, type, itemId);
      res.json(result);
    } catch (error) {
      if (error.message === 'invalid type') {
        return res.status(400).json({ message: error.message });
      }
      if (error.message === 'item not owned') {
        return res.status(404).json({ message: error.message });
      }
      console.error('[Inventory] Sell failed', error);
      res.sendStatus(500);
    }
  }
} 