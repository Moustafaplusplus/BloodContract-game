import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { Op } from 'sequelize';
import { Fight } from '../models/Fight.js';
import { Statistic } from '../models/Statistic.js';

// Centralized character attributes for reuse
const CHARACTER_ATTRIBUTES = [
  'id', 'userId', 'name', 'level', 'exp', 'money', 'strength', 'defense', 'energy', 'maxEnergy', 'hp', 'maxHp',
  'equippedHouseId', 'gangId', 'daysInGame', 'avatarUrl', 'killCount', 'lastActive', 'buffs', 'quote', 'attackImmunityExpiresAt', 'vipExpiresAt'
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
    
    // Simplified fame calculation to avoid complex getFame method
    let fame = 0;
    try {
      fame = (character.level * 100) + ((character.strength || 0) * 20) + ((character.getMaxHp()) * 8) + ((character.defense || 0) * 20);
      fame = Math.round(fame);
    } catch (fameError) {
      console.error('[ProfileService] Error calculating fame:', fameError);
      fame = 0;
    }
    
    return { fightsLost, fame };
  } catch (error) {
    console.error('[ProfileService] Error enriching character:', error);
    // Return default values if there's an error
    return { fightsLost: 0, fame: 0 };
  }
}

// Helper to sanitize user data for public display
function sanitizeUserData(userObj) {
  const sanitized = { ...userObj };
  // Remove sensitive fields
  delete sanitized.email;
  delete sanitized.age;
  delete sanitized.gender;
  delete sanitized.bio;
  delete sanitized.password;
  delete sanitized.googleId;
  delete sanitized.isBanned;
  delete sanitized.banReason;
  delete sanitized.bannedAt;
  delete sanitized.isIpBanned;
  delete sanitized.ipBanReason;
  delete sanitized.ipBannedAt;
  delete sanitized.lastIpAddress;
  delete sanitized.chatMutedUntil;
  delete sanitized.chatBannedUntil;
  // Keep safe fields: username, avatarUrl, isAdmin, isVip, money, blackcoins
  return sanitized;
}

