import { Character } from '../models/Character.js';
import { CharacterService } from './CharacterService.js';

export class JobsService {
  // Job definitions
  static JOBS = {
    DELIVERY: {
      name: 'توصيل الطرود',
      energyCost: 5,
      minReward: 20,
      maxReward: 50,
      successRate: 0.9,
      xpReward: 10
    },
    SECURITY: {
      name: 'حراسة المبنى',
      energyCost: 8,
      minReward: 35,
      maxReward: 80,
      successRate: 0.85,
      xpReward: 15
    },
    CLEANING: {
      name: 'تنظيف الشوارع',
      energyCost: 3,
      minReward: 15,
      maxReward: 30,
      successRate: 0.95,
      xpReward: 5
    },
    CONSTRUCTION: {
      name: 'أعمال البناء',
      energyCost: 10,
      minReward: 50,
      maxReward: 120,
      successRate: 0.75,
      xpReward: 20
    }
  };

  // Calculate job success chance
  static calcJobChance(level = 1, baseRate = 0.5) {
    const bonus = level * 0.01; // +1% per level
    return Math.min(0.95, Math.max(0.05, baseRate + bonus));
  }

  // Get random integer between min and max
  static randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Get available jobs for user's level
  static getAvailableJobs(userLevel = 1) {
    return Object.entries(this.JOBS).map(([key, job]) => ({
      id: key,
      name: job.name,
      energyCost: job.energyCost,
      minReward: job.minReward,
      maxReward: job.maxReward,
      successRate: job.successRate,
      chance: Math.round(this.calcJobChance(userLevel, job.successRate) * 100),
      xpReward: job.xpReward
    }));
  }

  // Execute a job
  static async executeJob(userId, jobId) {
    const job = this.JOBS[jobId];
    if (!job) {
      throw new Error('Job not found');
    }

    const character = await Character.findOne({ where: { userId } });
    if (!character) {
      throw new Error('Character not found');
    }

    // Check energy
    if (character.energy < job.energyCost) {
      throw new Error('Not enough energy');
    }

    // Calculate success
    const success = Math.random() < this.calcJobChance(character.level, job.successRate);
    const reward = success ? this.randInt(job.minReward, job.maxReward) : 0;

    // Apply results
    character.energy -= job.energyCost;
    if (reward > 0) {
      character.money += reward;
      character.exp += job.xpReward;
      await CharacterService.maybeLevelUp(character);
    }
    await character.save();

    return {
      success,
      reward,
      xpGained: success ? job.xpReward : 0,
      energyLeft: character.energy
    };
  }

  // Gym training
  static async trainAtGym(userId, attribute) {
    if (!['strength', 'defense'].includes(attribute)) {
      throw new Error('Invalid attribute');
    }

    const character = await Character.findOne({ where: { userId } });
    if (!character) {
      throw new Error('Character not found');
    }

    if (character.energy < 3) {
      throw new Error('Not enough energy');
    }

    // Train the attribute
    character[attribute] += 1;
    character.energy -= 3;
    character.exp += 5;
    
    await CharacterService.maybeLevelUp(character);
    await character.save();

    return {
      attribute,
      newValue: character[attribute],
      energyLeft: character.energy,
      xpGained: 5
    };
  }
} 