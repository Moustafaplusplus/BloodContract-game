import express from 'express';
import { JobsController } from '../controllers/JobsController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { adminAuth } from '../middleware/admin.js';

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

// Admin routes for job management
router.use(adminAuth);

// GET /api/jobs/admin - Get all jobs for admin
router.get('/admin', JobsController.getAllJobs);

// POST /api/jobs/admin - Create a new job (admin only)
router.post('/admin', JobsController.createJob);

// PUT /api/jobs/admin/:id - Update a job (admin only)
router.put('/admin/:id', JobsController.updateJob);

// DELETE /api/jobs/admin/:id - Delete a job (admin only)
router.delete('/admin/:id', JobsController.deleteJob);

export default router; 