import { Message } from '../models/Message.js';
import { Character } from '../models/Character.js';
import { NotificationService } from './NotificationService.js';
import { emitNotification } from '../socket.js';
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
    
    // Get sender name for notification
    const sender = await Character.findOne({ where: { userId: senderId } });
    const senderName = sender ? sender.name : 'Unknown User';
    
    // Create notification using NotificationService
    const notification = await NotificationService.createMessageReceivedNotification(receiverId, senderName);
    emitNotification(receiverId, notification);
    
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

  static async deleteMessage(messageId, userId) {
    const message = await Message.findByPk(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    if (message.senderId !== userId) {
      throw new Error('Not authorized to delete this message');
    }
    await message.destroy();
    return { success: true };
  }

  static async editMessage(messageId, userId, newContent) {
    const message = await Message.findByPk(messageId);
    if (!message) {
      throw new Error('Message not found');
    }
    if (message.senderId !== userId) {
      throw new Error('Not authorized to edit this message');
    }
    if (!newContent || newContent.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }
    
    await message.update({
      content: newContent.trim(),
      edited: true,
      editedAt: new Date()
    });
    
    return message;
  }
}
