import { Router } from 'express';
import { Crime } from '../models/crime.js';
import { randomInt } from 'crypto';

const router = Router();

/* ------------------------------------------------------------
 * GET /api/crimes   →  list all crimes
 * ---------------------------------------------------------- */
router.get('/', async (_req, res) => {
  const crimes = await Crime.findAll({ order: [['id', 'ASC']] });
  res.json(crimes);
});

/* ------------------------------------------------------------
 * POST /api/crimes/commit { crimeId }
 * Returns { success:boolean, reward:number }
 * ---------------------------------------------------------- */
router.post('/commit', async (req, res) => {
  const { crimeId } = req.body;

  const crime = await Crime.findByPk(crimeId);
  if (!crime) return res.status(404).json({ message: 'Crime not found' });

  const success = Math.random() <= crime.successRate;
  const reward  = success ? randomInt(crime.minReward, crime.maxReward + 1) : 0;

  // TODO: deduct energy / add money once user system is in place
  res.json({ success, reward });
});

export default router;
