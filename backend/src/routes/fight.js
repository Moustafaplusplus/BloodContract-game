import express from 'express';
import auth from '../middlewares/auth.js';            // your existing JWT middleware
import { runFight } from '../services/fightService.js';

const router = express.Router();

/**
 * POST /api/fight/:defenderId
 * • Attacker is req.user.id (set by auth middleware)
 * • Defender ID comes from URL
 */
router.post('/:defenderId', auth, async (req, res) => {
  try {
    const attackerId = req.user.id;                  // <- from auth middleware
    const defenderId = Number(req.params.defenderId);

    if (Number.isNaN(defenderId) || defenderId <= 0) {
      return res.status(400).json({ error: 'معرّف المدافع غير صالح' });
    }

    const result = await runFight(attackerId, defenderId);
    res.json(result);
  } catch (err) {
    console.error(err);
    const msg =
      err.message === 'لا يمكنك مهاجمة نفسك' ||
      err.message === 'الشخصية غير موجودة'
        ? err.message
        : 'فشل القتال';
    res.status(400).json({ error: msg, details: err.message });
  }
});

export default router;
