import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

router.post('/signup', async (req, res) => {
  const { username, nickname, email, password, age } = req.body;
  try {
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) return res.status(400).json({ message: 'البريد مستخدم مسبقاً' });

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) return res.status(400).json({ message: 'اسم المستخدم مستخدم مسبقاً' });

    const user = await User.create({ username, nickname, email, password, age });
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'فشل التسجيل', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });

    console.log('🔐 Login Attempt:', { username, password });
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    const isValid = user.validPassword(password);
    if (!isValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error('🔥 Login error:', err);
    res.status(500).json({ message: 'فشل تسجيل الدخول', error: err.message });
  }
});


export default router;
