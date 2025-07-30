import { sequelize } from './config/db.js';
import { User } from './models/User.js';
import { Character } from './models/Character.js';
import { Statistic } from './models/Statistic.js';

// Arabic male names
const arabicMaleNames = [
  'أحمد', 'محمد', 'علي', 'عمر', 'يوسف', 'إبراهيم', 'عبدالله', 'خالد', 'سعد', 'فهد',
  'عبدالرحمن', 'عبدالعزيز', 'عبدالرزاق', 'عبدالوهاب', 'عبدالسلام', 'عبدالمنعم', 'عبدالغني',
  'سلطان', 'أمير', 'ملك', 'شاه', 'بطل', 'فارس', 'جندي', 'محارب', 'قائد', 'زعيم',
  'حكيم', 'عارف', 'عالم', 'مفكر', 'فيلسوف', 'شاعر', 'كاتب', 'مؤرخ', 'مدرس',
  'بدر', 'قمر', 'نجم', 'شمس', 'بدران', 'قمران', 'نجمان', 'شمسان', 'بدرون', 'قمرون',
  'طارق', 'مازن', 'راشد', 'نواف', 'فيصل', 'طلال', 'سلمان', 'عبدالرحيم', 'عبدالرزاق', 'عبدالواحد',
  'عبدالوهاب', 'عبدالسلام', 'عبدالمنعم', 'عبدالغني', 'عبدالفتاح', 'عبداللطيف', 'عبدالرحمن', 'عبدالعزيز',
  'عبدالمجيد', 'عبدالرؤوف', 'عبدالستار', 'عبدالغفار', 'عبدالرزاق', 'عبدالوهاب', 'عبدالسلام', 'عبدالمنعم'
];

// Arabic female names
const arabicFemaleNames = [
  'فاطمة', 'عائشة', 'خديجة', 'زينب', 'مريم', 'نور', 'رنا', 'سارة', 'ليلى', 'نورا',
  'أمينة', 'حليمة', 'زهرة', 'فريدة', 'جميلة', 'كريمة', 'لطيفة', 'ماجدة', 'نادية',
  'فاطمة', 'عائشة', 'خديجة', 'زينب', 'مريم', 'نور', 'رنا', 'سارة', 'ليلى', 'نورا',
  'أمينة', 'حليمة', 'زهرة', 'فريدة', 'جميلة', 'كريمة', 'لطيفة', 'ماجدة', 'نادية',
  'فاطمة', 'عائشة', 'خديجة', 'زينب', 'مريم', 'نور', 'رنا', 'سارة', 'ليلى', 'نورا',
  'أمينة', 'حليمة', 'زهرة', 'فريدة', 'جميلة', 'كريمة', 'لطيفة', 'ماجدة', 'نادية',
  'فاطمة', 'عائشة', 'خديجة', 'زينب', 'مريم', 'نور', 'رنا', 'سارة', 'ليلى', 'نورا',
  'أمينة', 'حليمة', 'زهرة', 'فريدة', 'جميلة', 'كريمة', 'لطيفة', 'ماجدة', 'نادية'
];

// Arabic male nicknames
const arabicMaleNicknames = [
  'الأسد', 'الفهد', 'الذئب', 'الصقر', 'العقاب', 'النسر', 'الطائر', 'الطير', 'الطائر الحر',
  'الأسد الجريح', 'الفهد الأسود', 'الذئب الوحيد', 'الصقر الجارح', 'العقاب الذهبي', 'النسر الأحمر',
  'الأسد الأبيض', 'الفهد المرقط', 'الذئب الرمادي', 'الصقر البني', 'العقاب الأسود', 'النسر الأبيض',
  'الأسد الذهبي', 'الفهد الأبيض', 'الذئب الأسود', 'الصقر الأبيض', 'العقاب البني', 'النسر الذهبي',
  'الأسد الأسود', 'الفهد الذهبي', 'الذئب الأبيض', 'الصقر الأسود', 'العقاب الأبيض', 'النسر البني',
  'الأسد الأحمر', 'الفهد البني', 'الذئب الذهبي', 'الصقر الذهبي', 'العقاب الأحمر', 'النسر الأسود',
  'الأسد البني', 'الفهد الأحمر', 'الذئب الأحمر', 'الصقر الأحمر', 'العقاب الذهبي', 'النسر الأبيض',
  'الأسد الذهبي', 'الفهد الأسود', 'الذئب البني', 'الصقر البني', 'العقاب الأسود', 'النسر الذهبي'
];

