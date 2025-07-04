// backend/src/routes/fight.js
import express from 'express';
import jwt from 'jsonwebtoken';

import Character from '../models/character.js';
import User      from '../models/user.js';
import Fight     from '../models/fight.js';
import { calculateFightResult } from '../utils/fightEngine.js';

const router = express.Router();

/**
 * POST /api/fight/:defenderId
 * • Reads attacker from JWT
 * • Loads attacker/defender character + username
 * • Runs 20-round fight
 * • Persists fight log in JSONB column
 */
router.post('/:defenderId', async (req, res) => {
  try {
    // ───── auth ─────
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    const { id: attackerId } = jwt.verify(token, process.env.JWT_SECRET);

    const defenderId = Number(req.params.defenderId);

    // ───── load chars + usernames ─────
    const [atkChar, defChar] = await Promise.all([
      Character.findOne({ where: { userId: attackerId } }),
      Character.findOne({ where: { userId: defenderId } }),
    ]);
    if (!atkChar || !defChar)
      return res.status(404).json({ error: 'Character not found' });

    const [atkUser, defUser] = await Promise.all([
      User.findByPk(attackerId),
      User.findByPk(defenderId),
    ]);

    const attacker = { ...atkChar.toJSON(), username: atkUser.username };
    const defender = { ...defChar.toJSON(), username: defUser.username };

    // ───── run fight ─────
    const result = calculateFightResult(attacker, defender);

    // ───── persist log ─────
    await Fight.create({
      attacker_id: attacker.userId,
      defender_id: defender.userId,
      winner_id: result.winnerId,
      damage_given: result.totalDamage,
      log: result.log, // JSONB column
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fight failed', details: err.message });
  }
});

export default router;
