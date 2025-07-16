import { JobsService } from '../services/JobsService.js';
import { CharacterService } from '../services/CharacterService.js';

export class JobsController {
  static async getJobs(req, res) {
    try {
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      const level = character?.level ?? 1;
      const jobs = JobsService.getAvailableJobs(level);
      res.json(jobs);
    } catch (error) {
      console.error('Jobs error:', error);
      res.status(500).json({ error: 'Failed to get jobs' });
    }
  }

  static async getCurrentJob(req, res) {
    try {
      const currentJob = await JobsService.getCurrentJob(req.user.id);
      if (!currentJob) {
        return res.json({ currentJob: null });
      }

      const jobInfo = JobsService.JOBS[currentJob.jobType];
      res.json({
        currentJob: {
          ...currentJob.toJSON(),
          jobInfo
        }
      });
    } catch (error) {
      console.error('Get current job error:', error);
      res.status(500).json({ error: 'Failed to get current job' });
    }
  }

  static async hireUser(req, res) {
    try {
      const { jobType } = req.body;
      if (!jobType) {
        return res.status(400).json({ error: 'Job type required' });
      }

      const result = await JobsService.hireUser(req.user.id, jobType);
      const jobInfo = JobsService.JOBS[jobType];
      
      res.json({
        success: true,
        job: {
          ...result.toJSON(),
          jobInfo
        },
        message: `تم توظيفك كـ ${jobInfo.name}`
      });
    } catch (error) {
      console.error('Hire user error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async quitJob(req, res) {
    try {
      const result = await JobsService.quitJob(req.user.id);
      
      res.json({
        success: true,
        ...result,
        message: `تم الاستقالة من وظيفة ${result.jobName}`
      });
    } catch (error) {
      console.error('Quit job error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getJobHistory(req, res) {
    try {
      const history = await JobsService.getJobHistory(req.user.id);
      res.json(history);
    } catch (error) {
      console.error('Get job history error:', error);
      res.status(500).json({ error: 'Failed to get job history' });
    }
  }

  static async getJobStats(req, res) {
    try {
      const stats = await JobsService.getJobStats(req.user.id);
      res.json(stats);
    } catch (error) {
      console.error('Get job stats error:', error);
      res.status(500).json({ error: 'Failed to get job stats' });
    }
  }

  // Gym training (keeping this for now)
  static async trainAtGym(req, res) {
    try {
      const { energy } = req.body;
      if (!energy || isNaN(energy) || energy < 1) {
        return res.status(400).json({ error: 'Energy amount required and must be >= 1' });
      }

      const result = await JobsService.trainAtGym(req.user.id, energy);
      res.json(result);
    } catch (error) {
      console.error('Gym training error:', error);
      if (error.message === 'On cooldown') {
        return res.status(429).json({ error: 'You must wait before training again.' });
      }
      if (error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Not enough energy') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to train at gym' });
    }
  }
} 