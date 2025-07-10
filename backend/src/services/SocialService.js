import { Friendship, Message, Notification } from '../models/Social.js';
import { Character } from '../models/Character.js';
import { User } from '../models/User.js';
import { Op } from 'sequelize';

export class SocialService {
  // Friendship methods
  static async sendFriendRequest(requesterId, addresseeId) {
    if (requesterId === addresseeId) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if friendship already exists
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

    // Create notification
    await this.createNotification(addresseeId, 'FRIEND_REQUEST', 'Friend Request', `${requesterId} sent you a friend request`, { requesterId });

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

    // Create notification for requester
    await this.createNotification(friendship.requesterId, 'FRIEND_REQUEST', 'Friend Request Accepted', `${userId} accepted your friend request`, { userId });

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

    // Update existing friendship or create new one
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
    return await Friendship.findAll({
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
          attributes: ['id', 'name', 'level']
        },
        {
          model: Character,
          as: 'Addressee',
          attributes: ['id', 'name', 'level']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
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
          attributes: ['id', 'name', 'level', 'online']
        },
        {
          model: Character,
          as: 'Addressee',
          attributes: ['id', 'name', 'level', 'online']
        }
      ]
    });

    return friendships.map(friendship => {
      const friend = friendship.Requester.id === userId ? friendship.Addressee : friendship.Requester;
      return friend;
    });
  }

  // Messaging methods
  static async sendMessage(senderId, receiverId, content) {
    if (senderId === receiverId) {
      throw new Error('Cannot send message to yourself');
    }

    // Check if they are friends
    const friendship = await Friendship.findOne({
      where: {
        status: 'ACCEPTED',
        [Op.or]: [
          { requesterId: senderId, addresseeId: receiverId },
          { requesterId: receiverId, addresseeId: senderId }
        ]
      }
    });

    if (!friendship) {
      throw new Error('Can only send messages to friends');
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content
    });

    // Create notification
    await this.createNotification(receiverId, 'MESSAGE', 'New Message', `You have a new message from ${senderId}`, { senderId });

    return message;
  }

  static async getMessages(userId, otherUserId, limit = 50) {
    return await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      include: [
        {
          model: Character,
          as: 'Sender',
          attributes: ['id', 'name']
        },
        {
          model: Character,
          as: 'Receiver',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  static async markMessageAsRead(messageId, userId) {
    const message = await Message.findByPk(messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new Error('Not authorized to mark this message as read');
    }

    await message.update({ isRead: true });
    return message;
  }

  static async getUnreadMessageCount(userId) {
    return await Message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });
  }

  // Notification methods
  static async createNotification(userId, type, title, content, data = {}) {
    return await Notification.create({
      userId,
      type,
      title,
      content,
      data
    });
  }

  static async getUserNotifications(userId, limit = 20) {
    return await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  static async markNotificationAsRead(notificationId, userId) {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Not authorized to mark this notification as read');
    }

    await notification.update({ isRead: true });
    return notification;
  }

  static async markAllNotificationsAsRead(userId) {
    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
    return { success: true };
  }

  static async getUnreadNotificationCount(userId) {
    return await Notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  // Search methods
  static async searchUsers(query, userId, limit = 10) {
    const characters = await Character.findAll({
      where: {
        id: { [Op.ne]: userId },
        name: { [Op.iLike]: `%${query}%` }
      },
      attributes: ['id', 'name', 'level'],
      limit
    });

    // Check friendship status for each result
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
} 