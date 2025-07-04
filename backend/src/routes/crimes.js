// backend/src/routes/crimes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

import Crime from '../models/crime.js';
import Character from '../models/character.js';
import CrimeLog from '../models/crimeLog.js';       // <- new table, see 2
import Jail     from '../models/jail.js';           // -> simple placeholder model
import Hospital from '../models/hospital.js';       // -> simple placeholder model

const router = express.Router();

// GET /api/crimes               → list crimes filtered by player level
router.get('/', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
  const char = await Character.findOne({ where: { userId } });

  const crimes = await Crime.findAll({
    where: { req_level: { [Op.lte]: char.level } },
    order: [['id', 'ASC']],
  });
  res.json(crimes);
});

// POST /api/crimes/execute/:crimeId
router.post('/execute/:crimeId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);

    const crimeId = Number(req.params.crimeId);
    const crime   = await Crime.findByPk(crimeId);
    if (!crime) return res.status(404).send('crime not found');

    const char = await Character.findOne({ where: { userId } });

    // cooldown = 60 s
    const lastLog = await CrimeLog.findOne({
      where: { userId, crimeId },
      order: [['ts', 'DESC']],
    });
    if (lastLog && Date.now() - lastLog.ts.getTime() < 60_000) {
      return res.status(429).send('cooldown');
    }

    // costs
    if (char.courage < crime.courage_cost)
      return res.status(400).send('not enough courage');

    char.courage -= crime.courage_cost;

    // ---------- success formula ----------
    const courageWeight = 0.55;
    const intelWeight   = 0.35;
    const randFactor    = Math.random() * 0.20; // 0-0.2

    const score =
      courageWeight * (char.courage / 100) +
      intelWeight * (char.intel / crime.req_intel) +
      randFactor;

    const success = score >= 0.65; // tweakable threshold

    let payout = 0;

    if (success) {
      payout = crime.base_payout + Math.floor(Math.random() * 8);
      char.money += payout;
      char.xp    += Math.floor(crime.req_level * 2);
    } else {
      // 50 % chance jail, 50 % hospital
      if (Math.random() < 0.5) {
        await Jail.create({ userId, minutes: 3 });
      } else {
        await Hospital.create({ userId, hpLost: 20, minutes: 2 });
        char.hp = Math.max(0, char.hp - 20);
      }
    }

    await char.save();
    await CrimeLog.create({ userId, crimeId, success, payout });

    res.json({
      success,
      payout,
      courageLeft: char.courage,
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router;
