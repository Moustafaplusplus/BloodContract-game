import { Character, User } from '../models/index.js';
import { Statistic } from '../models/Statistic.js';
import { TaskService } from './TaskService.js';

export class CharacterService {
  // EXP and leveling logic
  static ACTIONS = {
    DAILY_LOGIN:    'DAILY_LOGIN',
  };

  static EXP_RULES = {
    [this.ACTIONS.DAILY_LOGIN]:    15,
  };

  // Static method to calculate exp needed for any level (exponential/linear system)
  static calculateExpNeeded(level) {
    if (level <= 50) {
      // Exponential scaling up to level 50: 100 * 1.1^(level-1)
      return Math.floor(100 * Math.pow(1.1, level - 1));
    } else {
      // Linear scaling after level 50: base + (level - 50) * increment
      const baseExp = Math.floor(100 * Math.pow(1.1, 49)); // exp needed for level 50
      const increment = 5000; // 5000 exp per level after 50
      return baseExp + (level - 50) * increment;
    }
  }

  static async giveReward({ character, action }, tx = null) {
    let xp;
    if (action === this.ACTIONS.DAILY_LOGIN) {
      // 3% of current level's required EXP
      const neededExp = character.expNeeded();
      xp = Math.ceil(neededExp * 0.03);
    } else {
      xp = this.EXP_RULES[action] ?? 0;
    }
    if (xp) {
      character.exp += xp;
      await this.maybeLevelUp(character);
      await TaskService.updateProgress(character.userId, 'exp', character.exp);
    }
    await character.save({ transaction: tx });
    return xp;
  }

  static applyLevelBonuses(char) {
    char.maxEnergy += 2;
    // Max HP is handled by the getMaxHp() method in Character model (1000 + level * 100)
    
    // Every level: +2 Strength, +1 Defense
    char.strength += 2;
    char.defense  += 1;
    
    // Every 5 levels: additional +10 Strength, +5 Defense
    if (char.level % 5 === 0) {
      char.strength += 10;
      char.defense  += 5;
    }
  }

  static async maybeLevelUp(char) {
    let needed = char.expNeeded();
    const levelUpRewards = [];
    const startingLevel = char.level;
    let leveledUp = false;
    
    while (char.exp >= needed) {
      char.exp   -= needed;
      char.level += 1;
      leveledUp = true;

      // Calculate rewards for this level
      const levelReward = this.calculateLevelRewards(char.level);
      levelUpRewards.push(levelReward);

      this.applyLevelBonuses(char);

      needed = char.expNeeded();
    }
    
    // Attach level-up info to character for frontend
    if (levelUpRewards.length > 0) {
      char._levelUpRewards = levelUpRewards;
      char._levelsGained = char.level - startingLevel;
    }
    if (leveledUp) {
      await TaskService.updateProgress(char.userId, 'level', char.level);
      // Fame is recalculated after level up
      const fame = await char.getFame();
      await TaskService.updateProgress(char.userId, 'fame', fame);
    }
    
    return levelUpRewards;
  }

  // Clear level-up rewards after they've been sent to frontend
  static clearLevelUpRewards(char) {
    char._levelUpRewards = null;
    char._levelsGained = 0;
  }

  static calculateLevelRewards(level) {
    const rewards = {
      level,
      maxEnergy: 2,
      maxHp: 100, // From getMaxHp() method: 1000 + ((level - 1) * 100)
      strength: 2,
      defense: 1,
      milestoneBonus: false
    };
    
    // Every 5 levels: additional +10 Strength, +5 Defense
    if (level % 5 === 0) {
      rewards.strength += 10;
      rewards.defense += 5;
      rewards.milestoneBonus = true;
    }
    
    return rewards;
  }

  static async addStat(userId, field, delta = 1, transaction = null) {
    let stat = await Statistic.findOne({ where: { userId }, transaction });
    if (!stat) {
      stat = await Statistic.create({ userId }, { transaction });
    }
    stat[field] = (stat[field] || 0) + delta;
    await stat.save({ transaction });
  }
  // Helper to increment both wins and losses
  static async addFightResult(winnerId, loserId, transaction = null) {
    await this.addStat(winnerId, 'wins', 1, transaction);
    await this.addStat(loserId, 'losses', 1, transaction);
    await this.addStat(winnerId, 'fights', 1, transaction);
    await this.addStat(loserId, 'fights', 1, transaction);
  }

  // Character retrieval
  static async getCharacterByUserId(userId) {
    const char = await Character.findOne({
      where: { userId },
      include: [{
        model: User,
        attributes: ['username', 'email', 'avatarUrl', 'isAdmin', 'age', 'gender', 'bio']
      }]
    });
    if (!char) return null;
    // Increment daysInGame if lastActive is from a previous day
    const now = new Date();
    const lastActive = char.lastActive ? new Date(char.lastActive) : null;
    let dailyLoginReward = 0;
    let gaveDailyLogin = false;
    if (!lastActive || now.toDateString() !== lastActive.toDateString()) {
      char.daysInGame = (char.daysInGame || 0) + 1;
      char.lastActive = now;
      // Give daily login reward and capture the amount
      dailyLoginReward = await this.giveReward({ character: char, action: this.ACTIONS.DAILY_LOGIN });
      gaveDailyLogin = true;
      await char.save();
      await TaskService.updateProgress(char.userId, 'days_in_game', char.daysInGame);
    }
    // Fame update (snapshot)
    const fame = await char.getFame();
    await TaskService.updateProgress(char.userId, 'fame', fame);
    // Attach reward info for frontend
    char._dailyLoginReward = dailyLoginReward;
    char._gaveDailyLogin = gaveDailyLogin;
    return char;
  }

  static async getCharacterByUsername(username) {
    return await Character.findOne({
      include: [{
        model: User,
        where: { username },
        attributes: ['username', 'email', 'avatarUrl']
      }]
    });
  }

  static async getCharacterStats(userId) {
    const stat = await Statistic.findOne({ where: { userId } });
    return stat ? stat.toJSON() : {};
  }

  // Add methods to update lastActive, increment daysInGame, manage buffs, and increment killCount
  static async updateMoney(userId, newMoney) {
    await TaskService.updateProgress(userId, 'money', newMoney);
  }
  static async updateBlackcoins(userId, newBlackcoins) {
    await TaskService.updateProgress(userId, 'blackcoins', newBlackcoins);
  }
} 