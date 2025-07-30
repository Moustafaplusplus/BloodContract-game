import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { Statistic } from '../models/Statistic.js';
import botActivityService from '../services/BotActivityService.js';
import { Op } from 'sequelize';

class BotController {
  // Get bot statistics
  async getBotStats(req, res) {
    try {
      const stats = await botActivityService.getBotStats();
      
      if (!stats) {
        return res.status(500).json({ error: 'Failed to get bot statistics' });
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting bot stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all bots with pagination
  async getAllBots(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page - 1) * limit;

      const { count, rows: bots } = await User.findAndCountAll({
        where: {
          email: {
            [Op.like]: 'bot_%@bot.com'
          }
        },
        include: [Character],
        limit,
        offset,
        order: [['id', 'DESC']]
      });

      const totalPages = Math.ceil(count / limit);

      res.json({
        success: true,
        data: {
          bots,
          pagination: {
            page,
            limit,
            total: count,
            totalPages
          }
        }
      });
    } catch (error) {
      console.error('Error getting all bots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get online bots
  async getOnlineBots(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      const onlineBots = await User.findAll({
        where: {
          email: {
            [Op.like]: 'bot_%@bot.com'
          }
        },
        include: [{
          model: Character,
          where: {
            lastActive: {
              [Op.gt]: thirtyMinutesAgo
            }
          }
        }],
        limit,
        order: [['id', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          bots: onlineBots,
          count: onlineBots.length
        }
      });
    } catch (error) {
      console.error('Error getting online bots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get bots by level range
  async getBotsByLevel(req, res) {
    try {
      const minLevel = parseInt(req.query.minLevel) || 1;
      const maxLevel = parseInt(req.query.maxLevel) || 50;
      const limit = parseInt(req.query.limit) || 20;

      const bots = await User.findAll({
        where: {
          email: {
            [Op.like]: 'bot_%@bot.com'
          }
        },
        include: [{
          model: Character,
          where: {
            level: {
              [Op.between]: [minLevel, maxLevel]
            }
          }
        }],
        limit,
        order: [['id', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          bots,
          count: bots.length,
          levelRange: { minLevel, maxLevel }
        }
      });
    } catch (error) {
      console.error('Error getting bots by level:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Start bot activity service
  async startBotActivity(req, res) {
    try {
      botActivityService.start();
      
      res.json({
        success: true,
        message: 'Bot activity service started successfully'
      });
    } catch (error) {
      console.error('Error starting bot activity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Stop bot activity service
  async stopBotActivity(req, res) {
    try {
      botActivityService.stop();
      
      res.json({
        success: true,
        message: 'Bot activity service stopped successfully'
      });
    } catch (error) {
      console.error('Error stopping bot activity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get bot activity service status
  async getBotActivityStatus(req, res) {
    try {
      const isRunning = botActivityService.isRunning;
      
      res.json({
        success: true,
        data: {
          isRunning,
          status: isRunning ? 'Active' : 'Stopped'
        }
      });
    } catch (error) {
      console.error('Error getting bot activity status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete all bots
  async deleteAllBots(req, res) {
    try {
      const botCount = await User.count({
        where: {
          email: {
            [Op.like]: 'bot_%@bot.com'
          }
        }
      });

      await User.destroy({
        where: {
          email: {
            [Op.like]: 'bot_%@bot.com'
          }
        }
      });

      res.json({
        success: true,
        message: `Deleted ${botCount} bots successfully`
      });
    } catch (error) {
      console.error('Error deleting all bots:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update bot activity manually
  async updateBotActivity(req, res) {
    try {
      await botActivityService.simulateBotActivity();
      
      res.json({
        success: true,
        message: 'Bot activity updated successfully'
      });
    } catch (error) {
      console.error('Error updating bot activity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get bot targeting suggestions for contracts
  async getBotTargets(req, res) {
    try {
      const level = parseInt(req.query.level) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      // Get bots within ±5 levels of the player
      const minLevel = Math.max(1, level - 5);
      const maxLevel = level + 5;

      const targets = await User.findAll({
        where: {
          email: {
            [Op.like]: 'bot_%@bot.com'
          }
        },
        include: [{
          model: Character,
          where: {
            level: {
              [Op.between]: [minLevel, maxLevel]
            },
            money: {
              [Op.gte]: 1000 // Only bots with money
            }
          }
        }],
        limit,
        order: [['id', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          targets,
          count: targets.length,
          levelRange: { minLevel, maxLevel }
        }
      });
    } catch (error) {
      console.error('Error getting bot targets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update bot statistics manually
  async updateBotStats(req, res) {
    try {
      const { vipPercentage, avgMoney, avgLevel, onlinePercentage } = req.body;
      
      // Validate input
      if (vipPercentage < 0 || vipPercentage > 100) {
        return res.status(400).json({
          success: false,
          message: 'VIP percentage must be between 0 and 100'
        });
      }
      
      if (avgMoney < 0) {
        return res.status(400).json({
          success: false,
          message: 'Average money cannot be negative'
        });
      }
      
      if (avgLevel < 1 || avgLevel > 100) {
        return res.status(400).json({
          success: false,
          message: 'Average level must be between 1 and 100'
        });
      }
      
      if (onlinePercentage < 0 || onlinePercentage > 100) {
        return res.status(400).json({
          success: false,
          message: 'Online percentage must be between 0 and 100'
        });
      }

      // Get all bots
      const bots = await User.findAll({
        where: {
          email: {
            [Op.like]: 'bot_%@bot.com'
          }
        },
        include: [Character]
      });

      let updatedCount = 0;
      
      for (const bot of bots) {
        const character = bot.Character;
        if (!character) continue;

        // Update VIP status based on percentage
        const shouldBeVip = Math.random() * 100 < vipPercentage;
        if (shouldBeVip && !character.vipExpiresAt) {
          character.vipExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        } else if (!shouldBeVip && character.vipExpiresAt) {
          character.vipExpiresAt = null;
        }

        // Update money based on average
        const moneyVariation = (Math.random() - 0.5) * 0.4; // ±20% variation
        character.money = Math.max(0, Math.floor(avgMoney * (1 + moneyVariation)));

        // Update level based on average
        const levelVariation = (Math.random() - 0.5) * 0.3; // ±15% variation
        character.level = Math.max(1, Math.min(100, Math.floor(avgLevel * (1 + levelVariation))));

        // Update online status based on percentage
        const shouldBeOnline = Math.random() * 100 < onlinePercentage;
        if (shouldBeOnline) {
          character.lastActive = new Date();
        }

        await character.save();
        updatedCount++;
      }

      res.json({
        success: true,
        data: {
          message: `Updated ${updatedCount} bots`,
          updatedCount,
          stats: {
            vipPercentage,
            avgMoney,
            avgLevel,
            onlinePercentage
          }
        }
      });
    } catch (error) {
      console.error('Error updating bot stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating bot statistics'
      });
    }
  }
}

export default new BotController(); 