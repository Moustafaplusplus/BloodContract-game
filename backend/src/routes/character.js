import express from 'express';
import { CharacterController } from '../controllers/CharacterController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Apply auth middleware to all character routes
router.use(auth);

// GET /api/character - Get character info
router.get('/', CharacterController.getCharacter);

// GET /api/character/stats - Get character statistics
router.get('/stats', CharacterController.getStats);

// POST /api/character/clear-level-up-rewards - Clear level-up rewards
router.post('/clear-level-up-rewards', CharacterController.clearLevelUpRewards);

export default router; 