// Arabic female nicknames
const arabicFemaleNicknames = [
  'الزهرة', 'الوردة', 'البنفسج', 'الزنبق', 'القرنفل', 'الأوركيد', 'اللوتس', 'الزنبق الأبيض',
  'الزهرة الحمراء', 'الوردة البيضاء', 'البنفسج الأزرق', 'الزنبق الأصفر', 'القرنفل الوردي', 'الأوركيد البنفسجي',
  'الزهرة الصفراء', 'الوردة الحمراء', 'البنفسج الأبيض', 'الزنبق الأحمر', 'القرنفل الأبيض', 'الأوركيد الأصفر',
  'الزهرة البيضاء', 'الوردة الصفراء', 'البنفسج الوردي', 'الزنبق البنفسجي', 'القرنفل الأزرق', 'الأوركيد الأبيض',
  'الزهرة الوردية', 'الوردة البنفسجية', 'البنفسج الأحمر', 'الزنبق الأبيض', 'القرنفل الأصفر', 'الأوركيد الأحمر',
  'الزهرة البنفسجية', 'الوردة الزرقاء', 'البنفسج الأصفر', 'الزنبق الوردي', 'القرنفل البنفسجي', 'الأوركيد الأزرق',
  'الزهرة الزرقاء', 'الوردة الصفراء', 'البنفسج الأبيض', 'الزنبق الأحمر', 'القرنفل الأبيض', 'الأوركيد الأصفر'
];

// Anime-inspired nicknames (gender-neutral)
const animeNicknames = [
  'Shadow', 'Blade', 'Phantom', 'Ghost', 'Demon', 'Angel', 'Dragon', 'Phoenix', 'Tiger', 'Wolf',
  'Shadow Blade', 'Phantom Ghost', 'Demon Angel', 'Dragon Phoenix', 'Tiger Wolf', 'Shadow Demon',
  'Blade Phantom', 'Ghost Angel', 'Demon Dragon', 'Phoenix Tiger', 'Wolf Shadow', 'Blade Ghost',
  'Phantom Demon', 'Angel Dragon', 'Tiger Phoenix', 'Wolf Blade', 'Shadow Angel', 'Blade Dragon',
  'Ghost Phoenix', 'Demon Tiger', 'Phoenix Wolf', 'Tiger Shadow', 'Wolf Blade', 'Shadow Phoenix',
  'Blade Tiger', 'Phantom Wolf', 'Ghost Shadow', 'Demon Blade', 'Angel Phantom', 'Dragon Ghost',
  'Phoenix Demon', 'Tiger Angel', 'Wolf Dragon', 'Shadow Phoenix', 'Blade Tiger', 'Phantom Wolf'
];

// Arabic surnames
const arabicSurnames = [
  'الزهراني', 'الغامدي', 'القحطاني', 'العتيبي', 'القرني', 'العمري', 'الزهراني', 'الغامدي',
  'القحطاني', 'العتيبي', 'القرني', 'العمري', 'الزهراني', 'الغامدي', 'القحطاني', 'العتيبي',
  'القرني', 'العمري', 'الزهراني', 'الغامدي', 'القحطاني', 'العتيبي', 'القرني', 'العمري',
  'الزهراني', 'الغامدي', 'القحطاني', 'العتيبي', 'القرني', 'العمري', 'الزهراني', 'الغامدي',
  'القحطاني', 'العتيبي', 'القرني', 'العمري', 'الزهراني', 'الغامدي', 'القحطاني', 'العتيبي',
  'القرني', 'العمري', 'الزهراني', 'الغامدي', 'القحطاني', 'العتيبي', 'القرني', 'العمري'
];

// Generate random bot data
function generateBotData(index) {
  const isMale = Math.random() < 0.7; // 70% male
  
  let firstName, nickname, username;
  
  if (isMale) {
    firstName = arabicMaleNames[Math.floor(Math.random() * arabicMaleNames.length)];
    nickname = arabicMaleNicknames[Math.floor(Math.random() * arabicMaleNicknames.length)];
  } else {
    firstName = arabicFemaleNames[Math.floor(Math.random() * arabicFemaleNames.length)];
    nickname = arabicFemaleNicknames[Math.floor(Math.random() * arabicFemaleNicknames.length)];
  }
  
  // Sometimes use anime nickname instead of Arabic nickname
  if (Math.random() < 0.3) {
    nickname = animeNicknames[Math.floor(Math.random() * animeNicknames.length)];
  }
  
  // Create username with nickname
  username = `${firstName}_${nickname}_${Math.floor(Math.random() * 999)}`;
  
  // Generate random stats
  const level = Math.floor(Math.random() * 100) + 1; // Level 1-100
  const maxHp = 1000 + ((level - 1) * 100);
  const strength = 10 + (level * 2) + Math.floor(Math.random() * 20);
  const defense = 5 + level + Math.floor(Math.random() * 15);
  const money = 1000 + (level * 50) + Math.floor(Math.random() * 5000);
  const blackcoins = Math.floor(Math.random() * 100);
  
  // Some bots have VIP (about 15%)
  const hasVip = Math.random() < 0.15;
  const vipExpiresAt = hasVip ? new Date(Date.now() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000) : null;
  
  // Random last active time (within last 7 days)
  const lastActive = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
  
  return {
    user: {
      username: username,
      email: `bot_${index}@bot.com`,
      password: 'bot123456',
      age: Math.floor(Math.random() * 40) + 18, // 18-57 years old
      gender: isMale ? 'male' : 'female',
      isAdmin: false,
      bio: 'لاعب محترف في اللعبة',
      avatarUrl: isMale ? '/avatars/default_avatar_male.png' : '/avatars/default_avatar_female.png'
    },
    character: {
      name: firstName,
      level: level,
      exp: Math.floor(Math.random() * 1000),
      money: money,
      blackcoins: blackcoins,
      strength: strength,
      defense: defense,
      maxEnergy: 100,
      energy: Math.floor(Math.random() * 100),
      maxHp: maxHp,
      hp: maxHp,
      killCount: Math.floor(Math.random() * 50),
      daysInGame: Math.floor(Math.random() * 365) + 1,
      lastActive: lastActive,
      vipExpiresAt: vipExpiresAt,
      quote: 'اللعبة ممتعة جداً!',
      buffs: {}
    },
    statistic: {
      wins: Math.floor(Math.random() * 100),
      losses: Math.floor(Math.random() * 200),
      crimes: Math.floor(Math.random() * 50),
      moneyEarned: money + Math.floor(Math.random() * 10000),
      moneySpent: Math.floor(Math.random() * 5000),
      totalDamage: Math.floor(Math.random() * 10000),
      totalDamageTaken: Math.floor(Math.random() * 8000),
      contractsCompleted: Math.floor(Math.random() * 20),
      contractsFailed: Math.floor(Math.random() * 10),
      housesOwned: Math.floor(Math.random() * 3),
      carsOwned: Math.floor(Math.random() * 2),
      dogsOwned: Math.floor(Math.random() * 2)
    }
  };
}

