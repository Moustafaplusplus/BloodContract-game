import { Character, User } from '../models/index.js';
import { Statistic } from '../models/Statistic.js';
import { TaskService } from './TaskService.js';
import { NotificationService } from './NotificationService.js';
import { emitNotification } from '../socket.js';

export class CharacterService {
  // EXP and leveling logic

  // Static method to calculate exp needed for any level (balanced progression system)
  static calculateExpNeeded(level) {
    if (level <= 20) {
      // Steep exponential scaling for early game: 200 * 1.15^(level-1)
      return Math.floor(200 * Math.pow(1.15, level - 1));
    } else if (level <= 50) {
      // Moderate exponential scaling for mid game: baseExp * 1.12^(level-20)
      const baseExp = Math.floor(200 * Math.pow(1.15, 19)); // exp needed for level 20
      return Math.floor(baseExp * Math.pow(1.12, level - 20));
    } else if (level <= 80) {
      // Steep linear scaling for late game: baseExp + (level-50) * 15000
      const baseExp = Math.floor(200 * Math.pow(1.15, 19) * Math.pow(1.12, 30)); // exp needed for level 50
      return baseExp + (level - 50) * 15000;
    } else {
      // Very steep linear scaling for end game: baseExp + (level-80) * 25000
      const baseExp = Math.floor(200 * Math.pow(1.15, 19) * Math.pow(1.12, 30)) + (30 * 15000); // exp needed for level 80
      return baseExp + (level - 80) * 25000;
    }
  }

  static async giveReward({ character, action }, tx = null) {
    let xp = 0;
    if (xp) {
      character.exp += xp;
      await this.maybeLevelUp(character);
      await TaskService.updateProgress(character.userId, 'exp', character.exp);
    }
    await character.save({ transaction: tx });
    return xp;
  }

  static applyLevelBonuses(char) {
    const oldMaxEnergy = char.maxEnergy;
    const oldMaxHp = char.maxHp;
    
    char.maxEnergy += 2;
    // Update maxHp to match the getMaxHp() calculation
    char.maxHp = char.getMaxHp();
    
    // Increase current HP and energy by the same amount as the max values
    // This ensures that if a player has 500/1000 HP and levels up to 1100 max HP,
    // they will have 600/1100 HP (not 500/1100)
    char.energy += (char.maxEnergy - oldMaxEnergy);
    char.hp += (char.maxHp - oldMaxHp);
    
    // Ensure current values don't exceed maximum values
    char.energy = Math.min(char.energy, char.maxEnergy);
    char.hp = Math.min(char.hp, char.maxHp);
    
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
    
    if (leveledUp) {
      await TaskService.updateProgress(char.userId, 'level', char.level);
      // Fame is recalculated after level up
      const fame = await char.getFame();
      await TaskService.updateProgress(char.userId, 'fame', fame);
      
      // Create level-up notification
      const levelsGained = char.level - startingLevel;
      const notification = await NotificationService.createLevelUpNotification(
        char.userId, 
        levelsGained, 
        levelUpRewards
      );
      
      // Emit notification via socket
      emitNotification(char.userId, notification);
    }
    
    return levelUpRewards;
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
    if (!lastActive || now.toDateString() !== lastActive.toDateString()) {
      char.daysInGame = (char.daysInGame || 0) + 1;
      char.lastActive = now;
      await char.save();
      await TaskService.updateProgress(char.userId, 'days_in_game', char.daysInGame);
    }
    // Fame update (snapshot)
    const fame = await char.getFame();
    await TaskService.updateProgress(char.userId, 'fame', fame);
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