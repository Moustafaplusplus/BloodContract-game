import { sequelize } from './src/config/db.js';
import './src/models/User.js';
import './src/models/Character.js';
import './src/models/Gang.js';
import './src/models/House.js';
import './src/models/Car.js';
import './src/models/Shop.js';
import './src/models/BlackMarket.js';
import './src/models/Achievement.js';
import './src/models/Crime.js';
import './src/models/Inventory.js';

(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ All tables dropped and recreated!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error syncing tables:', err);
    process.exit(1);
  }
})(); 