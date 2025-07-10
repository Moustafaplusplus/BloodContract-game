import { Jail, Hospital } from '../models/Confinement.js';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';
import { io } from '../socket.js';

export class ConfinementService {
  // Helper functions
  static now() {
    return new Date();
  }

  static minutesLeft(releasedAt) {
    return Math.max(0, Math.ceil((releasedAt.getTime() - Date.now()) / 60000));
  }

  static emitStatus(userId, payload) {
    if (io) {
      io.to(`user:${userId}`).emit("confinementUpdate", payload);
    }
  }

  // Jail operations
  static async getJailStatus(userId) {
    const rec = await Jail.findOne({ 
      where: { userId, releasedAt: { [sequelize.Op.gt]: this.now() } } 
    });
    
    if (!rec) return { inJail: false };
    
    const mins = this.minutesLeft(rec.releasedAt);
    return { 
      inJail: true, 
      remainingSeconds: mins * 60, 
      cost: 50 + mins * 5, 
      crimeId: rec.crimeId 
    };
  }

  static async bailOut(userId) {
    const t = await sequelize.transaction();
    try {
      const rec = await Jail.findOne({ 
        where: { userId, releasedAt: { [sequelize.Op.gt]: this.now() } }, 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      
      if (!rec) {
        await t.rollback();
        throw new Error("Not in jail");
      }

      const mins = this.minutesLeft(rec.releasedAt);
      const cost = 50 + mins * 5;

      const char = await Character.findOne({ 
        where: { userId }, 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      
      if (char.money < cost) {
        await t.rollback();
        throw new Error("Insufficient funds");
      }

      char.money -= cost;
      await char.save({ transaction: t });
      await rec.destroy({ transaction: t });

      await t.commit();
      this.emitStatus(userId, { type: "bailed", remainingSeconds: 0 });
      
      return { success: true, newCash: char.money };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // Hospital operations
  static async getHospitalStatus(userId) {
    const rec = await Hospital.findOne({ 
      where: { userId, releasedAt: { [sequelize.Op.gt]: this.now() } } 
    });
    
    if (!rec) return { inHospital: false };
    
    const mins = this.minutesLeft(rec.releasedAt);
    return { 
      inHospital: true, 
      remainingSeconds: mins * 60, 
      cost: 40 + mins * 4, 
      crimeId: rec.crimeId, 
      hpLoss: rec.hpLoss 
    };
  }

  static async healOut(userId) {
    const t = await sequelize.transaction();
    try {
      const rec = await Hospital.findOne({ 
        where: { userId, releasedAt: { [sequelize.Op.gt]: this.now() } }, 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      
      if (!rec) {
        await t.rollback();
        throw new Error("Not in hospital");
      }
      
      const mins = this.minutesLeft(rec.releasedAt);
      const cost = 40 + mins * 4;

      const char = await Character.findOne({ 
        where: { userId }, 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      
      if (char.money < cost) {
        await t.rollback();
        throw new Error("Insufficient funds");
      }

      char.money -= cost;
      char.hp = Math.min(char.hp + rec.hpLoss, char.maxHp);
      await char.save({ transaction: t });
      await rec.destroy({ transaction: t });

      await t.commit();
      this.emitStatus(userId, { type: "healed", hp: char.hp });
      
      return { success: true, newCash: char.money, hp: char.hp };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
} 