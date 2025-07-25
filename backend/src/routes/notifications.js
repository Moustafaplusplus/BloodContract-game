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
    console.log('[Notification Test] Creating test notification for user:', userId);
    
    const notification = await NotificationService.createNotification(
      userId,
      'SYSTEM',
      'إشعار تجريبي',
      'هذا إشعار تجريبي لاختبار النظام',
      { test: true }
    );
    
    console.log('[Notification Test] Notification created:', notification.id);
    emitNotification(userId, notification);
    console.log('[Notification Test] Notification emitted via socket');
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({
      success: false,
      message: 'فشل في إنشاء الإشعار التجريبي'
    });
  }
});

export default router; 