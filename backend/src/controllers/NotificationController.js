import { NotificationService } from '../services/NotificationService.js';

export class NotificationController {
  static async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;

      const result = await NotificationService.getUserNotifications(userId, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في جلب الإشعارات'
      });
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await NotificationService.getUnreadNotificationCount(userId);
      
      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في جلب عدد الإشعارات غير المقروءة'
      });
    }
  }

  static async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      const notification = await NotificationService.markNotificationAsRead(notificationId, userId);
      
      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'فشل في تحديث حالة الإشعار'
      });
    }
  }

  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;
      
      await NotificationService.markAllNotificationsAsRead(userId);
      
      res.json({
        success: true,
        message: 'تم تحديث جميع الإشعارات'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في تحديث الإشعارات'
      });
    }
  }

  static async deleteNotification(req, res) {
    try {
      const userId = req.user.id;
      const { notificationId } = req.params;

      await NotificationService.deleteNotification(notificationId, userId);
      
      res.json({
        success: true,
        message: 'تم حذف الإشعار'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'فشل في حذف الإشعار'
      });
    }
  }

  static async deleteAllNotifications(req, res) {
    try {
      const userId = req.user.id;
      
      await NotificationService.deleteAllNotifications(userId);
      
      res.json({
        success: true,
        message: 'تم حذف جميع الإشعارات'
      });
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      res.status(500).json({
        success: false,
        message: 'فشل في حذف الإشعارات'
      });
    }
  }
} 