export class ProfileService {
  // Get user profile by ID
  static async getUserProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: Character, attributes: CHARACTER_ATTRIBUTES }]
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // If user exists but character doesn't, create one
      if (!user.Character) {
        console.log(`[ProfileService] Character not found for user ${userId}, creating one...`);
        const character = await Character.create({
          userId: user.id,
          name: user.username
        });
        user.Character = character;
      }
      
      const userObj = user.toJSON();
      const sanitizedUser = sanitizeUserData(userObj);
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
        return { ...sanitizedUser, fame, fightsLost, assassinations, isVIP: false };
      }
      
      const rest = { ...sanitizedUser };
      delete rest.Character;
      
      // Clean character data - only include the actual character fields, not Sequelize metadata
      const characterData = {
        id: userObj.Character.id,
        userId: userObj.Character.userId,
        name: userObj.Character.name,
        level: userObj.Character.level,
        exp: userObj.Character.exp,
        money: userObj.Character.money,
        strength: userObj.Character.strength,
        defense: userObj.Character.defense,
        energy: userObj.Character.energy,
        maxEnergy: userObj.Character.maxEnergy,
        hp: userObj.Character.hp,
        maxHp: userObj.Character.maxHp,
        equippedHouseId: userObj.Character.equippedHouseId,
        gangId: userObj.Character.gangId,
        daysInGame: userObj.Character.daysInGame,
        avatarUrl: userObj.avatarUrl || userObj.Character.avatarUrl,
        killCount: userObj.Character.killCount,
        lastActive: userObj.Character.lastActive,
        buffs: userObj.Character.buffs,
        quote: userObj.Character.quote,
        vipExpiresAt: userObj.Character.vipExpiresAt,
        attackImmunityExpiresAt: userObj.Character.attackImmunityExpiresAt
      };
      
      return {
        ...rest,
        ...characterData,
        // Prioritize character name over username for display
        displayName: characterData.name || sanitizedUser.username,
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
      console.log('[ProfileService] Looking for user with username:', username);
      
      const user = await User.findOne({
        where: { username },
        include: [{ model: Character, attributes: CHARACTER_ATTRIBUTES }]
      });
      
      if (!user) {
        console.log('[ProfileService] User not found for username:', username);
        throw new Error('User not found');
      }
      
      if (!user.Character) {
        console.log('[ProfileService] Character not found for user:', user.id);
        throw new Error('Character not found');
      }
      
      console.log('[ProfileService] Found user and character:', { userId: user.id, characterId: user.Character.id });
      
      const userObj = user.toJSON();
      const sanitizedUser = sanitizeUserData(userObj);
      
      console.log('[ProfileService] Enriching character data...');
      const { fightsLost, fame } = await enrichCharacter(user.Character);
      
      // Fetch assassinations stat (if available)
      let assassinations = 0;
      try {
        const stat = await Statistic.findOne({ where: { userId: user.id } });
        if (stat) {
          // Check if assassinations field exists, otherwise use a default
          // Note: assassinations field might not exist in the Statistic model
          assassinations = 0; // Default to 0 since assassinations field doesn't exist
        }
      } catch (statError) {
        console.error('[ProfileService] Error fetching statistics:', statError);
        assassinations = 0;
      }
      
      if (!userObj.Character) {
        return { ...sanitizedUser, fame, fightsLost, assassinations, isVIP: false };
      }
      
      const rest = { ...sanitizedUser };
      delete rest.Character;
      
      // Clean character data - only include the actual character fields, not Sequelize metadata
      const characterData = {
        id: userObj.Character.id,
        userId: userObj.Character.userId,
        name: userObj.Character.name || userObj.username,
        level: userObj.Character.level || 1,
        exp: userObj.Character.exp || 0,
        money: userObj.Character.money || 0,
        strength: userObj.Character.strength || 10,
        defense: userObj.Character.defense || 5,
        energy: userObj.Character.energy || 100,
        maxEnergy: userObj.Character.maxEnergy || 100,
        hp: userObj.Character.hp || 1000,
        maxHp: userObj.Character.maxHp || 1000,
        equippedHouseId: userObj.Character.equippedHouseId || null,
        gangId: userObj.Character.gangId || null,
        daysInGame: userObj.Character.daysInGame || 1,
        avatarUrl: userObj.avatarUrl || userObj.Character.avatarUrl || null,
        killCount: userObj.Character.killCount || 0,
        lastActive: userObj.Character.lastActive || new Date(),
        buffs: userObj.Character.buffs || {},
        quote: userObj.Character.quote || '',
        vipExpiresAt: userObj.Character.vipExpiresAt || null,
        attackImmunityExpiresAt: userObj.Character.attackImmunityExpiresAt || null
      };
      
      const result = {
        ...rest,
        ...characterData,
        // Prioritize character name over username for display
        displayName: characterData.name || sanitizedUser.username,
        isVIP: characterData.vipExpiresAt && new Date(characterData.vipExpiresAt) > new Date(),
        fame,
        fightsLost,
        assassinations,
      };
      
      console.log('[ProfileService] Successfully created profile for user:', username);
      return result;
      
    } catch (error) {
      console.error('[ProfileService] Error getting user profile by username:', error);
      console.error('[ProfileService] Error stack:', error.stack);
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
    const allowedUserFields = ['email', 'bio', 'avatarUrl'];
    for (const field of allowedUserFields) {
      if (updateData[field] !== undefined) user[field] = updateData[field];
    }
    await user.save();
    
    // Update Character fields
    const allowedCharacterFields = ['quote'];
    for (const field of allowedCharacterFields) {
      if (updateData[field] !== undefined) user.Character[field] = updateData[field];
    }
    await user.Character.save();
    
    return this.getUserProfile(userId);
  }

  // Search users by criteria
  static async searchUsers({ sort = 'level', limit = 50, query, ...filters } = {}) {
    // Build query options
    const queryOptions = {
      include: [{ model: Character, attributes: CHARACTER_ATTRIBUTES }],
      order: [[{ model: Character }, sort, 'DESC']],
      limit: Number(limit) || 50,
      where: {}
    };
    
    // Handle search query - search by both username and character name
    if (query && query.trim()) {
      const searchQuery = query.trim();
      queryOptions.where = {
        [Op.or]: [
          { username: { [Op.like]: `%${searchQuery}%` } },
          { '$Character.name$': { [Op.like]: `%${searchQuery}%` } }
        ]
      };
    }
    
    // Add other filters to query if needed
    for (const key in filters) {
      if (filters[key] !== undefined) {
        if (queryOptions.where[Op.or]) {
          // If we already have an OR condition, add the new filter to it
          queryOptions.where[Op.and] = [
            queryOptions.where,
            { [key]: filters[key] }
          ];
          delete queryOptions.where[Op.or];
        } else {
          queryOptions.where[key] = filters[key];
        }
      }
    }
    
    const users = await User.findAll(queryOptions);
    // Remove email and enrich character
    return Promise.all(users.map(async user => {
      const userObj = user.toJSON();
      const sanitizedUser = sanitizeUserData(userObj);
      const { fightsLost, fame } = await enrichCharacter(user.Character);
      
      if (!userObj.Character) {
        return { 
          ...sanitizedUser, 
          fame, 
          fightsLost, 
          isVIP: false 
        };
      }
      
      // Clean character data - only include the actual character fields, not Sequelize metadata
      const characterData = {
        id: userObj.Character.id,
        userId: userObj.Character.userId,
        name: userObj.Character.name,
        level: userObj.Character.level,
        exp: userObj.Character.exp,
        money: userObj.Character.money,
        strength: userObj.Character.strength,
        defense: userObj.Character.defense,
        energy: userObj.Character.energy,
        maxEnergy: userObj.Character.maxEnergy,
        hp: userObj.Character.hp,
        maxHp: userObj.Character.maxHp,
        equippedHouseId: userObj.Character.equippedHouseId,
        gangId: userObj.Character.gangId,
        daysInGame: userObj.Character.daysInGame,
        avatarUrl: userObj.avatarUrl || userObj.Character.avatarUrl,
        killCount: userObj.Character.killCount,
        lastActive: userObj.Character.lastActive,
        buffs: userObj.Character.buffs,
        quote: userObj.Character.quote,
        vipExpiresAt: userObj.Character.vipExpiresAt
      };
      
      return {
        ...sanitizedUser,
        ...characterData,
        // Prioritize character name over username for display
        displayName: characterData.name || sanitizedUser.username,
        isVIP: characterData.vipExpiresAt && new Date(characterData.vipExpiresAt) > new Date(),
        fame,
        fightsLost,
      };
    }));
  }

  // Get top players by metric
  static async getTopPlayers(metric = 'level', limit = 50) {
    const validMetrics = ['level', 'money', 'strength', 'defense', 'killCount', 'crimesCommitted'];
    if (!validMetrics.includes(metric)) {
      throw new Error('Invalid metric');
    }

    const queryOptions = {
      include: [{ model: Character, attributes: CHARACTER_ATTRIBUTES }],
      order: [[{ model: Character }, metric, 'DESC']],
      limit: Number(limit) || 50,
    };

    const users = await User.findAll(queryOptions);
    
    return Promise.all(users.map(async user => {
      const userObj = user.toJSON();
      const sanitizedUser = sanitizeUserData(userObj);
      const { fightsLost, fame } = await enrichCharacter(user.Character);
      
      if (!userObj.Character) {
        return { 
          ...sanitizedUser, 
          fame, 
          fightsLost, 
          isVIP: false 
        };
      }
      
      // Clean character data - only include the actual character fields, not Sequelize metadata
      const characterData = {
        id: userObj.Character.id,
        userId: userObj.Character.userId,
        name: userObj.Character.name,
        level: userObj.Character.level,
        exp: userObj.Character.exp,
        money: userObj.Character.money,
        strength: userObj.Character.strength,
        defense: userObj.Character.defense,
        energy: userObj.Character.energy,
        maxEnergy: userObj.Character.maxEnergy,
        hp: userObj.Character.hp,
        maxHp: userObj.Character.maxHp,
        equippedHouseId: userObj.Character.equippedHouseId,
        gangId: userObj.Character.gangId,
        daysInGame: userObj.Character.daysInGame,
        avatarUrl: userObj.avatarUrl || userObj.Character.avatarUrl,
        killCount: userObj.Character.killCount,
        lastActive: userObj.Character.lastActive,
        buffs: userObj.Character.buffs,
        quote: userObj.Character.quote,
        vipExpiresAt: userObj.Character.vipExpiresAt
      };
      
      return {
        ...sanitizedUser,
        ...characterData,
        // Prioritize character name over username for display
        displayName: characterData.name || sanitizedUser.username,
        isVIP: characterData.vipExpiresAt && new Date(characterData.vipExpiresAt) > new Date(),
        fame,
        fightsLost,
      };
    }));
  }
}