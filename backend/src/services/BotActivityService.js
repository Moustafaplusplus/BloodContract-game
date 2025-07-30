import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { Statistic } from '../models/Statistic.js';
import { Op } from 'sequelize';
import { sequelize } from '../config/db.js';

class BotActivityService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
  }

  // Start the bot activity simulation
  start() {
    if (this.isRunning) {
      console.log('🤖 Bot activity service is already running');
      return;
    }

    console.log('🤖 Starting bot activity simulation...');
    this.isRunning = true;

    // Run bot activity every 5 minutes
    this.interval = setInterval(async () => {
      try {
        await this.simulateBotActivity();
      } catch (error) {
        console.error('❌ Error in bot activity simulation:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Run initial activity
    this.simulateBotActivity();
  }

  // Stop the bot activity simulation
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('🤖 Bot activity service stopped');
  }

  // Simulate bot activity
  async simulateBotActivity() {
    try {
      console.log('🤖 Simulating bot activity...');

      // Get all bot users (users with bot email pattern)
      const botUsers = await User.findAll({
        where: {
          email: {
            [Op.like]: 'bot_%@bot.com'
          }
        },
        include: [Character]
      });

      console.log(`🤖 Found ${botUsers.length} bots to update`);

      // Select 2-5 bots to appear online
      const minBots = 2;
      const maxBots = 5;
      const botsToUpdate = Math.floor(Math.random() * (maxBots - minBots + 1)) + minBots;
      
      // Randomly select bots
      const shuffledBots = botUsers.sort(() => 0.5 - Math.random());
      const selectedBots = shuffledBots.slice(0, botsToUpdate);

      console.log(`🤖 Updating ${selectedBots.length} bots (${(selectedBots.length / botUsers.length * 100).toFixed(1)}%)`);

      // Update selected bots
      for (const botUser of selectedBots) {
        await this.updateBotActivity(botUser);
      }

      console.log(`✅ Updated ${selectedBots.length} bots successfully`);

    } catch (error) {
      console.error('❌ Error simulating bot activity:', error);
    }
  }

  // Update individual bot activity
  async updateBotActivity(botUser) {
    try {
      const character = botUser.Character;
      if (!character) return;

      // Random stat changes (small increments)
      const statChanges = {
        strength: Math.floor(Math.random() * 3) - 1, // -1 to +1
        defense: Math.floor(Math.random() * 3) - 1,
        money: Math.floor(Math.random() * 100) - 50, // -50 to +50
        blackcoins: Math.floor(Math.random() * 5) - 2, // -2 to +2
        energy: Math.floor(Math.random() * 20) - 10, // -10 to +10
        hp: Math.floor(Math.random() * 50) - 25, // -25 to +25
        killCount: Math.floor(Math.random() * 2), // 0 or 1
        exp: Math.floor(Math.random() * 50) - 25 // -25 to +25
      };

      // Apply stat changes
      const updatedStats = {
        strength: Math.max(10, character.strength + statChanges.strength),
        defense: Math.max(5, character.defense + statChanges.defense),
        money: Math.max(0, character.money + statChanges.money),
        blackcoins: Math.max(0, character.blackcoins + statChanges.blackcoins),
        energy: Math.max(0, Math.min(character.maxEnergy, character.energy + statChanges.energy)),
        hp: Math.max(1, Math.min(character.maxHp, character.hp + statChanges.hp)),
        killCount: character.killCount + statChanges.killCount,
        exp: Math.max(0, character.exp + statChanges.exp),
        lastActive: new Date()
      };

      // Update character
      await character.update(updatedStats);

      // Update statistics if they exist
      const stats = await Statistic.findOne({ where: { userId: botUser.id } });
      if (stats) {
        const statUpdates = {
          wins: stats.wins + Math.floor(Math.random() * 2),
          losses: stats.losses + Math.floor(Math.random() * 2),
          crimes: stats.crimes + Math.floor(Math.random() * 1),
          moneyEarned: stats.moneyEarned + Math.max(0, statChanges.money),
          moneySpent: stats.moneySpent + Math.max(0, -statChanges.money),
          totalDamage: stats.totalDamage + Math.floor(Math.random() * 100),
          totalDamageTaken: stats.totalDamageTaken + Math.floor(Math.random() * 80)
        };

        await stats.update(statUpdates);
      }

    } catch (error) {
      console.error(`❌ Error updating bot ${botUser.username}:`, error);
    }
  }

  // Get bot statistics
  async getBotStats() {
    try {
      const botUsers = await User.findAll({
        where: {
          email: {
            [Op.like]: 'bot_%@bot.com'
          }
        },
        include: [Character]
      });

      const totalBots = botUsers.length;
      const onlineBots = botUsers.filter(user => {
        const lastActive = user.Character?.lastActive;
        if (!lastActive) return false;
        
        // Consider online if active in last 30 minutes
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        return lastActive > thirtyMinutesAgo;
      }).length;

      const vipBots = botUsers.filter(user => {
        const vipExpiresAt = user.Character?.vipExpiresAt;
        return vipExpiresAt && new Date(vipExpiresAt) > new Date();
      }).length;

      const totalMoney = botUsers.reduce((sum, user) => {
        return sum + (user.Character?.money || 0);
      }, 0);

      const avgLevel = botUsers.reduce((sum, user) => {
        return sum + (user.Character?.level || 1);
      }, 0) / totalBots;

      return {
        totalBots,
        onlineBots,
        onlinePercentage: (onlineBots / totalBots * 100).toFixed(1),
        vipBots,
        vipPercentage: (vipBots / totalBots * 100).toFixed(1),
        totalMoney,
        avgMoney: Math.floor(totalMoney / totalBots),
        avgLevel: avgLevel.toFixed(1)
      };

    } catch (error) {
      console.error('❌ Error getting bot stats:', error);
      return null;
    }
  }

  // Get random online bots for targeting
  async getRandomOnlineBots(limit = 10) {
    try {
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
        limit: limit,
        order: [['id', 'DESC']]
      });

      return onlineBots;

    } catch (error) {
      console.error('❌ Error getting random online bots:', error);
      return [];
    }
  }

  // Get bots by level range for targeting
  async getBotsByLevelRange(minLevel, maxLevel, limit = 20) {
    try {
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
        limit: limit,
        order: [['id', 'DESC']]
      });

      return bots;

    } catch (error) {
      console.error('❌ Error getting bots by level range:', error);
      return [];
    }
  }
}

// Create singleton instance
const botActivityService = new BotActivityService();

export default botActivityService; 