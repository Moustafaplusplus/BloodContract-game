import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Character from '../models/character.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.create({ username, password });
    await Character.create({ userId: user.id });
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Username might be taken' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ where: { username } });
  if (!user || !user.validPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

export default router;
