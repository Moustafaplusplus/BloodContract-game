import { Character } from '../models/Character.js';
import { Job, JobHistory } from '../models/Job.js';
import { JobDefinition } from '../models/JobDefinition.js';
import { CharacterService } from './CharacterService.js';
import { sequelize } from '../config/db.js';
import { Op } from 'sequelize';
import { User } from '../models/User.js';
import { TaskService } from './TaskService.js';
import { emitNotification } from '../socket.js';
import { NotificationService } from './NotificationService.js';

export class JobsService {
  // Job definitions with tiers
  static JOBS = {
    // Tier 1 (Level 1-5)
    DELIVERY_BOY: {
      name: 'عامل توصيل',
      tier: 1,
      minLevel: 1,
      salary: 50,
      expPerDay: 10,
      description: 'توصيل الطرود والرسائل'
    },
    CLEANER: {
      name: 'عامل نظافة',
      tier: 1,
      minLevel: 1,
      salary: 40,
      expPerDay: 15,
      description: 'تنظيف الشوارع والمباني'
    },
    
    // Tier 2 (Level 6-10)
    SECURITY_GUARD: {
      name: 'حارس أمن',
      tier: 2,
      minLevel: 6,
      salary: 100,
      expPerDay: 20,
      description: 'حراسة المباني والمنشآت'
    },
    CONSTRUCTION_WORKER: {
      name: 'عامل بناء',
      tier: 2,
      minLevel: 6,
      salary: 80,
      expPerDay: 25,
      description: 'أعمال البناء والتشييد'
    },
    
    // Tier 3 (Level 11-15)
    MANAGER: {
      name: 'مدير',
      tier: 3,
      minLevel: 11,
      salary: 200,
      expPerDay: 30,
      description: 'إدارة الفرق والمشاريع'
    },
    ENGINEER: {
      name: 'مهندس',
      tier: 3,
      minLevel: 11,
      salary: 150,
      expPerDay: 40,
      description: 'التصميم والإشراف الهندسي'
    },
    
    // Tier 4 (Level 16-20)
    EXECUTIVE: {
      name: 'تنفيذي',
      tier: 4,
      minLevel: 16,
      salary: 400,
      expPerDay: 50,
      description: 'إدارة الشركات والمؤسسات'
    },
    CONSULTANT: {
      name: 'مستشار',
      tier: 4,
      minLevel: 16,
      salary: 300,
      expPerDay: 60,
      description: 'الاستشارات المتخصصة'
    },
    
    // Tier 5 (Level 21+)
    CEO: {
      name: 'رئيس تنفيذي',
      tier: 5,
      minLevel: 21,
      salary: 800,
      expPerDay: 80,
      description: 'قيادة الشركات الكبرى'
    },
    INVESTOR: {
      name: 'مستثمر',
      tier: 5,
      minLevel: 21,
      salary: 600,
      expPerDay: 100,
      description: 'الاستثمار وإدارة المحافظ'
    }
  };

