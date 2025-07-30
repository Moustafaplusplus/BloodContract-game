import { Friendship } from '../models/Friendship.js';
import { Character } from '../models/Character.js';
import { Op } from 'sequelize';

export class FriendshipService {
  static async sendFriendRequest(requesterId, addresseeId) {
    if (requesterId === addresseeId) {
      throw new Error('Cannot send friend request to yourself');
    }
    const existingFriendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId }
        ]
      }
    });
    if (existingFriendship) {
      if (existingFriendship.status === 'PENDING') {
        throw new Error('Friend request already pending');
      } else if (existingFriendship.status === 'ACCEPTED') {
        throw new Error('Already friends');
      } else if (existingFriendship.status === 'BLOCKED') {
        throw new Error('Cannot send friend request to blocked user');
      }
    }
    const friendship = await Friendship.create({
      requesterId,
      addresseeId,
      status: 'PENDING'
    });
    // Friend request notifications removed as requested
    return friendship;
  }
  static async acceptFriendRequest(friendshipId, userId) {
    const friendship = await Friendship.findByPk(friendshipId);
    if (!friendship) {
      throw new Error('Friend request not found');
    }
    if (friendship.addresseeId !== userId) {
      throw new Error('Not authorized to accept this request');
    }
    if (friendship.status !== 'PENDING') {
      throw new Error('Friend request is not pending');
    }
    await friendship.update({ status: 'ACCEPTED' });
    // Friend request acceptance notifications removed as requested
    return friendship;
  }
  static async rejectFriendRequest(friendshipId, userId) {
    const friendship = await Friendship.findByPk(friendshipId);
    if (!friendship) {
      throw new Error('Friend request not found');
    }
    if (friendship.addresseeId !== userId) {
      throw new Error('Not authorized to reject this request');
    }
    await friendship.update({ status: 'REJECTED' });
    return friendship;
  }
  static async blockUser(blockerId, blockedId) {
    if (blockerId === blockedId) {
      throw new Error('Cannot block yourself');
    }
    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { requesterId: blockerId, addresseeId: blockedId },
          { requesterId: blockedId, addresseeId: blockerId }
        ]
      }
    });
    if (friendship) {
      await friendship.update({ status: 'BLOCKED' });
    } else {
      await Friendship.create({
        requesterId: blockerId,
        addresseeId: blockedId,
        status: 'BLOCKED'
      });
    }
    return { success: true };
  }
  static async getFriendships(userId) {
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { requesterId: userId },
          { addresseeId: userId }
        ]
      },
      include: [
        {
          model: Character,
          as: 'Requester',
          attributes: ['id', 'name', 'level', 'vipExpiresAt']
        },
        {
          model: Character,
          as: 'Addressee',
          attributes: ['id', 'name', 'level', 'vipExpiresAt']
        }
      ]
    });
    return friendships;
  }
  static async getFriends(userId) {
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
          model: Character,
          as: 'Requester',
          attributes: ['id', 'name', 'level', 'vipExpiresAt']
        },
        {
          model: Character,
          as: 'Addressee',
          attributes: ['id', 'name', 'level', 'vipExpiresAt']
        }
      ]
    });
    return friendships.map(friendship => {
      let friend = null;
      if (friendship.Requester && friendship.Requester.id !== userId) {
        friend = friendship.Requester;
      } else if (friendship.Addressee && friendship.Addressee.id !== userId) {
        friend = friendship.Addressee;
      }
      return friend ? { 
        id: friend.id, 
        name: friend.name, 
        level: friend.level,
        vipExpiresAt: friend.vipExpiresAt
      } : null;
    }).filter(Boolean);
  }
  static async searchUsers(query, userId, limit = 10) {
    const characters = await Character.findAll({
      where: {
        id: { [Op.ne]: userId },
        name: { [Op.iLike]: `%${query}%` }
      },
      attributes: ['id', 'name', 'level', 'vipExpiresAt'],
      limit
    });
    const results = await Promise.all(
      characters.map(async (character) => {
        const friendship = await Friendship.findOne({
          where: {
            [Op.or]: [
              { requesterId: userId, addresseeId: character.id },
              { requesterId: character.id, addresseeId: userId }
            ]
          }
        });
        return {
          ...character.toJSON(),
          friendshipStatus: friendship ? friendship.status : null
        };
      })
    );
    return results;
  }
  static async createNotification(userId, type, title, content, data = {}) {
    return await Notification.create({
      userId,
      type,
      title,
      content,
      data
    });
  }

  static async acceptFriendRequest(friendshipId, userId) {
    const friendship = await Friendship.findByPk(friendshipId);
    if (!friendship) {
      throw new Error('Friend request not found');
    }
    if (friendship.addresseeId !== userId) {
      throw new Error('Not authorized to accept this request');
    }
    if (friendship.status !== 'PENDING') {
      throw new Error('Friend request is not pending');
    }
    await friendship.update({ status: 'ACCEPTED' });
    return friendship;
  }

  static async rejectFriendRequest(friendshipId, userId) {
    const friendship = await Friendship.findByPk(friendshipId);
    if (!friendship) {
      throw new Error('Friend request not found');
    }
    if (friendship.addresseeId !== userId) {
      throw new Error('Not authorized to reject this request');
    }
    await friendship.update({ status: 'REJECTED' });
    return friendship;
  }

  static async blockUser(blockerId, blockedId) {
    if (blockerId === blockedId) {
      throw new Error('Cannot block yourself');
    }
    const friendship = await Friendship.findOne({
      where: {
        [Op.or]: [
          { requesterId: blockerId, addresseeId: blockedId },
          { requesterId: blockedId, addresseeId: blockerId }
        ]
      }
    });
    if (friendship) {
      await friendship.update({ status: 'BLOCKED' });
    } else {
      await Friendship.create({
        requesterId: blockerId,
        addresseeId: blockedId,
        status: 'BLOCKED'
      });
    }
    return { success: true };
  }

  static async getFriendships(userId) {
    const friendships = await Friendship.findAll({
      where: {
        [Op.or]: [
          { requesterId: userId },
          { addresseeId: userId }
        ]
      },
      include: [
        {
          model: Character,
          as: 'Requester',
          attributes: ['id', 'name', 'level', 'vipExpiresAt']
        },
        {
          model: Character,
          as: 'Addressee',
          attributes: ['id', 'name', 'level', 'vipExpiresAt']
        }
      ]
    });
    return friendships;
  }

  static async getFriends(userId) {
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
          model: Character,
          as: 'Requester',
          attributes: ['id', 'name', 'level', 'vipExpiresAt']
        },
        {
          model: Character,
          as: 'Addressee',
          attributes: ['id', 'name', 'level', 'vipExpiresAt']
        }
      ]
    });
    return friendships.map(friendship => {
      let friend = null;
      if (friendship.Requester && friendship.Requester.id !== userId) {
        friend = friendship.Requester;
      } else if (friendship.Addressee && friendship.Addressee.id !== userId) {
        friend = friendship.Addressee;
      }
      return friend ? { 
        id: friend.id, 
        name: friend.name, 
        level: friend.level,
        vipExpiresAt: friend.vipExpiresAt
      } : null;
    }).filter(Boolean);
  }
}
