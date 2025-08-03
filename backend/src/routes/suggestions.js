import express from 'express';
import { SuggestionController } from '../controllers/SuggestionController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { adminAuth } from '../middleware/admin.js';

const router = express.Router();

// Public routes (require auth)
router.use(firebaseAuth);

// User routes
router.post('/', SuggestionController.createSuggestion);
router.get('/user', SuggestionController.getUserSuggestions);

// Admin routes (require admin auth)
router.use(adminAuth);
router.get('/', SuggestionController.getAllSuggestions);
router.get('/stats', SuggestionController.getSuggestionStats);
router.get('/:id', SuggestionController.getSuggestionById);
router.put('/:id/status', SuggestionController.updateSuggestionStatus);
router.delete('/:id', SuggestionController.deleteSuggestion);

export default router; 