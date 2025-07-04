// backend/src/routes/gym.js
import express from 'express';
import jwt     from 'jsonwebtoken';
import Character from '../models/character.js';

const router = express.Router();

// POST /api/gym/train { energy: 10 }
router.post('/train', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('Token missing');

    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET);
    const { energy } = req.body;

    if (!energy || energy <= 0) return res.status(400).send('Invalid energy');

    const char = await Character.findOne({ where: { userId } });
    if (!char) return res.status(404).send('Character not found');
    if (char.energy < energy) return res.status(400).send('Not enough energy');

    // simple linear gain: pick a random factor between 0.30 and 0.50
    const factor = 0.30 + Math.random() * 0.20;
    const gain   = Math.floor(factor * char.will * (energy / 100));

    // Update character
    char.energy       -= energy;
    char.stamina      += gain;
    char.attackPower  += Math.floor(gain / 2);
    char.defense      += Math.floor(gain / 2);
    await char.save();

    res.json({
      gained: { stamina: gain, attack: Math.floor(gain / 2), defense: Math.floor(gain / 2) },
      remainingEnergy: char.energy,
    });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router;
