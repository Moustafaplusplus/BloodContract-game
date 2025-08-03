import express from 'express';
import { NotificationController } from '../controllers/NotificationController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { NotificationService } from '../services/NotificationService.js';
import { emitNotification } from '../socket.js';

const router = express.Router();

// Get user notifications with pagination
router.get('/', firebaseAuth, NotificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', firebaseAuth, NotificationController.getUnreadCount);

// Mark specific notification as read
router.patch('/:notificationId/read', firebaseAuth, NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', firebaseAuth, NotificationController.markAllAsRead);

// Delete specific notification
router.delete('/:notificationId', firebaseAuth, NotificationController.deleteNotification);

// Delete all notifications
router.delete('/', firebaseAuth, NotificationController.deleteAllNotifications);

// Test endpoint to create a sample notification (remove in production)
router.post('/test', firebaseAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notification = await NotificationService.createNotification(
      userId,
      'TEST',
      'إشعار تجريبي',
      'هذا إشعار تجريبي لاختبار النظام',
      { test: true }
    );
    
    emitNotification(userId, notification);
    
    res.json({ success: true, notification });
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ error: 'Failed to create test notification' });
  }
});

export default router; 