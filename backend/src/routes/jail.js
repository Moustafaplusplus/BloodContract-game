// src/routes/jail.js
import express from 'express';
import jwt from 'jsonwebtoken';
import Jail from '../models/jail.js';
import Character from '../models/character.js';

const router = express.Router();

/* helper: seconds remaining for this record */
const remainingSecs = (j) =>
  Math.max(
    0,
    j.minutes * 60 - Math.floor((Date.now() - new Date(j.startedAt)) / 1000),
  );

/* ── GET /api/jail/me ───────────────────────────── */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
    const jail = await Jail.findOne({ where: { userId } });

    if (!jail) return res.json({ inJail: false });

    const remaining = remainingSecs(jail);

    if (remaining === 0) {
      await jail.destroy();
      return res.json({ inJail: false });
    }

    return res.json({ inJail: true, remaining });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

/* ── POST /api/jail/bail ────────────────────────── */
router.post('/bail', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
    const jail = await Jail.findOne({ where: { userId } });
    if (!jail) return res.status(400).json({ message: 'لست في السجن' });

    const bailCost = 250;
    const char = await Character.findOne({ where: { userId } });

    if (char.money < bailCost)
      return res
        .status(400)
        .json({ message: 'لا تملك مالًا كافيًا لدفع الكفالة' });

    char.money -= bailCost;
    await char.save();
    await jail.destroy();

    res.json({ message: 'تم إطلاق سراحك' });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

export default router;
