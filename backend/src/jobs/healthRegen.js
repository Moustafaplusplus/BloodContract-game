// backend/src/jobs/healthRegen.js
import cron from 'node-cron';
import { Op } from 'sequelize';
import Character from '../models/character.js';

const MAX_HEALTH    = 100;   // HP cap
const HEALTH_REGEN  = 1;     // +1 HP per tick

/**
 * Grants passive health regen every 3 minutes to any character
 * whose hp is below MAX_HEALTH.
 */
export function startHealthRegen() {
  // */3 * * * *  ==> every 3 minutes
  cron.schedule('*/3 * * * *', async () => {
    // 1️⃣ bulk-increment everyone below the cap
    await Character.increment(
      { hp: HEALTH_REGEN },
      {
        where: { hp: { [Op.lt]: MAX_HEALTH } },
      },
    );

    // 2️⃣ clamp any rows that might have exceeded MAX_HEALTH
    await Character.update(
      { hp: MAX_HEALTH },
      {
        where: { hp: { [Op.gt]: MAX_HEALTH } },
      },
    );

    console.log('[HEALTH] +1 HP to everyone < 100');
  });
}
