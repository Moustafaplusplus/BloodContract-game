import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
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
      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { senderId: myId, receiverId: userId },
            { senderId: userId, receiverId: myId },
          ],
        },
        order: [['createdAt', 'ASC']],
      });
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async markAsRead(req, res) {
    try {
      const { messageId } = req.params;
      const message = await Message.findByPk(messageId);
      if (!message) return res.status(404).json({ error: 'Message not found' });
      message.read = true;
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
      const users = await User.findAll({ where: { id: { [Op.in]: userIds } }, attributes: ['id', 'username'] });
      const result = users.map(u => ({ userId: u.id, username: u.username }));
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

export default MessageController; 