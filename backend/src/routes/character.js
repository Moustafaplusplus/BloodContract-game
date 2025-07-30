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

// POST /api/character/fix-max-hp - Fix maxHp to match level calculation
router.post('/fix-max-hp', CharacterController.fixMaxHp);

// POST /api/character/change-name - Change character name
router.post('/change-name', validate('changeCharacterName'), CharacterController.changeName);

export default router; 