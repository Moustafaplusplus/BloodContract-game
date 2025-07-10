import express from 'express';
import { ConfinementController } from '../controllers/ConfinementController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all confinement routes
router.use(auth);

// Jail routes
router.get('/jail', ConfinementController.getJailStatus);
router.post('/jail/bail', ConfinementController.bailOut);

// Hospital routes
router.get('/hospital', ConfinementController.getHospitalStatus);
router.post('/hospital/heal', ConfinementController.healOut);

export default router; 