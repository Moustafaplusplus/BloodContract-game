import express from 'express';
import { CarController } from '../controllers/CarController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';

const router = express.Router();

// GET /api/cars - Get all available cars (no auth required)
router.get('/', CarController.getAllCars);

// Apply auth middleware to user-specific routes
router.use(auth);

// GET /api/cars/user - Get user's cars
router.get('/user', CarController.getUserCars);

// GET /api/cars/user/active - Get user's active car
router.get('/user/active', CarController.getUserActiveCar);

// POST /api/cars/buy - Buy a car
router.post('/buy', CarController.buyCar);

// POST /api/cars/:carId/activate - Activate a car
router.post('/:carId/activate', CarController.activateCar);

// POST /api/cars/deactivate - Deactivate current car
router.post('/deactivate', CarController.deactivateCar);

// DELETE /api/cars/:carId/sell - Sell a car
router.delete('/:carId/sell', CarController.sellCar);

export default router; 