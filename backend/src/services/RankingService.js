import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { Statistic } from '../models/Statistic.js';
import { Op } from 'sequelize';

const CHARACTER_ATTRIBUTES = [
  'id', 'userId', 'name', 'level', 'exp', 'money', 'strength', 'defense', 'energy', 'maxEnergy', 'hp', 'maxHp',
  'equippedHouseId', 'gangId', 'daysInGame', 'avatarUrl', 'killCount', 'lastActive', 'buffs', 'quote', 'vipExpiresAt'
];

export class RankingService {
  // Get top ranked users by a given stat (default: fame)
  static async getTopRanked({ sort = 'fame', limit = 50 } = {}) {
    let users;
    // Fame: compute and sort in JS
    if (sort === 'fame') {
      users = await User.findAll({
        include: [{ model: Character, attributes: CHARACTER_ATTRIBUTES }],
        limit: 200,
      });
      const enriched = await Promise.all(users.map(async user => {
        const userObj = user.toJSON();
        if (!userObj.Character) return null;
        const char = userObj.Character;
        const fame = typeof user.Character.getFame === 'function' ? await user.Character.getFame() : 0;
        return {
          userId: user.id,
          username: user.username,
          name: char.name,
          level: char.level,
          criteria: fame,
        };
      }));
      return enriched
        .filter(Boolean)
        .sort((a, b) => b.criteria - a.criteria)
        .slice(0, Number(limit) || 50)
        .map((item, idx) => ({ 
          ranking: idx + 1, 
          userId: item.userId,
          username: item.username,
          name: item.name,
          level: item.level,
          criteria: item.criteria 
        }));
    }
    // Kills
    if (sort === 'killCount') {
      users = await User.findAll({
        include: [{ model: Character, attributes: CHARACTER_ATTRIBUTES }],
        order: [[{ model: Character }, 'killCount', 'DESC']],
        limit: Number(limit) || 50,
      });
      return users
        .filter(user => user.Character)
        .map((user, idx) => ({
          ranking: idx + 1,
          userId: user.id,
          username: user.username,
          name: user.Character.name,
          level: user.Character.level,
          criteria: user.Character.killCount ?? 0,
        }));
    }
    // Level
    if (sort === 'level') {
      users = await User.findAll({
        include: [{ model: Character, attributes: CHARACTER_ATTRIBUTES }],
        order: [[{ model: Character }, 'level', 'DESC']],
        limit: Number(limit) || 50,
      });
      return users
        .filter(user => user.Character)
        .map((user, idx) => ({
          ranking: idx + 1,
          userId: user.id,
          username: user.username,
          name: user.Character.name,
          level: user.Character.level,
          criteria: user.Character.level ?? 0,
        }));
    }
    // Money
    if (sort === 'money') {
      users = await User.findAll({
        include: [{ model: Character, attributes: CHARACTER_ATTRIBUTES }],
        order: [[{ model: Character }, 'money', 'DESC']],
        limit: Number(limit) || 50,
      });
      return users
        .filter(user => user.Character)
        .map((user, idx) => ({
          ranking: idx + 1,
          userId: user.id,
          username: user.username,
          name: user.Character.name,
          level: user.Character.level,
          criteria: user.Character.money ?? 0,
        }));
    }
    // Crimes
    if (sort === 'crimesCommitted') {
      users = await User.findAll({
        include: [
          { 
            model: Character, 
            attributes: CHARACTER_ATTRIBUTES,
            include: [{ model: Statistic, attributes: ['crimes'] }]
          }
        ],
        limit: 200,
      });
      // Get crimesCommitted from stats
      const enriched = users.map(user => {
        const userObj = user.toJSON();
        if (!userObj.Character) return null;
        const char = userObj.Character;
        const crimes = char.Statistic?.crimes ?? 0;
        return {
          userId: user.id,
          username: user.username,
          name: char.name,
          level: char.level,
          criteria: crimes,
        };
      });
      return enriched
        .filter(Boolean)
        .sort((a, b) => b.criteria - a.criteria)
        .slice(0, Number(limit) || 50)
        .map((item, idx) => ({ 
          ranking: idx + 1, 
          userId: item.userId,
          username: item.username,
          name: item.name,
          level: item.level,
          criteria: item.criteria 
        }));
    }
    // Default fallback
    return [];
  }
}
