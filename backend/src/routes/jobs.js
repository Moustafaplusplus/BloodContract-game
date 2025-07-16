import express from 'express';
import { JobsController } from '../controllers/JobsController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all job routes
router.use(auth);

// GET /api/jobs - Get available jobs
router.get('/', JobsController.getJobs);

// GET /api/jobs/current - Get current job
router.get('/current', JobsController.getCurrentJob);

// POST /api/jobs/hire - Hire user for a job
router.post('/hire', JobsController.hireUser);

// POST /api/jobs/quit - Quit current job
router.post('/quit', JobsController.quitJob);

// GET /api/jobs/history - Get job history
router.get('/history', JobsController.getJobHistory);

// GET /api/jobs/stats - Get job statistics
router.get('/stats', JobsController.getJobStats);

// POST /api/jobs/gym - Train at gym
router.post('/gym', JobsController.trainAtGym);

export default router; 