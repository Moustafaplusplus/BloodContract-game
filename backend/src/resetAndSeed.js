import { sequelize } from './config/db.js';
import { User } from './models/User.js';
import { Character } from './models/Character.js';

import { Statistic } from './models/Statistic.js';
import { Crime, CrimeLog } from './models/Crime.js';
import { Jail, Hospital } from './models/Confinement.js';
import { Fight } from './models/Fight.js';
import { BankAccount, BankTxn } from './models/Bank.js';
import { InventoryItem } from './models/Inventory.js';
import { Car } from './models/Car.js';
import { House } from './models/House.js';
import { Gang, GangMember, GangJoinRequest } from './models/Gang.js';
import { Job, JobHistory } from './models/Job.js';
import { JobDefinition } from './models/JobDefinition.js';
import { BlackMarketListing } from './models/BlackMarketListing.js';
import { BlackcoinTransaction, BlackcoinPackage } from './models/Blackcoin.js';
import { MoneyPackage } from './models/MoneyPackage.js';
import { Dog, UserDog } from './models/Dog.js';
import { Message } from './models/Message.js';
import { Friendship } from './models/Friendship.js';
import { IpTracking } from './models/IpTracking.js';
import { MinistryMission, UserMinistryMission } from './models/MinistryMission.js';
import { Suggestion } from './models/Suggestion.js';
import { GlobalMessage } from './models/GlobalMessage.js';
import BloodContractFactory from './models/BloodContract.js';
import { ProfileRating } from './models/ProfileRating.js';
import { Task, UserTaskProgress } from './models/Task.js';
import { Notification } from './models/Notification.js';
import { SpecialItem } from './models/SpecialItem.js';

console.log('🚀 Starting complete database reset and seeding process...');

async function dropAllTables() {
  try {
    console.log('🗑️  Dropping all tables...');
    
    // Get all table names
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    
    // Normalize table names for Postgres (lowercase, no schema)
    const normalizedTables = tables.map(t => (typeof t === 'object' ? t.tableName : t)).map(t => t.toLowerCase());
    
    console.log(`📋 Found ${normalizedTables.length} tables to drop`);
    
    // Drop all tables in reverse dependency order
    for (const table of normalizedTables) {
      try {
        await sequelize.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (err) {
        console.warn(`⚠️  Could not drop table ${table}:`, err.message);
      }
    }
    
    console.log('✅ All tables dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    throw error;
  }
}

async function createAllTables() {
  try {
    console.log('🏗️  Creating all tables from scratch...');
    
    // Force sync all models to create tables
    await sequelize.sync({ force: true });
    
    console.log('✅ All tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');
    
    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@hitman.com',
      password: 'admin123',
      age: 25,
      gender: 'male',
      isAdmin: true,
    });
    
    // Create admin character
    const adminMaxHp = 1000 + ((1 - 1) * 100); // 1000
    await Character.create({
      userId: adminUser.id,
      name: adminUser.username,
      level: 1,
      money: 1000000,
      blackcoins: 1000,
      strength: 10,
      defense: 5,
      maxEnergy: 100,
      energy: 100,
      maxHp: adminMaxHp,
      hp: adminMaxHp,
    });
    
    console.log('✅ Admin user created: admin@hitman.com / admin123 (Level 1)');
    
    // Create test users with different levels
    const testUsers = [
      { username: 'user1', level: 1 },
      { username: 'user10', level: 10 },
      { username: 'user50', level: 50 },
      { username: 'user100', level: 100 }
    ];
    
    const users = await User.bulkCreate(
      testUsers.map((user) => ({
        username: user.username,
        email: `${user.username}@user.com`,
        password: '123456',
        age: 25,
        gender: 'male',
        isAdmin: false,
      })),
      { individualHooks: true }
    );
    
    // Create characters with proper stat calculations
    const characterData = users.map((user, i) => {
      const level = testUsers[i].level;
      const maxHp = 1000 + ((level - 1) * 100);
      return {
        userId: user.id,
        name: user.username,
        level: level,
        money: 1000 + (level * 100),
        blackcoins: level * 10,
        strength: 10 + (level * 2),
        defense: 5 + level,
        maxEnergy: 100,
        energy: 100,
        maxHp: maxHp,
        hp: maxHp,
      };
    });
    
    await Character.bulkCreate(characterData);
    
    console.log('✅ Test users created:');
    console.log('   - user1@user.com / 123456 (Level 1, HP: 1000)');
    console.log('   - user10@user.com / 123456 (Level 10, HP: 1900)');
    console.log('   - user50@user.com / 123456 (Level 50, HP: 5900)');
    console.log('   - user100@user.com / 123456 (Level 100, HP: 10900)');
    
    return { users, characters: characterData };
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Drop all tables
    await dropAllTables();
    
    // Create all tables from scratch
    await createAllTables();
    
    // Seed test data
    await seedTestData();
    
    console.log('\n🎉 Database reset and seeding completed successfully!');
    console.log('📊 Database summary:');
    console.log('   - Users: 5 users (1 admin + 4 test users) with characters');
    console.log('   - Admin user: admin@hitman.com / admin123 (Level 1)');
    console.log('   - Test users: user1@user.com, user10@user.com, user50@user.com, user100@user.com (password: 123456)');
    console.log('   - All tables: fresh and clean');
    console.log('\n🚀 Ready to start the application!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Database reset failed:', error);
    process.exit(1);
  }
}

main(); 