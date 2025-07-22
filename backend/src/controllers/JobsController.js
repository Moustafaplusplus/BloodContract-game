import { JobsService } from '../services/JobsService.js';
import { CharacterService } from '../services/CharacterService.js';

export class JobsController {
  static async getJobs(req, res) {
    try {
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      const level = character?.level ?? 1;
      const jobs = await JobsService.getAvailableJobs(level);
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

      // Get job info from database using job ID
      const jobInfo = await JobsService.getJobDefinitionById(parseInt(currentJob.jobType));
      res.json({
        currentJob: {
          ...currentJob.toJSON(),
          jobInfo: jobInfo ? jobInfo.toJSON() : null
        }
      });
    } catch (error) {
      console.error('Get current job error:', error);
      res.status(500).json({ error: 'Failed to get current job' });
    }
  }

  static async hireUser(req, res) {
    try {
      const { jobId } = req.body;
      if (!jobId) {
        return res.status(400).json({ error: 'Job ID required' });
      }

      const result = await JobsService.hireUser(req.user.id, jobId);
      const jobInfo = await JobsService.getJobDefinitionById(jobId);
      
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

  // Admin methods for job management
  static async getAllJobs(req, res) {
    try {
      const jobs = await JobsService.getAllJobsForAdmin();
      res.json(jobs);
    } catch (error) {
      console.error('Admin get jobs error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }

  static async createJob(req, res) {
    try {
      // Basic validation
      const requiredFields = [
        'name', 'description', 'tier', 'minLevel', 'salary', 'expPerDay'
      ];
      for (const field of requiredFields) {
        if (req.body[field] === undefined) {
          return res.status(400).json({ error: `Missing field: ${field}` });
        }
      }

      const job = await JobsService.createJob(req.body);
      res.status(201).json(job);
    } catch (error) {
      console.error('Create job error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  static async updateJob(req, res) {
    try {
      const jobId = parseInt(req.params.id, 10);
      if (!jobId) {
        return res.status(400).json({ error: 'Invalid job ID' });
      }

      // Basic validation
      const requiredFields = [
        'name', 'description', 'tier', 'minLevel', 'salary', 'expPerDay'
      ];
      for (const field of requiredFields) {
        if (req.body[field] === undefined) {
          return res.status(400).json({ error: `Missing field: ${field}` });
        }
      }

      const job = await JobsService.updateJob(jobId, req.body);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      res.json(job);
    } catch (error) {
      console.error('Update job error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  static async deleteJob(req, res) {
    try {
      const jobId = parseInt(req.params.id, 10);
      if (!jobId) {
        return res.status(400).json({ error: 'Invalid job ID' });
      }

      const success = await JobsService.deleteJob(jobId);
      if (!success) {
        return res.status(404).json({ error: 'Job not found' });
      }
      res.json({ message: 'Job deleted successfully' });
    } catch (error) {
      console.error('Delete job error:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }
} 