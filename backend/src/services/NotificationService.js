import { Notification } from '../models/Notification.js';
import { Op } from 'sequelize';

export class NotificationService {
  static async createNotification(userId, type, title, content, data = {}) {
    return await Notification.create({
      userId,
      type,
      title,
      content,
      data
    });
  }

  static async getUserNotifications(userId, limit = 20) {
    return await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  static async markNotificationAsRead(notificationId, userId) {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new Error('Not authorized to mark this notification as read');
    }
    await notification.update({ isRead: true });
    return notification;
  }

  static async markAllNotificationsAsRead(userId) {
    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
    return { success: true };
  }

  static async getUnreadNotificationCount(userId) {
    return await Notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }
}
