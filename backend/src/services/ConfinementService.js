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
    // First get the character ID for this user
    const character = await Character.findOne({ where: { userId } });
    if (!character) return { inJail: false };
    
    const rec = await Jail.findOne({ 
      where: { userId: userId, releasedAt: { [Op.gt]: this.now() } } 
    });
    
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
      // First get the character ID for this user
      const character = await Character.findOne({ where: { userId } });
      if (!character) {
        return { inHospital: false };
      }
      
      const now = this.now();
      
      const rec = await Hospital.findOne({ 
        where: { userId: userId, releasedAt: { [Op.gt]: now } } 
      });
      
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
      console.error('[HOSPITAL_SERVICE] Error in getHospitalStatus:', error);
      console.error('[HOSPITAL_SERVICE] Error stack:', error.stack);
      throw error;
    }
  }

  static async healOut(userId, fullHeal = true) {
    const t = await sequelize.transaction();
    try {
      console.log('[ConfinementService] Starting healOut for userId:', userId);
      
      // First get the character ID for this user
      const character = await Character.findOne({ where: { userId }, transaction: t });
      if (!character) {
        console.log('[ConfinementService] Character not found for userId:', userId);
        await t.rollback();
        throw new Error("Character not found");
      }
      
      console.log('[ConfinementService] Found character:', character.id);
      
      const rec = await Hospital.findOne({ 
        where: { userId: userId, releasedAt: { [Op.gt]: this.now() } }, 
        transaction: t, 
        lock: t.LOCK.UPDATE 
      });
      
      if (!rec) {
        console.log('[ConfinementService] No active hospital record found for userId:', userId);
        await t.rollback();
        throw new Error("Not in hospital");
      }
      
      console.log('[ConfinementService] Found hospital record:', rec.id);
      
      const remainingSeconds = this.secondsLeft(rec.releasedAt);
      const minutesLeft = Math.ceil(remainingSeconds / 60);
      // Fixed heal cost: 100 money per minute
      const cost = minutesLeft * 100;
      
      console.log('[ConfinementService] Heal cost:', cost, 'Character money:', character.money);
      
      if (character.money < cost) {
        console.log('[ConfinementService] Insufficient funds for heal');
        await t.rollback();
        throw new Error("Insufficient funds");
      }

      character.money -= cost;
      
      // Restore 100% HP if paid heal, 80% if natural
      const maxHp = typeof character.getMaxHp === 'function' ? character.getMaxHp() : character.maxHp;
      character.hp = fullHeal ? maxHp : Math.floor(maxHp * 0.8);
      
      console.log('[ConfinementService] Updated character - Money:', character.money, 'HP:', character.hp);
      
      await character.save({ transaction: t });
      await rec.destroy({ transaction: t });

      console.log('[ConfinementService] Committing transaction...');
      await t.commit();
      console.log('[ConfinementService] Transaction committed successfully');
      
      // Emit hospital leave event
      if (io) {
        io.to(`user:${userId}`).emit('hospital:leave');
      }

      // Create notification for hospital release (optional - don't fail if this fails)
      try {
        const notification = await NotificationService.createOutOfHospitalNotification(userId);
        emitNotification(userId, notification);
        console.log('[ConfinementService] Hospital notification created successfully');
      } catch (notificationError) {
        console.error('[ConfinementService] Notification error (non-critical):', notificationError);
        // Continue even if notifications fail - this should not break the heal process
      }
      
      return { success: true, newCash: character.money, hp: character.hp };
    } catch (err) {
      console.error('[ConfinementService] Error in healOut:', err);
      console.error('[ConfinementService] Error stack:', err.stack);
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