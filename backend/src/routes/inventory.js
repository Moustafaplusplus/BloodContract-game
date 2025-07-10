import express from 'express';
import { InventoryController } from '../controllers/InventoryController.js';

const router = express.Router();

// GET /api/inventory - Get user's inventory
router.get('/', InventoryController.getInventory);

// POST /api/inventory/equip - Equip an item
router.post('/equip', InventoryController.equipItem);

// POST /api/inventory/unequip - Unequip an item
router.post('/unequip', InventoryController.unequipItem);

// POST /api/inventory/sell - Sell an item
router.post('/sell', InventoryController.sellItem);

export default router; 