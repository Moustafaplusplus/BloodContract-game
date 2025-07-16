import { Character } from '../models/Character.js';
import { Job, JobHistory } from '../models/Job.js';
import { CharacterService } from './CharacterService.js';
import { sequelize } from '../config/db.js';
import { User } from '../models/User.js';

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
  static getAvailableJobs(userLevel = 1) {
    return Object.entries(this.JOBS)
      .filter(([key, job]) => job.minLevel <= userLevel)
      .map(([key, job]) => ({
        id: key,
        name: job.name,
        tier: job.tier,
        minLevel: job.minLevel,
        salary: job.salary,
        expPerDay: job.expPerDay,
        description: job.description
      }));
  }

  // Get user's current job
  static async getCurrentJob(userId) {
    return await Job.findOne({ where: { userId } });
  }

  // Hire user for a job
  static async hireUser(userId, jobType) {
    const job = this.JOBS[jobType];
    if (!job) {
      throw new Error('Job not found');
    }

    const character = await Character.findOne({ where: { userId } });
    if (!character) {
      throw new Error('Character not found');
    }

    if (character.level < job.minLevel) {
      throw new Error(`Level ${job.minLevel} required for this job`);
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
        jobType,
        hiredAt: new Date(),
        lastPaidAt: new Date(),
        totalEarned: 0,
        totalExpEarned: 0,
        daysWorked: 0
      }, { transaction: t });

      await t.commit();
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

      const jobInfo = this.JOBS[currentJob.jobType];
      if (!jobInfo) {
        await t.rollback();
        throw new Error('Invalid job type');
      }

      // Calculate unpaid salary (if any)
      const now = new Date();
      const lastPaid = new Date(currentJob.lastPaidAt);
      const daysSinceLastPaid = Math.floor((now - lastPaid) / (1000 * 60 * 60 * 24));
      
      let unpaidSalary = 0;
      if (daysSinceLastPaid > 0) {
        unpaidSalary = daysSinceLastPaid * jobInfo.salary;
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
      
      return {
        jobType: currentJob.jobType,
        jobName: jobInfo.name,
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
        const jobInfo = this.JOBS[jobRecord.jobType];
        if (!jobInfo) continue;

        const lastPaid = new Date(jobRecord.lastPaidAt);
        const daysSinceLastPaid = Math.floor((now - lastPaid) / (1000 * 60 * 60 * 24));

        if (daysSinceLastPaid >= 1) {
          const salary = jobInfo.salary * daysSinceLastPaid;
          const exp = jobInfo.expPerDay * daysSinceLastPaid;

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
          }

          totalPaid += finalSalary;
          totalExpGiven += finalExp;
        }
      }

      await t.commit();
      console.log(`💼 Job payouts: $${totalPaid} paid, ${totalExpGiven} exp given`);
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

    return {
      currentJob: currentJob ? {
        ...currentJob.toJSON(),
        jobInfo: this.JOBS[currentJob.jobType]
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
    // Grant proportional stats (example: 1 energy = +0.5 strength, +0.25 defense, +2 exp)
    let strengthGain = Math.floor(energy * 0.5);
    let defenseGain = Math.floor(energy * 0.25);
    let expGain = energy * 2;
    // VIP bonus
    if (character && character.vipExpiresAt && new Date(character.vipExpiresAt) > new Date()) {
      strengthGain = Math.round(strengthGain * 1.5);
      defenseGain = Math.round(defenseGain * 1.5);
      expGain = Math.round(expGain * 1.5);
    }
    character.strength += strengthGain;
    character.defense += defenseGain;
    character.exp += expGain;
    character.energy -= energy;
    // Set cooldown: 10 seconds per energy spent
    character.gymCooldown = now + energy * 10 * 1000;
    await CharacterService.maybeLevelUp(character);
    await character.save();
    return {
      strengthGain,
      defenseGain,
      expGain,
      energyLeft: character.energy,
      cooldown: energy * 10,
      gymCooldownUntil: character.gymCooldown,
    };
  }
} 