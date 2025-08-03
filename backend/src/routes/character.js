import express from 'express';
import { CharacterController } from '../controllers/CharacterController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.use(firebaseAuth);

router.get('/', CharacterController.getCharacter);
router.get('/stats', CharacterController.getStats);
router.post('/fix-max-hp', CharacterController.fixMaxHp);
router.post('/change-name', validate('changeCharacterName'), CharacterController.changeName);

export default router; 