import express from 'express';
import BotController from '../controllers/BotController.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/admin.js';

const router = express.Router();

// All routes require admin authentication
router.use(auth);
router.use(adminAuth);

// Get bot statistics
router.get('/stats', BotController.getBotStats);

// Get all bots with pagination
router.get('/', BotController.getAllBots);

// Get online bots
router.get('/online', BotController.getOnlineBots);

// Get bots by level range
router.get('/by-level', BotController.getBotsByLevel);

// Get bot targets for contracts
router.get('/targets', BotController.getBotTargets);

// Bot activity management
router.get('/activity/status', BotController.getBotActivityStatus);
router.post('/activity/start', BotController.startBotActivity);
router.post('/activity/stop', BotController.stopBotActivity);
router.post('/activity/update', BotController.updateBotActivity);

// Bot management
router.delete('/all', BotController.deleteAllBots);

// Manual stats update
router.post('/update-stats', BotController.updateBotStats);

export default router; 