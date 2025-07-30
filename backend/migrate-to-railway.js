#!/usr/bin/env node

/**
 * Railway Database Migration Script
 * This script helps migrate your local database to Railway
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

console.log('🚀 Railway Database Migration Script');
console.log('=====================================\n');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set');
  console.log('Please set your Railway DATABASE_URL in your environment variables');
  process.exit(1);
}

console.log('✅ DATABASE_URL is configured');

// Create Sequelize instance for Railway
const railwaySequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 5000,
    evict: 15000,
  },
});

async function testConnection() {
  try {
    await railwaySequelize.authenticate();
    console.log('✅ Successfully connected to Railway database');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to Railway database:', error.message);
    return false;
  }
}

async function runMigrations() {
  try {
    console.log('\n🗄️ Running database migrations...');
    
    // Import and run migrations
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.cjs'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = await import(path.join(migrationsDir, file));
      
      if (migration.up) {
        await migration.up(railwaySequelize.getQueryInterface(), Sequelize);
        console.log(`✅ Completed: ${file}`);
      }
    }

    console.log('✅ All migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

async function seedDatabase() {
  try {
    console.log('\n🌱 Seeding database...');
    
    // Import the seed script
    const { resetAndSeed } = await import('./src/resetAndSeed.js');
    await resetAndSeed();
    
    console.log('✅ Database seeded successfully');
    return true;
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('\n📋 Starting migration process...\n');

  // Step 1: Test connection
  const connectionOk = await testConnection();
  if (!connectionOk) {
    process.exit(1);
  }

  // Step 2: Run migrations
  const migrationsOk = await runMigrations();
  if (!migrationsOk) {
    process.exit(1);
  }

  // Step 3: Ask about seeding
  console.log('\n❓ Do you want to seed the database with initial data? (y/n)');
  process.stdin.once('data', async (data) => {
    const answer = data.toString().trim().toLowerCase();
    
    if (answer === 'y' || answer === 'yes') {
      const seedingOk = await seedDatabase();
      if (!seedingOk) {
        process.exit(1);
      }
    }

    console.log('\n🎉 Railway migration completed successfully!');
    console.log('🌐 Your database is now ready on Railway');
    process.exit(0);
  });
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

main().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}); 