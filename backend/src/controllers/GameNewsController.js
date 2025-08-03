import { GameNewsService } from '../services/GameNewsService.js';

export class GameNewsController {
  // Get all game news (for players)
  static async getAllNews(req, res) {
    try {
      const news = await GameNewsService.getAllNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get specific news by ID
  static async getNewsById(req, res) {
    try {
      const { id } = req.params;
      const news = await GameNewsService.getNewsById(id);
      
      if (!news) {
        return res.status(404).json({ error: 'Game news not found' });
      }
      
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Create new game news (admin only)
  static async createNews(req, res) {
    try {
      const { title, content, type = 'GENERAL' } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }
      
      const news = await GameNewsService.createNews({ title, content, color }, adminId);
      
      res.status(201).json(news);
    } catch (error) {
      console.error('Create news error:', error);
      res.status(500).json({ error: 'Failed to create news' });
    }
  }

  // Update game news (admin only)
  static async updateNews(req, res) {
    try {
      const { id } = req.params;
      const { title, content, color } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
      }

      const news = await GameNewsService.updateNews(id, { title, content, color });
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete game news (admin only)
  static async deleteNews(req, res) {
    try {
      const { id } = req.params;
      const result = await GameNewsService.deleteNews(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get all news for admin management (including inactive)
  static async getAllNewsForAdmin(req, res) {
    try {
      const { GameNews, User } = await import('../models/index.js');
      
      const news = await GameNews.findAll({
        include: [
          {
            model: User,
            as: 'admin',
            attributes: ['username']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
} 