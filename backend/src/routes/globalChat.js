import express from 'express';
import GlobalChatController from '../controllers/GlobalChatController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { adminAuth } from '../middleware/admin.js';

const router = express.Router();

// Test endpoint to verify global chat is working
router.get('/test', (req, res) => {
  res.json({ message: 'Global chat is working!' });
});

// Get recent global messages
router.get('/messages', firebaseAuth, GlobalChatController.getRecentMessages);

// Get system messages only
router.get('/system', firebaseAuth, GlobalChatController.getSystemMessages);

// Send system message (admin only)
router.post('/system', firebaseAuth, adminAuth, GlobalChatController.sendSystemMessage);

export default router; 