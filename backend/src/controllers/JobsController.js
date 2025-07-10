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

  static async executeJob(req, res) {
    try {
      const { jobId } = req.body;
      if (!jobId) {
        return res.status(400).json({ error: 'Job ID required' });
      }

      const result = await JobsService.executeJob(req.user.id, jobId);
      res.json(result);
    } catch (error) {
      console.error('Execute job error:', error);
      if (error.message === 'Job not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Character not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Not enough energy') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to execute job' });
    }
  }

  static async trainAtGym(req, res) {
    try {
      const { attribute } = req.body;
      if (!attribute) {
        return res.status(400).json({ error: 'Attribute required' });
      }

      const result = await JobsService.trainAtGym(req.user.id, attribute);
      res.json(result);
    } catch (error) {
      console.error('Gym training error:', error);
      if (error.message === 'Invalid attribute') {
        return res.status(400).json({ error: error.message });
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