import express from 'express';
import { TaskController } from '../controllers/TaskController.js';
import { adminAuth } from '../middleware/admin.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Admin routes - apply both auth and adminAuth middleware
router.post('/', auth, adminAuth, TaskController.createTask);
router.put('/:id', auth, adminAuth, TaskController.updateTask);
router.delete('/:id', auth, adminAuth, TaskController.deleteTask);
router.get('/all', auth, adminAuth, TaskController.listTasks);

// Player routes
router.get('/', auth, TaskController.listPlayerTasks);
router.post('/collect', auth, TaskController.collectTaskReward);

// Promotion routes
router.get('/promotion/status', auth, TaskController.getPromotionStatus);

// Admin promotion routes
router.get('/promotions', auth, adminAuth, TaskController.listPromotions);
router.post('/promotions', auth, adminAuth, TaskController.createPromotion);
router.put('/promotions/:id', auth, adminAuth, TaskController.updatePromotion);
router.delete('/promotions/:id', auth, adminAuth, TaskController.deletePromotion);

// Daily task routes
router.get('/daily/status', auth, TaskController.getDailyTaskStatus);
router.post('/daily/claim', auth, TaskController.claimDailyTask);

// Unclaimed count route
router.get('/unclaimed-count', auth, TaskController.getUnclaimedCount);

export default router; 