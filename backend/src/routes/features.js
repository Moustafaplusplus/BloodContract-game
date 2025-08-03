import express from 'express';
import { FeatureController } from '../controllers/FeatureController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';

const router = express.Router();

// Get feature unlock information for current player
router.get('/info', firebaseAuth, FeatureController.getFeatureInfo);

// Check if a specific feature is unlocked
router.get('/check/:featureName', firebaseAuth, FeatureController.checkFeatureAccess);

// Get features that unlock at a specific level
router.get('/level/:level', firebaseAuth, FeatureController.getFeaturesAtLevel);

export default router; 