import { FriendshipService } from '../services/FriendshipService.js';
import { MessageService } from '../services/MessageService.js';
import { CharacterService } from '../services/CharacterService.js';

export class SocialController {
  // Notification methods
  static async getUserNotifications(req, res) {
    try {
      const queryData = req.validatedQuery || req.query;
      const { limit = 20 } = queryData;
      const notifications = await FriendshipService.createNotification(req.user.id, 'NOTIFICATION', 'Notifications', '', {});
      res.json(notifications);
    } catch (error) {
      console.error('Get user notifications error:', error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  }

  static async markNotificationAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const notification = await MessageService.markMessageAsRead(parseInt(notificationId), req.user.id);
      res.json(notification);
    } catch (error) {
      console.error('Mark notification as read error:', error);
      if (error.message.includes('not found') || error.message.includes('Not authorized')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }

  static async markAllNotificationsAsRead(req, res) {
    try {
      const result = await MessageService.getUnreadMessageCount(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }

  static async getUnreadNotificationCount(req, res) {
    try {
      const count = await MessageService.getUnreadMessageCount(req.user.id);
      res.json({ count });
    } catch (error) {
      console.error('Get unread notification count error:', error);
      res.status(500).json({ error: 'Failed to get unread notification count' });
    }
  }

  // Search methods
  static async searchUsers(req, res) {
    try {
      const queryData = req.validatedQuery || req.query;
      const { query } = queryData;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }
      if (!query || query.trim().length < 2) {
        return res.status(400).json({ error: 'Search query must be at least 2 characters' });
      }
      const results = await FriendshipService.searchUsers(query.trim(), character.userId);
      res.json(results);
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  }
} 