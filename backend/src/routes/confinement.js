import express from 'express';
import { ConfinementController } from '../controllers/ConfinementController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';

const router = express.Router();

// Public live counters
router.get('/jail/count', ConfinementController.getJailCount);
router.get('/hospital/count', ConfinementController.getHospitalCount);

// Apply auth middleware to all confinement routes
router.use(firebaseAuth);

// Jail routes
router.get('/jail', ConfinementController.getJailStatus);
router.post('/jail/bail', ConfinementController.bailOut);

// Hospital routes
router.get('/hospital', ConfinementController.getHospitalStatus);
router.get('/hospital/:userId', ConfinementController.getHospitalStatusForUser);
router.post('/hospital/heal', ConfinementController.healOut);

export default router; 