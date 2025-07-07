import { sequelize } from '../src/config/db.js';
import { loadStarterWeapons, loadStarterArmors } from '../src/features/shop.js';

(async () => {
  try {
    await sequelize.sync();        // ensures tables exist
    await loadStarterWeapons();
    await loadStarterArmors();
    console.log('✅ Store items seeded');
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
})();