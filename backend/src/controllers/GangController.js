import { GangService } from '../services/GangService.js';

export class GangController {
  // Create gang
  static async createGang(req, res) {
    try {
      const { name, description, method } = req.body;
      if (!name || !description) {
        return res.status(400).json({ error: 'Name and description required' });
      }
      const gang = await GangService.createGang(name, description, req.user.id, method);
      res.status(201).json(gang);
    } catch (error) {
      console.error('[ERROR] Create gang:', error);
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
      console.error('[ERROR] Get all gangs:', error);
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
      console.error('[ERROR] Get gang by ID:', error);
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
      console.error('[ERROR] Get user gang:', error);
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
      console.error('[ERROR] Join gang:', error);
      if (error.message === 'User is already in a gang') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Gang not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Gang is full') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'You already have a pending join request for this gang') {
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
      console.error('[ERROR] Leave gang:', error);
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
      console.error('[ERROR] Transfer leadership:', error);
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
      console.error('[ERROR] Contribute money:', error);
      if (error.message === 'Not a member of this gang') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Not enough money') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to contribute money' });
    }
  }



  // Update gang board
  static async updateBoard(req, res) {
    try {
      const { gangId } = req.params;
      const { board } = req.body;
      if (!board) {
        return res.status(400).json({ error: 'Board content required' });
      }
      const result = await GangService.updateBoard(gangId, req.user.id, board);
      res.json(result);
    } catch (error) {
      console.error('[ERROR] Update board:', error);
      if (error.message === 'Not authorized') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Gang not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update board' });
    }
  }



  // Get gang vault
  static async getVault(req, res) {
    try {
      const { gangId } = req.params;
      const vault = await GangService.getVault(gangId);
      res.json({ vault });
    } catch (error) {
      console.error('[ERROR] Get vault:', error);
      res.status(500).json({ error: 'Failed to get vault' });
    }
  }

  // Update gang vault (admin/owner only)
  static async updateVault(req, res) {
    try {
      const { gangId } = req.params;
      const { money } = req.body;
      const result = await GangService.updateVault(gangId, req.user.id, money);
      res.json(result);
    } catch (error) {
      console.error('[ERROR] Update vault:', error);
      if (error.message === 'Not authorized') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Gang not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update vault' });
    }
  }

  // Delete gang (owner only)
  static async deleteGang(req, res) {
    try {
      const { gangId } = req.params;
      const result = await GangService.deleteGang(gangId, req.user.id);
      res.json(result);
    } catch (error) {
      console.error('[ERROR] Delete gang:', error);
      if (error.message === 'Gang not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Not authorized') {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to delete gang' });
    }
  }

  // Transfer money from vault to member (owner only)
  static async transferFromVault(req, res) {
    try {
      const { gangId } = req.params;
      const { memberId, amount } = req.body;
      if (!memberId || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid memberId and amount required' });
      }
      const result = await GangService.transferFromVault(gangId, req.user.id, memberId, amount);
      res.json(result);
    } catch (error) {
      console.error('[ERROR] Transfer from vault:', error);
      if (error.message === 'Gang not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Not authorized') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Not enough money in vault') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Target user is not a member of this gang' || error.message === 'Character not found') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to transfer money' });
    }
  }

  // Kick a member (leader/officer only)
  static async kickMember(req, res) {
    try {
      const { gangId } = req.params;
      const { targetUserId } = req.body;
      if (!targetUserId) {
        return res.status(400).json({ error: 'Target user ID required' });
      }
      const result = await GangService.kickMember(gangId, req.user.id, targetUserId);
      res.json(result);
    } catch (error) {
      console.error('[ERROR] Kick member:', error);
      if (error.message === 'Not a member of this gang' || error.message === 'Not authorized to kick members') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Target user is not a member of this gang' || error.message === 'Cannot kick the leader' || error.message === 'Officers cannot kick other officers') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to kick member' });
    }
  }

  // Promote member to officer (leader only)
  static async promoteMember(req, res) {
    try {
      const { gangId } = req.params;
      const { targetUserId } = req.body;
      if (!targetUserId) {
        return res.status(400).json({ error: 'Target user ID required' });
      }
      const result = await GangService.promoteMember(gangId, req.user.id, targetUserId);
      res.json(result);
    } catch (error) {
      console.error('[ERROR] Promote member:', error);
      if (error.message === 'Not authorized') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Target user is not a member of this gang' || error.message === 'Can only promote members to officers') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to promote member' });
    }
  }

  // Demote officer to member (leader only)
  static async demoteOfficer(req, res) {
    try {
      const { gangId } = req.params;
      const { targetUserId } = req.body;
      if (!targetUserId) {
        return res.status(400).json({ error: 'Target user ID required' });
      }
      const result = await GangService.demoteOfficer(gangId, req.user.id, targetUserId);
      res.json(result);
    } catch (error) {
      console.error('[ERROR] Demote officer:', error);
      if (error.message === 'Not authorized') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Target user is not a member of this gang' || error.message === 'Can only demote officers') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to demote officer' });
    }
  }

  // Get join requests for a gang (leader/officer only)
  static async getJoinRequests(req, res) {
    try {
      const { gangId } = req.params;
      const requests = await GangService.getJoinRequests(gangId, req.user.id);
      res.json(requests);
    } catch (error) {
      console.error('[ERROR] Get join requests:', error);
      if (error.message === 'Not a member of this gang' || error.message === 'Not authorized to view join requests') {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to get join requests' });
    }
  }

  // Accept join request (leader/officer only)
  static async acceptJoinRequest(req, res) {
    try {
      const { gangId } = req.params;
      const { requestId } = req.body;
      if (!requestId) {
        return res.status(400).json({ error: 'Request ID required' });
      }
      const result = await GangService.acceptJoinRequest(gangId, req.user.id, requestId);
      res.json(result);
    } catch (error) {
      console.error('[ERROR] Accept join request:', error);
      if (error.message === 'Not a member of this gang' || error.message === 'Not authorized to accept join requests') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Join request not found' || error.message === 'Join request is not pending' || error.message === 'Gang is full' || error.message === 'User is already in a gang') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to accept join request' });
    }
  }

  // Reject join request (leader/officer only)
  static async rejectJoinRequest(req, res) {
    try {
      const { gangId } = req.params;
      const { requestId } = req.body;
      if (!requestId) {
        return res.status(400).json({ error: 'Request ID required' });
      }
      const result = await GangService.rejectJoinRequest(gangId, req.user.id, requestId);
      res.json(result);
    } catch (error) {
      console.error('[ERROR] Reject join request:', error);
      if (error.message === 'Not a member of this gang' || error.message === 'Not authorized to reject join requests') {
        return res.status(403).json({ error: error.message });
      }
      if (error.message === 'Join request not found' || error.message === 'Join request is not pending') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to reject join request' });
    }
  }

  // Get user's own join requests
  static async getUserJoinRequests(req, res) {
    try {
      const requests = await GangService.getUserJoinRequests(req.user.id);
      res.json(requests);
    } catch (error) {
      console.error('[ERROR] Get user join requests:', error);
      res.status(500).json({ error: 'Failed to get join requests' });
    }
  }

  // Cancel join request
  static async cancelJoinRequest(req, res) {
    try {
      const { gangId } = req.params;
      const result = await GangService.cancelJoinRequest(req.user.id, gangId);
      res.json(result);
    } catch (error) {
      console.error('[ERROR] Cancel join request:', error);
      if (error.message === 'No pending join request found for this gang') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to cancel join request' });
    }
  }
}
