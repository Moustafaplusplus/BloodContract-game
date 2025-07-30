import { CharacterService } from '../services/CharacterService.js';
import { io } from '../socket.js';

export class CharacterController {
  static async getCharacter(req, res) {
    try {
      const char = await CharacterService.getCharacterByUserId(req.user.id);
      if (!char) {
        return res.status(404).json({ error: 'Character not found' });
      }
      const safeChar = await char.toSafeJSON();
      // Daily login info removed
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

  static async fixMaxHp(req, res) {
    try {
      const char = await CharacterService.getCharacterByUserId(req.user.id);
      if (!char) {
        return res.status(404).json({ error: 'Character not found' });
      }
      
      const oldMaxHp = char.maxHp;
      char.maxHp = char.getMaxHp();
      await char.save();
      
      return res.json({ 
        success: true, 
        oldMaxHp, 
        newMaxHp: char.maxHp,
        level: char.level
      });
    } catch (error) {
      console.error('Error fixing maxHp:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async changeName(req, res) {
    try {
      const { newName } = req.body;
      
      if (!newName || newName.trim().length < 3) {
        return res.status(400).json({ error: 'الاسم يجب أن يكون 3 أحرف على الأقل' });
      }
      
      if (newName.trim().length > 20) {
        return res.status(400).json({ error: 'الاسم يجب أن يكون 20 حرف أو أقل' });
      }

      const char = await CharacterService.getCharacterByUserId(req.user.id);
      if (!char) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const oldName = char.name;
      char.name = newName.trim();
      await char.save();
      
      // Emit HUD update to refresh all components
      if (io) {
        const updatedChar = await char.toSafeJSON();
        io.to(String(req.user.id)).emit("hud:update", updatedChar);
      }
      
      return res.json({ 
        success: true, 
        oldName, 
        newName: char.name,
        message: 'تم تغيير الاسم بنجاح'
      });
    } catch (error) {
      console.error('Error changing name:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 