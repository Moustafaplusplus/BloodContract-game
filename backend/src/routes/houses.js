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

// POST /api/houses/buy - Buy a house
router.post('/buy', HouseController.buyHouse);

// POST /api/houses/mine/sell - Sell current house
router.post('/mine/sell', HouseController.sellHouse);

export default router; 