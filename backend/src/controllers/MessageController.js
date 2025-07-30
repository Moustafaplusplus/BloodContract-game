import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { Op } from 'sequelize';

const MessageController = {
  async sendMessage(req, res) {
    try {
      const { receiverId, content } = req.body;
      const senderId = req.user.id;
      const message = await Message.create({ senderId, receiverId, content });
      res.status(201).json(message);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getMessages(req, res) {
    try {
      const { userId } = req.params;
      const myId = req.user?.id;
      if (!myId) return res.status(401).json({ error: 'Unauthorized' });
      if (!userId || isNaN(Number(userId))) return res.status(400).json({ error: 'Invalid userId' });
      // Pagination support
      const { before, limit = 50 } = req.query;
      const where = {
        [Op.or]: [
          { senderId: myId, receiverId: userId },
          { senderId: userId, receiverId: myId },
        ],
        deleted: false
      };
      if (before) {
        where.id = { [Op.lt]: before };
      }
      const messages = await Message.findAll({
        where,
        order: [['id', 'DESC']],
        limit: Number(limit)
      });
      res.json(messages.reverse());
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Edit message
  async editMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { content } = req.body;
      const myId = req.user?.id;
      const message = await Message.findByPk(messageId);
      if (!message) return res.status(404).json({ error: 'Message not found' });
      if (message.senderId !== myId) return res.status(403).json({ error: 'Unauthorized' });
      if (!content || content.trim().length === 0) return res.status(400).json({ error: 'Message cannot be empty' });
      message.content = content.trim();
      message.edited = true;
      message.editedAt = new Date();
      await message.save();
      res.json(message);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Delete message (soft delete)
  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params;
      const myId = req.user?.id;
      const message = await Message.findByPk(messageId);
      if (!message) return res.status(404).json({ error: 'Message not found' });
      if (message.senderId !== myId) return res.status(403).json({ error: 'Unauthorized' });
      message.deleted = true;
      await message.save();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  // Add or remove reaction
  async reactMessage(req, res) {
    try {
      const { messageId } = req.params;
      const { emoji } = req.body;
      const myId = req.user?.id;
      const message = await Message.findByPk(messageId);
      if (!message) return res.status(404).json({ error: 'Message not found' });
      if (!emoji) return res.status(400).json({ error: 'Emoji required' });
      let reactions = message.reactions || {};
      if (!reactions[emoji]) reactions[emoji] = [];
      if (!reactions[emoji].includes(myId)) {
        reactions[emoji].push(myId);
      } else {
        reactions[emoji] = reactions[emoji].filter(id => id !== myId);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      }
      message.reactions = reactions;
      await message.save();
      res.json(message);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async markAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const message = await Message.findByPk(messageId);
      if (!message) return res.status(404).json({ error: 'Message not found' });
      message.isRead = true;
      await message.save();
      res.json(message);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async searchUsers(req, res) {
    try {
      const { q } = req.query;
      const users = await User.findAll({
        where: {
          [Op.or]: [
            { username: { [Op.like]: `%${q}%` } },
            { id: isNaN(Number(q)) ? -1 : Number(q) },
          ],
        },
        attributes: ['id', 'username'],
        limit: 10,
      });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async inbox(req, res) {
    try {
      const myId = req.user.id;
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { senderId: myId },
            { receiverId: myId },
          ],
        },
        attributes: ['senderId', 'receiverId'],
      });
      const userIds = Array.from(new Set(messages.flatMap(m => [m.senderId, m.receiverId]).filter(id => id !== myId)));
      const users = await User.findAll({ 
        where: { id: { [Op.in]: userIds } }, 
        attributes: ['id', 'username'],
        include: [{
          model: Character,
          attributes: ['name', 'vipExpiresAt']
        }]
      });
      
      // Check for unread messages for each conversation
      const result = await Promise.all(users.map(async (user) => {
        const unreadCount = await Message.count({
          where: {
            senderId: user.id,
            receiverId: myId,
            isRead: false,
            deleted: false
          }
        });
        
        return {
          userId: user.id,
          username: user.username,
          displayName: user.Character?.name || user.username,
          vipExpiresAt: user.Character?.vipExpiresAt,
          hasUnreadMessages: unreadCount > 0,
          unreadCount: unreadCount
        };
      }));
      
      res.json(result);
    } catch (err) {
      console.error('[INBOX] Error:', err);
      res.status(500).json({ error: err.message });
    }
  },
};

export default MessageController; 