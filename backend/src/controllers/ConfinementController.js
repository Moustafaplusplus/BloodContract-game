import { ConfinementService } from '../services/ConfinementService.js';

export class ConfinementController {
  // Jail endpoints
  static async getJailStatus(req, res) {
    try {
      const status = await ConfinementService.getJailStatus(req.user.id);
      res.json(status);
    } catch (error) {
      console.error('Jail status error:', error);
      res.status(500).json({ 
        error: 'Failed to get jail status',
        details: error.message 
      });
    }
  }

  static async bailOut(req, res) {
    try {
      const result = await ConfinementService.bailOut(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Bail error:', error);
      if (error.message === 'Not in jail') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Insufficient funds') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Bail failed" });
    }
  }

  // Hospital endpoints
  static async getHospitalStatus(req, res) {
    try {
      console.log('[HOSPITAL] Getting status for user:', req.user.id);
      const status = await ConfinementService.getHospitalStatus(req.user.id);
      console.log('[HOSPITAL] Status result:', status);
      res.json(status);
    } catch (error) {
      console.error('[HOSPITAL] Hospital status error:', error);
      console.error('[HOSPITAL] Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Failed to get hospital status',
        details: error.message 
      });
    }
  }

  // Get hospital status for any user by userId (admin/public)
  static async getHospitalStatusForUser(req, res) {
    try {
      const userId = Number(req.params.userId);
      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid userId' });
      }
      const status = await ConfinementService.getHospitalStatus(userId);
      res.json(status);
    } catch (error) {
      console.error('Hospital status for user error:', error);
      // Return a more specific error response instead of 500
      res.status(500).json({ 
        error: 'Failed to get hospital status',
        details: error.message 
      });
    }
  }

  static async healOut(req, res) {
    try {
      const result = await ConfinementService.healOut(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Heal error:', error);
      if (error.message === 'Not in hospital') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Insufficient funds') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Heal failed" });
    }
  }

  static async getJailCount(req, res) {
    try {
      const count = await ConfinementService.getJailCount();
      res.json({ count });
    } catch (error) {
      console.error('Jail count error:', error);
      res.status(500).json({ error: 'Failed to get jail count' });
    }
  }

  static async getHospitalCount(req, res) {
    try {
      const count = await ConfinementService.getHospitalCount();
      res.json({ count });
    } catch (error) {
      console.error('Hospital count error:', error);
      res.status(500).json({ error: 'Failed to get hospital count' });
    }
  }
} 