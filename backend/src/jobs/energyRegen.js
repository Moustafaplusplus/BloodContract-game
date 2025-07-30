import cron from 'node-cron';
import { Op } from 'sequelize';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';
import { io } from '../socket.js';

const ENERGY_REGEN_PERCENTAGE = 1.5; // 1.5% of max energy per minute

function emitEnergyUpdate(char) {
  io?.to(`user:${char.userId}`).emit('energyUpdate', {
    energy:    char.energy,
    maxEnergy: char.maxEnergy,
  });
}

export function startEnergyRegen() {
  cron.schedule('* * * * *', async () => {
    try {
      const chars = await Character.findAll({
        where: { energy: { [Op.lt]: sequelize.col('maxEnergy') } },
      });
      for (const char of chars) {
        const regenAmount = Math.floor(char.maxEnergy * (ENERGY_REGEN_PERCENTAGE / 100));
        char.energy = Math.min(char.energy + regenAmount, char.maxEnergy);
        await char.save();
        emitEnergyUpdate(char);
      }
    } catch (err) { 
      console.error('[EnergyRegen] failed', err); 
    }
  });
} 