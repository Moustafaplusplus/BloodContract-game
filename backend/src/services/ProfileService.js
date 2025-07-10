import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { Op } from 'sequelize';

export class ProfileService {
  // Get user profile by ID
  static async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Character,
          attributes: ['id', 'name', 'level', 'exp', 'money', 'strength', 'defense', 'energy', 'maxEnergy', 'health', 'maxHealth', 'title', 'equippedHouseId', 'gangId', 'daysInGame', 'avatarUrl', 'killCount', 'lastActive', 'buffs', 'quote']
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Get user profile by username
  static async getUserProfileByUsername(username) {
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Character,
          attributes: ['id', 'name', 'level', 'exp', 'money', 'strength', 'defense', 'energy', 'maxEnergy', 'health', 'maxHealth', 'title', 'equippedHouseId', 'gangId', 'daysInGame', 'avatarUrl', 'killCount', 'lastActive', 'buffs', 'quote']
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Update user profile
  static async updateUserProfile(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Only allow updating certain fields
    const allowedFields = ['email', 'bio', 'avatar'];
    const filteredData = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    await user.update(filteredData);
    return user;
  }

  // Search users
  static async searchUsers(query, limit = 10, sort = 'username', filters = {}) {
    let where = {};
    if (query && query.trim().length >= 2) {
      where = {
        username: {
          [Op.iLike]: `%${query.trim()}%`
        }
      };
    }
    // TODO: Add filter support here using filters param
    const users = await User.findAll({
      where,
      include: [
        {
          model: Character,
          attributes: ['id', 'name', 'level', 'exp', 'money', 'strength', 'defense', 'energy', 'maxEnergy', 'health', 'maxHealth', 'title', 'equippedHouseId', 'gangId', 'daysInGame', 'avatarUrl', 'killCount', 'lastActive', 'buffs', 'quote']
        }
      ],
      limit,
      order: [[sort || 'username', 'ASC']]
    });
    return users;
  }

  // Get top players by various metrics
  static async getTopPlayers(metric = 'level', limit = 10) {
    const allowedMetrics = ['level', 'money', 'strength', 'defense', 'exp'];
    
    if (!allowedMetrics.includes(metric)) {
      throw new Error('Invalid metric');
    }

    const characters = await Character.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'username']
        }
      ],
      order: [[metric, 'DESC']],
      limit
    });

    return characters;
  }

  // Get user statistics
  static async getUserStats(userId) {
    const character = await Character.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'createdAt']
        }
      ]
    });

    if (!character) {
      throw new Error('Character not found');
    }

    // Calculate additional stats
    const stats = {
      id: character.id,
      username: character.User.username,
      name: character.name,
      level: character.level,
      exp: character.exp,
      money: character.money,
      strength: character.strength,
      defense: character.defense,
      energy: character.energy,
      maxEnergy: character.maxEnergy,
      health: character.health,
      maxHealth: character.maxHealth,
      joinedAt: character.User.createdAt,
      // Add more calculated stats here as needed
    };

    return stats;
  }

  // Check if username is available
  static async isUsernameAvailable(username) {
    const existingUser = await User.findOne({
      where: { username }
    });

    return !existingUser;
  }

  // Get user's public info (for other users to view)
  static async getPublicUserInfo(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Character,
          attributes: ['id', 'name', 'level', 'strength', 'defense', 'title', 'equippedHouseId', 'gangId', 'daysInGame', 'avatarUrl', 'killCount', 'lastActive', 'buffs', 'quote']
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      character: user.Character
    };
  }
} 