import { GlobalMessage } from '../models/GlobalMessage.js';
import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { Op } from 'sequelize';

const GlobalChatController = {
  static async getRecentMessages(req, res) {
    try {
      const messages = await GlobalMessage.findAll({
        order: [['createdAt', 'DESC']],
        limit: 50,
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'avatarUrl', 'isAdmin', 'isVip']
          }
        ]
      });
      
      const formattedMessages = messages.reverse().map(msg => ({
        id: msg.id,
        content: msg.content,
        createdAt: msg.createdAt,
        user: {
          id: msg.User.id,
          username: msg.User.username,
          avatarUrl: msg.User.avatarUrl,
          isAdmin: msg.User.isAdmin,
          isVip: msg.User.isVip
        }
      }));
      
      res.json(formattedMessages);
    } catch (error) {
      console.error('Get recent messages error:', error);
      res.status(500).json({ error: 'Failed to get recent messages' });
    }
  },

  async getSystemMessages(req, res) {
    try {
      const messages = await GlobalMessage.findAll({
        where: {
          messageType: {
            [Op.in]: ['SYSTEM', 'ANNOUNCEMENT']
          }
        },
        order: [['createdAt', 'DESC']],
        limit: 20,
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'avatarUrl', 'isAdmin', 'isVip'],
            include: [{ model: Character, attributes: ['name', 'vipExpiresAt'] }]
          }
        ]
      });
      const mapped = messages.reverse().map(msg => {
        const user = msg.User || {};
        const character = user.Character || {};
        return {
          id: msg.id,
          userId: msg.userId,
          username: msg.username, // Keep original username for reference
          displayName: character.name || msg.username, // Use character name if available, fallback to username
          avatarUrl: user.avatarUrl,
          isAdmin: user.isAdmin || false,
          isVip: user.isVip || false,
          vipExpiresAt: character.vipExpiresAt,
          content: msg.content,
          messageType: msg.messageType,
          createdAt: msg.createdAt
        };
      });
      
      res.json(mapped);
    } catch (err) {
      console.error('[Global Chat] Error fetching system messages:', err);
      res.status(500).json({ error: err.message });
    }
  },

  async sendSystemMessage(req, res) {
    try {
      const { content, messageType = 'SYSTEM' } = req.body;
      
      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Message cannot be empty' });
      }

      const message = await GlobalMessage.create({
        userId: req.user.id,
        username: req.user.username,
        content: content.trim(),
        messageType: messageType
      });

      // Emit to all connected users if socket is available
      const { io } = await import('../socket.js');
      if (io) {
        io.emit('global_message', {
          id: message.id,
          userId: message.userId,
          username: message.username,
          content: message.content,
          messageType: message.messageType,
          createdAt: message.createdAt
        });
      }

      res.status(201).json(message);
    } catch (err) {
      console.error('[Global Chat] Error sending system message:', err);
      res.status(500).json({ error: err.message });
    }
  }
};

export default GlobalChatController; 