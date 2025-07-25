import { Friendship } from '../models/Friendship.js';
import { User } from '../models/User.js';
import { Op } from 'sequelize';

const FriendshipController = {
  async addFriend(req, res) {
    try {
      const userId = req.user.id;
      const { friendId } = req.body;
      if (userId === friendId) return res.status(400).json({ error: 'Cannot friend yourself' });
      await Friendship.findOrCreate({ where: { requesterId: userId, addresseeId: friendId }, defaults: { status: 'PENDING' } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async removeFriend(req, res) {
    try {
      const userId = req.user.id;
      const { friendId } = req.body;
      await Friendship.destroy({ where: { requesterId: userId, addresseeId: friendId } });
      await Friendship.destroy({ where: { requesterId: friendId, addresseeId: userId } });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async listFriends(req, res) {
    try {
      const userId = req.user.id;
      const friendships = await Friendship.findAll({
        where: {
          status: 'ACCEPTED',
          [Op.or]: [
            { requesterId: userId },
            { addresseeId: userId }
          ]
        },
        include: [
          { association: 'Requester', attributes: ['id', 'username'] },
          { association: 'Addressee', attributes: ['id', 'username'] }
        ]
      });
      // Return the friend (not the current user) for each friendship
      const friends = friendships.map(f => {
        let friend = f.Requester.id === userId ? f.Addressee : f.Requester;
        return { id: friend.id, username: friend.username };
      });
      res.json(friends);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async isFriend(req, res) {
    try {
      const userId = req.user.id;
      const { friendId } = req.query;
      const exists = await Friendship.findOne({ where: { status: 'ACCEPTED', [Op.or]: [
        { requesterId: userId, addresseeId: friendId },
        { requesterId: friendId, addresseeId: userId }
      ] } });
      res.json({ isFriend: !!exists });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  // New: Get pending friend requests for the current user
  async pending(req, res) {
    try {
      const userId = req.user.id;
      const requests = await Friendship.findAll({
        where: { status: 'PENDING', addresseeId: userId },
        include: [
          { association: 'Requester', attributes: ['id', 'username'] }
        ]
      });
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  // New: Accept a friend request
  async accept(req, res) {
    try {
      const userId = req.user.id;
      const { friendshipId } = req.body;
      const friendship = await Friendship.findByPk(friendshipId);
      if (!friendship) return res.status(404).json({ error: 'Request not found' });
      if (friendship.addresseeId !== userId) return res.status(403).json({ error: 'Not authorized' });
      if (friendship.status !== 'PENDING') return res.status(400).json({ error: 'Not pending' });
      await friendship.update({ status: 'ACCEPTED' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  // New: Reject a friend request
  async reject(req, res) {
    try {
      const userId = req.user.id;
      const { friendshipId } = req.body;
      const friendship = await Friendship.findByPk(friendshipId);
      if (!friendship) return res.status(404).json({ error: 'Request not found' });
      if (friendship.addresseeId !== userId) return res.status(403).json({ error: 'Not authorized' });
      if (friendship.status !== 'PENDING') return res.status(400).json({ error: 'Not pending' });
      await friendship.update({ status: 'REJECTED' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  // Get friends of any user by userId
  async listFriendsOfUser(req, res) {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) return res.status(400).json({ error: 'Invalid userId' });
      const friendships = await Friendship.findAll({
        where: {
          status: 'ACCEPTED',
          [Op.or]: [
            { requesterId: userId },
            { addresseeId: userId }
          ]
        },
        include: [
          { association: 'Requester', attributes: ['id', 'username'] },
          { association: 'Addressee', attributes: ['id', 'username'] }
        ]
      });
      const friends = friendships.map(f => {
        let friend = f.Requester.id === userId ? f.Addressee : f.Requester;
        return { id: friend.id, username: friend.username };
      });
      res.json(friends);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

export default FriendshipController; 