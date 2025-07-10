import express from 'express';
import { CrimeController } from '../controllers/CrimeController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all crime routes
router.use(auth);

// GET /api/crimes - Get available crimes for user's level
router.get('/', CrimeController.getCrimes);

// POST /api/crimes/execute/:crimeId - Execute a specific crime
router.post('/execute/:crimeId', CrimeController.executeCrime);

// POST /api/crimes/execute - Execute a crime (alternative endpoint)
router.post('/execute', CrimeController.executeCrime);

export default router; 