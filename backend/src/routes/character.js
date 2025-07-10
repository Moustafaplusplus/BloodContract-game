import express from 'express';
import { CharacterController } from '../controllers/CharacterController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all character routes
router.use(auth);

// GET /api/character - Get character info
router.get('/', CharacterController.getCharacter);

// POST /api/character/train - Train strength or defense
router.post('/train', CharacterController.trainAttribute);

// GET /api/character/stats - Get character statistics
router.get('/stats', CharacterController.getStats);

export default router; 