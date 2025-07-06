// backend/src/routes/profile.js
import express from 'express';
import auth from '../middlewares/auth.js';
import { getProfile, updateProfile } from '../services/profileService.js';
import uploadAvatar from '../middlewares/uploadAvatar.js';

const router = express.Router();

// GET /api/profile/       → your own profile
router.get('/', auth, getProfile);

// GET /api/profile/:id    → another user's profile
router.get('/:id', auth, getProfile);

// PUT /api/profile        → update your own profile
router.put('/', auth, uploadAvatar, updateProfile);

export default router;
