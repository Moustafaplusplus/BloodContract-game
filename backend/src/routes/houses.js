import express from 'express';
import { HouseController } from '../controllers/HouseController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all house routes
router.use(auth);

// GET /api/houses - Get all available houses
router.get('/', HouseController.getAllHouses);

// GET /api/houses/mine - Get user's current house
router.get('/mine', HouseController.getUserHouse);

// GET /api/houses/owned - Get all houses owned by the user
router.get('/owned', HouseController.getUserHouses);

// POST /api/houses/buy - Buy a house
router.post('/buy', HouseController.buyHouse);

// POST /api/houses/equip - Equip a house
router.post('/equip', HouseController.equipHouse);

// POST /api/houses/mine/sell - Sell current house
router.post('/mine/sell', HouseController.sellHouse);

// POST /api/houses/sell - Sell any owned house
router.post('/sell', HouseController.sellHouse);

export default router; 