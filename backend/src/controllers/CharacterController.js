import { CharacterService } from '../services/CharacterService.js';

export class CharacterController {
  static async getCharacter(req, res) {
    try {
      const char = await CharacterService.getCharacterByUserId(req.user.id);
      if (!char) {
        return res.status(404).json({ error: 'Character not found' });
      }
      return res.json(await char.toSafeJSON());
    } catch (error) {
      console.error('Error getting character:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async trainAttribute(req, res) {
    try {
      const { attr } = req.body;
      if (!['strength', 'defense'].includes(attr)) {
        return res.status(400).json({ error: 'Invalid attribute' });
      }

      const char = await CharacterService.trainAttribute(req.user.id, attr);
      return res.json(await char.toSafeJSON());
    } catch (error) {
      console.error('Error training attribute:', error);
      if (error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Not enough energy') {
        return res.status(400).json({ error: error.message });
      }
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
} 