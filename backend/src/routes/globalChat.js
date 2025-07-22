import express from 'express';
import GlobalChatController from '../controllers/GlobalChatController.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/admin.js';

const router = express.Router();

// Test endpoint to verify global chat is working
router.get('/test', (req, res) => {
  res.json({ message: 'Global chat is working!' });
});

// Get recent global messages
router.get('/messages', auth, GlobalChatController.getRecentMessages);

// Get system messages only
router.get('/system', auth, GlobalChatController.getSystemMessages);

// Send system message (admin only)
router.post('/system', auth, adminAuth, GlobalChatController.sendSystemMessage);

export default router; 