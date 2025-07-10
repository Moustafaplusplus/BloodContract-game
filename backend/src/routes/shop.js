import express from 'express';
import { ShopController } from '../controllers/ShopController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/shop/weapons - Get all weapons
router.get('/weapons', ShopController.getWeapons);

// GET /api/shop/armors - Get all armors
router.get('/armors', ShopController.getArmors);

// Apply auth middleware to purchase routes
router.use(auth);

// POST /api/shop/buy/weapon/:id - Buy a weapon
router.post('/buy/weapon/:id', ShopController.buyWeapon);

// POST /api/shop/buy/armor/:id - Buy an armor
router.post('/buy/armor/:id', ShopController.buyArmor);

export default router; 