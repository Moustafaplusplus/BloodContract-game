import { AchievementService } from '../services/AchievementService.js';
import { CharacterService } from '../services/CharacterService.js';

export class AchievementController {
  // Get all achievements
  static async getAllAchievements(req, res) {
    try {
      const achievements = await AchievementService.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      console.error('Get all achievements error:', error);
      res.status(500).json({ error: 'Failed to get achievements' });
    }
  }

  // Get user's achievements
  static async getUserAchievements(req, res) {
    try {
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const achievements = await AchievementService.getUserAchievements(character.id);
      res.json(achievements);
    } catch (error) {
      console.error('Get user achievements error:', error);
      res.status(500).json({ error: 'Failed to get user achievements' });
    }
  }

  // Check achievements for current user
  static async checkAchievements(req, res) {
    try {
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const unlockedAchievements = await AchievementService.checkAchievements(character.id);
      res.json({ unlockedAchievements });
    } catch (error) {
      console.error('Check achievements error:', error);
      if (error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to check achievements' });
    }
  }

  // Get achievement statistics
  static async getAchievementStats(req, res) {
    try {
      const stats = await AchievementService.getAchievementStats();
      res.json(stats);
    } catch (error) {
      console.error('Get achievement stats error:', error);
      res.status(500).json({ error: 'Failed to get achievement statistics' });
    }
  }

  // Get achievement leaderboard
  static async getAchievementLeaderboard(req, res) {
    try {
      const { limit = 10 } = req.query;
      const leaderboard = await AchievementService.getAchievementLeaderboard(parseInt(limit));
      res.json(leaderboard);
    } catch (error) {
      console.error('Get achievement leaderboard error:', error);
      res.status(500).json({ error: 'Failed to get achievement leaderboard' });
    }
  }
} 