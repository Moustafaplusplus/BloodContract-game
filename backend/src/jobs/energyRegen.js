import cron from 'node-cron';
import { Op } from 'sequelize';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';
import { io } from '../socket.js';

const ENERGY_REGEN_RATE = 1;

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
        char.energy = Math.min(char.energy + ENERGY_REGEN_RATE, char.maxEnergy);
        await char.save();
        emitEnergyUpdate(char);
      }
    } catch (err) { 
      console.error('[EnergyRegen] failed', err); 
    }
  });
} 