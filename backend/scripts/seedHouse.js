// backend/scripts/seed-houses.js
//-------------------------------------------------------
// Seeds the starter houses into your Postgres DB
//-------------------------------------------------------

import { sequelize } from '../src/config/db.js';
import { seedHouses } from '../src/features/houses.js';

(async () => {
  try {
    // Ensure all Sequelize tables exist
    await sequelize.sync();

    // Bulk-insert the default houses
    await seedHouses();

    console.log('🏠  Houses seeded successfully ✅');
  } catch (err) {
    console.error('❌  Seed failed:', err);
  } finally {
    await sequelize.close();
  }
})();
