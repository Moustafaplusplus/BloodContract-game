import express from 'express';
import { SearchController } from '../controllers/SearchController.js';
import { validate } from '../middleware/validation.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// GET /api/v1/search/users - Search users (no auth required)
router.get('/users', cacheMiddleware(30), validate('searchUsers'), SearchController.searchUsers);

// GET /api/v1/search/top-players - Get top players (no auth required)
router.get('/top-players', cacheMiddleware(60), validate('searchUsers'), SearchController.getTopPlayers);

export default router; 