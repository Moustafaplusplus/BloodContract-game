// backend/src/routes/character.js
import express from 'express';
import auth from '../middlewares/auth.js';
import Character from '../models/character.js';

const router = express.Router();

// GET /api/character/me - Return current user's character stats
router.get('/me', auth, async (req, res) => {
  try {
    const character = await Character.findOne({ where: { userId: req.user.id } });
    if (!character) return res.status(404).json({ message: 'لم يتم العثور على الشخصية' });
    res.json(character);
  } catch (err) {
    console.error('🚨 character/me error:', err);
    res.status(500).json({ message: 'فشل جلب البيانات' });
  }
});

export default router;
