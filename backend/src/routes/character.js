import express from 'express';
import { CharacterController } from '../controllers/CharacterController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.use(auth);

router.get('/', CharacterController.getCharacter);
router.get('/stats', CharacterController.getStats);
router.post('/fix-max-hp', CharacterController.fixMaxHp);
router.post('/change-name', validate('changeCharacterName'), CharacterController.changeName);

export default router; 