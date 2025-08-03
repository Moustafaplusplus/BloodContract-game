import express from 'express';
import { FightController } from '../controllers/FightController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { checkConfinementAccess } from '../middleware/confinement.js';

const router = express.Router();

// Apply auth middleware to all fight routes
router.use(firebaseAuth);

// GET /api/fight/challenges - Get challengeable players (5 levels above or below)
router.get('/challenges', FightController.getChallengeablePlayers);

// GET /api/fight/search - Search for players to fight
router.get('/search', FightController.searchPlayers);

// POST /api/fight/:defenderId - Attack another player
router.post('/:defenderId', checkConfinementAccess, FightController.attackPlayer);

export default router; 