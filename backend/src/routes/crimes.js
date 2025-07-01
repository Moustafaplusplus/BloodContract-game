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

  await char.update({
    energy: char.energy - crime.energyCost,
    money: success ? char.money + reward : char.money,
    lastCrimeAt: new Date(),
  });

  res.json({ success, reward: success ? reward : 0 });
});

export default router;
