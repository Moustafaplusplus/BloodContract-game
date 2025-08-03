import { 
  User, 
  Character, 
  IpTracking, 
  Statistic, 
  Fight, 
  Crime, 
  Car, 
  Dog, 
  BloodContract, 
  MinistryMission 
} from '../models/index.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';


export class AdminSystemService {
  // Ban/unban user
  static async toggleUserBan(userId, banned = true, reason = '') {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isBanned = banned;
    user.banReason = reason;
    user.bannedAt = banned ? new Date() : null;
    
    await user.save();

    return {
      user,
      banned,
      reason,
      bannedAt: user.bannedAt
    };
  }

  // Get user statistics
  static async getUserStats(userId) {
    const stats = await Statistic.findOne({ where: { userId } });
    return stats || {};
  }

  // Get system statistics
  static async getSystemStats() {
    const [
      totalUsers,
      totalCharacters,
      activeUsers,
      totalMoney,
      totalBlackcoins,
      averageLevel,
      bannedUsers,
      blockedIps,
      totalExperience,
      maxLevel,
      totalFights,
      totalCrimes,
      totalCars,
      totalDogs,
      totalWeapons,
      totalArmors,
      totalContracts,
      totalMissions
    ] = await Promise.all([
      User.count(),
      Character.count(),
      Character.count({
        where: {
          lastActive: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),
      Character.sum('money'),
      Character.sum('blackcoins'),
      Character.findOne({
        attributes: [[sequelize.fn('AVG', sequelize.col('level')), 'averageLevel']]
      }),
      User.count({ where: { isBanned: true } }),
      IpTracking.count({ where: { isBlocked: true } }),
      Character.sum('exp'),
      Character.max('level'),
      Fight.count(),
      Crime.count(),
      Car.count(),
      Dog.count(),
      // Note: Weapons and Armors are part of Shop model, so we'll count them separately
      Promise.resolve(0), // totalWeapons - will implement when Shop model is properly structured
      Promise.resolve(0), // totalArmors - will implement when Shop model is properly structured
      BloodContract.count(),
      MinistryMission.count()
    ]);

    return {
      totalUsers,
      totalCharacters,
      activeUsers,
      totalMoney: totalMoney || 0,
      totalBlackcoins: totalBlackcoins || 0,
      averageLevel: Math.round(averageLevel?.dataValues?.averageLevel || 1),
      bannedUsers,
      blockedIps,
      totalExperience: totalExperience || 0,
      maxLevel: maxLevel || 1,
      totalFights,
      totalCrimes,
      totalCars,
      totalDogs,
      totalWeapons,
      totalArmors,
      totalContracts,
      totalMissions
    };
  }

  // Get all IP addresses for a user
  static async getUserIps(userId) {
    const ips = await IpTracking.findAll({
      where: { userId },
      order: [['lastSeen', 'DESC']]
    });
    return ips;
  }

  // Block an IP address
  static async blockIp(ipAddress, reason = '') {
    const [ipRecord, created] = await IpTracking.findOrCreate({
      where: { ipAddress },
      defaults: {
        userId: 0, // System block
        userAgent: 'System',
        isBlocked: true,
        blockReason: reason,
        blockedAt: new Date()
      }
    });

    if (!created) {
      ipRecord.isBlocked = true;
      ipRecord.blockReason = reason;
      ipRecord.blockedAt = new Date();
      await ipRecord.save();
    }

    return {
      ipAddress,
      isBlocked: true,
      reason,
      blockedAt: ipRecord.blockedAt
    };
  }

  // Unblock an IP address
  static async unblockIp(ipAddress) {
    const ipRecord = await IpTracking.findOne({
      where: { ipAddress }
    });

    if (!ipRecord) {
      throw new Error('IP address not found');
    }

    ipRecord.isBlocked = false;
    ipRecord.blockReason = null;
    ipRecord.blockedAt = null;
    await ipRecord.save();

    return {
      ipAddress,
      isBlocked: false,
      unblockedAt: new Date()
    };
  }

  // Get all blocked IPs
  static async getBlockedIps() {
    const blockedIps = await IpTracking.findAll({
      where: { isBlocked: true },
      order: [['blockedAt', 'DESC']]
    });
    return blockedIps;
  }

  // Get IP statistics
  static async getIpStats() {
    const [
      totalIps,
      blockedIps,
      uniqueUsers
    ] = await Promise.all([
      IpTracking.count(),
      IpTracking.count({ where: { isBlocked: true } }),
      IpTracking.count({ distinct: true, col: 'userId' })
    ]);

    return {
      totalIps,
      blockedIps,
      uniqueUsers
    };
  }

  // Get all IPs used by more than one user (flagged IPs)
  static async getFlaggedIps() {
    // Find all IPs with more than one distinct userId
    const flagged = await IpTracking.findAll({
      attributes: [
        'ipAddress',
        [sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('userId'))), 'userCount']
      ],
      group: ['ipAddress'],
      having: sequelize.literal('COUNT(DISTINCT "userId") > 1'),
      raw: true
    });

    // For each flagged IP, get the associated users and their characters
    const results = await Promise.all(flagged.map(async (row) => {
      const ipAddress = row.ipAddress;
      // Find all userIds for this IP
      const ipRecords = await IpTracking.findAll({ where: { ipAddress }, attributes: ['userId'], raw: true });
      const userIds = [...new Set(ipRecords.map(r => r.userId))];
      // Fetch users
      const users = await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'username', 'email', 'isBanned', 'lastIpAddress'],
        raw: true
      });
      // Fetch characters
      const characters = await Character.findAll({
        where: { userId: userIds },
        attributes: ['id', 'userId', 'name', 'level', 'avatarUrl'],
        raw: true
      });
      // Attach characters to users
      const usersWithCharacters = users.map(user => ({
        ...user,
        characters: characters.filter(c => c.userId === user.id)
      }));
      return {
        ipAddress,
        userCount: parseInt(row.userCount, 10),
        users: usersWithCharacters
      };
    }));
    return results;
  }

  // Generate login token for any user (admin feature)
  static async generateUserLoginToken(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user's character
    const character = await Character.findOne({ where: { userId } });
    if (!character) {
      throw new Error('User has no character');
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      },
      character: {
        id: character.id,
        name: character.name,
        level: character.level
      }
    };
  }

  // Get user's inventory (admin feature)
  static async getUserInventory(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user's character
    const character = await Character.findOne({ where: { userId } });
    if (!character) {
      throw new Error('User has no character');
    }

    // Import models
    const { InventoryItem } = await import('../models/Inventory.js');
    const { Weapon, Armor } = await import('../models/Shop.js');
    const { SpecialItem } = await import('../models/SpecialItem.js');
    const { House } = await import('../models/House.js');
    const { Car } = await import('../models/Car.js');
    const { Dog } = await import('../models/Dog.js');

    // Get all inventory items
    const inventoryItems = await InventoryItem.findAll({
      where: { userId }
    });

    // Get equipped items from character
    const equippedItems = {
      weapon1: character.equippedWeapon1Id,
      weapon2: character.equippedWeapon2Id,
      armor: character.equippedArmorId,
      house: character.equippedHouseId
    };

    // Fetch related items based on itemType
    const formattedInventory = [];
    
    for (const item of inventoryItems) {
      let itemData = null;
      let itemType = item.itemType;

      try {
        switch (itemType) {
          case 'weapon':
            itemData = await Weapon.findByPk(item.itemId);
            break;
          case 'armor':
            itemData = await Armor.findByPk(item.itemId);
            break;
          case 'special':
            itemData = await SpecialItem.findByPk(item.itemId);
            break;
          case 'house':
            itemData = await House.findByPk(item.itemId);
            break;
          case 'car':
            itemData = await Car.findByPk(item.itemId);
            break;
          case 'dog':
            itemData = await Dog.findByPk(item.itemId);
            break;
        }

        if (!itemData) continue;

        // Check if item is equipped
        const isEquipped = 
          (itemType === 'weapon' && (equippedItems.weapon1 === itemData.id || equippedItems.weapon2 === itemData.id)) ||
          (itemType === 'armor' && equippedItems.armor === itemData.id) ||
          (itemType === 'house' && equippedItems.house === itemData.id);

        formattedInventory.push({
          id: item.id,
          itemId: itemData.id,
          name: itemData.name,
          type: itemType,
          quantity: item.quantity,
          isEquipped,
          rarity: itemData.rarity || 'common',
          imageUrl: itemData.imageUrl,
          // Add specific stats based on type
          ...(itemType === 'weapon' && { damage: itemData.damage, energyBonus: itemData.energyBonus }),
          ...(itemType === 'armor' && { def: itemData.def, hpBonus: itemData.hpBonus }),
          ...(itemType === 'house' && { hpBonus: itemData.hpBonus, defenseBonus: itemData.defenseBonus }),
          ...(itemType === 'car' && { speed: itemData.speed }),
          ...(itemType === 'dog' && { powerBonus: itemData.powerBonus }),
          ...(itemType === 'special' && { effect: itemData.effect })
        });
      } catch (error) {
        console.error(`Error fetching ${itemType} with id ${item.itemId}:`, error);
        continue;
      }
    }

    return {
      userId: user.id,
      username: user.username,
      characterName: character.name,
      inventory: formattedInventory,
      totalItems: formattedInventory.length,
      equippedItems: Object.values(equippedItems).filter(Boolean).length
    };
  }
} 