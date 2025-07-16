import { SocialService } from '../services/SocialService.js';
import { CharacterService } from '../services/CharacterService.js';

export class SocialController {
  // Friendship methods
  static async sendFriendRequest(req, res) {
    try {
      const { targetId } = req.body;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const friendship = await SocialService.sendFriendRequest(character.userId, parseInt(targetId));
      res.json(friendship);
    } catch (error) {
      console.error('Send friend request error:', error);
      if (error.message.includes('Cannot send') || error.message.includes('already') || 
          error.message.includes('blocked')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to send friend request' });
    }
  }

  static async acceptFriendRequest(req, res) {
    try {
      const { friendshipId } = req.params;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const friendship = await SocialService.acceptFriendRequest(parseInt(friendshipId), character.userId);
      res.json(friendship);
    } catch (error) {
      console.error('Accept friend request error:', error);
      if (error.message.includes('not found') || error.message.includes('Not authorized') ||
          error.message.includes('not pending')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to accept friend request' });
    }
  }

  static async rejectFriendRequest(req, res) {
    try {
      const { friendshipId } = req.params;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const friendship = await SocialService.rejectFriendRequest(parseInt(friendshipId), character.userId);
      res.json(friendship);
    } catch (error) {
      console.error('Reject friend request error:', error);
      if (error.message.includes('not found') || error.message.includes('Not authorized')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to reject friend request' });
    }
  }

  static async blockUser(req, res) {
    try {
      const { targetId } = req.body;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const result = await SocialService.blockUser(character.userId, parseInt(targetId));
      res.json(result);
    } catch (error) {
      console.error('Block user error:', error);
      if (error.message.includes('Cannot block yourself')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to block user' });
    }
  }

  static async getFriendships(req, res) {
    try {
      console.log('DEBUG getFriendships req.user:', req.user);
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      console.log('DEBUG getFriendships character:', character);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const friendships = await SocialService.getFriendships(character.userId);
      res.json(friendships);
    } catch (error) {
      console.error('Get friendships error:', error);
      res.status(500).json({ error: 'Failed to get friendships' });
    }
  }

  static async getFriends(req, res) {
    try {
      console.log('DEBUG getFriends req.user:', req.user);
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      console.log('DEBUG getFriends character:', character);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const friends = await SocialService.getFriends(character.userId);
      res.json(friends);
    } catch (error) {
      console.error('Get friends error:', error);
      res.status(500).json({ error: 'Failed to get friends' });
    }
  }

  // Messaging methods
  static async sendMessage(req, res) {
    try {
      const { receiverId, content } = req.body;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Message content is required' });
      }

      const message = await SocialService.sendMessage(character.userId, parseInt(receiverId), content);
      res.json(message);
    } catch (error) {
      console.error('Send message error:', error);
      if (error.message.includes('Cannot send message to yourself') || 
          error.message.includes('Can only send messages to friends')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  static async getMessages(req, res) {
    try {
      const { otherUserId } = req.params;
      const queryData = req.validatedQuery || req.query;
      const { limit = 50 } = queryData;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const messages = await SocialService.getMessages(character.userId, parseInt(otherUserId), parseInt(limit));
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: 'Failed to get messages' });
    }
  }

  static async markMessageAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const message = await SocialService.markMessageAsRead(parseInt(messageId), character.userId);
      res.json(message);
    } catch (error) {
      console.error('Mark message as read error:', error);
      if (error.message.includes('not found') || error.message.includes('Not authorized')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to mark message as read' });
    }
  }

  static async getUnreadMessageCount(req, res) {
    try {
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const count = await SocialService.getUnreadMessageCount(character.userId);
      res.json({ count });
    } catch (error) {
      console.error('Get unread message count error:', error);
      res.status(500).json({ error: 'Failed to get unread message count' });
    }
  }

  // Notification methods
  static async getUserNotifications(req, res) {
    try {
      const queryData = req.validatedQuery || req.query;
      const { limit = 20 } = queryData;
      const notifications = await SocialService.getUserNotifications(req.user.id, parseInt(limit));
      res.json(notifications);
    } catch (error) {
      console.error('Get user notifications error:', error);
      res.status(500).json({ error: 'Failed to get notifications' });
    }
  }

  static async markNotificationAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const notification = await SocialService.markNotificationAsRead(parseInt(notificationId), req.user.id);
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
      const result = await SocialService.markAllNotificationsAsRead(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
  }

  static async getUnreadNotificationCount(req, res) {
    try {
      const count = await SocialService.getUnreadNotificationCount(req.user.id);
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

      const results = await SocialService.searchUsers(query.trim(), character.userId);
      res.json(results);
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  }
} 