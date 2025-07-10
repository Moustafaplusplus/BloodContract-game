import express from 'express';
import { GoldController } from '../controllers/GoldController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /gold-market/packages - Get gold packages (no auth required)
router.get('/packages', GoldController.getGoldPackages);

// GET /gold-market/vip/prices - Get VIP prices (no auth required)
router.get('/vip/prices', GoldController.getVIPPrices);

// Apply auth middleware to user-specific routes
router.use(auth);

// POST /gold-market/purchase - Purchase gold
router.post('/purchase', GoldController.purchaseGold);

// POST /gold-market/vip/purchase - Purchase VIP membership
router.post('/vip/purchase', GoldController.purchaseVIP);

// GET /gold-market/vip/status - Get user's VIP status
router.get('/vip/status', GoldController.getUserVIPStatus);

// GET /gold-market/history - Get user's transaction history
router.get('/history', GoldController.getUserTransactionHistory);

// Admin routes
// GET /gold-market/admin/stats - Get gold statistics
router.get('/admin/stats', GoldController.getGoldStats);

export default router; 