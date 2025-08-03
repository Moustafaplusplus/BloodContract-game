import { Task, UserTaskProgress, UserDailyTask } from '../models/Task.js';
import { PromotionService } from './PromotionService.js';
import { Character } from '../models/Character.js';
import { BankAccount } from '../models/Bank.js';
import { Statistic } from '../models/Statistic.js';
import { CharacterService } from './CharacterService.js';
import { Op } from 'sequelize';

export class TaskService {
  // Check if daily task is available for user
  static async isDailyTaskAvailable(userId) {
    const dailyTask = await UserDailyTask.findOne({ where: { userId } });
    
    if (!dailyTask) {
      // First time user, create daily task record
      await UserDailyTask.create({ userId });
      return true;
    }
    
    if (!dailyTask.lastClaimDate) {
      return true;
    }
    
    // Check if 24 hours have passed since last claim
    const now = new Date();
    const lastClaim = new Date(dailyTask.lastClaimDate);
    const hoursDiff = (now - lastClaim) / (1000 * 60 * 60);
    
    return hoursDiff >= 24;
  }

  // Calculate exp reward for daily task (1% of total required exp)
  static calculateDailyTaskExpReward(character) {
    // Calculate total exp required for next level using CharacterService
    const totalExpForNextLevel = CharacterService.calculateExpNeeded(character.level);
    return Math.floor(totalExpForNextLevel * 0.01); // 1% of required exp
  }

  // Claim daily task reward
  static async claimDailyTask(userId) {
    const character = await Character.findOne({ where: { userId } });
    if (!character) {
      throw new Error('Character not found');
    }

    const isAvailable = await this.isDailyTaskAvailable(userId);
    if (!isAvailable) {
      throw new Error('Daily task not available yet');
    }

    // Calculate rewards
    const expReward = this.calculateDailyTaskExpReward(character);
    const blackcoinReward = 1;

    // Grant rewards
    character.exp += expReward;
    character.blackcoins += blackcoinReward;
    await character.save();

    // Update daily task record
    let dailyTask = await UserDailyTask.findOne({ where: { userId } });
    if (!dailyTask) {
      dailyTask = await UserDailyTask.create({ userId });
    }
    
    dailyTask.lastClaimDate = new Date();
    dailyTask.isCompleted = true;
    await dailyTask.save();

    return {
      expReward,
      blackcoinReward,
      newStats: {
        exp: character.exp,
        blackcoins: character.blackcoins,
        level: character.level
      }
    };
  }

  // Get daily task status
  static async getDailyTaskStatus(userId) {
    const dailyTask = await UserDailyTask.findOne({ where: { userId } });
    const isAvailable = await this.isDailyTaskAvailable(userId);
    
    if (!dailyTask) {
      return {
        isAvailable: true,
        lastClaimDate: null,
        isCompleted: false
      };
    }

    return {
      isAvailable,
      lastClaimDate: dailyTask.lastClaimDate,
      isCompleted: dailyTask.isCompleted
    };
  }

  // Check and update task progress based on current character stats
  static async checkAndUpdateTaskProgress(userId) {
    const character = await Character.findOne({ where: { userId } });
    if (!character) return;

    // Get all active tasks
    const tasks = await Task.findAll({ where: { isActive: true } });
    
    for (const task of tasks) {
      let progress = await UserTaskProgress.findOne({ where: { userId, taskId: task.id } });
      if (!progress) {
        progress = await UserTaskProgress.create({ userId, taskId: task.id, progress: 0 });
      }

      // Get current value for the metric
      const currentValue = await this.getCurrentMetricValue(character, task.metric);
      
      // Update progress based on metric type
      if (this.isCumulativeMetric(task.metric)) {
        // For cumulative metrics, use the current value directly
        progress.progress = currentValue;
      } else {
        // For snapshot metrics, use the current value if it's higher than current progress
        if (currentValue > progress.progress) {
          progress.progress = currentValue;
        }
      }

      // Mark as completed if goal met
      if (!progress.isCompleted && progress.progress >= task.goal) {
        progress.isCompleted = true;
      }

      await progress.save();
    }
  }

