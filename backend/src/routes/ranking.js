import { Router } from 'express';
import { RankingService } from '../services/RankingService.js';

const router = Router();

// GET /ranking?sort=fame&limit=50
router.get('/', async (req, res) => {
  try {
    const { sort, limit } = req.query;
    const rankings = await RankingService.getTopRanked({ sort, limit });
    res.json(rankings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
