import { sequelize } from './src/config/db.js';
import { User } from './src/models/User.js';
import { Statistic } from './src/models/Statistic.js';

async function testStatistics() {
  try {
    console.log('Testing Statistics creation...');
    
    // First, let's check if user 12 exists
    const user = await User.findByPk(12);
    if (!user) {
      console.log('User 12 does not exist, creating a test user...');
      const testUser = await User.create({
        username: 'testuser12',
        email: 'test12@example.com',
        password: 'password123',
        age: 25,
        gender: 'male'
      });
      console.log(`Created test user with ID: ${testUser.id}`);
    } else {
      console.log(`User 12 exists: ${user.username}`);
    }
    
    // Now try to create a statistic for user 12
    console.log('Attempting to create statistic for user 12...');
    const stat = await Statistic.create({
      userId: 12,
      crimes: 0,
      fights: 0,
      wins: 0,
      losses: 0,
      daysOnline: 0
    });
    
    console.log('✅ Successfully created statistic:', stat.toJSON());
    
    // Test updating the statistic
    console.log('Testing statistic update...');
    stat.crimes = 5;
    await stat.save();
    console.log('✅ Successfully updated statistic');
    
    // Test finding the statistic
    const foundStat = await Statistic.findOne({ where: { userId: 12 } });
    console.log('✅ Successfully found statistic:', foundStat.toJSON());
    
  } catch (error) {
    console.error('❌ Error testing statistics:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await sequelize.close();
  }
}

testStatistics(); 