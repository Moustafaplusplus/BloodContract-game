// backend/src/routes/crimes.js
// Crime listing + execution (user-centric version)

import express from 'express';
import auth    from '../middlewares/auth.js';

/* ─── models ───────────────────────────────────────────── */
import Crime     from '../models/crime.js';
import Character from '../models/character.js';
import Hospital  from '../models/hospital.js';
import Jail      from '../models/jail.js';
/* ──────────────────────────────────────────────────────── */

import { giveReward, ACTIONS } from '../services/rewardService.js';

const router = express.Router();

/* helper: success chance (0-1) */
const calcChance = (level, baseRate) =>
  Math.min(baseRate + Math.max(level - 1, 0) * 0.03, 0.95);   // +3 %/lvl, cap 95 %

const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/* ─────────────────────────────────────────────────────────
 * GET /api/crimes
 * ──────────────────────────────────────────────────────── */
router.get('/', auth, async (req, res) => {
  try {
    const level  = req.user.level ?? 1;
    const crimes = await Crime.findAll({ where: { isEnabled: true } });

    const list = crimes
      .filter(c => c.req_level <= level)
      .map(c => ({
        id:         c.id,
        name:       c.name,
        req_level:  c.req_level,
        energyCost: c.energyCost,
        minReward:  c.minReward,
        maxReward:  c.maxReward,
        cooldown:   c.cooldown,
        chance:     Math.round(calcChance(level, c.successRate) * 100), // 0-100 %
      }));

    res.json(list);
  } catch (err) {
    console.error('GET /crimes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* core executor shared by both POST styles */
const runCrime = async (req, res) => {
  const crimeId = parseInt(req.params.crimeId ?? req.body.crimeId, 10);
  if (!crimeId) return res.status(400).json({ error: 'crimeId required' });

  try {
    const crime = await Crime.findByPk(crimeId);
    if (!crime || !crime.isEnabled)
      return res.status(404).json({ error: 'Crime not found' });

    const character = await Character.findOne({ where: { userId: req.user.id } });
    if (!character)
      return res.status(404).json({ error: 'Character not found' });

    if (character.level   < crime.req_level)
      return res.status(400).json({ error: 'Level too low' });
    if (character.energy < crime.energyCost)
      return res.status(400).json({ error: 'Not enough energy' });

    if (crime.req_intel && character.intel < crime.req_intel)
      return res.status(400).json({ error: 'Not enough intelligence' });

    const nowMs = Date.now();
    if (character.crimeCooldown && character.crimeCooldown > nowMs)
      return res.status(429).json({
        error:        'Crime on cooldown',
        cooldownLeft: Math.ceil((character.crimeCooldown - nowMs) / 1000),
      });

    const baseRate = parseFloat(crime.successRate);
    const chance   = calcChance(character.level, baseRate);
    const success  = Math.random() < chance;
    let   payout   = 0;
    let   redirect = null;

    if (success) {
      payout       = randInt(crime.minReward, crime.maxReward);
      character.money += payout;

      await giveReward({
        character,
        action: ACTIONS.CRIME_SUCCESS,
        context: { energyCost: crime.energyCost },
      });

    } else if (crime.jailMinutes) {
      redirect = 'jail';
      await Jail.create({
        userId:     character.id,
        minutes:    crime.jailMinutes,
        bailRate:   crime.bailRate,
        releasedAt: new Date(nowMs + crime.jailMinutes * 60000),
      });

      await giveReward({ character, action: ACTIONS.CRIME_FAIL });

    } else {
      redirect = 'hospital';
      await Hospital.create({
        userId:     character.id,
        minutes:    crime.hospitalMinutes,
        hpLoss:     crime.hpLoss,
        healRate:   crime.healRate,
        releasedAt: new Date(nowMs + crime.hospitalMinutes * 60000),
      });

      await giveReward({ character, action: ACTIONS.CRIME_FAIL });
    }

    character.energy       -= crime.energyCost;
    character.crimeCooldown = nowMs + crime.cooldown * 1000;
    await character.save();

    res.json({
      success,
      payout,
      energyLeft:   character.energy,
      cooldownLeft: crime.cooldown,
      redirect,
    });
  } catch (err) {
    console.error('POST /crimes/execute error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/* POST /api/crimes/execute/:crimeId */
router.post('/execute/:crimeId', auth, runCrime);
/* POST /api/crimes/execute        { crimeId } */
router.post('/execute',           auth, runCrime);

export default router;
