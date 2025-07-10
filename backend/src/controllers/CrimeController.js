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

  static async executeCrime(req, res) {
    try {
      const crimeId = parseInt(req.params.crimeId ?? req.body.crimeId, 10);
      if (!crimeId) {
        return res.status(400).json({ error: "crimeId required" });
      }

      const result = await CrimeService.executeCrime(req.user.id, crimeId);
      res.json(result);
    } catch (error) {
      const status = error.status || 500;
      res.status(status).json({ 
        error: error.msg || "Server error", 
        ...(error.meta || {}) 
      });
    }
  }
} 