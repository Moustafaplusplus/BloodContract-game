import { CrimeService } from '../services/CrimeService.js';
import { CharacterService } from '../services/CharacterService.js';

export class CrimeController {
  static async getCrimes(req, res) {
    try {
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      const level = character?.level ?? 1;
      const crimes = await CrimeService.getAvailableCrimes(level);
      res.json(crimes);
    } catch (error) {
      console.error('[crimes] list error', error);
      res.status(500).json({ error: "Server error" });
    }
  }

  static async getAllCrimes(req, res) {
    try {
      const crimes = await CrimeService.getAllCrimes();
      res.json(crimes);
    } catch (error) {
      console.error('[crimes] admin list error', error);
      res.status(500).json({ error: "Server error" });
    }
  }

  static async getCrimeById(req, res) {
    try {
      const crimeId = parseInt(req.params.id, 10);
      if (!crimeId) {
        return res.status(400).json({ error: "Invalid crime ID" });
      }
      const crime = await CrimeService.getCrimeById(crimeId);
      if (!crime) {
        return res.status(404).json({ error: "Crime not found" });
      }
      res.json(crime);
    } catch (error) {
      console.error('[crimes] get by id error', error);
      res.status(500).json({ error: "Server error" });
    }
  }

  static async executeCrime(req, res) {
    try {
      const crimeId = parseInt(req.params.crimeId ?? req.body.crimeId, 10);
      if (!crimeId) {
        return res.status(400).json({ error: "crimeId required" });
      }

      console.log(`[CrimeController] Executing crime ${crimeId} for user ${req.user.id}`);
      const result = await CrimeService.executeCrime(req.user.id, crimeId);
      res.json(result);
    } catch (error) {
      console.error(`[CrimeController] Error executing crime:`, error);
      const status = error.status || 500;
      res.status(status).json({ 
        error: error.msg || "Server error", 
        ...(error.meta || {}) 
      });
    }
  }

  static async createCrime(req, res) {
    try {
      // Basic validation (expand as needed)
      const requiredFields = [
        'name', 'description', 'req_level', 'energyCost', 'successRate',
        'minReward', 'maxReward', 'cooldown', 'failOutcome', 'jailMinutes',
        'hospitalMinutes', 'expReward', 'imageUrl'
      ];
      for (const field of requiredFields) {
        if (req.body[field] === undefined) {
          return res.status(400).json({ error: `Missing field: ${field}` });
        }
      }
      const crime = await CrimeService.createCrime(req.body);
      res.status(201).json(crime);
    } catch (error) {
      console.error('[crimes] create error', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  static async updateCrime(req, res) {
    try {
      const crimeId = parseInt(req.params.id, 10);
      if (!crimeId) {
        return res.status(400).json({ error: "Invalid crime ID" });
      }

      // Basic validation (expand as needed)
      const requiredFields = [
        'name', 'description', 'req_level', 'energyCost', 'successRate',
        'minReward', 'maxReward', 'cooldown', 'failOutcome', 'jailMinutes',
        'hospitalMinutes', 'expReward', 'imageUrl'
      ];
      for (const field of requiredFields) {
        if (req.body[field] === undefined) {
          return res.status(400).json({ error: `Missing field: ${field}` });
        }
      }

      const crime = await CrimeService.updateCrime(crimeId, req.body);
      if (!crime) {
        return res.status(404).json({ error: "Crime not found" });
      }
      res.json(crime);
    } catch (error) {
      console.error('[crimes] update error', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }

  static async deleteCrime(req, res) {
    try {
      const crimeId = parseInt(req.params.id, 10);
      if (!crimeId) {
        return res.status(400).json({ error: "Invalid crime ID" });
      }

      const success = await CrimeService.deleteCrime(crimeId);
      if (!success) {
        return res.status(404).json({ error: "Crime not found" });
      }
      res.json({ message: "Crime deleted successfully" });
    } catch (error) {
      console.error('[crimes] delete error', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  }
} 