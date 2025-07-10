import { FightService } from '../services/FightService.js';

export class FightController {
  static async attackPlayer(req, res) {
    try {
      const attackerId = req.user.id;
      const defenderId = Number(req.params.defenderId);
      
      if (!defenderId || defenderId <= 0) {
        return res.status(400).json({ error: "معرّف المدافع غير صالح" });
      }
      
      const result = await FightService.runFight(attackerId, defenderId);
      res.json(result);
    } catch (error) {
      console.error('Fight error:', error);
      res.status(400).json({ error: error.message || "فشل القتال" });
    }
  }
} 