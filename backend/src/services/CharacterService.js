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
    let needed = char.expNeeded();
    while (char.exp >= needed) {
      char.exp   -= needed;
      char.level += 1;

      this.applyLevelBonuses(char);

      // mini-refill
      char.energy = Math.min(char.energy + 2, char.maxEnergy);
      char.hp     = Math.min(char.hp + 2, char.maxHp);

      needed = char.expNeeded();
    }
  }

  static async addStat(userId, field, delta = 1) {
    await Statistic.updateOne({ userId }, { $inc: { [field]: delta } }, { upsert: true });
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
    return await Character.findOne({ 
      where: { userId },
      include: [{ model: User, attributes: ['username', 'nickname', 'email', 'avatarUrl'] }]
    });
  }

  static async getCharacterStats(userId) {
    return await Statistic.findOne({ userId }).lean();
  }

  // Add methods to update lastActive, increment daysInGame, manage buffs, and increment killCount
} 