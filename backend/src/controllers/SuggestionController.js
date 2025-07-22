import { SuggestionService } from '../services/SuggestionService.js';

export class SuggestionController {
  // Create a new suggestion
  static async createSuggestion(req, res) {
    try {
      const { type, title, message } = req.body;
      const suggestion = await SuggestionService.createSuggestion(req.user.id, {
        type,
        title,
        message
      });
      res.status(201).json(suggestion);
    } catch (error) {
      console.error('Error creating suggestion:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get all suggestions (admin only)
  static async getAllSuggestions(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const result = await SuggestionService.getAllSuggestions(
        parseInt(page),
        parseInt(limit),
        status
      );
      res.json(result);
    } catch (error) {
      console.error('Error getting all suggestions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get suggestion by ID (admin only)
  static async getSuggestionById(req, res) {
    try {
      const { id } = req.params;
      const suggestion = await SuggestionService.getSuggestionById(parseInt(id));
      res.json(suggestion);
    } catch (error) {
      console.error('Error getting suggestion by ID:', error);
      if (error.message === 'Suggestion not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update suggestion status (admin only)
  static async updateSuggestionStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;
      
      if (!status || !['unread', 'pending', 'done'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const suggestion = await SuggestionService.updateSuggestionStatus(
        parseInt(id),
        status,
        adminNotes,
        req.user.id
      );
      res.json(suggestion);
    } catch (error) {
      console.error('Error updating suggestion status:', error);
      if (error.message === 'Suggestion not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete suggestion (admin only)
  static async deleteSuggestion(req, res) {
    try {
      const { id } = req.params;
      const result = await SuggestionService.deleteSuggestion(parseInt(id));
      res.json(result);
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      if (error.message === 'Suggestion not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get suggestion statistics (admin only)
  static async getSuggestionStats(req, res) {
    try {
      const stats = await SuggestionService.getSuggestionStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting suggestion stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user's suggestions
  static async getUserSuggestions(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await SuggestionService.getUserSuggestions(
        req.user.id,
        parseInt(page),
        parseInt(limit)
      );
      res.json(result);
    } catch (error) {
      console.error('Error getting user suggestions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 