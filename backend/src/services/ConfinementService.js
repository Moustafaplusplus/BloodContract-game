import { Jail, Hospital } from '../models/Confinement.js';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';
import { io, emitNotification } from '../socket.js';
import { Op } from 'sequelize';
import { NotificationService } from './NotificationService.js';

// Helper function to run database operations with timeout
async function withTimeout(promise, timeoutMs = 3000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timed out')), timeoutMs)
    )
  ]);
}

export class ConfinementService {
  // Helper functions
  static now() {
    return new Date();
  }

  static minutesLeft(releasedAt) {
    return Math.max(0, Math.ceil((releasedAt.getTime() - Date.now()) / 60000));
  }

  static secondsLeft(releasedAt) {
    return Math.max(0, Math.floor((releasedAt.getTime() - Date.now()) / 1000));
  }

  static emitStatus(userId, payload) {
    if (io) {
      io.to(`user:${userId}`).emit("confinementUpdate", payload);
    }
  }

  // Jail operations
  static async getJailStatus(userId) {
    try {
      // First get the character ID for this user with timeout
      const character = await withTimeout(
        Character.findOne({ where: { userId } }),
        2000
      );
      if (!character) return { inJail: false };
      
      const rec = await withTimeout(
        Jail.findOne({ 
          where: { userId: userId, releasedAt: { [Op.gt]: this.now() } } 
        }),
        2000
      );
      
      if (!rec) return { inJail: false };
      
      const remainingSeconds = this.secondsLeft(rec.releasedAt);
      // Fixed bail cost: 100 money per minute
      const minutesLeft = Math.ceil(remainingSeconds / 60);
      const cost = minutesLeft * 100;
      
      return { 
        inJail: true, 
        remainingSeconds: remainingSeconds, 
        cost: cost, 
        crimeId: rec.crimeId,
        startedAt: rec.startedAt,
        releasedAt: rec.releasedAt
      };
    } catch (error) {
      console.error('[JAIL_SERVICE] Error in getJailStatus:', error.message);
      // Return default state if database is unavailable
      return { inJail: false };
    }
  }

  static async bailOut(userId) {
    const t = await sequelize.transaction();
    try {
      // First get the character ID for this user
      const character = await withTimeout(
        Character.findOne({ where: { userId }, transaction: t }),
        3000
      );
      if (!character) {
        await t.rollback();
        throw new Error("Character not found");
      }
      
      const rec = await withTimeout(
        Jail.findOne({ 
          where: { userId: userId, releasedAt: { [Op.gt]: this.now() } }, 
          transaction: t, 
          lock: t.LOCK.UPDATE 
        }),
        3000
      );
      
      if (!rec) {
        await t.rollback();
        throw new Error("Not in jail");
      }

      const remainingSeconds = this.secondsLeft(rec.releasedAt);
      const minutesLeft = Math.ceil(remainingSeconds / 60);
      // Fixed bail cost: 100 money per minute
      const cost = minutesLeft * 100;
      
      if (character.money < cost) {
        await t.rollback();
        throw new Error("Insufficient funds");
      }

      character.money -= cost;
      await character.save({ transaction: t });
      await rec.destroy({ transaction: t });

      await t.commit();
      
      // Emit jail leave event
      if (io) {
        io.to(`user:${userId}`).emit('jail:leave');
      }

      // Create notification for jail release (non-blocking)
      setImmediate(async () => {
        try {
          const notification = await NotificationService.createOutOfJailNotification(userId);
          emitNotification(userId, notification);
        } catch (notificationError) {
          console.error('[ConfinementService] Notification error:', notificationError.message);
        }
      });
      
      return { success: true, newCash: character.money };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // Jail operations
  static async getJailCount() {
    try {
      const now = this.now();
      return await withTimeout(
        Jail.count({ where: { releasedAt: { [Op.gt]: now } } }),
        2000
      );
    } catch (error) {
      console.error('[JAIL_SERVICE] Error in getJailCount:', error.message);
      return 0;
    }
  }

  // Hospital operations
  static async getHospitalStatus(userId) {
    try {
      // First get the character ID for this user with timeout
      const character = await withTimeout(
        Character.findOne({ where: { userId } }),
        2000
      );
      if (!character) {
        return { inHospital: false };
      }
      
      const now = this.now();
      
      const rec = await withTimeout(
        Hospital.findOne({ 
          where: { userId: userId, releasedAt: { [Op.gt]: now } } 
        }),
        2000
      );
      
      if (!rec) {
        return { inHospital: false };
      }
      
      const remainingSeconds = this.secondsLeft(rec.releasedAt);
      // Fixed heal cost: 100 money per minute
      const minutesLeft = Math.ceil(remainingSeconds / 60);
      const cost = minutesLeft * 100;
      
      const result = { 
        inHospital: true, 
        remainingSeconds: remainingSeconds, 
        cost: cost, 
        crimeId: rec.crimeId, 
        hpLoss: rec.hpLoss,
        startedAt: rec.startedAt,
        releasedAt: rec.releasedAt
      };
      
      return result;
    } catch (error) {
      console.error('[HOSPITAL_SERVICE] Error in getHospitalStatus:', error.message);
      // Return default state if database is unavailable
      return { inHospital: false };
    }
  }

  static async healOut(userId) {
    const t = await sequelize.transaction();
    try {
      // First get the character ID for this user
      const character = await withTimeout(
        Character.findOne({ where: { userId }, transaction: t }),
        3000
      );
      if (!character) {
        await t.rollback();
        throw new Error("Character not found");
      }
      
      const rec = await withTimeout(
        Hospital.findOne({ 
          where: { userId: userId, releasedAt: { [Op.gt]: this.now() } }, 
          transaction: t, 
          lock: t.LOCK.UPDATE 
        }),
        3000
      );
      
      if (!rec) {
        await t.rollback();
        throw new Error("Not in hospital");
      }

      const remainingSeconds = this.secondsLeft(rec.releasedAt);
      const minutesLeft = Math.ceil(remainingSeconds / 60);
      // Fixed heal cost: 100 money per minute
      const cost = minutesLeft * 100;
      
      if (character.money < cost) {
        await t.rollback();
        throw new Error("Insufficient funds");
      }

      character.money -= cost;
      // Restore HP to max if maxHp exists, otherwise to 100
      character.hp = character.maxHp || 100;
      await character.save({ transaction: t });
      await rec.destroy({ transaction: t });

      await t.commit();
      
      // Emit hospital leave event
      if (io) {
        io.to(`user:${userId}`).emit('hospital:leave');
      }

      // Create notification for hospital release (non-blocking)
      setImmediate(async () => {
        try {
          const notification = await NotificationService.createOutOfHospitalNotification(userId);
          emitNotification(userId, notification);
        } catch (notificationError) {
          console.error('[ConfinementService] Notification error:', notificationError.message);
        }
      });
      
      return { success: true, newCash: character.money };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // Hospital operations
  static async getHospitalCount() {
    try {
      const now = this.now();
      return await withTimeout(
        Hospital.count({ where: { releasedAt: { [Op.gt]: now } } }),
        2000
      );
    } catch (error) {
      console.error('[HOSPITAL_SERVICE] Error in getHospitalCount:', error.message);
      return 0;
    }
  }
}
