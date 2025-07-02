// File: backend/src/jobs/staminaRegen.js

import Character from '../models/character.js';
import { sequelize } from '../config/db.js';

const TICK_INTERVAL = 60 * 1000; // 60 seconds
const STAMINA_REGEN = 2;
const MAX_STAMINA = 100;

const runStaminaRegen = async () => {
  try {
    await sequelize.authenticate();
    console.log('⏳ Stamina Regen Job started...');

    setInterval(async () => {
      try {
        const characters = await Character.findAll();

        for (const char of characters) {
          if (char.stamina < MAX_STAMINA) {
            char.stamina = Math.min(char.stamina + STAMINA_REGEN, MAX_STAMINA);
            await char.save();
            console.log(`🔋 +${STAMINA_REGEN} → userId=${char.userId}`);
          }
        }
      } catch (tickError) {
        console.error('❌ Error in stamina tick:', tickError);
      }
    }, TICK_INTERVAL);

  } catch (err) {
    console.error('❌ Stamina Regen Initialization Error:', err);
  }
};

runStaminaRegen();

export default runStaminaRegen;