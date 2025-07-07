// scripts/seedCrimes.js – one‑off CLI to seed crimes into the DB
// -----------------------------------------------------------------------------
// Usage:
//   npm run seed:crimes        # via package.json script below
//   OR
//   node --no-warnings --experimental-modules scripts/seedCrimes.js
// -----------------------------------------------------------------------------
import dotenv from 'dotenv';
import { sequelize } from '../src/config/db.js';
import { seedCrimes } from '../src/features/crimes.js';

// load .env first (DB creds, etc.)
dotenv.config();

(async () => {
  try {
    console.log('⏳ Connecting to Postgres …');
    await sequelize.authenticate();
    console.log('🗄️  DB connection OK');

    // make sure the tables exist
    await sequelize.sync();

    // seed!
    await seedCrimes();

    console.log('🌱 Crimes seeding complete.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
