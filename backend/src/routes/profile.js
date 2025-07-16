import express from 'express';
import { ProfileController } from '../controllers/ProfileController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Apply auth middleware to all profile routes
router.use(auth);

// GET /api/profile - Get own profile
router.get('/', ProfileController.getOwnProfile);

// GET /api/profile/stats - Get own stats
router.get('/stats', ProfileController.getUserStats);

// PUT /api/profile - Update own profile
router.put('/', validate('updateProfile'), ProfileController.updateOwnProfile);

// GET /api/profile/check-username - Check username availability
router.get('/check-username', validate('checkUsername'), ProfileController.checkUsernameAvailability);

// GET /api/profile/:id - Get user profile by ID
router.get('/:id', ProfileController.getUserProfileById);

// GET /api/profile/username/:username - Get user profile by username
router.get('/username/:username', ProfileController.getUserProfileByUsername);

export default router; 