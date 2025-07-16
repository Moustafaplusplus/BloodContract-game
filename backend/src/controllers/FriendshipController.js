import { Friendship } from '../models/Friendship.js';
import { User } from '../models/User.js';
import { Op } from 'sequelize';

const FriendshipController = {
  async addFriend(req, res) {
    try {
      const userId = req.user.id;
      const { friendId } = req.body;
      if (userId === friendId) return res.status(400).json({ error: 'Cannot friend yourself' });
      await Friendship.findOrCreate({ where: { userId, friendId } });
      await Friendship.findOrCreate({ where: { userId: friendId, friendId: userId } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async removeFriend(req, res) {
    try {
      const userId = req.user.id;
      const { friendId } = req.body;
      await Friendship.destroy({ where: { userId, friendId } });
      await Friendship.destroy({ where: { userId: friendId, friendId: userId } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async listFriends(req, res) {
    try {
      const userId = req.user.id;
      const friends = await Friendship.findAll({ where: { userId } });
      const friendIds = friends.map(f => f.friendId);
      const users = await User.findAll({ where: { id: { [Op.in]: friendIds } }, attributes: ['id', 'username'] });
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async isFriend(req, res) {
    try {
      const userId = req.user.id;
      const { friendId } = req.query;
      const exists = await Friendship.findOne({ where: { userId, friendId } });
      res.json({ isFriend: !!exists });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

export default FriendshipController; 