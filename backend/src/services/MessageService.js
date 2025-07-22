import { Message } from '../models/Message.js';
import { Character } from '../models/Character.js';
import { Notification } from '../models/Notification.js';
import { Op } from 'sequelize';

export class MessageService {
  static async sendMessage(senderId, receiverId, content) {
    if (senderId === receiverId) {
      throw new Error('Cannot send message to yourself');
    }
    const message = await Message.create({
      senderId,
      receiverId,
      content
    });
    await Notification.create({
      userId: receiverId,
      type: 'MESSAGE',
      title: 'New Message',
      content: `You have a new message from ${senderId}`,
      data: { senderId }
    });
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
  static async sendMessage(senderId, receiverId, content) {
    if (senderId === receiverId) {
      throw new Error('Cannot send message to yourself');
    }
    const message = await Message.create({
      senderId,
      receiverId,
      content
    });
    await Notification.create({
      userId: receiverId,
      type: 'MESSAGE',
      title: 'New Message',
      content: `You have a new message from ${senderId}`,
      data: { senderId }
    });
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
}
