// backend/src/routes/character.js
import express from 'express';
import auth from '../middlewares/auth.js';
import Character from '../models/character.js';

const router = express.Router();

// GET /api/character/me → return current user's character stats
router.get('/me', auth, async (req, res) => {
  try {
    const character = await Character.findOne({ where: { userId: req.user.id } });

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.json(character.toSafeJSON());
  } catch (err) {
    console.error('🚨 character/me error:', err);
    res.status(500).json({ message: 'Failed to fetch character data' });
  }
});

export default router;