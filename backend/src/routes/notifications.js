import express from 'express';
import { NotificationController } from '../controllers/NotificationController.js';
import { auth } from '../middleware/auth.js';
import { NotificationService } from '../services/NotificationService.js';
import { emitNotification } from '../socket.js';

const router = express.Router();

// Get user notifications with pagination
router.get('/', auth, NotificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', auth, NotificationController.getUnreadCount);

// Mark specific notification as read
router.patch('/:notificationId/read', auth, NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', auth, NotificationController.markAllAsRead);

// Delete specific notification
router.delete('/:notificationId', auth, NotificationController.deleteNotification);

// Delete all notifications
router.delete('/', auth, NotificationController.deleteAllNotifications);

// Test endpoint to create a sample notification (remove in production)
router.post('/test', auth, async (req, res) => {
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