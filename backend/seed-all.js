#!/usr/bin/env node

import { execSync } from 'child_process';

async function seedAll() {
  console.log('🌱 Starting database seeding...');
  
  try {
    console.log('📦 Running all seeders...');
    execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
    console.log('🎉 All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Failed to run seeders:', error.message);
    process.exit(1);
  }
}

seedAll().catch(console.error); 