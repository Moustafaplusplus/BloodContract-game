import express from 'express';
import { AdminSystemController } from '../controllers/AdminSystemController.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/admin.js';

const router = express.Router();

// Apply auth and admin middleware to all admin system routes
router.use(auth);
router.use(adminAuth);

// User management routes
router.post('/users/:userId/ban', AdminSystemController.toggleUserBan);

// IP management routes
router.get('/users/:userId/ips', AdminSystemController.getUserIps);
router.post('/ips/block', AdminSystemController.blockIp);
router.delete('/ips/:ipAddress/unblock', AdminSystemController.unblockIp);
router.get('/ips/blocked', AdminSystemController.getBlockedIps);
router.get('/ips/flagged', AdminSystemController.getFlaggedIps);
router.get('/ips/stats', AdminSystemController.getIpStats);

// Statistics routes
router.get('/users/:userId/stats', AdminSystemController.getUserStats);
router.get('/stats', AdminSystemController.getSystemStats);

export default router; 