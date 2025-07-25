import express from 'express';
import { BlackMarketController } from '../controllers/BlackMarketController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /black-market - Get all available items (no auth required)
router.get('/', BlackMarketController.getAvailableItems);

// USER-TO-USER LISTINGS
router.get('/listings', BlackMarketController.getAllListings); // public
router.get('/listings/my', auth, BlackMarketController.getMyListings); // user only
router.post('/listings', auth, BlackMarketController.postListing); // user only
router.post('/listings/buy', auth, BlackMarketController.buyListing); // user only
router.post('/listings/cancel', auth, BlackMarketController.cancelListing); // user only

// GET /black-market/:id - Get item by ID (no auth required)
router.get('/:id', BlackMarketController.getItemById);

// Apply auth middleware to user-specific routes
router.use(auth);

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