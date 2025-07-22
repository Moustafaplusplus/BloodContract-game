import express from 'express';
import { MinistryMissionController } from '../controllers/MinistryMissionController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all missions list with user progress
router.get('/list', auth, MinistryMissionController.getMissionsList);

// Get specific mission data
router.get('/:missionId', auth, MinistryMissionController.getMissionData);

// Complete a mission
router.post('/complete', auth, MinistryMissionController.completeMission);

// Get user mission statistics
router.get('/stats/user', auth, MinistryMissionController.getUserMissionStats);

export default router; 