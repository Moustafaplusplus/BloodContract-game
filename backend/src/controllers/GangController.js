import { GangService } from '../services/GangService.js';

export class GangController {
  // Create gang
  static async createGang(req, res) {
    try {
      const { name, description } = req.body;
      if (!name || !description) {
        return res.status(400).json({ error: 'Name and description required' });
      }

      const gang = await GangService.createGang(name, description, req.user.id);
      res.status(201).json(gang);
    } catch (error) {
      console.error('Create gang error:', error);
      if (error.message === 'User is already in a gang') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Gang name already taken') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to create gang' });
    }
  }

  // Get all gangs
  static async getAllGangs(req, res) {
    try {
      const gangs = await GangService.getAllGangs();
      res.json(gangs);
    } catch (error) {
      console.error('Get all gangs error:', error);
      res.status(500).json({ error: 'Failed to get gangs' });
    }
  }

  // Get gang by ID
  static async getGangById(req, res) {
    try {
      const { id } = req.params;
      const gang = await GangService.getGangById(id);
      if (!gang) {
        return res.status(404).json({ error: 'Gang not found' });
      }
      res.json(gang);
    } catch (error) {
      console.error('Get gang by ID error:', error);
      res.status(500).json({ error: 'Failed to get gang' });
    }
  }

  // Get user's gang
  static async getUserGang(req, res) {
    try {
      const gang = await GangService.getUserGang(req.user.id);
      if (!gang) {
        return res.status(404).json({ message: 'Not in a gang' });
      }
      res.json(gang);
    } catch (error) {
      console.error('Get user gang error:', error);
      res.status(500).json({ error: 'Failed to get user gang' });
    }
  }

  // Join gang
  static async joinGang(req, res) {
    try {
      const { gangId } = req.params;
      const member = await GangService.sendJoinRequest(gangId, req.user.id);
      res.status(201).json(member);
    } catch (error) {
      console.error('Join gang error:', error);
      if (error.message === 'User is already in a gang') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Gang not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Gang is full') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to join gang' });
    }
  }

  // Leave gang
  static async leaveGang(req, res) {
    try {
      const result = await GangService.leaveGang(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Leave gang error:', error);
      if (error.message === 'User is not in a gang') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Leader cannot leave gang. Transfer leadership first.') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to leave gang' });
    }
  }

  // Transfer leadership
  static async transferLeadership(req, res) {
    try {
      const { gangId } = req.params;
      const { newLeaderId } = req.body;
      if (!newLeaderId) {
        return res.status(400).json({ error: 'New leader ID required' });
      }

      const gang = await GangService.transferLeadership(gangId, newLeaderId, req.user.id);
      res.json(gang);
    } catch (error) {
      console.error('Transfer leadership error:', error);
      if (error.message === 'Not authorized') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'New leader is not a member of this gang') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to transfer leadership' });
    }
  }

  // Contribute money
  static async contributeMoney(req, res) {
    try {
      const { gangId } = req.params;
      const { amount } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid amount required' });
      }

      const result = await GangService.contributeMoney(gangId, req.user.id, amount);
      res.json(result);
    } catch (error) {
      console.error('Contribute money error:', error);
      if (error.message === 'Not a member of this gang') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Not enough money') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to contribute money' });
    }
  }

  // Get gang wars
  static async getGangWars(req, res) {
    try {
      const { gangId } = req.params;
      const wars = await GangService.getGangWars(gangId);
      res.json(wars);
    } catch (error) {
      console.error('Get gang wars error:', error);
      res.status(500).json({ error: 'Failed to get gang wars' });
    }
  }

  // Start gang war
  static async startGangWar(req, res) {
    try {
      const { gang1Id, gang2Id, duration } = req.body;
      if (!gang1Id || !gang2Id) {
        return res.status(400).json({ error: 'Both gang IDs required' });
      }

      const war = await GangService.startGangWar(gang1Id, gang2Id, duration);
      res.status(201).json(war);
    } catch (error) {
      console.error('Start gang war error:', error);
      if (error.message === 'One or both gangs not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'One or both gangs are already in a war') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to start gang war' });
    }
  }
} 