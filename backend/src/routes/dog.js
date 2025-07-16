import express from 'express';
import { DogController } from '../controllers/DogController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/dogs - Get all available dogs
router.get('/', DogController.getAllDogs);

// Authenticated routes
router.use(auth);

// GET /api/dogs/user - Get user's dogs
router.get('/user', DogController.getUserDogs);

// GET /api/dogs/user/active - Get user's active dog
router.get('/user/active', DogController.getUserActiveDog);

// POST /api/dogs/buy - Buy a dog
router.post('/buy', DogController.buyDog);

// POST /api/dogs/activate - Activate a dog
router.post('/activate', DogController.activateDog);

// POST /api/dogs/deactivate - Deactivate current dog
router.post('/deactivate', DogController.deactivateDog);

// POST /api/dogs/sell - Sell a dog
router.post('/sell', DogController.sellDog);

export default router; 