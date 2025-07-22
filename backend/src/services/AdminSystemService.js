import { Character, User, IpTracking } from '../models/index.js';
import { Statistic } from '../models/Statistic.js';
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
      blockedIps
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
      IpTracking.count({ where: { isBlocked: true } })
    ]);

    return {
      totalUsers,
      totalCharacters,
      activeUsers,
      totalMoney: totalMoney || 0,
      totalBlackcoins: totalBlackcoins || 0,
      averageLevel: Math.round(averageLevel?.dataValues?.averageLevel || 1),
      bannedUsers,
      blockedIps
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
} 