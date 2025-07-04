// src/routes/hospital.js
import express from 'express';
import jwt from 'jsonwebtoken';
import Hospital from '../models/hospital.js';
import Character from '../models/character.js';

const router = express.Router();

/* helper: seconds left from minutes + startedAt */
const secsLeft = (rec) =>
  Math.max(
    0,
    rec.minutes * 60 - Math.floor((Date.now() - new Date(rec.startedAt)) / 1000),
  );

/* ── GET /api/hospital/me ───────────────────────── */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
    const hosp = await Hospital.findOne({ where: { userId } });

    if (!hosp) return res.json({ inHospital: false });

    const remaining = secsLeft(hosp);

    if (remaining === 0) {
      await hosp.destroy();
      return res.json({ inHospital: false });
    }

    res.json({
      inHospital: true,
      remaining,
      hpLost: hosp.hpLost,
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

/* ── POST /api/hospital/heal  (pay doctor, heal instantly) ── */
router.post('/heal', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
    const hosp = await Hospital.findOne({ where: { userId } });
    if (!hosp) return res.status(400).json({ message: 'لست في المستشفى' });

    const doctorFee = 200;                          // tweak as you like
    const char = await Character.findOne({ where: { userId } });

    if (char.money < doctorFee)
      return res
        .status(400)
        .json({ message: 'لا تملك مالًا كافيًا لدفع الطبيب' });

    char.money -= doctorFee;
    char.hp    += hosp.hpLost;                      // restore lost HP
    await char.save();
    await hosp.destroy();

    res.json({ message: 'تم شفاؤك بالكامل' });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

export default router;
