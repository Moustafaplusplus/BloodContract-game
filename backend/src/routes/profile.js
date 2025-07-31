import express from 'express';
import { ProfileController } from '../controllers/ProfileController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.get('/username/:username', ProfileController.getUserProfileByUsername);
router.get('/:id', ProfileController.getUserProfileById);

router.use(auth);

router.get('/', ProfileController.getOwnProfile);
router.get('/stats', ProfileController.getUserStats);
router.put('/', validate('updateProfile'), ProfileController.updateOwnProfile);
router.get('/check-username', validate('checkUsername'), ProfileController.checkUsernameAvailability);

router.get('/:id/ratings', ProfileController.getProfileRatings);
router.post('/:id/rate', ProfileController.rateProfile);

export default router; 