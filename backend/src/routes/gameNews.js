import express from 'express';
import { GameNewsController } from '../controllers/GameNewsController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { adminAuth } from '../middleware/admin.js';

const router = express.Router();

// Public routes (for players)
router.get('/news', GameNewsController.getAllNews);
router.get('/news/:id', GameNewsController.getNewsById);

// Admin routes
router.get('/admin/news', firebaseAuth, adminAuth, GameNewsController.getAllNewsForAdmin);
router.post('/admin/news', firebaseAuth, adminAuth, GameNewsController.createNews);
router.put('/admin/news/:id', firebaseAuth, adminAuth, GameNewsController.updateNews);
router.delete('/admin/news/:id', firebaseAuth, adminAuth, GameNewsController.deleteNews);

export default router; 