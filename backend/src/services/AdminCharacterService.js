import { Character, User } from '../models/index.js';
import { Op } from 'sequelize';

export class AdminCharacterService {
  // Get all characters with user info
  static async getAllCharacters(page = 1, limit = 20, search = '') {
    const offset = (page - 1) * limit;
    
    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { '$User.username$': { [Op.like]: `%${search}%` } },
        { '$User.email$': { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const { count, rows } = await Character.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'isAdmin', 'avatarUrl', 'isBanned', 'banReason', 'lastIpAddress']
      }],
      order: [['level', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      characters: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  // Get character by ID with full details
  static async getCharacterById(characterId) {
    const character = await Character.findByPk(characterId, {
      include: [{
        model: User,
        attributes: ['username', 'email', 'isAdmin', 'avatarUrl', 'age', 'gender', 'bio']
      }]
    });

    if (!character) {
      throw new Error('Character not found');
    }

    return character;
  }

  // Update character stats
  static async updateCharacter(characterId, updates) {
    const character = await Character.findByPk(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Validate updates
    const allowedFields = [
      'name', 'level', 'exp', 'money', 'blackcoins', 'strength', 'defense',
      'maxEnergy', 'energy', 'maxHp', 'hp', 'equippedWeapon1Id', 'equippedWeapon2Id',
      'equippedArmorId', 'equippedHouseId', 'gangId', 'killCount', 'quote',
      'vipExpiresAt', 'buffs'
    ];

    const validUpdates = {};
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        validUpdates[key] = value;
      }
    }

    await character.update(validUpdates);
    return character;
  }

  // Add/remove money from character
  static async adjustMoney(characterId, amount) {
    const character = await Character.findByPk(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const newMoney = character.money + amount;
    if (newMoney < 0) {
      throw new Error('Cannot reduce money below 0');
    }

    character.money = newMoney;
    await character.save();

    return {
      character,
      adjustment: amount,
      newBalance: newMoney
    };
  }

  // Add/remove blackcoins from character
  static async adjustBlackcoins(characterId, amount) {
    const character = await Character.findByPk(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const newBlackcoins = character.blackcoins + amount;
    if (newBlackcoins < 0) {
      throw new Error('Cannot reduce blackcoins below 0');
    }

    character.blackcoins = newBlackcoins;
    await character.save();

    return {
      character,
      adjustment: amount,
      newBalance: newBlackcoins
    };
  }

  // Set character level and adjust stats accordingly
  static async setCharacterLevel(characterId, newLevel) {
    const character = await Character.findByPk(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    if (newLevel < 1) {
      throw new Error('Level cannot be less than 1');
    }

    const oldLevel = character.level;
    character.level = newLevel;
    
    // Reset exp to 0 for the new level
    character.exp = 0;
    
    // Recalculate stats based on new level
    // Base stats: 10 strength, 5 defense at level 1
    character.strength = 10 + ((newLevel - 1) * 2);
    character.defense = 5 + (newLevel - 1);
    
    // Add bonus stats for every 5 levels
    const level5Bonus = Math.floor((newLevel - 1) / 5);
    character.strength += level5Bonus * 10;
    character.defense += level5Bonus * 5;
    
    // Update max energy and HP
    character.maxEnergy = 100 + ((newLevel - 1) * 2);
    character.maxHp = 1000 + ((newLevel - 1) * 100);
    
    // Ensure current energy and HP don't exceed new maximums
    if (character.energy > character.maxEnergy) {
      character.energy = character.maxEnergy;
    }
    if (character.hp > character.maxHp) {
      character.hp = character.maxHp;
    }

    await character.save();

    return {
      character,
      oldLevel,
      newLevel,
      levelDifference: newLevel - oldLevel
    };
  }

  // Reset character (dangerous operation)
  static async resetCharacter(characterId, confirmPassword) {
    const character = await Character.findByPk(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Reset to default values
    character.level = 1;
    character.exp = 0;
    character.money = 1500;
    character.blackcoins = 0;
    character.strength = 10;
    character.defense = 5;
    character.maxEnergy = 100;
    character.energy = 100;
    character.maxHp = 1000;
    character.hp = 1000;
    character.equippedWeapon1Id = null;
    character.equippedWeapon2Id = null;
    character.equippedArmorId = null;
    character.equippedHouseId = null;
    character.gangId = null;
    character.killCount = 0;
    character.daysInGame = 0;
    character.buffs = {};
    character.quote = null;
    character.vipExpiresAt = null;

    await character.save();

    return {
      character,
      resetAt: new Date()
    };
  }
} 