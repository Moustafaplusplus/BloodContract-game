import { GlobalMessage } from '../models/GlobalMessage.js';
import { User } from '../models/User.js';
import { Op } from 'sequelize';

const GlobalChatController = {
  async getRecentMessages(req, res) {
    try {
      console.log('[Global Chat] Fetching recent messages');
      const limit = parseInt(req.query.limit) || 50;
      
      // Test if GlobalMessage model is available
      if (!GlobalMessage) {
        console.error('[Global Chat] GlobalMessage model not found');
        return res.status(500).json({ error: 'GlobalMessage model not available' });
      }
      
      const messages = await GlobalMessage.findAll({
        order: [['createdAt', 'DESC']],
        limit,
        include: [
          {
            model: User,
            attributes: ['id', 'username', 'avatarUrl', 'isAdmin', 'isVip']
          }
        ]
      });
      
      // Map messages to include avatarUrl, isAdmin, isVip
      const mapped = messages.reverse().map(msg => {
        const user = msg.User || {};
        return {
          id: msg.id,
          userId: msg.userId,
          username: msg.username,
          avatarUrl: user.avatarUrl || '/avatars/default.png',
          isAdmin: user.isAdmin || false,
          isVip: user.isVip || false,
          content: msg.content,
          messageType: msg.messageType,
          createdAt: msg.createdAt
        };
      });
      console.log('[Global Chat] Found messages:', messages.length);
      
      // Return in chronological order (oldest first)
      res.json(mapped);
    } catch (err) {
      console.error('[Global Chat] Error fetching messages:', err);
      res.status(500).json({ error: err.message });
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
            attributes: ['id', 'username', 'avatarUrl', 'isAdmin', 'isVip']
          }
        ]
      });
      const mapped = messages.reverse().map(msg => {
        const user = msg.User || {};
        return {
          id: msg.id,
          userId: msg.userId,
          username: msg.username,
          avatarUrl: user.avatarUrl || '/avatars/default.png',
          isAdmin: user.isAdmin || false,
          isVip: user.isVip || false,
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