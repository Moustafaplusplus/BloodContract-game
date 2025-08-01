import { Friendship } from '../models/Friendship.js';
import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { Op } from 'sequelize';
import { io } from '../socket.js';

const FriendshipController = {
  async addFriend(req, res) {
    try {
      const userId = req.user.id;
      const { friendId } = req.body;
      if (userId === friendId) return res.status(400).json({ error: 'Cannot friend yourself' });
      
      const friendship = await Friendship.findOrCreate({ 
        where: { requesterId: userId, addresseeId: friendId }, 
        defaults: { status: 'PENDING' } 
      });
      
      // Emit socket events for real-time updates
      if (io) {
        // Notify the requester (sender)
        io.to(String(userId)).emit('friendship:request-sent', {
          friendId,
          status: 'PENDING'
        });
        
        // Notify the addressee (receiver)
        io.to(String(friendId)).emit('friendship:request-received', {
          requesterId: userId,
          status: 'PENDING'
        });
        
        // Emit general friendship update
        io.to(String(userId)).emit('friendship:updated');
        io.to(String(friendId)).emit('friendship:updated');
      }
      
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async removeFriend(req, res) {
    try {
      const userId = req.user.id;
      const { friendId } = req.body;
      
      // Check if friendship exists before destroying
      const friendship1 = await Friendship.findOne({ where: { requesterId: userId, addresseeId: friendId } });
      const friendship2 = await Friendship.findOne({ where: { requesterId: friendId, addresseeId: userId } });
      
      await Friendship.destroy({ where: { requesterId: userId, addresseeId: friendId } });
      await Friendship.destroy({ where: { requesterId: friendId, addresseeId: userId } });
      
      // Emit socket events for real-time updates
      if (io) {
        // Notify both users about the friendship removal
        io.to(String(userId)).emit('friendship:removed', {
          friendId,
          status: 'REMOVED'
        });
        
        io.to(String(friendId)).emit('friendship:removed', {
          friendId: userId,
          status: 'REMOVED'
        });
        
        // Emit general friendship update
        io.to(String(userId)).emit('friendship:updated');
        io.to(String(friendId)).emit('friendship:updated');
      }
      
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
          { 
            association: 'Requester', 
            attributes: ['id', 'username'],
            include: [{ model: Character, attributes: ['name'] }]
          },
          { 
            association: 'Addressee', 
            attributes: ['id', 'username'],
            include: [{ model: Character, attributes: ['name'] }]
          }
        ]
      });
      // Return the friend (not the current user) for each friendship
      const friends = friendships.map(f => {
        let friend = f.Requester.id === userId ? f.Addressee : f.Requester;
        return { 
          id: friend.id, 
          username: friend.username,
          name: friend.Character?.name
        };
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
  // New: Get pending friend requests for the current user (both sent and received)
  async pending(req, res) {
    try {
      const userId = req.user.id;
      const requests = await Friendship.findAll({
        where: { 
          status: 'PENDING', 
          [Op.or]: [
            { requesterId: userId },
            { addresseeId: userId }
          ]
        },
        include: [
          { 
            association: 'Requester', 
            attributes: ['id', 'username'],
            include: [{ model: Character, attributes: ['name'] }]
          },
          { 
            association: 'Addressee', 
            attributes: ['id', 'username'],
            include: [{ model: Character, attributes: ['name'] }]
          }
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
      
      // Emit socket events for real-time updates
      if (io) {
        const requesterId = friendship.requesterId;
        const addresseeId = friendship.addresseeId;
        
        // Notify the requester (sender) that their request was accepted
        io.to(String(requesterId)).emit('friendship:request-accepted', {
          friendId: addresseeId,
          status: 'ACCEPTED'
        });
        
        // Notify the addressee (receiver) that they accepted the request
        io.to(String(addresseeId)).emit('friendship:request-accepted', {
          friendId: requesterId,
          status: 'ACCEPTED'
        });
        
        // Emit general friendship update
        io.to(String(requesterId)).emit('friendship:updated');
        io.to(String(addresseeId)).emit('friendship:updated');
      }
      
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
      
      // Emit socket events for real-time updates
      if (io) {
        const requesterId = friendship.requesterId;
        const addresseeId = friendship.addresseeId;
        
        // Notify the requester (sender) that their request was rejected
        io.to(String(requesterId)).emit('friendship:request-rejected', {
          friendId: addresseeId,
          status: 'REJECTED'
        });
        
        // Notify the addressee (receiver) that they rejected the request
        io.to(String(addresseeId)).emit('friendship:request-rejected', {
          friendId: requesterId,
          status: 'REJECTED'
        });
        
        // Emit general friendship update
        io.to(String(requesterId)).emit('friendship:updated');
        io.to(String(addresseeId)).emit('friendship:updated');
      }
      
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
          { 
            association: 'Requester', 
            attributes: ['id', 'username'],
            include: [{ model: Character, attributes: ['name'] }]
          },
          { 
            association: 'Addressee', 
            attributes: ['id', 'username'],
            include: [{ model: Character, attributes: ['name'] }]
          }
        ]
      });
      const friends = friendships.map(f => {
        let friend = f.Requester.id === userId ? f.Addressee : f.Requester;
        return { 
          id: friend.id, 
          username: friend.username,
          name: friend.Character?.name
        };
      });
      res.json(friends);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};

export default FriendshipController; 