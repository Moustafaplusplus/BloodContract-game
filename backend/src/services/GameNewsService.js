import { GameNews, User } from '../models/index.js';
import { Notification } from '../models/Notification.js';
import { Character } from '../models/Character.js';
import { Op } from 'sequelize';

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
      await this.notifyAllPlayers(news.id);

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

  // Get recent game news (for socket updates)
  static async getRecentNews() {
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
        limit: 5
      });
      return news;
    } catch (error) {
      throw new Error(`Failed to fetch recent game news: ${error.message}`);
    }
  }

  // Notify all players about new game news
  static async notifyAllPlayers(newsId) {
    try {
      const news = await GameNews.findByPk(newsId);
      if (!news) {
        throw new Error('News not found');
      }

      // Get all active characters
      const characters = await Character.findAll({
        where: {
          lastActive: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Active in last 7 days
        },
        attributes: ['userId']
      });

      if (characters.length === 0) {
        return { success: false, message: 'No active users found to notify' };
      }

      const userIds = characters.map(char => char.userId);

      // Create notifications for all users
      const notifications = userIds.map(userId => ({
        userId,
        type: 'game_news',
        title: 'أخبار اللعبة',
        message: news.title,
        data: { newsId: news.id },
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const createdNotifications = await Notification.bulkCreate(notifications);

      // Emit socket notifications
      try {
        if (global.io) {
          userIds.forEach(userId => {
            global.io.to(`user:${userId}`).emit('notification:new', {
              type: 'game_news',
              title: 'أخبار اللعبة',
              message: news.title,
              data: { newsId: news.id }
            });
          });
        }
      } catch (socketError) {
        console.error('Socket notification error:', socketError);
      }

      return { success: true, notifiedUsers: userIds.length };
    } catch (error) {
      console.error('Failed to notify players:', error);
      return { success: false, message: 'Failed to notify players' };
    }
  }
} 