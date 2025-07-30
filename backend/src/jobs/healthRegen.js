import cron from 'node-cron';
import { Op } from 'sequelize';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';
import { io } from '../socket.js';

const HEALTH_REGEN_PERCENTAGE = 1.5; // 1.5% of max HP per minute

function emitHealthUpdate(char) {
  io?.to(`user:${char.userId}`).emit('healthUpdate', {
    hp: char.hp,
    maxHp: char.getMaxHp(),
  });
}

export function startHealthRegen() {
  cron.schedule('* * * * *', async () => {
    try {
      const chars = await Character.findAll({
        where: { hp: { [Op.lt]: sequelize.col('maxHp') } },
      });
      
      for (const char of chars) {
        const maxHp = char.getMaxHp();
        const regenAmount = Math.floor(maxHp * (HEALTH_REGEN_PERCENTAGE / 100));
        char.hp = Math.min(char.hp + regenAmount, maxHp);
        await char.save();
        emitHealthUpdate(char);
      }
    } catch (err) { 
      console.error('[HealthRegen] failed', err); 
    }
  });
} 