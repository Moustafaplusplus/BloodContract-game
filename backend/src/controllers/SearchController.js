import { ProfileService } from '../services/ProfileService.js';

export class SearchController {
  // Search users
  static async searchUsers(req, res) {
    try {
      const queryData = req.validatedQuery || req.query;
      const { query, limit = 10, sort, ...filters } = queryData;
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
      const queryData = req.validatedQuery || req.query;
      const { metric = 'level', limit = 10 } = queryData;
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