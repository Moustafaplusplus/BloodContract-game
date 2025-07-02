import express from 'express';
import auth from '../middlewares/auth.js'; // ✅ Import auth middleware
import Crime from '../models/crime.js';
import Character from '../models/character.js';
import { randomInt } from 'crypto';

const router = express.Router();

// 🔒 Protect both routes with auth middleware
router.get('/', auth, async (_req, res) => {
  const crimes = await Crime.findAll();
  res.json(crimes);
});

router.post('/commit', auth, async (req, res) => {
  const { crimeId } = req.body;
  const crime = await Crime.findByPk(crimeId);
  const char = await Character.findOne({ where: { userId: req.user.id } });

  if (!crime || !char) {
    return res.status(404).json({ message: 'بيانات غير متوفرة' });
  }

  if (char.energy < crime.energyCost) {
    return res.status(400).json({ message: 'طاقة غير كافية' });
  }

  const success = Math.random() <= crime.successRate;
  const reward = randomInt(crime.minReward, crime.maxReward + 1);
  const xpGain = success ? 25 : 5;

  char.energy -= crime.energyCost;
  if (success) char.money += reward;
  char.lastCrimeAt = new Date();

  await char.save();
  await char.addXp(xpGain);

  res.json({
    success,
    reward: success ? reward : 0,
    xpGained: xpGain,
    level: char.level,
    xp: char.xp,
    xpToNext: char.level * 100,
  });
});

export default router;
