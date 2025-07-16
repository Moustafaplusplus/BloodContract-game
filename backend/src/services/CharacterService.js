import { Character, User } from '../models/index.js';
import { Statistic } from '../models/Statistic.js';

export class CharacterService {
  // EXP and leveling logic
  static ACTIONS = {
    CRIME_SUCCESS:  'CRIME_SUCCESS',
    CRIME_FAIL:     'CRIME_FAIL',
    FIGHT_WIN:      'FIGHT_WIN',
    DAILY_LOGIN:    'DAILY_LOGIN',
    TRAIN_STRENGTH: 'TRAIN_STRENGTH',
    TRAIN_DEFENSE:  'TRAIN_DEFENSE',
  };

  static EXP_RULES = {
    [this.ACTIONS.CRIME_SUCCESS]:  20,
    [this.ACTIONS.CRIME_FAIL]:      5,
    [this.ACTIONS.FIGHT_WIN]:      50,
    [this.ACTIONS.DAILY_LOGIN]:    15,
    [this.ACTIONS.TRAIN_STRENGTH]:  3,
    [this.ACTIONS.TRAIN_DEFENSE]:   3,
  };

  static expNeeded(level) {
    // Example formula: 100 * level
    return 100 * level;
  }

  static async giveReward({ character, action }, tx = null) {
    const xp = this.EXP_RULES[action] ?? 0;
    if (xp) {
      character.exp += xp;
      await this.maybeLevelUp(character);
    }
    await character.save({ transaction: tx });
    return xp;
  }

  static applyLevelBonuses(char) {
    char.maxEnergy += 2;
    char.maxHp     += 2;

    const bonus = Math.ceil(char.level / 5); // every 5 levels
    char.strength += bonus;
    char.defense  += bonus;
  }

  static async maybeLevelUp(char) {
    let needed = char.expNeeded ? char.expNeeded() : this.expNeeded(char.level);
    while (char.exp >= needed) {
      char.exp   -= needed;
      char.level += 1;

      this.applyLevelBonuses(char);

      // mini-refill
      char.energy = Math.min(char.energy + 2, char.maxEnergy);
      char.hp     = Math.min(char.hp + 2, char.maxHp);

      needed = char.expNeeded ? char.expNeeded() : this.expNeeded(char.level);
    }
  }

  static async addStat(userId, field, delta = 1) {
    let stat = await Statistic.findOne({ where: { userId } });
    if (!stat) {
      stat = await Statistic.create({ userId });
    }
    stat[field] = (stat[field] || 0) + delta;
    await stat.save();
  }
  // Helper to increment both wins and losses
  static async addFightResult(winnerId, loserId) {
    await this.addStat(winnerId, 'wins');
    await this.addStat(loserId, 'losses');
    await this.addStat(winnerId, 'fights');
    await this.addStat(loserId, 'fights');
  }

  // Training logic
  static async trainAttribute(userId, attribute) {
    const char = await Character.findOne({ where: { userId } });
    if (!char) throw new Error('Character not found');
    
    if (char.energy < 2) throw new Error('Not enough energy');
    if (!['strength', 'defense'].includes(attribute)) {
      throw new Error('Invalid attribute');
    }

    char[attribute] += 1;
    char.energy -= 2;
    await char.save();
    
    await this.giveReward({
      character: char,
      action: attribute === 'strength' ? this.ACTIONS.TRAIN_STRENGTH : this.ACTIONS.TRAIN_DEFENSE,
    });

    return char;
  }

  // Character retrieval
  static async getCharacterByUserId(userId) {
    const char = await Character.findOne({
      where: { userId },
      include: [{
        model: User,
        attributes: ['username', 'email', 'avatarUrl']
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
    }
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
    return await Statistic.findOne({ where: { userId } });
  }

  // Add methods to update lastActive, increment daysInGame, manage buffs, and increment killCount
} 