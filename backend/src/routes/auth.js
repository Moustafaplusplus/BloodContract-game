import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Character from '../models/character.js';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

/* ─────────── POST /api/auth/signup ─────────── */
router.post('/signup', async (req, res) => {
  const { username, nickname, email, password, age } = req.body;
  try {
    /* uniqueness checks */
    if (await User.findOne({ where: { email } }))
      return res.status(400).json({ message: 'البريد مستخدم مسبقاً' });

    if (await User.findOne({ where: { username } }))
      return res.status(400).json({ message: 'اسم المستخدم مستخدم مسبقاً' });

    /* create user + default character */
    const user = await User.create({ username, nickname, email, password, age });
    const character = await Character.create({ userId: user.id }); // save character instance

    /* include characterId and initial level in JWT */
    const token = jwt.sign(
      { id: user.id, characterId: character.id, level: character.level ?? 1 },
      SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token });
  } catch (err) {
    console.error('🔥 Signup error:', err);
    res.status(500).json({ message: 'فشل التسجيل', error: err.message });
  }
});

/* ─────────── POST /api/auth/login ─────────── */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !user.validPassword(password))
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });

    /* ensure character exists and retrieve it */
    const [character] = await Character.findOrCreate({ where: { userId: user.id } });

    /* include characterId and current level in JWT */
    const token = jwt.sign(
      { id: user.id, characterId: character.id, level: character.level ?? 1 },
      SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token });
  } catch (err) {
    console.error('🔥 Login error:', err);
    res.status(500).json({ message: 'فشل تسجيل الدخول', error: err.message });
  }
});

export default router;
