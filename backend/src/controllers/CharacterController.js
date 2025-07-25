import { CharacterService } from '../services/CharacterService.js';

export class CharacterController {
  static async getCharacter(req, res) {
    try {
      const char = await CharacterService.getCharacterByUserId(req.user.id);
      if (!char) {
        return res.status(404).json({ error: 'Character not found' });
      }
      const safeChar = await char.toSafeJSON();
      // Always include daily login info
      safeChar.dailyLoginReward = char._dailyLoginReward || 0;
      safeChar.gaveDailyLogin = !!char._gaveDailyLogin;
      return res.json(safeChar);
    } catch (error) {
      console.error('Error getting character:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await CharacterService.getCharacterStats(req.user.id);
      return res.json(stats || {});
    } catch (error) {
      console.error('Error getting stats:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getCharacterByUsername(req, res) {
    try {
      const { username } = req.params;
      const char = await CharacterService.getCharacterByUsername(username);
      if (!char) {
        return res.status(404).json({ error: 'Character not found' });
      }
      return res.json(await char.toSafeJSON());
    } catch (error) {
      console.error('Error getting character by username:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async clearLevelUpRewards(req, res) {
    try {
      const char = await CharacterService.getCharacterByUserId(req.user.id);
      if (!char) {
        return res.status(404).json({ error: 'Character not found' });
      }
      
      CharacterService.clearLevelUpRewards(char);
      await char.save();
      
      return res.json({ success: true });
    } catch (error) {
      console.error('Error clearing level-up rewards:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 