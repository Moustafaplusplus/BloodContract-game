import express from 'express';
import { BlackMarketController } from '../controllers/BlackMarketController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';

const router = express.Router();

// GET /black-market - Get all available items (no auth required)
router.get('/', BlackMarketController.getAvailableItems);

// USER-TO-USER LISTINGS
router.get('/listings', BlackMarketController.getAllListings); // public
router.get('/listings/my', firebaseAuth, BlackMarketController.getMyListings); // user only
router.post('/listings', firebaseAuth, BlackMarketController.postListing); // user only
router.post('/listings/buy', firebaseAuth, BlackMarketController.buyListing); // user only
router.post('/listings/cancel', firebaseAuth, BlackMarketController.cancelListing); // user only

// GET /black-market/:id - Get item by ID (no auth required)
router.get('/:id', BlackMarketController.getItemById);

// Apply auth middleware to user-specific routes
router.use(firebaseAuth);

// POST /black-market/buy - Buy an item
router.post('/buy', BlackMarketController.buyItem);

// GET /black-market/user/history - Get user's purchase history
router.get('/user/history', BlackMarketController.getUserPurchaseHistory);

// Admin routes (you might want to add admin middleware here)
// GET /black-market/admin/stats - Get market statistics
router.get('/admin/stats', BlackMarketController.getMarketStats);

// PUT /black-market/admin/:id/availability - Update item availability
router.put('/admin/:id/availability', BlackMarketController.updateItemAvailability);

// PUT /black-market/admin/:id/stock - Update item stock
router.put('/admin/:id/stock', BlackMarketController.updateItemStock);

export default router; 