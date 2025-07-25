import { Jail, Hospital } from '../models/Confinement.js';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';
import { io, emitNotification } from '../socket.js';
import { Op } from 'sequelize';
import { NotificationService } from './NotificationService.js';

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
    // First get the character ID for this user
    const character = await Character.findOne({ where: { userId } });
    if (!character) return { inJail: false };
    
    const rec = await Jail.findOne({ 
      where: { userId: userId, releasedAt: { [Op.gt]: this.now() } } 
    });
    
    if (!rec) return { inJail: false };
    
    const mins = this.minutesLeft(rec.releasedAt);
    // Dynamic bail cost based on level: base cost + level multiplier
    const levelMultiplier = Math.max(0.5, Math.min(2.0, character.level / 10));
    const baseCost = rec.bailRate || 50;
    const cost = Math.round(baseCost * levelMultiplier);
    
    return { 
      inJail: true, 
      remainingSeconds: mins * 60, 
      cost: cost, 
      crimeId: rec.crimeId,
      startedAt: rec.startedAt,
      releaseAt: rec.releasedAt
    };
  }

  static async bailOut(userId) {
    const t = await sequelize.transaction();
    try {
      // First get the character ID for this user
      const character = await Character.findOne({ where: { userId }, transaction: t });
      if (!character) {
        await t.rollback();
        throw new Error("Character not found");
      }
      
      const rec = await Jail.findOne({ 
        where: { userId: userId, releasedAt: { [Op.gt]: this.now() } }, 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      
      if (!rec) {
        await t.rollback();
        throw new Error("Not in jail");
      }

      const mins = this.minutesLeft(rec.releasedAt);
      // Dynamic bail cost based on level: base cost + level multiplier
      const levelMultiplier = Math.max(0.5, Math.min(2.0, character.level / 10));
      const baseCost = rec.bailRate || 50;
      const cost = Math.round(baseCost * levelMultiplier);
      
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

      // Create notification for jail release
      try {
        const notification = await NotificationService.createOutOfJailNotification(userId);
        emitNotification(userId, notification);
      } catch (notificationError) {
        console.error('[ConfinementService] Notification error:', notificationError);
        // Continue even if notifications fail
      }
      
      return { success: true, newCash: character.money };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // Jail operations
  static async getJailCount() {
    const now = this.now();
    return await Jail.count({ where: { releasedAt: { [Op.gt]: now } } });
  }

  // Hospital operations
  static async getHospitalStatus(userId) {
    try {
      console.log('[HOSPITAL_SERVICE] Getting status for user:', userId);
      
      // First get the character ID for this user
      const character = await Character.findOne({ where: { userId } });
      if (!character) {
        console.log('[HOSPITAL_SERVICE] No character found for user:', userId);
        return { inHospital: false };
      }
      
      const now = this.now();
      console.log('[HOSPITAL_SERVICE] Current time:', now);
      
      const rec = await Hospital.findOne({ 
        where: { userId: userId, releasedAt: { [Op.gt]: now } } 
      });
      
      if (!rec) {
        console.log('[HOSPITAL_SERVICE] No active hospital record for user:', userId);
        return { inHospital: false };
      }
      
      console.log('[HOSPITAL_SERVICE] Found hospital record:', {
        userId: rec.userId,
        minutes: rec.minutes,
        releasedAt: rec.releasedAt,
        hpLoss: rec.hpLoss,
        healRate: rec.healRate
      });
      
      const mins = this.minutesLeft(rec.releasedAt);
      // Dynamic heal cost based on level: base cost + level multiplier
      const levelMultiplier = Math.max(0.5, Math.min(2.0, character.level / 10));
      const baseCost = rec.healRate || 40;
      const cost = Math.round(baseCost * levelMultiplier);
      
      const result = { 
        inHospital: true, 
        remainingSeconds: mins * 60, 
        cost: cost, 
        crimeId: rec.crimeId, 
        hpLoss: rec.hpLoss,
        startedAt: rec.startedAt,
        releasedAt: rec.releasedAt
      };
      
      console.log('[HOSPITAL_SERVICE] Returning result:', result);
      return result;
    } catch (error) {
      console.error('[HOSPITAL_SERVICE] Error in getHospitalStatus:', error);
      console.error('[HOSPITAL_SERVICE] Error stack:', error.stack);
      throw error;
    }
  }

  static async healOut(userId, fullHeal = true) {
    const t = await sequelize.transaction();
    try {
      // First get the character ID for this user
      const character = await Character.findOne({ where: { userId }, transaction: t });
      if (!character) {
        await t.rollback();
        throw new Error("Character not found");
      }
      
      const rec = await Hospital.findOne({ 
        where: { userId: userId, releasedAt: { [Op.gt]: this.now() } }, 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      
      if (!rec) {
        await t.rollback();
        throw new Error("Not in hospital");
      }
      
      const mins = this.minutesLeft(rec.releasedAt);
      // Dynamic heal cost based on level: base cost + level multiplier
      const levelMultiplier = Math.max(0.5, Math.min(2.0, character.level / 10));
      const baseCost = rec.healRate || 40;
      const cost = Math.round(baseCost * levelMultiplier);
      
      if (character.money < cost) {
        await t.rollback();
        throw new Error("Insufficient funds");
      }

      character.money -= cost;
      // Restore 100% HP if paid heal, 80% if natural
      const maxHp = typeof character.getMaxHp === 'function' ? character.getMaxHp() : character.maxHp;
      character.hp = fullHeal ? maxHp : Math.floor(maxHp * 0.8);
      await character.save({ transaction: t });
      await rec.destroy({ transaction: t });

      await t.commit();
      
      // Emit hospital leave event
      if (io) {
        io.to(`user:${userId}`).emit('hospital:leave');
      }

      // Create notification for hospital release
      try {
        const notification = await NotificationService.createOutOfHospitalNotification(userId);
        emitNotification(userId, notification);
      } catch (notificationError) {
        console.error('[ConfinementService] Notification error:', notificationError);
        // Continue even if notifications fail
      }
      
      return { success: true, newCash: character.money, hp: character.hp };
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  // Hospital operations
  static async getHospitalCount() {
    const now = this.now();
    return await Hospital.count({ where: { releasedAt: { [Op.gt]: now } } });
  }
} 