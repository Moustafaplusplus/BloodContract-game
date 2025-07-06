// ── backend/src/routes/jail.js
import { Router } from 'express';
import { Op } from 'sequelize';
import auth from '../middlewares/auth.js';
import Jail from '../models/jail.js';
import User from '../models/user.js';

const router = Router();

// Constants for bail calculation (designer‑tweakable)
const BASE_BAIL_FEE = 50;        // flat charge in $
const PER_MINUTE_FEE = 5;        // additional $ per remaining minute

// GET /api/jail  – return current jail status for the authed user
router.get('/', auth, async (req, res) => {
  const { id: userId } = req.user;
  const now = new Date();

  const record = await Jail.findOne({
    where: {
      userId,
      releasedAt: { [Op.gt]: now },
    },
  });

  if (!record) return res.json({ inJail: false });

  const remainingMs = record.releasedAt.getTime() - now.getTime();
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  const cost = BASE_BAIL_FEE + remainingMinutes * PER_MINUTE_FEE;

  res.json({
    inJail: true,
    remainingSeconds,
    cost,           // cost to bail out right now
    crimeId: record.crimeId,
  });
});

// POST /api/jail/bail – pay and leave jail immediately
router.post('/bail', auth, async (req, res) => {
  const { id: userId } = req.user;
  const now = new Date();

  const record = await Jail.findOne({
    where: {
      userId,
      releasedAt: { [Op.gt]: now },
    },
  });

  if (!record) return res.status(400).json({ error: 'Not in jail' });

  const remainingMs = record.releasedAt.getTime() - now.getTime();
  const remainingMinutes = Math.ceil(remainingMs / 60000);
  const cost = BASE_BAIL_FEE + remainingMinutes * PER_MINUTE_FEE;

  // Check balance & deduct money atomically
  const user = await User.findByPk(userId);
  if (user.cash < cost) return res.status(400).json({ error: 'Insufficient funds' });

  await user.update({ cash: user.cash - cost });
  await record.destroy();

  res.json({ success: true, newCash: user.cash });
});

export default router;