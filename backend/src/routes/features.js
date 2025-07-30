import express from 'express';
import { FeatureController } from '../controllers/FeatureController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get feature unlock information for current player
router.get('/info', auth, FeatureController.getFeatureInfo);

// Check if a specific feature is unlocked
router.get('/check/:featureName', auth, FeatureController.checkFeatureAccess);

// Get features that unlock at a specific level
router.get('/level/:level', auth, FeatureController.getFeaturesAtLevel);

export default router; 