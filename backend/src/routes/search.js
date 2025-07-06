// 📁 backend/src/routes/search.js
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import auth      from '../middlewares/auth.js';
import User      from '../models/user.js';

const router = Router();
router.get('/players', auth, rateLimit({ windowMs: 10 * 1000, max: 60 }), async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const regex = new RegExp('^' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const players = await User.find({ username: regex }).limit(20).select('username level');
    res.json(players);
  } catch (e) { next(e); }
});
export default router;