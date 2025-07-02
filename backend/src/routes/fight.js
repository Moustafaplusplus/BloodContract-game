import express from 'express';
import User from '../models/user.js';
import Fight from '../models/fight.js';
import { calculateFightResult } from '../utils/fightEngine.js';
import auth from '../middlewares/auth.js'; // ✅ ADDED

const router = express.Router();

router.post('/:id', auth, async (req, res) => {
  try {
    const attackerId = req.user.id;
    const defenderId = req.params.id;

    const attacker = await User.findByPk(attackerId);
    const defender = await User.findByPk(defenderId);

    if (!attacker || !defender)
      return res.status(404).json({ error: 'User not found' });

    const result = calculateFightResult(attacker, defender);

    await Fight.create({
      attacker_id: attacker.id,
      defender_id: defender.id,
      winner_id: result.winnerId,
      damage_given: result.totalDamage,
      log: result.log,
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Fight failed', details: err.message });
  }
});

export default router;