  // Get available jobs for user's level
  static async getAvailableJobs(userLevel = 1) {
    const jobs = await JobDefinition.findAll({
      where: {
        minLevel: { [Op.lte]: userLevel },
        isEnabled: true
      },
      order: [['tier', 'ASC'], ['minLevel', 'ASC']]
    });
    
    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      tier: job.tier,
      minLevel: job.minLevel,
      salary: job.salary,
      expPerDay: job.expPerDay,
      description: job.description
    }));
  }

  // Get job definition by ID
  static async getJobDefinitionById(jobId) {
    const job = await JobDefinition.findByPk(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    return job;
  }

  // Seed default jobs if database is empty
  static async seedDefaultJobs() {
    const count = await JobDefinition.count();
    if (count > 0) return; // Already seeded

    const defaultJobs = [
      // Tier 1 (Level 1-5)
      {
        name: 'عامل توصيل',
        description: 'توصيل الطرود والرسائل',
        tier: 1,
        minLevel: 1,
        salary: 50,
        expPerDay: 10,
        isEnabled: true
      },
      {
        name: 'عامل نظافة',
        description: 'تنظيف الشوارع والمباني',
        tier: 1,
        minLevel: 1,
        salary: 40,
        expPerDay: 15,
        isEnabled: true
      },
      
      // Tier 2 (Level 6-10)
      {
        name: 'حارس أمن',
        description: 'حراسة المباني والمنشآت',
        tier: 2,
        minLevel: 6,
        salary: 100,
        expPerDay: 20,
        isEnabled: true
      },
      {
        name: 'عامل بناء',
        description: 'أعمال البناء والتشييد',
        tier: 2,
        minLevel: 6,
        salary: 80,
        expPerDay: 25,
        isEnabled: true
      },
      
      // Tier 3 (Level 11-15)
      {
        name: 'مدير',
        description: 'إدارة الفرق والمشاريع',
        tier: 3,
        minLevel: 11,
        salary: 200,
        expPerDay: 30,
        isEnabled: true
      },
      {
        name: 'مهندس',
        description: 'التصميم والإشراف الهندسي',
        tier: 3,
        minLevel: 11,
        salary: 150,
        expPerDay: 40,
        isEnabled: true
      },
      
      // Tier 4 (Level 16-20)
      {
        name: 'تنفيذي',
        description: 'إدارة الشركات والمؤسسات',
        tier: 4,
        minLevel: 16,
        salary: 400,
        expPerDay: 50,
        isEnabled: true
      },
      {
        name: 'مستشار',
        description: 'الاستشارات المتخصصة',
        tier: 4,
        minLevel: 16,
        salary: 300,
        expPerDay: 60,
        isEnabled: true
      },
      
      // Tier 5 (Level 21+)
      {
        name: 'رئيس تنفيذي',
        description: 'قيادة الشركات الكبرى',
        tier: 5,
        minLevel: 21,
        salary: 800,
        expPerDay: 80,
        isEnabled: true
      },
      {
        name: 'مستثمر',
        description: 'الاستثمار وإدارة المحافظ',
        tier: 5,
        minLevel: 21,
        salary: 600,
        expPerDay: 100,
        isEnabled: true
      }
    ];

    await JobDefinition.bulkCreate(defaultJobs);
  }

  // Get user's current job
  static async getCurrentJob(userId) {
    return await Job.findOne({ where: { userId } });
  }

  // Hire user for a job
  static async hireUser(userId, jobId) {
    const jobDefinition = await JobDefinition.findByPk(jobId);
    if (!jobDefinition || !jobDefinition.isEnabled) {
      throw new Error('Job not found or disabled');
    }

    const character = await Character.findOne({ where: { userId } });
    if (!character) {
      throw new Error('Character not found');
    }

    if (character.level < jobDefinition.minLevel) {
      throw new Error(`Level ${jobDefinition.minLevel} required for this job`);
    }

    const t = await sequelize.transaction();
    try {
      // Check if user already has a job
      const existingJob = await Job.findOne({ 
        where: { userId },
        transaction: t 
      });

      if (existingJob) {
        await t.rollback();
        throw new Error('You already have a job. Quit your current job first.');
      }

      // Create new job record
      const newJob = await Job.create({
        userId,
        jobType: jobId.toString(), // Store job ID as string
        hiredAt: new Date(),
        lastPaidAt: new Date(),
        totalEarned: 0,
        totalExpEarned: 0,
        daysWorked: 0
      }, { transaction: t });

      await t.commit();
      
      // Emit real-time updates
      const { io } = await import('../socket.js');
      if (io) {
        // Update HUD
        const hudData = await character.toSafeJSON();
        io.to(String(userId)).emit('hud:update', hudData);
        
        // Update jobs
        const jobs = await Job.findAll({ where: { userId } });
        io.to(String(userId)).emit('jobs:update', jobs);
        
        // Update tasks
        const tasks = await TaskService.getUserTasks(userId);
        io.to(String(userId)).emit('tasks:update', tasks);
      }
      
      return newJob;
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // Quit current job
  static async quitJob(userId) {
    const t = await sequelize.transaction();
    try {
      const currentJob = await Job.findOne({ 
        where: { userId },
        transaction: t 
      });

      if (!currentJob) {
        await t.rollback();
        throw new Error('You are not currently employed');
      }

      const jobDefinition = await JobDefinition.findByPk(currentJob.jobType);
      if (!jobDefinition) {
        await t.rollback();
        throw new Error('Invalid job type');
      }

      // Calculate unpaid salary (if any)
      const now = new Date();
      const lastPaid = new Date(currentJob.lastPaidAt);
      const daysSinceLastPaid = Math.floor((now - lastPaid) / (1000 * 60 * 60 * 24));
      
      let unpaidSalary = 0;
      if (daysSinceLastPaid > 0) {
        unpaidSalary = daysSinceLastPaid * jobDefinition.salary;
      }

      // Add to job history
      await JobHistory.create({
        userId,
        jobType: currentJob.jobType,
        hiredAt: currentJob.hiredAt,
        quitAt: now,
        totalEarned: currentJob.totalEarned + unpaidSalary,
        totalExpEarned: currentJob.totalExpEarned,
        daysWorked: currentJob.daysWorked + daysSinceLastPaid,
        reason: 'quit'
      }, { transaction: t });

      // Delete current job
      await currentJob.destroy({ transaction: t });

      // Add unpaid salary to character if any
      if (unpaidSalary > 0) {
        const character = await Character.findOne({
          where: { userId },
          transaction: t,
          lock: t.LOCK.UPDATE
        });
        
        if (character) {
          character.money += unpaidSalary;
          await character.save({ transaction: t });
        }
      }

      await t.commit();
      
      // Emit real-time updates
      const { io } = await import('../socket.js');
      if (io) {
        // Update HUD
        const character = await Character.findOne({ where: { userId } });
        if (character) {
          const hudData = await character.toSafeJSON();
          io.to(String(userId)).emit('hud:update', hudData);
        }
        
        // Update jobs
        const jobs = await Job.findAll({ where: { userId } });
        io.to(String(userId)).emit('jobs:update', jobs);
        
        // Update tasks
        const tasks = await TaskService.getUserTasks(userId);
        io.to(String(userId)).emit('tasks:update', tasks);
      }
      
      return {
        jobType: currentJob.jobType,
        jobName: jobDefinition.name,
        unpaidSalary,
        totalEarned: currentJob.totalEarned + unpaidSalary,
        totalExpEarned: currentJob.totalExpEarned,
        daysWorked: currentJob.daysWorked + daysSinceLastPaid
      };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // Get job history for user
  static async getJobHistory(userId, limit = 10) {
    return await JobHistory.findAll({
      where: { userId },
      order: [['quitAt', 'DESC']],
      limit
    });
  }

  // Daily job payout (called by cronjob)
  static async processDailyJobPayouts() {
    const t = await sequelize.transaction();
    try {
      const activeJobs = await Job.findAll({
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      const now = new Date();
      let totalPaid = 0;
      let totalExpGiven = 0;

      for (const jobRecord of activeJobs) {
        const jobDefinition = await JobDefinition.findByPk(jobRecord.jobType);
        if (!jobDefinition || !jobDefinition.isEnabled) continue;

        const lastPaid = new Date(jobRecord.lastPaidAt);
        const daysSinceLastPaid = Math.floor((now - lastPaid) / (1000 * 60 * 60 * 24));

        if (daysSinceLastPaid >= 1) {
          const salary = jobDefinition.salary * daysSinceLastPaid;
          const exp = jobDefinition.expPerDay * daysSinceLastPaid;

          // Update job record
          jobRecord.totalEarned += salary;
          jobRecord.totalExpEarned += exp;
          jobRecord.daysWorked += daysSinceLastPaid;
          jobRecord.lastPaidAt = now;
          await jobRecord.save({ transaction: t });

          // Update character
          const character = await Character.findOne({
            where: { userId: jobRecord.userId },
            transaction: t,
            lock: t.LOCK.UPDATE
          });
          
          let finalSalary = salary;
          let finalExp = exp;
          
          // VIP bonus
          if (character && character.vipExpiresAt && new Date(character.vipExpiresAt) > new Date()) {
            finalSalary = Math.round(salary * 1.5);
            finalExp = Math.round(exp * 1.5);
          }
          
          if (character) {
            character.money += finalSalary;
            character.exp += finalExp;
            await CharacterService.maybeLevelUp(character);
            await character.save({ transaction: t });
            
            // Track job completion for tasks
            await TaskService.updateProgress(jobRecord.userId, 'jobs_completed', 1);
          }

          totalPaid += finalSalary;
          totalExpGiven += finalExp;
        }
      }

      await t.commit();
      
      // Emit real-time updates for all users who received payouts
      const { io } = await import('../socket.js');
      if (io) {
        for (const jobRecord of activeJobs) {
          const jobDefinition = await JobDefinition.findByPk(jobRecord.jobType);
          if (!jobDefinition || !jobDefinition.isEnabled) continue;

          const lastPaid = new Date(jobRecord.lastPaidAt);
          const daysSinceLastPaid = Math.floor((now - lastPaid) / (1000 * 60 * 60 * 24));

          if (daysSinceLastPaid >= 1) {
            // Update HUD
            const character = await Character.findOne({ where: { userId: jobRecord.userId } });
            if (character) {
              const hudData = await character.toSafeJSON();
              io.to(String(jobRecord.userId)).emit('hud:update', hudData);
            }
            
            // Update jobs
            const jobs = await Job.findAll({ where: { userId: jobRecord.userId } });
            io.to(String(jobRecord.userId)).emit('jobs:update', jobs);
            
            // Update tasks
            const tasks = await TaskService.getUserTasks(jobRecord.userId);
            io.to(String(jobRecord.userId)).emit('tasks:update', tasks);
          }
        }
      }
      
      // Create notifications for job payouts
      try {
        for (const jobRecord of activeJobs) {
          const jobDefinition = await JobDefinition.findByPk(jobRecord.jobType);
          if (!jobDefinition || !jobDefinition.isEnabled) continue;

          const lastPaid = new Date(jobRecord.lastPaidAt);
          const daysSinceLastPaid = Math.floor((now - lastPaid) / (1000 * 60 * 60 * 24));

          if (daysSinceLastPaid >= 1) {
            const salary = jobDefinition.salary * daysSinceLastPaid;
            const exp = jobDefinition.expPerDay * daysSinceLastPaid;
            
            // Get character for VIP bonus calculation
            const character = await Character.findOne({ where: { userId: jobRecord.userId } });
            let finalSalary = salary;
            let finalExp = exp;
            
            // VIP bonus
            if (character && character.vipExpiresAt && new Date(character.vipExpiresAt) > new Date()) {
              finalSalary = Math.round(salary * 1.5);
              finalExp = Math.round(exp * 1.5);
            }
            
            // Create job salary notification
            const notification = await NotificationService.createJobSalaryNotification(
              jobRecord.userId,
              jobDefinition.name,
              finalSalary
            );
            emitNotification(jobRecord.userId, notification);
          }
        }
      } catch (notificationError) {
        console.error('[JobsService] Notification error:', notificationError);
        // Continue even if notifications fail
      }
      
      // Job payouts completed
    } catch (err) {
      await t.rollback();
      console.error('❌ Job payout failed:', err);
      throw err;
    }
  }

  // Get job statistics
  static async getJobStats(userId) {
    const currentJob = await this.getCurrentJob(userId);
    const history = await this.getJobHistory(userId);
    
    const totalJobs = history.length;
    const totalEarned = history.reduce((sum, job) => sum + job.totalEarned, 0);
    const totalExpEarned = history.reduce((sum, job) => sum + job.totalExpEarned, 0);
    const totalDaysWorked = history.reduce((sum, job) => sum + job.daysWorked, 0);

    let jobInfo = null;
    if (currentJob) {
      jobInfo = await JobDefinition.findByPk(parseInt(currentJob.jobType));
    }

    return {
      currentJob: currentJob ? {
        ...currentJob.toJSON(),
        jobInfo: jobInfo ? jobInfo.toJSON() : null
      } : null,
      history,
      stats: {
        totalJobs,
        totalEarned,
        totalExpEarned,
        totalDaysWorked
      }
    };
  }

  // Gym training
  static async trainAtGym(userId, energy) {
    const character = await Character.findOne({ where: { userId } });
    if (!character) {
      throw new Error('Character not found');
    }
    const user = await User.findByPk(userId);
    const now = Date.now();
    if (character.gymCooldown && character.gymCooldown > now) {
      throw new Error('On cooldown');
    }
    if (character.energy < energy) {
      throw new Error('Not enough energy');
    }

    // Limit energy per training session to prevent abuse
    const maxEnergyPerSession = 20;
    if (energy > maxEnergyPerSession) {
      throw new Error(`Maximum ${maxEnergyPerSession} energy per training session`);
    }

    // New balanced reward system - only exp and money
    const level = character.level || 1;
    const isVip = character.vipExpiresAt && new Date(character.vipExpiresAt) > new Date();
    
    // Money reward: Scalable like EXP
    // Base: $5 per energy
    // Level scaling: 1 + (level / 10) - so level 10 gets 2x, level 20 gets 3x
    let moneyGain = energy * 5 * (1 + level / 10);
    
    // Experience: Much more conservative to prevent level jumping
    // Base: 2 exp per energy (reduced from 3)
    // Level scaling: 1 + (level / 10) - so level 10 gets 2x, level 20 gets 3x
    let expGain = Math.floor(energy * 2 * (1 + level / 10));
    
    // Additional level scaling: Diminishing returns (logarithmic scaling)
    // Formula: 1 + log10(level) * 0.1 (reduced from 0.2)
    // This means: Level 1=1.0x, Level 10=1.1x, Level 100=1.2x
    const levelScaling = 1 + Math.log10(Math.max(1, level)) * 0.1;
    
    // Apply level scaling to both money and exp
    moneyGain = Math.floor(moneyGain * levelScaling);
    expGain = Math.floor(expGain * levelScaling);
    
    // VIP bonus: 50% bonus for money and exp
    if (isVip) {
      moneyGain = Math.floor(moneyGain * 1.5);
      expGain = Math.floor(expGain * 1.5);
    }
    
    // Safety check: Limit exp gain to prevent level jumping
    // Calculate how much exp is needed for next level using the exponential/linear system
    const expNeededForNextLevel = CharacterService.calculateExpNeeded(level);
    const maxExpGain = Math.min(expGain, Math.floor(expNeededForNextLevel * 0.3)); // Max 30% of next level's exp
    
    // Apply rewards
    character.money += moneyGain;
    character.exp += maxExpGain;
    character.energy -= energy;
    
    // Set cooldown: 10 seconds per energy spent
    character.gymCooldown = now + energy * 10 * 1000;
    
    await CharacterService.maybeLevelUp(character);
    await character.save();
    
    return {
      moneyGain,
      expGain: maxExpGain,
      energyLeft: character.energy,
      cooldown: energy * 10,
      gymCooldownUntil: character.gymCooldown,
      scaling: levelScaling,
      level: level,
      isVip,
      expNeededForNextLevel,
      maxEnergyPerSession
    };
  }

  // Admin methods for job definition management
  static async getAllJobsForAdmin() {
    const jobs = await JobDefinition.findAll({
      order: [['tier', 'ASC'], ['minLevel', 'ASC']]
    });
    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      description: job.description,
      tier: job.tier,
      minLevel: job.minLevel,
      salary: job.salary,
      expPerDay: job.expPerDay,
      isEnabled: job.isEnabled
    }));
  }

  static async createJob(data) {
    // Only allow fields defined in the model
    const allowedFields = [
      'name', 'description', 'tier', 'minLevel', 'salary', 'expPerDay', 'isEnabled'
    ];
    const jobData = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) jobData[field] = data[field];
    }
    const job = await JobDefinition.create(jobData);
    return job;
  }

  static async updateJob(jobId, data) {
    const job = await JobDefinition.findByPk(jobId);
    if (!job) return null;

    // Only allow fields defined in the model
    const allowedFields = [
      'name', 'description', 'tier', 'minLevel', 'salary', 'expPerDay', 'isEnabled'
    ];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        job[field] = data[field];
      }
    }
    
    await job.save();
    return job;
  }

  static async deleteJob(jobId) {
    const job = await JobDefinition.findByPk(jobId);
    if (!job) return false;
    
    await job.destroy();
    return true;
  }
} 