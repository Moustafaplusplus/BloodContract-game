import { GoldService } from '../services/GoldService.js';

export class GoldController {
  // Get gold packages
  static async getGoldPackages(req, res) {
    try {
      const packages = await GoldService.getGoldPackages();
      res.json(packages);
    } catch (error) {
      console.error('Get gold packages error:', error);
      res.status(500).json({ error: 'Failed to get gold packages' });
    }
  }

  // Purchase gold
  static async purchaseGold(req, res) {
    try {
      const { packageId } = req.body;
      if (!packageId) {
        return res.status(400).json({ error: 'Package ID required' });
      }

      // Process payment (mock for now)
      const packageData = await GoldService.getPackageById(packageId);
      if (!packageData) {
        return res.status(404).json({ error: 'Package not found' });
      }

      const payment = await GoldService.processPayment(req.user.id, packageData.usdPrice);
      if (!payment.success) {
        return res.status(402).json({ error: 'Payment failed' });
      }

      const result = await GoldService.purchaseGold(req.user.id, packageId, payment.transactionId);
      res.status(201).json(result);
    } catch (error) {
      console.error('Purchase gold error:', error);
      if (error.message === 'Character or package not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Package not available') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to purchase gold' });
    }
  }

  // Purchase VIP membership
  static async purchaseVIP(req, res) {
    try {
      const { tier } = req.body;
      if (!tier) {
        return res.status(400).json({ error: 'VIP tier required' });
      }

      const result = await GoldService.purchaseVIP(req.user.id, tier);
      res.status(201).json(result);
    } catch (error) {
      console.error('Purchase VIP error:', error);
      if (error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Invalid VIP tier') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Not enough gold') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to purchase VIP' });
    }
  }

  // Get user's VIP status
  static async getUserVIPStatus(req, res) {
    try {
      const vipStatus = await GoldService.getUserVIPStatus(req.user.id);
      res.json({ vipStatus });
    } catch (error) {
      console.error('Get VIP status error:', error);
      res.status(500).json({ error: 'Failed to get VIP status' });
    }
  }

  // Get user's transaction history
  static async getUserTransactionHistory(req, res) {
    try {
      const history = await GoldService.getUserTransactionHistory(req.user.id);
      res.json(history);
    } catch (error) {
      console.error('Get transaction history error:', error);
      res.status(500).json({ error: 'Failed to get transaction history' });
    }
  }

  // Get gold statistics (admin only)
  static async getGoldStats(req, res) {
    try {
      const stats = await GoldService.getGoldStats();
      res.json(stats);
    } catch (error) {
      console.error('Get gold stats error:', error);
      res.status(500).json({ error: 'Failed to get gold statistics' });
    }
  }

  // Get VIP prices
  static async getVIPPrices(req, res) {
    try {
      res.json(GoldService.VIP_PRICES);
    } catch (error) {
      console.error('Get VIP prices error:', error);
      res.status(500).json({ error: 'Failed to get VIP prices' });
    }
  }
} 