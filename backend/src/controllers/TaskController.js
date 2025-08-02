import { Task, UserTaskProgress } from '../models/Task.js';
import { Character } from '../models/Character.js';
import { Op } from 'sequelize';
import { CharacterService } from '../services/CharacterService.js';
import { TaskService } from '../services/TaskService.js';
import { PromotionService } from '../services/PromotionService.js';
import { io } from '../socket.js';

export class TaskController {
  // Admin: Create a new task
  static async createTask(req, res) {
    try {
      const task = await Task.create(req.body);
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Admin: Update a task
  static async updateTask(req, res) {
    try {
      const { id } = req.params;
      const task = await Task.findByPk(id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      await task.update(req.body);
      res.json(task);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Admin: Delete a task
  static async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const task = await Task.findByPk(id);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      await task.destroy();
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Admin: List all tasks
  static async listTasks(req, res) {
    const tasks = await Task.findAll();
    res.json(tasks);
  }

  // Player: List all active tasks and progress
  static async listPlayerTasks(req, res) {
    const userId = req.user.id;
    
    // First, check and update task progress based on current character stats
    await TaskService.checkAndUpdateTaskProgress(userId);
    
    const tasks = await Task.findAll({ where: { isActive: true } });
    const progresses = await UserTaskProgress.findAll({ where: { userId } });
    const progressMap = {};
    progresses.forEach(p => { progressMap[p.taskId] = p; });
    const result = tasks.map(task => ({
      ...task.toJSON(),
      progress: progressMap[task.id]?.progress || 0,
      isCompleted: progressMap[task.id]?.isCompleted || false,
      rewardCollected: progressMap[task.id]?.rewardCollected || false,
    }));
    res.json(result);
  }

  // Player: Collect reward for a completed task
  static async collectTaskReward(req, res) {
    const userId = req.user.id;
    const { taskId } = req.body;
    
    const progress = await UserTaskProgress.findOne({ where: { userId, taskId } });
    if (!progress || !progress.isCompleted || progress.rewardCollected) {
      return res.status(400).json({ error: 'Task not completed or already collected' });
    }
    
    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    const character = await Character.findOne({ where: { userId } });
    if (!character) return res.status(404).json({ error: 'Character not found' });
    
    // Grant rewards
    if (task.rewardMoney > 0) {
      character.money += task.rewardMoney;
    }
    if (task.rewardExp > 0) {
      character.exp += task.rewardExp;
      await CharacterService.maybeLevelUp(character);
    }
    if (task.rewardBlackcoins > 0) {
      character.blackcoins += task.rewardBlackcoins;
    }
    
    await character.save();
    
    // Award progress points and check for promotion
    if (task.progressPoints > 0) {
      await TaskService.awardProgressPoints(userId, task.progressPoints);
    }
    
    // Mark reward as collected
    progress.rewardCollected = true;
    await progress.save();
    
    // Get updated promotion status
    const promotionStatus = await PromotionService.getUserPromotionStatus(userId);
    
    // Emit socket event to update navigation badge
    if (io) {
      io.to(`user:${userId}`).emit('tasks:unclaimed-count-updated');
    }
    
    res.json({ 
      success: true, 
      rewards: {
        money: task.rewardMoney,
        exp: task.rewardExp,
        blackcoins: task.rewardBlackcoins,
        progressPoints: task.progressPoints,
      },
      newStats: {
        money: character.money,
        exp: character.exp,
        blackcoins: character.blackcoins,
        level: character.level
      },
      promotionStatus
    });
  }

  // Player: Get promotion status
  static async getPromotionStatus(req, res) {
    try {
      const userId = req.user.id;
      
      // Check and update task progress based on current character stats
      await TaskService.checkAndUpdateTaskProgress(userId);
      
      const promotionStatus = await PromotionService.getUserPromotionStatus(userId);
      res.json(promotionStatus);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Admin: Get all promotions
  static async listPromotions(req, res) {
    try {
      const promotions = await PromotionService.getAllPromotions();
      res.json(promotions);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Admin: Create promotion
  static async createPromotion(req, res) {
    try {
      const promotion = await PromotionService.createPromotion(req.body);
      res.status(201).json(promotion);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Admin: Update promotion
  static async updatePromotion(req, res) {
    try {
      const { id } = req.params;
      const promotion = await PromotionService.updatePromotion(id, req.body);
      res.json(promotion);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Admin: Delete promotion
  static async deletePromotion(req, res) {
    try {
      const { id } = req.params;
      const result = await PromotionService.deletePromotion(id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Player: Get daily task status
  static async getDailyTaskStatus(req, res) {
    try {
      const userId = req.user.id;
      const character = await Character.findOne({ where: { userId } });
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const dailyTaskStatus = await TaskService.getDailyTaskStatus(userId);
      const expReward = TaskService.calculateDailyTaskExpReward(character);
      
      res.json({
        ...dailyTaskStatus,
        expReward,
        blackcoinReward: 1
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Player: Claim daily task reward
  static async claimDailyTask(req, res) {
    try {
      const userId = req.user.id;
      const result = await TaskService.claimDailyTask(userId);
      
      // Emit socket event to update navigation badge
      if (io) {
        io.to(`user:${userId}`).emit('tasks:unclaimed-count-updated');
      }
      
      res.json({
        success: true,
        rewards: {
          exp: result.expReward,
          blackcoins: result.blackcoinReward
        },
        newStats: result.newStats
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Player: Get total unclaimed tasks count
  static async getUnclaimedCount(req, res) {
    try {
      const userId = req.user.id;
      
      // Use a single optimized query to count unclaimed tasks
      const unclaimedRegularTasks = await UserTaskProgress.count({
        where: {
          userId,
          isCompleted: true,
          rewardCollected: false
        },
        include: [{
          model: Task,
          where: { isActive: true },
          attributes: []
        }]
      });

      // Check daily task availability
      const dailyTaskStatus = await TaskService.getDailyTaskStatus(userId);
      const dailyTaskAvailable = dailyTaskStatus.isAvailable ? 1 : 0;

      const totalUnclaimed = unclaimedRegularTasks + dailyTaskAvailable;
      
      res.json({ count: totalUnclaimed });
    } catch (err) {
      console.error('[TASK] Error getting unclaimed count:', err);
      res.status(400).json({ error: err.message });
    }
  }
} 