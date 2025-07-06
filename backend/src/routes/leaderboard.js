
import express from 'express';
import Character from '../models/character.js';

const router = express.Router();

// /api/leaderboard/:metric where metric is money | level | wins
router.get('/:metric', async (req, res, next) => {
  try {
    const { metric } = req.params;
    const allowed = ['money', 'level', 'wins'];
    if (!allowed.includes(metric)) {
      return res.status(400).json({ message: 'Invalid metric' });
    }
    const rows = await Character.findAll({
      order: [[metric, 'DESC']],
      limit: 100,
      attributes: ['id', 'name', metric],
      include: [{ association: 'user', attributes: ['username'] }],
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
