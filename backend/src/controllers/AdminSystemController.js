import { AdminSystemService } from '../services/AdminSystemService.js';

export class AdminSystemController {
  // Toggle user ban
  static async toggleUserBan(req, res) {
    try {
      const { userId } = req.params;
      const { banned, reason } = req.body;
      
      const result = await AdminSystemService.toggleUserBan(parseInt(userId), banned, reason);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error toggling user ban:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user statistics
  static async getUserStats(req, res) {
    try {
      const { userId } = req.params;
      const stats = await AdminSystemService.getUserStats(parseInt(userId));
      res.json(stats);
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get system statistics
  static async getSystemStats(req, res) {
    try {
      const stats = await AdminSystemService.getSystemStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting system stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user IP addresses
  static async getUserIps(req, res) {
    try {
      const { userId } = req.params;
      const ips = await AdminSystemService.getUserIps(parseInt(userId));
      res.json(ips);
    } catch (error) {
      console.error('Error getting user IPs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Block an IP address
  static async blockIp(req, res) {
    try {
      const { ipAddress, reason } = req.body;
      
      if (!ipAddress) {
        return res.status(400).json({ error: 'IP address is required' });
      }

      const result = await AdminSystemService.blockIp(ipAddress, reason);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error blocking IP:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Unblock an IP address
  static async unblockIp(req, res) {
    try {
      const { ipAddress } = req.params;
      
      const result = await AdminSystemService.unblockIp(ipAddress);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error unblocking IP:', error);
      if (error.message === 'IP address not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all blocked IPs
  static async getBlockedIps(req, res) {
    try {
      const blockedIps = await AdminSystemService.getBlockedIps();
      res.json(blockedIps);
    } catch (error) {
      console.error('Error getting blocked IPs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get IP statistics
  static async getIpStats(req, res) {
    try {
      const stats = await AdminSystemService.getIpStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting IP stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get flagged IPs (IPs used by more than one user)
  static async getFlaggedIps(req, res) {
    try {
      const flaggedIps = await AdminSystemService.getFlaggedIps();
      res.json(flaggedIps);
    } catch (error) {
      console.error('Error getting flagged IPs:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 