import express from 'express';
import { AdminCharacterController } from '../controllers/AdminCharacterController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { adminAuth } from '../middleware/admin.js';

const router = express.Router();

// Apply auth and admin middleware to all admin character routes
router.use(firebaseAuth);
router.use(adminAuth);

// Character management routes
router.get('/', AdminCharacterController.getAllCharacters);
router.get('/:id', AdminCharacterController.getCharacterById);
router.put('/:id', AdminCharacterController.updateCharacter);
router.post('/:id/money', AdminCharacterController.adjustMoney);
router.post('/:id/blackcoins', AdminCharacterController.adjustBlackcoins);
router.post('/:id/level', AdminCharacterController.setCharacterLevel);
router.post('/:id/reset', AdminCharacterController.resetCharacter);

export default router; 