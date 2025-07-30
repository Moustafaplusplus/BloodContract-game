import express from 'express';
import { ProfileController } from '../controllers/ProfileController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Public routes (no auth required) - these must come BEFORE the auth middleware
router.get('/username/:username', ProfileController.getUserProfileByUsername);
router.get('/:id', ProfileController.getUserProfileById);

// Apply auth middleware to the remaining routes
router.use(auth);

// GET /api/profile - Get own profile
router.get('/', ProfileController.getOwnProfile);

// GET /api/profile/stats - Get own stats
router.get('/stats', ProfileController.getUserStats);

// PUT /api/profile - Update own profile
router.put('/', validate('updateProfile'), ProfileController.updateOwnProfile);

// GET /api/profile/check-username - Check username availability
router.get('/check-username', validate('checkUsername'), ProfileController.checkUsernameAvailability);

// Ratings endpoints
router.get('/:id/ratings', ProfileController.getProfileRatings);
router.post('/:id/rate', ProfileController.rateProfile);

export default router; 