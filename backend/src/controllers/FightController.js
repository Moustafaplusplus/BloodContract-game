import { FightService } from '../services/FightService.js';

export class FightController {
  static async attackPlayer(req, res) {
    try {
      const { defenderId } = req.params;
      const attackerId = req.user.id;
      
      const result = await FightService.executeFight(attackerId, defenderId);
      res.json(result);
    } catch (error) {
      console.error('[FightController] Attack error:', error);
      res.status(500).json({ error: 'Failed to execute fight' });
    }
  }

  // Get challengeable players (5 levels above or below)
  static async getChallengeablePlayers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const players = await FightService.getChallengeablePlayers(req.user.id, limit);
      res.json(players);
    } catch (error) {
      console.error('Get challengeable players error:', error);
      res.status(500).json({ error: error.message || "فشل جلب اللاعبين" });
    }
  }

  // Search for players to fight
  static async searchPlayers(req, res) {
    try {
      const { query } = req.query;
      const limit = parseInt(req.query.limit) || 10;
      
      if (!query) {
        return res.status(400).json({ error: "مطلوب نص البحث" });
      }
      
      const players = await FightService.searchPlayers(req.user.id, query, limit);
      res.json(players);
    } catch (error) {
      console.error('Search players error:', error);
      if (error.message.includes('at least 2 characters')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "فشل البحث" });
    }
  }
} 