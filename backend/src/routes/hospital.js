// ── backend/src/routes/hospital.js
import { Router } from 'express';
import { Op } from 'sequelize';
import auth from '../middlewares/auth.js';
import Hospital from '../models/hospital.js';
import User from '../models/user.js';

const router = Router();

const BASE_HEAL_FEE = 40;        // flat charge in $
const PER_MINUTE_FEE = 4;        // $ per remaining minute

router.get('/', auth, async (req, res) => {
  const { id: userId } = req.user;
  const now = new Date();

  const record = await Hospital.findOne({
    where: {
      userId,
      releasedAt: { [Op.gt]: now },
    },
  });

  if (!record) return res.json({ inHospital: false });

  const remainingMs = record.releasedAt.getTime() - now.getTime();
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const remainingMinutes = Math.ceil(remainingSeconds / 60);
  const cost = BASE_HEAL_FEE + remainingMinutes * PER_MINUTE_FEE;

  res.json({
    inHospital: true,
    remainingSeconds,
    cost,
    crimeId: record.crimeId,
    hpLoss: record.hpLoss,
  });
});

router.post('/heal', auth, async (req, res) => {
  const { id: userId } = req.user;
  const now = new Date();

  const record = await Hospital.findOne({
    where: {
      userId,
      releasedAt: { [Op.gt]: now },
    },
  });

  if (!record) return res.status(400).json({ error: 'Not in hospital' });

  const remainingMs = record.releasedAt.getTime() - now.getTime();
  const remainingMinutes = Math.ceil(remainingMs / 60000);
  const cost = BASE_HEAL_FEE + remainingMinutes * PER_MINUTE_FEE;

  const user = await User.findByPk(userId);
  if (user.cash < cost) return res.status(400).json({ error: 'Insufficient funds' });

  await user.update({ cash: user.cash - cost, hp: Math.min(user.hp + record.hpLoss, user.maxHp) });
  await record.destroy();

  res.json({ success: true, newCash: user.cash, hp: user.hp });
});

export default router;