import { LoginGiftService } from '../services/LoginGiftService.js';

export class LoginGiftController {
  static async getUserStatus(req, res) {
    try {
      const userId = req.user.id;
      const status = await LoginGiftService.getUserStatus(userId);
      
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Error getting user status:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting user status',
        error: error.message
      });
    }
  }

  static async claimDailyReward(req, res) {
    try {
      const userId = req.user.id;
      const result = await LoginGiftService.claimDailyReward(userId);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getAdminConfiguration(req, res) {
    try {
      const config = await LoginGiftService.getAdminConfiguration();
      
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Error getting admin configuration:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting admin configuration',
        error: error.message
      });
    }
  }

  static async updateAdminConfiguration(req, res) {
    try {
      const { dayNumber } = req.params;
      const config = req.body;
      
      const result = await LoginGiftService.updateAdminConfiguration(parseInt(dayNumber), config);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error updating admin configuration:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getAvailableItems(req, res) {
    try {
      const items = await LoginGiftService.getAvailableItems();
      
      res.json({
        success: true,
        data: items
      });
    } catch (error) {
      console.error('Error getting available items:', error);
      res.status(500).json({
        success: false,
        message: 'Error getting available items',
        error: error.message
      });
    }
  }

  static async resetUserProgress(req, res) {
    try {
      const { userId } = req.params;
      const result = await LoginGiftService.resetUserProgress(parseInt(userId));
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error resetting user progress:', error);
      res.status(500).json({
        success: false,
        message: 'Error resetting user progress',
        error: error.message
      });
    }
  }
} 