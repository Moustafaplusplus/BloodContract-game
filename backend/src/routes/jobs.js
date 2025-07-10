import express from 'express';
import { JobsController } from '../controllers/JobsController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all job routes
router.use(auth);

// GET /api/jobs - Get available jobs
router.get('/', JobsController.getJobs);

// POST /api/jobs/execute - Execute a job
router.post('/execute', JobsController.executeJob);

// POST /api/jobs/gym - Train at gym
router.post('/gym', JobsController.trainAtGym);

export default router; 