import { ProfileService } from '../services/ProfileService.js';
import { ProfileRating } from '../models/ProfileRating.js';

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
      console.log('[ProfileController] Request for username:', username);
      console.log('[ProfileController] Request headers:', req.headers);
      
      const profile = await ProfileService.getUserProfileByUsername(username);
      console.log('[ProfileController] Successfully retrieved profile for:', username);
      res.json(profile);
    } catch (error) {
      console.error('[ProfileController] Get user profile by username error:', error);
      console.error('[ProfileController] Error stack:', error.stack);
      if (error.message === 'User not found' || error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to get user profile', details: error.message });
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

  // Get likes/dislikes count for a user
  static async getProfileRatings(req, res) {
    try {
      const { id } = req.params;
      const likes = await ProfileRating.count({ where: { targetId: id, rating: 'LIKE' } });
      const dislikes = await ProfileRating.count({ where: { targetId: id, rating: 'DISLIKE' } });
      let userRating = null;
      if (req.user) {
        const existing = await ProfileRating.findOne({ where: { raterId: req.user.id, targetId: id } });
        if (existing) userRating = existing.rating;
      }
      res.json({ likes, dislikes, userRating });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get profile ratings' });
    }
  }

  // Like or dislike a user profile
  static async rateProfile(req, res) {
    try {
      const { id } = req.params;
      const { rating } = req.body;
      if (!['LIKE', 'DISLIKE'].includes(rating)) {
        return res.status(400).json({ error: 'Invalid rating' });
      }
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({ error: 'Cannot rate yourself' });
      }
      let profileRating = await ProfileRating.findOne({ where: { raterId: req.user.id, targetId: id } });
      if (profileRating) {
        profileRating.rating = rating;
        await profileRating.save();
      } else {
        profileRating = await ProfileRating.create({ raterId: req.user.id, targetId: id, rating });
      }
      res.json({ success: true, rating });
    } catch (error) {
      res.status(500).json({ error: 'Failed to rate profile' });
    }
  }
} 