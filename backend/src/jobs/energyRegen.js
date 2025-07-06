// backend/src/jobs/energyRegen.js
import cron          from 'node-cron';
import { Op }        from 'sequelize';
import Character     from '../models/character.js';

/**
 * +1 energy per minute, capped at 100.
 */
export function startEnergyRegen() {
  cron.schedule('*/1 * * * *', async () => {
    await Character.increment(
      { energy: 1 },
      {
        where: {
          energy: { [Op.lt]: 100 },   // ✅ proper operator
        },
      },
    );
    console.log('[ENERGY] +1 energy to everyone');
  });
}
