import express from 'express';
import { CharacterController } from '../controllers/CharacterController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Public route: Get character by username
router.get('/:username', CharacterController.getCharacterByUsername);

// Apply auth middleware to all character routes
router.use(auth);

// GET /api/character - Get character info
router.get('/', CharacterController.getCharacter);

// POST /api/character/train - Train strength or defense
router.post('/train', validate('trainAttribute'), CharacterController.trainAttribute);

// GET /api/character/stats - Get character statistics
router.get('/stats', CharacterController.getStats);

export default router; 