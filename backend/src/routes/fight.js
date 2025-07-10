import express from 'express';
import { FightController } from '../controllers/FightController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all fight routes
router.use(auth);

// POST /api/fight/:defenderId - Attack another player
router.post('/:defenderId', FightController.attackPlayer);

export default router; 