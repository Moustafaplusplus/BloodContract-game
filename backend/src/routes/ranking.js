import { Router } from 'express';
import { RankingService } from '../services/RankingService.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();

// GET /ranking?sort=fame&limit=50
router.get('/', cacheMiddleware(60), async (req, res) => {
  try {
    const { sort, limit } = req.query;
    const rankings = await RankingService.getTopRanked({ sort, limit });
    res.json(rankings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
