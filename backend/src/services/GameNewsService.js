import { GameNews, User } from '../models/index.js';
import { Notification } from '../models/Notification.js';
import { Character } from '../models/Character.js';

export class GameNewsService {
  // Get all active game news
  static async getAllNews() {
    try {
      const news = await GameNews.findAll({
        where: { isActive: true },
        include: [
          {
            model: User,
            as: 'admin',
            attributes: ['username']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10
      });
      return news;
    } catch (error) {
      throw new Error(`Failed to fetch game news: ${error.message}`);
    }
  }

  // Create new game news
  static async createNews(newsData, adminId) {
    try {
      const news = await GameNews.create({
        title: newsData.title,
        content: newsData.content,
        color: newsData.color || 'yellow',
        adminId: adminId,
        isActive: true
      });

      // Send notification to all players
      await this.notifyAllPlayers(news);

      return news;
    } catch (error) {
      throw new Error(`Failed to create game news: ${error.message}`);
    }
  }

  // Update game news
  static async updateNews(newsId, newsData) {
    try {
      const news = await GameNews.findByPk(newsId);
      if (!news) {
        throw new Error('Game news not found');
      }

      await news.update({
        title: newsData.title,
        content: newsData.content,
        color: newsData.color || 'yellow'
      });

      return news;
    } catch (error) {
      throw new Error(`Failed to update game news: ${error.message}`);
    }
  }

  // Delete game news (soft delete)
  static async deleteNews(newsId) {
    try {
      const news = await GameNews.findByPk(newsId);
      if (!news) {
        throw new Error('Game news not found');
      }

      await news.update({ isActive: false });
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete game news: ${error.message}`);
    }
  }

  // Get news by ID
  static async getNewsById(newsId) {
    try {
      const news = await GameNews.findByPk(newsId, {
        include: [
          {
            model: User,
            as: 'admin',
            attributes: ['username']
          }
        ]
      });
      return news;
    } catch (error) {
      throw new Error(`Failed to fetch game news: ${error.message}`);
    }
  }

  // Notify all players about new game news
  static async notifyAllPlayers(news) {
    try {
      // Get all characters (all characters are considered active)
      const characters = await Character.findAll({
        attributes: ['userId']
      });

      console.log(`Found ${characters.length} active characters to notify`);

      const userIds = characters.map(char => char.userId);

      if (userIds.length === 0) {
        console.log('No active users found to notify');
        return { success: true, notifiedCount: 0 };
      }

      // Create notifications for all players
      const notifications = userIds.map(userId => ({
        userId: userId,
        type: 'SYSTEM',
        title: 'تحديث جديد في اللعبة!',
        content: `تم نشر تحديث جديد: "${news.title}". يمكنك مشاهدته في قسم أخبار اللعبة في الصفحة الرئيسية.`,
        data: {
          newsId: news.id,
          newsTitle: news.title
        },
        isRead: false
      }));

      const createdNotifications = await Notification.bulkCreate(notifications);
      console.log(`Created ${createdNotifications.length} notifications`);

      // Also emit socket event for real-time notifications
      try {
        const { emitNotification } = await import('../socket.js');
        userIds.forEach(userId => {
          emitNotification(userId, {
            type: 'SYSTEM',
            title: 'تحديث جديد في اللعبة!',
            content: `تم نشر تحديث جديد: "${news.title}". يمكنك مشاهدته في قسم أخبار اللعبة في الصفحة الرئيسية.`,
            data: {
              newsId: news.id,
              newsTitle: news.title
            }
          });
        });
        console.log(`Emitted socket notifications to ${userIds.length} users`);
      } catch (socketError) {
        console.error('Socket notification error:', socketError);
      }

      return { success: true, notifiedCount: userIds.length };
    } catch (error) {
      console.error('Failed to notify players:', error);
      // Don't throw error here as the news was created successfully
      return { success: false, error: error.message };
    }
  }
} 