import express from 'express';
import { GameNewsController } from '../controllers/GameNewsController.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/admin.js';

const router = express.Router();

// Public routes (for players)
router.get('/news', GameNewsController.getAllNews);
router.get('/news/:id', GameNewsController.getNewsById);

// Admin routes
router.get('/admin/news', auth, adminAuth, GameNewsController.getAllNewsForAdmin);
router.post('/admin/news', auth, adminAuth, GameNewsController.createNews);
router.put('/admin/news/:id', auth, adminAuth, GameNewsController.updateNews);
router.delete('/admin/news/:id', auth, adminAuth, GameNewsController.deleteNews);

export default router; 