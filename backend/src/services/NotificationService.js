import { Notification } from '../models/Notification.js';
import { Op } from 'sequelize';

export class NotificationService {
  static async createNotification(userId, type, title, content, data = {}) {
    const notification = await Notification.create({
      userId,
      type,
      title,
      content,
      data
    });
    
    return notification;
  }

  static async getUserNotifications(userId, page = 1, limit = 30) {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Notification.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      notifications: rows,
      totalCount: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      hasMore: page * limit < count
    };
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

  static async deleteNotification(notificationId, userId) {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new Error('Not authorized to delete this notification');
    }
    await notification.destroy();
    return { success: true };
  }

  static async deleteAllNotifications(userId) {
    await Notification.destroy({
      where: { userId }
    });
    return { success: true };
  }

  // Helper methods for creating specific notification types
  static async createAttackNotification(userId, attackerName, damage) {
    return await this.createNotification(
      userId,
      'ATTACKED',
      'تم الهجوم عليك',
      `تم الهجوم عليك من قبل ${attackerName} وتلقيت ${damage} ضرر`,
      { attackerName, damage }
    );
  }

  static async createHospitalizedNotification(userId, reason) {
    return await this.createNotification(
      userId,
      'HOSPITALIZED',
      'تم إدخالك المستشفى',
      `تم إدخالك المستشفى: ${reason}`,
      { reason }
    );
  }

  static async createJailedNotification(userId, reason, duration) {
    return await this.createNotification(
      userId,
      'JAILED',
      'تم سجنك',
      `تم سجنك لمدة ${duration} دقيقة: ${reason}`,
      { reason, duration }
    );
  }

  static async createBankInterestNotification(userId, amount) {
    return await this.createNotification(
      userId,
      'BANK_INTEREST',
      'فائدة بنكية',
      `حصلت على ${amount.toLocaleString()} فائدة بنكية`,
      { amount }
    );
  }

  static async createJobSalaryNotification(userId, jobName, amount) {
    return await this.createNotification(
      userId,
      'JOB_SALARY',
      'راتب العمل',
      `حصلت على ${amount.toLocaleString()} راتب من عملك كـ ${jobName}`,
      { jobName, amount }
    );
  }

  static async createBlackMarketSoldNotification(userId, itemName, amount) {
    return await this.createNotification(
      userId,
      'BLACK_MARKET_SOLD',
      'تم بيع عنصر في السوق السوداء',
      `تم بيع ${itemName} مقابل ${amount.toLocaleString()}`,
      { itemName, amount }
    );
  }

  static async createMessageReceivedNotification(userId, senderName) {
    return await this.createNotification(
      userId,
      'MESSAGE_RECEIVED',
      'رسالة جديدة',
      `رسالة جديدة من ${senderName}`,
      { senderName }
    );
  }

  static async createFriendRequestNotification(userId, requesterName) {
    return await this.createNotification(
      userId,
      'FRIEND_REQUEST_RECEIVED',
      'طلب صداقة جديد',
      `طلب صداقة من ${requesterName}`,
      { requesterName }
    );
  }

  static async createFriendRequestAcceptedNotification(userId, friendName) {
    return await this.createNotification(
      userId,
      'FRIEND_REQUEST_ACCEPTED',
      'تم قبول طلب الصداقة',
      `قبل ${friendName} طلب الصداقة الخاص بك`,
      { friendName }
    );
  }

  static async createCrimeCooldownEndedNotification(userId, crimeName) {
    return await this.createNotification(
      userId,
      'CRIME_COOLDOWN_ENDED',
      'انتهى وقت الانتظار للجريمة',
      `يمكنك الآن ارتكاب جريمة ${crimeName} مرة أخرى`,
      { crimeName }
    );
  }

  static async createGymCooldownEndedNotification(userId, exerciseName) {
    return await this.createNotification(
      userId,
      'GYM_COOLDOWN_ENDED',
      'انتهى وقت الانتظار للتمرين',
      `يمكنك الآن ممارسة ${exerciseName} مرة أخرى`,
      { exerciseName }
    );
  }

  static async createContractExecutedNotification(userId, targetName, reward) {
    return await this.createNotification(
      userId,
      'CONTRACT_EXECUTED',
      'تم تنفيذ العقد',
      `تم تنفيذ العقد على ${targetName} وحصلت على ${reward.toLocaleString()}`,
      { targetName, reward }
    );
  }

  static async createContractFulfilledNotification(userId, posterName, reward) {
    return await this.createNotification(
      userId,
      'CONTRACT_FULFILLED',
      'تم إنجاز العقد',
      `تم إنجاز العقد الذي نشرته وحصلت على ${reward.toLocaleString()}`,
      { posterName, reward }
    );
  }

  static async createVipExpiredNotification(userId) {
    return await this.createNotification(
      userId,
      'VIP_EXPIRED',
      'انتهت صلاحية VIP',
      'انتهت صلاحية VIP الخاصة بك',
      {}
    );
  }

  static async createVipActivatedNotification(userId, duration) {
    return await this.createNotification(
      userId,
      'VIP_ACTIVATED',
      'تم تفعيل VIP',
      `تم تفعيل VIP لمدة ${duration}`,
      { duration }
    );
  }

  static async createOutOfHospitalNotification(userId) {
    return await this.createNotification(
      userId,
      'OUT_OF_HOSPITAL',
      'تم خروجك من المستشفى',
      'تم شفاؤك ويمكنك الآن الخروج من المستشفى',
      {}
    );
  }

  static async createOutOfJailNotification(userId) {
    return await this.createNotification(
      userId,
      'OUT_OF_JAIL',
      'تم إطلاق سراحك',
      'تم إطلاق سراحك من السجن',
      {}
    );
  }

  static async createGangJoinRequestNotification(userId, requesterName, gangName) {
    return await this.createNotification(
      userId,
      'GANG_JOIN_REQUEST',
      'طلب انضمام للعصابة',
      `طلب ${requesterName} الانضمام إلى عصابة ${gangName}`,
      { requesterName, gangName }
    );
  }

  static async createGangMemberLeftNotification(userId, memberName, gangName) {
    return await this.createNotification(
      userId,
      'GANG_MEMBER_LEFT',
      'غادر عضو العصابة',
      `غادر ${memberName} عصابة ${gangName}`,
      { memberName, gangName }
    );
  }

  static async createAssassinatedNotification(userId, assassinName) {
    return await this.createNotification(
      userId,
      'ASSASSINATED',
      'تم اغتيالك',
      `تم اغتيالك من قبل ${assassinName}`,
      { assassinName }
    );
  }
}
