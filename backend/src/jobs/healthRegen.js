import cron from 'node-cron';
import { Op } from 'sequelize';
import { Character } from '../models/Character.js';
import { sequelize } from '../config/db.js';

const HEALTH_REGEN_RATE = 2;

export function startHealthRegen() {
  cron.schedule('*/2 * * * *', async () => {
    try {
      await Character.increment({ hp: HEALTH_REGEN_RATE }, {
        where: { hp: { [Op.lt]: sequelize.col('maxHp') } },
      });
    } catch (err) { 
      console.error('[HealthRegen] failed', err); 
    }
  });
} 