import { seedBots } from './src/seedBots.js';

console.log('🤖 Starting bot seeding process...');

seedBots()
  .then(() => {
    console.log('✅ Bot seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Bot seeding failed:', error);
    process.exit(1);
  }); 