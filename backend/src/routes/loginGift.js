import express from 'express';
import { LoginGiftController } from '../controllers/LoginGiftController.js';
import { auth as authMiddleware } from '../middleware/auth.js';
import { adminAuth } from '../middleware/admin.js';

const router = express.Router();

// User routes
router.get('/status', authMiddleware, LoginGiftController.getUserStatus);
router.post('/claim', authMiddleware, LoginGiftController.claimDailyReward);

// Admin routes
router.get('/admin/config', authMiddleware, adminAuth, LoginGiftController.getAdminConfiguration);
router.put('/admin/config/:dayNumber', authMiddleware, adminAuth, LoginGiftController.updateAdminConfiguration);
router.get('/admin/items', authMiddleware, adminAuth, LoginGiftController.getAvailableItems);
router.delete('/admin/reset/:userId', authMiddleware, adminAuth, LoginGiftController.resetUserProgress);

export default router; 