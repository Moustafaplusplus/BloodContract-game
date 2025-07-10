import express from 'express';
import { AchievementController } from '../controllers/AchievementController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/achievements - Get all achievements (no auth required)
router.get('/', AchievementController.getAllAchievements);

// GET /api/achievements/stats - Get achievement statistics (no auth required)
router.get('/stats', AchievementController.getAchievementStats);

// GET /api/achievements/leaderboard - Get achievement leaderboard (no auth required)
router.get('/leaderboard', AchievementController.getAchievementLeaderboard);

// Apply auth middleware to user-specific routes
router.use(auth);

// GET /api/achievements/user - Get user's achievements
router.get('/user', AchievementController.getUserAchievements);

// POST /api/achievements/check - Check achievements for current user
router.post('/check', AchievementController.checkAchievements);

export default router; 