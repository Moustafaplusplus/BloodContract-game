import { ProfileService } from '../services/ProfileService.js';

export class ProfileController {
  // Get own profile
  static async getOwnProfile(req, res) {
    try {
      const profile = await ProfileService.getUserProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      console.error('Get own profile error:', error);
      if (error.message === 'User not found' || error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  // Get user profile by ID
  static async getUserProfileById(req, res) {
    try {
      const { id } = req.params;
      const profile = await ProfileService.getPublicUserInfo(id);
      res.json(profile);
    } catch (error) {
      console.error('Get user profile error:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to get user profile' });
    }
  }

  // Get user profile by username
  static async getUserProfileByUsername(req, res) {
    try {
      const { username } = req.params;
      const profile = await ProfileService.getUserProfileByUsername(username);
      res.json(profile);
    } catch (error) {
      console.error('Get user profile by username error:', error);
      if (error.message === 'User not found' || error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to get user profile' });
    }
  }

  // Update own profile
  static async updateOwnProfile(req, res) {
    try {
      const updateData = req.body;
      const updatedProfile = await ProfileService.updateUserProfile(req.user.id, updateData);
      res.json(updatedProfile);
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // Get user stats
  static async getUserStats(req, res) {
    try {
      const stats = await ProfileService.getUserStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      if (error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to get user stats' });
    }
  }

  // Check username availability
  static async checkUsernameAvailability(req, res) {
    try {
      const queryData = req.validatedQuery || req.query;
      const { username } = queryData;
      if (!username) {
        return res.status(400).json({ error: 'Username parameter required' });
      }

      const isAvailable = await ProfileService.isUsernameAvailable(username);
      res.json({ available: isAvailable });
    } catch (error) {
      console.error('Check username availability error:', error);
      res.status(500).json({ error: 'Failed to check username availability' });
    }
  }
} 