async function seedBots() {
  try {
    console.log('🤖 Starting bot seeding process...');
    
    const botCount = 975;
    const bots = [];
    
    // Generate bot data
    for (let i = 0; i < botCount; i++) {
      bots.push(generateBotData(i + 1));
    }
    
    console.log(`📊 Generated ${botCount} bot profiles`);
    
    // Create users in batches
    const batchSize = 100;
    let createdUsers = [];
    
    for (let i = 0; i < bots.length; i += batchSize) {
      const batch = bots.slice(i, i + batchSize);
      const users = await User.bulkCreate(
        batch.map(bot => bot.user),
        { individualHooks: true }
      );
      createdUsers.push(...users);
      console.log(`✅ Created users batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(bots.length / batchSize)}`);
    }
    
    console.log(`✅ Created ${createdUsers.length} bot users`);
    
    // Create characters in batches
    let createdCharacters = [];
    
    for (let i = 0; i < bots.length; i += batchSize) {
      const batch = bots.slice(i, i + batchSize);
      const characters = await Character.bulkCreate(
        batch.map((bot, index) => ({
          ...bot.character,
          userId: createdUsers[i + index].id
        }))
      );
      createdCharacters.push(...characters);
      console.log(`✅ Created characters batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(bots.length / batchSize)}`);
    }
    
    console.log(`✅ Created ${createdCharacters.length} bot characters`);
    
    // Create statistics in batches
    let createdStats = [];
    
    for (let i = 0; i < bots.length; i += batchSize) {
      const batch = bots.slice(i, i + batchSize);
      const stats = await Statistic.bulkCreate(
        batch.map((bot, index) => ({
          ...bot.statistic,
          userId: createdUsers[i + index].id
        }))
      );
      createdStats.push(...stats);
      console.log(`✅ Created statistics batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(bots.length / batchSize)}`);
    }
    
    console.log(`✅ Created ${createdStats.length} bot statistics`);
    
    // Summary
    const vipCount = createdCharacters.filter(char => char.vipExpiresAt).length;
    const totalMoney = createdCharacters.reduce((sum, char) => sum + char.money, 0);
    const avgLevel = createdCharacters.reduce((sum, char) => sum + char.level, 0) / createdCharacters.length;
    
    console.log('\n🎉 Bot seeding completed successfully!');
    console.log('📊 Bot Summary:');
    console.log(`   - Total bots: ${createdCharacters.length}`);
    console.log(`   - VIP bots: ${vipCount} (${((vipCount / createdCharacters.length) * 100).toFixed(1)}%)`);
    console.log(`   - Average level: ${avgLevel.toFixed(1)}`);
    console.log(`   - Total money in economy: ${totalMoney.toLocaleString()}`);
    console.log(`   - Average money per bot: ${Math.floor(totalMoney / createdCharacters.length).toLocaleString()}`);
    console.log('🤖 Bots are ready to serve as player base and economy targets!');
    
    return { users: createdUsers, characters: createdCharacters, statistics: createdStats };
    
  } catch (error) {
    console.error('❌ Error seeding bots:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBots()
    .then(() => {
      console.log('✅ Bot seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Bot seeding failed:', error);
      process.exit(1);
    });
}

export { seedBots }; 