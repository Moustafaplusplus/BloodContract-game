import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { Op } from 'sequelize';
import { Fight } from '../models/Fight.js';

export class ProfileService {
  // Get user profile by ID
  static async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Character,
          attributes: ['id', 'name', 'level', 'exp', 'money', 'strength', 'defense', 'energy', 'maxEnergy', 'hp', 'maxHp', 'equippedHouseId', 'gangId', 'daysInGame', 'avatarUrl', 'killCount', 'lastActive', 'buffs', 'quote']
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Add fightsLost to character
    if (user.Character) {
      const fightsLost = await Fight.count({
        where: {
          [Op.or]: [
            { attacker_id: user.Character.userId },
            { defender_id: user.Character.userId }
          ],
          winner_id: { [Op.ne]: user.Character.userId }
        }
      });
      user.Character.setDataValue('fightsLost', fightsLost);
    }

    // Remove email from user object before returning
    const userObj = user.toJSON();
    delete userObj.email;
    return {
      ...userObj,
      isVIP: user.Character && user.Character.vipExpiresAt && new Date(user.Character.vipExpiresAt) > new Date(),
      vipExpiresAt: user.Character ? user.Character.vipExpiresAt : null,
    };
  }

  // Get user profile by username
  static async getUserProfileByUsername(username) {
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Character,
          attributes: ['id', 'name', 'level', 'exp', 'money', 'strength', 'defense', 'energy', 'maxEnergy', 'hp', 'maxHp', 'equippedHouseId', 'gangId', 'daysInGame', 'avatarUrl', 'killCount', 'lastActive', 'buffs', 'quote']
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Add fightsLost to character
    if (user.Character) {
      const fightsLost = await Fight.count({
        where: {
          [Op.or]: [
            { attacker_id: user.Character.userId },
            { defender_id: user.Character.userId }
          ],
          winner_id: { [Op.ne]: user.Character.userId }
        }
      });
      user.Character.setDataValue('fightsLost', fightsLost);
    }

    // Remove email from user object before returning
    const userObj = user.toJSON();
    delete userObj.email;
    return {
      ...userObj,
      isVIP: user.Character && user.Character.vipExpiresAt && new Date(user.Character.vipExpiresAt) > new Date(),
      vipExpiresAt: user.Character ? user.Character.vipExpiresAt : null,
    };
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

    // Update character quote if provided
    if (updateData.quote !== undefined) {
      const character = await Character.findOne({ where: { userId } });
      if (character) {
        character.quote = updateData.quote;
        await character.save();
      }
    }

    // Return updated user with character
    const updatedUser = await User.findByPk(userId, {
      include: [
        {
          model: Character,
          attributes: ['id', 'name', 'level', 'exp', 'money', 'strength', 'defense', 'energy', 'maxEnergy', 'hp', 'maxHp', 'equippedHouseId', 'gangId', 'daysInGame', 'avatarUrl', 'killCount', 'lastActive', 'buffs', 'quote']
        }
      ]
    });
    return updatedUser;
  }

  // Search users
  static async searchUsers(query, limit = 10, sort = 'username', filters = {}) {
    let where = {};
    let characterWhere = {};
    
    if (query && query.trim().length >= 2) {
      where = {
        username: {
          [Op.iLike]: `%${query.trim()}%`
        }
      };
      // Also search by character name
      characterWhere = {
        name: {
          [Op.iLike]: `%${query.trim()}%`
        }
      };
    }
    
    // TODO: Add filter support here using filters param
    // Determine if sort is a character field
    const characterFields = ['level', 'killCount', 'daysInGame', 'lastActive'];
    let order = [];
    if (characterFields.includes(sort)) {
      order = [[{ model: Character }, sort, 'DESC']];
    } else {
      order = [[sort || 'username', 'ASC']];
    }
    
    const users = await User.findAll({
      where,
      include: [
        {
          model: Character,
          where: Object.keys(characterWhere).length > 0 ? characterWhere : undefined,
          attributes: ['userId', 'name', 'level', 'exp', 'money', 'strength', 'defense', 'energy', 'maxEnergy', 'hp', 'maxHp', 'equippedHouseId', 'gangId', 'daysInGame', 'avatarUrl', 'killCount', 'lastActive', 'buffs', 'quote']
        }
      ],
      limit,
      order,
    });
    
    // If we searched by character name, we need to also find users whose characters match
    if (query && query.trim().length >= 2 && Object.keys(characterWhere).length > 0) {
      const characterUsers = await User.findAll({
        include: [
          {
            model: Character,
            where: characterWhere,
            attributes: ['id', 'name', 'level', 'exp', 'money', 'strength', 'defense', 'energy', 'maxEnergy', 'hp', 'maxHp', 'equippedHouseId', 'gangId', 'daysInGame', 'avatarUrl', 'killCount', 'lastActive', 'buffs', 'quote']
          }
        ],
        limit,
        order,
      });
      
      // Combine and deduplicate results
      const allUsers = [...users, ...characterUsers];
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      );
      
      return uniqueUsers.slice(0, limit);
    }
    
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
      health: character.hp,
      maxHealth: character.maxHp,
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
          attributes: ['id', 'name', 'level', 'strength', 'defense', 'equippedHouseId', 'gangId', 'daysInGame', 'avatarUrl', 'killCount', 'lastActive', 'buffs', 'quote']
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    let fightsLost = 0;
    if (user.Character) {
      fightsLost = await Fight.count({
        where: {
          [Op.or]: [
            { attacker_id: user.Character.userId },
            { defender_id: user.Character.userId }
          ],
          winner_id: { [Op.ne]: user.Character.userId }
        }
      });
    }

    // Remove email from user object before returning
    const userObj = user.toJSON();
    delete userObj.email;
    return {
      id: userObj.id,
      username: userObj.username,
      bio: userObj.bio,
      avatar: userObj.avatar,
      isVIP: user.Character && user.Character.vipExpiresAt && new Date(user.Character.vipExpiresAt) > new Date(),
      vipExpiresAt: user.Character ? user.Character.vipExpiresAt : null,
      character: {
        ...user.Character?.toJSON(),
        fightsLost
      }
    };
  }
} 