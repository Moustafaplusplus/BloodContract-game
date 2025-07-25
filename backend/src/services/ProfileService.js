import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { Op } from 'sequelize';
import { Fight } from '../models/Fight.js';
import { Statistic } from '../models/Statistic.js';

// Centralized character attributes for reuse
const CHARACTER_ATTRIBUTES = [
  'id', 'userId', 'name', 'level', 'exp', 'money', 'strength', 'defense', 'energy', 'maxEnergy', 'hp', 'maxHp',
  'equippedHouseId', 'gangId', 'daysInGame', 'avatarUrl', 'killCount', 'lastActive', 'buffs', 'quote'
];

// Helper to get fightsLost and fame
async function enrichCharacter(character) {
  if (!character) return {};
  try {
    const fightsLost = await Fight.count({
      where: {
        [Op.or]: [
          { attacker_id: character.userId },
          { defender_id: character.userId }
        ],
        winner_id: { [Op.ne]: character.userId }
      }
    });
    const fame = await character.getFame();
    return { fightsLost, fame };
  } catch (error) {
    console.error('[ProfileService] Error enriching character:', error);
    // Return default values if there's an error
    return { fightsLost: 0, fame: 0 };
  }
}

export class ProfileService {
  // Get user profile by ID
  // Get user profile by ID
  static async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: Character, attributes: CHARACTER_ATTRIBUTES }]
      });
      if (!user || !user.Character) throw new Error('User or Character not found');
      const userObj = user.toJSON();
      delete userObj.email;
      const { fightsLost, fame } = await enrichCharacter(user.Character);
      // Fetch assassinations stat
      let assassinations = 0;
      try {
        const stat = await Statistic.findOne({ where: { userId } });
        if (stat) assassinations = stat.assassinations || 0;
      } catch (statError) {
        console.error('[ProfileService] Error fetching statistics:', statError);
        assassinations = 0;
      }
      if (!userObj.Character) {
        return { ...userObj, fame, fightsLost, assassinations, isVIP: false };
      }
      const rest = { ...userObj };
      delete rest.Character;
      // Only spread plain character data, not Sequelize instance
      const characterData = typeof userObj.Character.toJSON === 'function'
        ? userObj.Character.toJSON()
        : userObj.Character;
      return {
        ...rest,
        ...characterData,
        isVIP: characterData.vipExpiresAt && new Date(characterData.vipExpiresAt) > new Date(),
        fame,
        fightsLost,
        assassinations,
      };
    } catch (error) {
      console.error('[ProfileService] Error getting user profile:', error);
      throw error;
    }
  }

  // Get user profile by username
  static async getUserProfileByUsername(username) {
    try {
      const user = await User.findOne({
        where: { username },
        include: [{ model: Character, attributes: CHARACTER_ATTRIBUTES }]
      });
      if (!user || !user.Character) throw new Error('User or Character not found');
      const userObj = user.toJSON();
      delete userObj.email;
      const { fightsLost, fame } = await enrichCharacter(user.Character);
      // Fetch assassinations stat
      let assassinations = 0;
      try {
        const stat = await Statistic.findOne({ where: { userId: user.id } });
        if (stat) assassinations = stat.assassinations || 0;
      } catch (statError) {
        console.error('[ProfileService] Error fetching statistics:', statError);
        assassinations = 0;
      }
      if (!userObj.Character) {
        return { ...userObj, fame, fightsLost, assassinations, isVIP: false };
      }
      const rest = { ...userObj };
      delete rest.Character;
      // Only spread plain character data, not Sequelize instance
      const characterData = typeof userObj.Character.toJSON === 'function'
        ? userObj.Character.toJSON()
        : userObj.Character;
      return {
        ...rest,
        ...characterData,
        isVIP: characterData.vipExpiresAt && new Date(characterData.vipExpiresAt) > new Date(),
        fame,
        fightsLost,
        assassinations,
      };
    } catch (error) {
      console.error('[ProfileService] Error getting user profile by username:', error);
      throw error;
    }
  }

  // Get public user info by ID (for /api/profile/:id)
  static async getPublicUserInfo(userId) {
    // Reuse the same logic as getUserProfile
    return await this.getUserProfile(userId);
  }

  // Update user profile
  static async updateUserProfile(userId, updateData) {
    const user = await User.findByPk(userId, { include: [Character] });
    if (!user || !user.Character) throw new Error('User or Character not found');
    // Update User fields
    const allowedUserFields = ['email', 'bio'];
    for (const field of allowedUserFields) {
      if (updateData[field] !== undefined) user[field] = updateData[field];
    }
    await user.save();
    // Update Character fields
    const allowedCharacterFields = ['avatar', 'quote'];
    for (const field of allowedCharacterFields) {
      if (updateData[field] !== undefined) user.Character[field] = updateData[field];
    }
    await user.Character.save();
    return this.getUserProfile(userId);
  }

  // Search users by criteria
  static async searchUsers({ sort = 'level', limit = 50, ...filters } = {}) {
    // Build query options
    const queryOptions = {
      include: [{ model: Character, attributes: CHARACTER_ATTRIBUTES }],
      order: [[{ model: Character }, sort, 'DESC']],
      limit: Number(limit) || 50,
      where: {}
    };
    // Add filters to query if needed
    for (const key in filters) {
      if (filters[key] !== undefined) queryOptions.where[key] = filters[key];
    }
    const users = await User.findAll(queryOptions);
    // Remove email and enrich character
    return Promise.all(users.map(async user => {
      const userObj = user.toJSON();
      delete userObj.email;
      const { fightsLost, fame } = await enrichCharacter(user.Character);
      if (!userObj.Character) return { ...userObj, fame, fightsLost, isVIP: false };
      const { Character, ...rest } = userObj;
      return {
        ...rest,
        ...Character,
        isVIP: Character.vipExpiresAt && new Date(Character.vipExpiresAt) > new Date(),
        fame,
        fightsLost,
      };
    }));
  }
}
// ...existing code...