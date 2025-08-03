import express from 'express';
import { InventoryController } from '../controllers/InventoryController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';

const router = express.Router();

// Apply auth middleware to all inventory routes
router.use(firebaseAuth);

// GET /api/inventory - Get user's inventory
router.get('/', InventoryController.getInventory);

// POST /api/inventory/equip - Equip an item
router.post('/equip', InventoryController.equipItem);

// POST /api/inventory/unequip - Unequip an item
router.post('/unequip', InventoryController.unequipItem);

// POST /api/inventory/sell - Sell an item
router.post('/sell', InventoryController.sellItem);

// POST /api/inventory/use-special - Use a special item
router.post('/use-special', InventoryController.useSpecialItem);

export default router; 