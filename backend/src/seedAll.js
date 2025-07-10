import { sequelize } from './config/db.js';
import { User } from './models/User.js';
import { Character } from './models/Character.js';
import { Gang, GangMember } from './models/Gang.js';
import { House } from './models/House.js';
import { Car } from './models/Car.js';
import { Weapon, Armor } from './models/Shop.js';
import { BlackMarketItem } from './models/BlackMarket.js';
import { Achievement } from './models/Achievement.js';
import { Crime } from './models/Crime.js';
import { ShopService } from './services/ShopService.js';
import { CrimeService } from './services/CrimeService.js';
import { HouseService } from './services/HouseService.js';
import { CarService } from './services/CarService.js';
import { AchievementService } from './services/AchievementService.js';
import { BlackMarketService } from './services/BlackMarketService.js';

async function wipeAll() {
  // Truncate tables in dependency order for PostgreSQL
  await Promise.all([
    GangMember.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }),
    Gang.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }),
    Character.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }),
    User.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }),
    House.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }),
    Car.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }),
    Weapon.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }),
    Armor.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }),
    BlackMarketItem.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }),
    Achievement.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }),
    Crime.destroy({ where: {}, truncate: true, cascade: true, restartIdentity: true }),
  ]);
  console.log('🧹 All tables truncated');
}

async function seedUsersAndCharacters() {
  const users = await User.bulkCreate([
    { username: 'admin', nickname: 'الزعيم', email: 'admin@test.com', age: 30, password: 'admin123', bio: 'مدير اللعبة', avatarUrl: '/avatars/default.png' },
    { username: 'player1', nickname: 'الذئب', email: 'wolf@test.com', age: 22, password: 'wolfpass', bio: 'لاعب محترف', avatarUrl: '/avatars/default.png' },
    { username: 'player2', nickname: 'النمر', email: 'tiger@test.com', age: 25, password: 'tigerpass', bio: 'مغامر', avatarUrl: '/avatars/default.png' },
    { username: 'player3', nickname: 'الصقر', email: 'falcon@test.com', age: 19, password: 'falconpass', bio: 'مبتدئ', avatarUrl: '/avatars/default.png' },
    { username: 'player4', nickname: 'الثعلب', email: 'fox@test.com', age: 28, password: 'foxpass', bio: 'مخادع', avatarUrl: '/avatars/default.png' },
  ], { individualHooks: true });
  const characters = await Character.bulkCreate([
    { userId: users[0].id, name: 'هيتمان', level: 10, exp: 5000, money: 10000, strength: 30, defense: 20, maxEnergy: 150, energy: 150, maxHp: 120, hp: 120, quote: 'أنا الأسطورة!' },
    { userId: users[1].id, name: 'ذئب الليل', level: 5, exp: 1200, money: 3000, strength: 18, defense: 12, maxEnergy: 110, energy: 110, maxHp: 100, hp: 100, quote: 'لا أحد يوقفني.' },
    { userId: users[2].id, name: 'نمر الغابة', level: 7, exp: 2500, money: 5000, strength: 22, defense: 15, maxEnergy: 120, energy: 120, maxHp: 110, hp: 110, quote: 'القوة في التنوع.' },
    { userId: users[3].id, name: 'صقر الصحراء', level: 2, exp: 200, money: 800, strength: 12, defense: 8, maxEnergy: 90, energy: 90, maxHp: 90, hp: 90, quote: 'البداية فقط.' },
    { userId: users[4].id, name: 'ثعلب المدينة', level: 3, exp: 400, money: 1200, strength: 14, defense: 10, maxEnergy: 95, energy: 95, maxHp: 95, hp: 95, quote: 'الدهاء نصف القوة.' },
  ]);
  console.log('👤 Seeded users & characters');
  return { users, characters };
}

async function seedGangs(users) {
  const gangs = await Gang.bulkCreate([
    { name: 'العقارب', description: 'عصابة العقارب السامة', leaderId: users[1].id, money: 5000, level: 3, exp: 800, maxMembers: 10 },
    { name: 'الصقور', description: 'عصابة الصقور السريعة', leaderId: users[2].id, money: 3000, level: 2, exp: 400, maxMembers: 8 },
  ]);
  await GangMember.bulkCreate([
    { gangId: gangs[0].id, userId: users[1].id, role: 'LEADER' },
    { gangId: gangs[0].id, userId: users[3].id, role: 'MEMBER' },
    { gangId: gangs[1].id, userId: users[2].id, role: 'LEADER' },
    { gangId: gangs[1].id, userId: users[4].id, role: 'MEMBER' },
  ]);
  console.log('🦹‍♂️ Seeded gangs & members');
}

async function main() {
  await sequelize.authenticate();
  await wipeAll();
  // Seed core game data
  await Promise.all([
    ShopService.seedShopItems(),
    CrimeService.seedCrimes(),
    HouseService.seedHouses(),
    CarService.seedCars(),
    AchievementService.seedAchievements(),
    BlackMarketService.seedBlackMarketItems(),
  ]);
  // Seed users, characters, gangs
  const { users } = await seedUsersAndCharacters();
  await seedGangs(users);
  console.log('🌱 All data seeded!');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); }); 