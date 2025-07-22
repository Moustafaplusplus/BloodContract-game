import { FriendshipService } from '../services/FriendshipService.js';
import { CharacterService } from '../services/CharacterService.js';

export class FriendController {
  static async sendFriendRequest(req, res) {
    try {
      const { targetId } = req.body;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }
      const friendship = await FriendshipService.sendFriendRequest(character.userId, parseInt(targetId));
      res.json(friendship);
    } catch (error) {
      console.error('Send friend request error:', error);
      if (error.message.includes('Cannot send') || error.message.includes('already') || error.message.includes('blocked')) {
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
      const friendship = await FriendshipService.acceptFriendRequest(parseInt(friendshipId), character.userId);
      res.json(friendship);
    } catch (error) {
      console.error('Accept friend request error:', error);
      if (error.message.includes('not found') || error.message.includes('Not authorized') || error.message.includes('not pending')) {
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
      const friendship = await FriendshipService.rejectFriendRequest(parseInt(friendshipId), character.userId);
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
      const result = await FriendshipService.blockUser(character.userId, parseInt(targetId));
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
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }
      const friendships = await FriendshipService.getFriendships(character.userId);
      res.json(friendships);
    } catch (error) {
      console.error('Get friendships error:', error);
      res.status(500).json({ error: 'Failed to get friendships' });
    }
  }

  static async getFriends(req, res) {
    try {
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }
      const friends = await FriendshipService.getFriends(character.userId);
      res.json(friends);
    } catch (error) {
      console.error('Get friends error:', error);
      res.status(500).json({ error: 'Failed to get friends' });
    }
  }
}