  // Get current value for a specific metric
  static async getCurrentMetricValue(character, metric) {
    switch (metric) {
      case 'level':
        return character.level;
      case 'money':
        return character.money;
      case 'blackcoins':
        return character.blackcoins;
      case 'fame':
        return await character.getFame();
      case 'bank_balance':
        // Fetch bank balance from BankAccount model
        const bankAccount = await BankAccount.findOne({ where: { userId: character.userId } });
        return bankAccount ? bankAccount.balance : 0;
      case 'days_in_game':
        // Calculate days since character creation
        const createdAt = new Date(character.createdAt);
        const now = new Date();
        return Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
      case 'fights_won':
        // Get from Statistic model
        const statsWon = await Statistic.findOne({ where: { userId: character.userId } });
        return statsWon ? statsWon.wins : 0;
      case 'fights_lost':
        // Get from Statistic model
        const statsLost = await Statistic.findOne({ where: { userId: character.userId } });
        return statsLost ? statsLost.losses : 0;
      case 'total_fights':
        // Get from Statistic model
        const statsTotal = await Statistic.findOne({ where: { userId: character.userId } });
        return statsTotal ? statsTotal.fights : 0;
      case 'kill_count':
        return character.killCount || 0;
      case 'damage_dealt':
        // This might not be tracked, return 0 for now
        return 0;
      case 'crimes_committed':
        // Get from Statistic model
        const statsCrimes = await Statistic.findOne({ where: { userId: character.userId } });
        return statsCrimes ? statsCrimes.crimes : 0;
      case 'jobs_completed':
        // This might not be tracked, return 0 for now
        return 0;
      case 'ministry_missions_completed':
        // This might not be tracked, return 0 for now
        return 0;
      case 'money_deposited':
        // This might not be tracked, return 0 for now
        return 0;
      case 'money_withdrawn':
        // This might not be tracked, return 0 for now
        return 0;
      case 'blackmarket_items_bought':
        // This might not be tracked, return 0 for now
        return 0;
      case 'blackmarket_items_sold':
        // This might not be tracked, return 0 for now
        return 0;
      case 'gang_joined':
        // Check if character has a gang
        return character.gangId ? 1 : 0;
      case 'gang_created':
        // This might not be tracked, return 0 for now
        return 0;
      case 'gang_money_contributed':
        // This might not be tracked, return 0 for now
        return 0;
      case 'houses_owned':
        // This might not be tracked, return 0 for now
        return 0;
      case 'dogs_owned':
        // This might not be tracked, return 0 for now
        return 0;
      case 'suggestions_submitted':
        // This might not be tracked, return 0 for now
        return 0;
      default:
        return 0;
    }
  }

  // Check if a metric is cumulative (increments over time) or snapshot (current value)
  static isCumulativeMetric(metric) {
    const cumulativeMetrics = [
      'fights_won', 'fights_lost', 'total_fights', 'kill_count', 'damage_dealt',
      'crimes_committed', 'jobs_completed', 'ministry_missions_completed',
      'money_deposited', 'money_withdrawn', 'blackmarket_items_bought',
      'blackmarket_items_sold', 'gang_joined', 'gang_created', 'gang_money_contributed',
      'houses_owned', 'dogs_owned', 'suggestions_submitted'
    ];
    return cumulativeMetrics.includes(metric);
  }

  // Call this whenever a player performs a trackable action
  static async updateProgress(userId, metric, value) {
    try {
      const character = await Character.findByPk(userId);
      if (!character) {
        return { success: false, message: 'Character not found' };
      }

      // Get all active tasks for this user
      const activeTasks = await Task.findAll({
        where: {
          userId,
          isCompleted: false,
          expiresAt: { [Op.gt]: new Date() }
        }
      });

      let updatedTasks = [];

      for (const task of activeTasks) {
        if (task.metric === metric) {
          const currentValue = await this.getCurrentValue(character, metric);
          const progress = await this.calculateProgress(task, currentValue);

          if (progress.progress >= 100 && !task.isCompleted) {
            task.isCompleted = true;
            task.completedAt = new Date();
            await task.save();

            // Award rewards
            if (task.rewards) {
              if (task.rewards.money) {
                character.money += task.rewards.money;
              }
              if (task.rewards.experience) {
                character.exp += task.rewards.experience;
              }
              if (task.rewards.blackcoins) {
                character.blackcoins += task.rewards.blackcoins;
              }
            }

            await character.save();
            updatedTasks.push(task);
          }
        }
      }

      return { success: true, updatedTasks };
    } catch (error) {
      console.error(`[TaskService] Error updating progress for user ${userId}, metric ${metric}:`, error);
      return { success: false, message: 'Failed to update progress' };
    }
  }

  // Award progress points and check for promotion
  static async awardProgressPoints(userId, points) {
    if (points > 0) {
      await PromotionService.addProgressPoints(userId, points);
    }
  }
} 