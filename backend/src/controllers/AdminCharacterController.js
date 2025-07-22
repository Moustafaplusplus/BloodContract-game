import { AdminCharacterService } from '../services/AdminCharacterService.js';

export class AdminCharacterController {
  // Get all characters with pagination and search
  static async getAllCharacters(req, res) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await AdminCharacterService.getAllCharacters(
        parseInt(page),
        parseInt(limit),
        search
      );
      res.json(result);
    } catch (error) {
      console.error('Error getting all characters:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get character by ID
  static async getCharacterById(req, res) {
    try {
      const { id } = req.params;
      const character = await AdminCharacterService.getCharacterById(parseInt(id));
      res.json(character);
    } catch (error) {
      console.error('Error getting character by ID:', error);
      if (error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update character
  static async updateCharacter(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const character = await AdminCharacterService.updateCharacter(parseInt(id), updates);
      res.json({ success: true, character });
    } catch (error) {
      console.error('Error updating character:', error);
      if (error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Adjust money
  static async adjustMoney(req, res) {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      
      if (typeof amount !== 'number') {
        return res.status(400).json({ error: 'Amount must be a number' });
      }

      const result = await AdminCharacterService.adjustMoney(parseInt(id), amount);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error adjusting money:', error);
      if (error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Cannot reduce money below 0')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Adjust blackcoins
  static async adjustBlackcoins(req, res) {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      
      if (typeof amount !== 'number') {
        return res.status(400).json({ error: 'Amount must be a number' });
      }

      const result = await AdminCharacterService.adjustBlackcoins(parseInt(id), amount);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error adjusting blackcoins:', error);
      if (error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Cannot reduce blackcoins below 0')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Set character level
  static async setCharacterLevel(req, res) {
    try {
      const { id } = req.params;
      const { level } = req.body;
      
      if (typeof level !== 'number' || level < 1) {
        return res.status(400).json({ error: 'Level must be a positive number' });
      }

      const result = await AdminCharacterService.setCharacterLevel(parseInt(id), level);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error setting character level:', error);
      if (error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message.includes('Level cannot be less than 1')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Reset character (dangerous operation)
  static async resetCharacter(req, res) {
    try {
      const { id } = req.params;
      const { confirmPassword } = req.body;
      
      if (!confirmPassword || confirmPassword !== 'CONFIRM_RESET') {
        return res.status(400).json({ 
          error: 'Please confirm the reset by providing the correct confirmation password' 
        });
      }

      const result = await AdminCharacterService.resetCharacter(parseInt(id), confirmPassword);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error resetting character:', error);
      if (error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 