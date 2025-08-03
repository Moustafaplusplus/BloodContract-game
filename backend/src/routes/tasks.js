import express from 'express';
import { TaskController } from '../controllers/TaskController.js';
import { adminAuth } from '../middleware/admin.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';

const router = express.Router();

// Admin routes - apply both auth and adminAuth middleware
router.post('/', firebaseAuth, adminAuth, TaskController.createTask);
router.put('/:id', firebaseAuth, adminAuth, TaskController.updateTask);
router.delete('/:id', firebaseAuth, adminAuth, TaskController.deleteTask);
router.get('/all', firebaseAuth, adminAuth, TaskController.listTasks);

// Player routes
router.get('/', firebaseAuth, TaskController.listPlayerTasks);
router.post('/collect', firebaseAuth, TaskController.collectTaskReward);

// Promotion routes
router.get('/promotion/status', firebaseAuth, TaskController.getPromotionStatus);

// Admin promotion routes
router.get('/promotions', firebaseAuth, adminAuth, TaskController.listPromotions);
router.post('/promotions', firebaseAuth, adminAuth, TaskController.createPromotion);
router.put('/promotions/:id', firebaseAuth, adminAuth, TaskController.updatePromotion);
router.delete('/promotions/:id', firebaseAuth, adminAuth, TaskController.deletePromotion);

// Daily task routes
router.get('/daily/status', firebaseAuth, TaskController.getDailyTaskStatus);
router.post('/daily/claim', firebaseAuth, TaskController.claimDailyTask);

// Unclaimed count route
router.get('/unclaimed-count', firebaseAuth, TaskController.getUnclaimedCount);

export default router; 