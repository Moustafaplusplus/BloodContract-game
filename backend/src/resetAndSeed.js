import { sequelize } from './config/db.js';
import { getDefaultAvatarUrl } from './config/defaultAvatars.js';
import { Gang } from './models/Gang.js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, ''),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.log('✅ Firebase Admin SDK already initialized');
}

// Import all models from the index file to ensure proper registration
import {
  User,
  Character,
  Statistic,
  Crime,
  CrimeLog,
  Jail,
  Hospital,
  Fight,
  BankAccount,
  BankTxn,
  InventoryItem,
  Car,
  House,
  GangMember,
  GangJoinRequest,
  Job,
  JobHistory,
  BlackMarketListing,
  BlackcoinTransaction,
  BlackcoinPackage,
  MoneyPackage,
  Dog,
  UserDog,
  Message,
  Friendship,
  IpTracking,
  MinistryMission,
  UserMinistryMission,
  Suggestion,
  GlobalMessage,
  BloodContract,
  ProfileRating,
  Task,
  UserTaskProgress,
  Notification,
  SpecialItem,
  LoginGift,
  LoginGiftItem,
  UserLoginGift
} from './models/index.js';

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
    
    // Verify that BloodContract table was created
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    const normalizedTables = tables.map(t => (typeof t === 'object' ? t.tableName : t)).map(t => t.toLowerCase());
    
    if (normalizedTables.includes('blood_contracts')) {
      console.log('✅ BloodContract table created successfully');
    } else {
      console.warn('⚠️  BloodContract table not found in created tables');
      console.log('📋 Created tables:', normalizedTables);
    }
    
    console.log('✅ All tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

async function createFirebaseUser(email, password, displayName) {
  try {
    // Create user in Firebase
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: true
    });
    
    console.log(`✅ Firebase user created: ${email} (UID: ${userRecord.uid})`);
    return userRecord.uid;
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`⚠️  Firebase user already exists: ${email}`);
      // Get the existing user's UID
      const userRecord = await admin.auth().getUserByEmail(email);
      return userRecord.uid;
    }
    console.error(`❌ Error creating Firebase user ${email}:`, error.message);
    throw error;
  }
}

async function seedTestData() {
  try {
    console.log('🌱 Seeding test data...');
    
    // Create admin user in Firebase first
    const adminFirebaseUid = await createFirebaseUser(
      'admin@hitman.com',
      'admin123',
      'Admin User'
    );
    
    // Create admin user in database
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@hitman.com',
      password: 'admin123',
      age: 25,
      gender: 'male',
      isAdmin: true,
      avatarUrl: getDefaultAvatarUrl('male'),
      firebaseUid: adminFirebaseUid,
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
    
    // Create Firebase users and database users
    const users = [];
    for (const userData of testUsers) {
      const email = `${userData.username}@user.com`;
      
      // Create Firebase user
      const firebaseUid = await createFirebaseUser(
        email,
        '123456',
        userData.username
      );
      
      // Create database user
      const user = await User.create({
        username: userData.username,
        email: email,
        password: '123456',
        age: 25,
        gender: 'male',
        isAdmin: false,
        avatarUrl: getDefaultAvatarUrl('male'),
        firebaseUid: firebaseUid,
      });
      
      users.push(user);
    }
    
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
    
    // Seed login gifts data
    console.log('🎁 Seeding login gifts data...');
    const loginGifts = [];
    
    // Create 15 days of login gifts with default values
    for (let day = 1; day <= 15; day++) {
      loginGifts.push({
        dayNumber: day,
        expReward: 0,
        moneyReward: 0,
        blackcoinReward: 0,
        isActive: true
      });
    }
    
    await LoginGift.bulkCreate(loginGifts);
    console.log('✅ Login gifts created: 15 days with default rewards');
    
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
    console.log('   - All users: Created in both Firebase and database with linked firebaseUid');
    console.log('   - All tables: fresh and clean');
    console.log('\n🚀 Ready to start the application!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Database reset failed:', error);
    process.exit(1);
  }
}

main(); 