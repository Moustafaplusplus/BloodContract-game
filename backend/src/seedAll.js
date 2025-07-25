import { sequelize } from './config/db.js';
import { User } from './models/User.js';
import { Character } from './models/Character.js';
import { Statistic } from './models/Statistic.js';
import { Crime, CrimeLog } from './models/Crime.js';
import { Jail, Hospital } from './models/Confinement.js';
import { Fight } from './models/Fight.js';
import { BankAccount, BankTxn } from './models/Bank.js';
import { InventoryItem } from './models/Inventory.js';
import { Weapon, Armor } from './models/Shop.js';
import { House, UserHouse } from './models/House.js';
import { Car } from './models/Car.js';
import { Job, JobHistory } from './models/Job.js';
import { BlackMarketListing } from './models/BlackMarketListing.js';
import { BlackcoinTransaction, BlackcoinPackage } from './models/Blackcoin.js';
import { Dog, UserDog } from './models/Dog.js';
import { Message } from './models/Message.js';
import { Friendship } from './models/Friendship.js';
import { IpTracking } from './models/IpTracking.js';
import { MinistryMission, UserMinistryMission } from './models/MinistryMission.js';
import { Suggestion } from './models/Suggestion.js';

console.log('🚀 Starting database reset and seeding process...');

async function dropAndRecreateDatabase() {
  try {
    console.log('🗑️  Dropping and recreating all tables...');
    await sequelize.sync({ force: true });
    console.log('✅ Database schema dropped and recreated successfully');
  } catch (error) {
    console.error('❌ Error during database reset:', error);
    throw error;
  }
}

async function seedBlackcoinPackages() {
  try {
    console.log('💰 Seeding blackcoin packages...');
    await BlackcoinPackage.bulkCreate([
      { name: 'Small Blackcoin Pack', usdPrice: 2.99, blackcoinAmount: 30, bonus: 5, isActive: true },
      { name: 'Medium Blackcoin Pack', usdPrice: 7.99, blackcoinAmount: 90, bonus: 15, isActive: true },
      { name: 'Large Blackcoin Pack', usdPrice: 19.99, blackcoinAmount: 250, bonus: 50, isActive: true },
      { name: 'Mega Blackcoin Pack', usdPrice: 49.99, blackcoinAmount: 700, bonus: 150, isActive: true }
    ]);
    console.log('✅ Blackcoin packages seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding blackcoin packages:', error);
    throw error;
  }
}

async function seedShopItems() {
  try {
    console.log('🛒 Seeding shop items...');
    
    // Remove weapon and armor seeding - now managed through admin panel
    console.log('✅ Shop items seeding skipped (managed through admin panel)');
  } catch (error) {
    console.error('❌ Error seeding shop items:', error);
    throw error;
  }
}

async function seedCrimes() {
  try {
    console.log('🦹‍♂️ Seeding crimes...');
    await Crime.destroy({ where: {} });
    // No crimes are seeded by default
    console.log('✅ Crimes cleared, none seeded');
  } catch (error) {
    console.error('❌ Error seeding crimes:', error);
    throw error;
  }
}

async function seedHouses() {
  console.log('🏠 Skipping houses seeding (managed via admin panel)');
}
async function seedCars() {
  console.log('🚗 Skipping cars seeding (managed via admin panel)');
}
async function seedDogs() {
  console.log('🐕 Skipping dogs seeding (managed via admin panel)');
}


async function seedUsersAndCharacters() {
  try {
    console.log('👤 Seeding users and characters...');
    
    // Create admin user first
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@hitman.com',
      password: 'admin123',
      age: 25,
      gender: 'male',
      isAdmin: true,
    });

    // Create admin character
    await Character.create({
      userId: adminUser.id,
      name: adminUser.username,
      level: 50,
      money: 1000000,
      blackcoins: 1000,
      strength: 200,
      defense: 150,
      maxEnergy: 200,
      energy: 200,
      maxHp: 6000,
      hp: 6000,
    });

    console.log('✅ Admin user created: admin@hitman.com / admin123');

    // Generate 20 regular users with diverse usernames and levels
    const userData = [
      { username: 'shadow_hunter', level: 5 },
      { username: 'silent_assassin', level: 8 },
      { username: 'night_stalker', level: 12 },
      { username: 'ghost_runner', level: 15 },
      { username: 'stealth_master', level: 18 },
      { username: 'dark_phantom', level: 22 },
      { username: 'silent_death', level: 25 },
      { username: 'shadow_blade', level: 28 },
      { username: 'night_wolf', level: 32 },
      { username: 'stealth_ninja', level: 35 },
      { username: 'dark_assassin', level: 38 },
      { username: 'silent_ghost', level: 42 },
      { username: 'shadow_stalker', level: 45 },
      { username: 'night_phantom', level: 48 },
      { username: 'stealth_hunter', level: 52 },
      { username: 'dark_ninja', level: 55 },
      { username: 'silent_wolf', level: 58 },
      { username: 'shadow_master', level: 62 },
      { username: 'night_assassin', level: 65 },
      { username: 'stealth_phantom', level: 68 }
    ];

    const users = await User.bulkCreate(
      userData.map((user, i) => ({
        username: user.username,
        email: `user${user.level}@user.com`,
        password: 'pass123',
        age: 20 + (i % 15),
        gender: i % 2 === 0 ? 'male' : 'female',
        isAdmin: false,
      })), 
      { individualHooks: true }
    );

    // Create 20 characters, synced with users
    const characterData = users.map((user, i) => ({
      userId: user.id,
      name: user.username,
      level: userData[i].level,
      money: 1000 + (userData[i].level * 100),
    }));
    await Character.bulkCreate(characterData);
    console.log('✅ Users and characters seeded successfully');
    return { users, characters: characterData };
  } catch (error) {
    console.error('❌ Error seeding users and characters:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // Step 1: Drop and recreate database
    await dropAndRecreateDatabase();

    // Step 2: Seed all game data
    console.log('\n🌱 Starting data seeding process...');
    
    await Promise.all([
      seedShopItems(),
      seedCrimes(),
      seedBlackcoinPackages(),
      seedHouses(),
      seedCars(),
      seedDogs(),
    ]);

    await seedUsersAndCharacters();

    console.log('\n🎉 All seeding completed successfully!');
    console.log('📊 Database summary:');
    console.log('   - Shop items: Managed through admin panel');
    console.log('   - Crimes: 11 different crime types');
    console.log('   - Jobs: Managed through admin panel');
    console.log('   - Users: 21 users (1 admin + 20 regular) with characters');
    console.log('   - Admin user: admin@hitman.com / admin123');
    console.log('   - Suggestions system: Ready for use');
    console.log('\n🚀 Ready to start the application!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  }
}

main(); 