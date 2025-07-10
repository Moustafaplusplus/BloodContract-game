import { ProfileService } from '../services/ProfileService.js';

export class SearchController {
  // Search users
  static async searchUsers(req, res) {
    try {
      const { query, limit = 10, sort, ...filters } = req.query;
      const users = await ProfileService.searchUsers(query, parseInt(limit), sort, filters);
      res.json(users);
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({ error: 'Failed to search users' });
    }
  }

  // Get top players
  static async getTopPlayers(req, res) {
    try {
      const { metric = 'level', limit = 10 } = req.query;
      const players = await ProfileService.getTopPlayers(metric, parseInt(limit));
      res.json(players);
    } catch (error) {
      console.error('Get top players error:', error);
      if (error.message === 'Invalid metric') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to get top players' });
    }
  }
} 