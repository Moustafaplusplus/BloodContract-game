import { sequelize } from './config/db.js';
import { User } from './models/User.js';
import { Character } from './models/Character.js';
import { Weapon, Armor, VIPPackage } from './models/Shop.js';
import { Crime } from './models/Crime.js';
import { BlackcoinPackage } from './models/Blackcoin.js';
import { HouseService } from './services/HouseService.js';
import { House } from './models/House.js';
import { Car } from './models/Car.js';
import { Dog } from './models/Dog.js';

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
      { name: 'Small Blackcoin Pack', usdPrice: 2.99, blackcoinAmount: 30, bonus: 0, isActive: true },
      { name: 'Medium Blackcoin Pack', usdPrice: 7.99, blackcoinAmount: 90, bonus: 10, isActive: true },
      { name: 'Large Blackcoin Pack', usdPrice: 19.99, blackcoinAmount: 250, bonus: 40, isActive: true },
      { name: 'Mega Blackcoin Pack', usdPrice: 49.99, blackcoinAmount: 700, bonus: 120, isActive: true }
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
    
    // Weapons
    await Weapon.bulkCreate([
      // Common Weapons
      { name: 'سكين مطبخ',        type: 'melee',  damage: 3,  energyBonus: 0,  price: 100,  rarity: 'common', imageUrl: '/images/weapons/kitchen-knife.png' },
      { name: 'خنجر صدئ',         type: 'melee',  damage: 4,  energyBonus: 0,  price: 150,  rarity: 'common', imageUrl: '/images/weapons/rusty-dagger.png' },
      { name: 'عصا خشبية',        type: 'melee',  damage: 5,  energyBonus: 0,  price: 200,  rarity: 'common', imageUrl: '/images/weapons/wooden-stick.png' },
      { name: 'عصا حديدية',       type: 'melee',  damage: 6,  energyBonus: 1,  price: 300,  rarity: 'common', imageUrl: '/images/weapons/iron-pipe.png' },
      { name: 'مسدس قديم',        type: 'pistol', damage: 7,  energyBonus: 0,  price: 500,  rarity: 'common', imageUrl: '/images/weapons/old-pistol.png' },
      
      // Uncommon Weapons
      { name: 'مسدس 9mm',         type: 'pistol', damage: 9,  energyBonus: 0,  price: 800,  rarity: 'uncommon', imageUrl: '/images/weapons/9mm-pistol.png' },
      { name: 'بندقية صيد',       type: 'rifle',  damage: 12, energyBonus: 0,  price: 1200, rarity: 'uncommon', imageUrl: '/images/weapons/hunting-rifle.png' },
      { name: 'سيف قصير',         type: 'melee',  damage: 14, energyBonus: 1,  price: 1500, rarity: 'uncommon', imageUrl: '/images/weapons/short-sword.png' },
      { name: 'مسدس مزدوج',       type: 'pistol', damage: 11, energyBonus: 0,  price: 1000, rarity: 'uncommon', imageUrl: '/images/weapons/dual-pistols.png' },
      { name: 'قوس وسهم',         type: 'ranged', damage: 13, energyBonus: 0,  price: 1400, rarity: 'uncommon', imageUrl: '/images/weapons/bow-arrow.png' },
      
      // Rare Weapons
      { name: 'كاتانا فولاذية',   type: 'melee',  damage: 16, energyBonus: 2,  price: 2200, rarity: 'rare', imageUrl: '/images/weapons/steel-katana.png' },
      { name: 'قناص قصير',        type: 'sniper', damage: 20, energyBonus: 0,  price: 3000, rarity: 'rare', imageUrl: '/images/weapons/short-sniper.png' },
      { name: 'رشاش خفيف',        type: 'rifle',  damage: 18, energyBonus: 0,  price: 2800, rarity: 'rare', imageUrl: '/images/weapons/light-machinegun.png' },
      { name: 'فأس حربي',         type: 'melee',  damage: 22, energyBonus: 1,  price: 3500, rarity: 'rare', imageUrl: '/images/weapons/war-axe.png' },
      { name: 'مسدس ليزر',        type: 'pistol', damage: 19, energyBonus: 0,  price: 3200, rarity: 'rare', imageUrl: '/images/weapons/laser-pistol.png' },
      
      // Epic Weapons
      { name: 'مطرقة الحرب',      type: 'melee',  damage: 24, energyBonus: 3,  price: 3800, rarity: 'epic', imageUrl: '/images/weapons/war-hammer.png' },
      { name: 'رشاش آلي',         type: 'rifle',  damage: 28, energyBonus: 0,  price: 4500, rarity: 'epic', imageUrl: '/images/weapons/auto-rifle.png' },
      { name: 'قناصة متوسطة',     type: 'sniper', damage: 32, energyBonus: 0,  price: 5200, rarity: 'epic', imageUrl: '/images/weapons/medium-sniper.png' },
      { name: 'سيف بلازما',       type: 'melee',  damage: 26, energyBonus: 4,  price: 4200, rarity: 'epic', imageUrl: '/images/weapons/plasma-sword.png' },
      { name: 'قوس كهربائي',      type: 'ranged', damage: 30, energyBonus: 0,  price: 4800, rarity: 'epic', imageUrl: '/images/weapons/electric-bow.png' },
      
      // Legendary Weapons
      { name: 'قناصة متقدمة',     type: 'sniper', damage: 34, energyBonus: 0,  price: 5500, rarity: 'legend', imageUrl: '/images/weapons/advanced-sniper.png' },
      { name: 'سيف أسطوري',       type: 'melee',  damage: 40, energyBonus: 5,  price: 7000, rarity: 'legend', imageUrl: '/images/weapons/legendary-sword.png' },
      { name: 'رشاش بلازما',      type: 'rifle',  damage: 38, energyBonus: 0,  price: 6500, rarity: 'legend', imageUrl: '/images/weapons/plasma-rifle.png' },
      { name: 'قوس الجليد',       type: 'ranged', damage: 36, energyBonus: 0,  price: 6000, rarity: 'legend', imageUrl: '/images/weapons/ice-bow.png' },
      { name: 'سيف النار',        type: 'melee',  damage: 42, energyBonus: 6,  price: 7500, rarity: 'legend', imageUrl: '/images/weapons/fire-sword.png' },
      // Add some blackcoin-only weapons
      { name: 'Shadow Dagger', type: 'melee', damage: 50, energyBonus: 5, price: 20, rarity: 'legend', imageUrl: '/images/weapons/shadow-dagger.png', currency: 'blackcoin' },
      { name: 'Inferno Rifle', type: 'rifle', damage: 70, energyBonus: 10, price: 35, rarity: 'legend', imageUrl: '/images/weapons/inferno-rifle.png', currency: 'blackcoin' }
    ]);

    // Armors
    await Armor.bulkCreate([
      // Common Armors
      { name: 'ملابس عادية',      def: 1,  hpBonus: 0,  price: 100,  rarity: 'common', imageUrl: '/images/armors/regular-clothes.png' },
      { name: 'سترة قماش',        def: 2,  hpBonus: 0,  price: 200,  rarity: 'common', imageUrl: '/images/armors/cloth-vest.png' },
      { name: 'سترة جلدية',       def: 4,  hpBonus: 10, price: 400,  rarity: 'common', imageUrl: '/images/armors/leather-vest.png' },
      { name: 'سترة واقية',       def: 3,  hpBonus: 5,  price: 300,  rarity: 'common', imageUrl: '/images/armors/protective-vest.png' },
      { name: 'سترة سميكة',       def: 5,  hpBonus: 8,  price: 500,  rarity: 'common', imageUrl: '/images/armors/thick-vest.png' },
      
      // Uncommon Armors
      { name: 'درع كيفلر خفيف',   def: 7,  hpBonus: 15, price: 900,  rarity: 'uncommon', imageUrl: '/images/armors/light-kevlar.png' },
      { name: 'درع كيفلر متوسط',  def: 9,  hpBonus: 20, price: 1300, rarity: 'uncommon', imageUrl: '/images/armors/medium-kevlar.png' },
      { name: 'درع تكتيكي خفيف',  def: 8,  hpBonus: 18, price: 1100, rarity: 'uncommon', imageUrl: '/images/armors/light-tactical.png' },
      { name: 'درع مركب خفيف',     def: 10, hpBonus: 22, price: 1500, rarity: 'uncommon', imageUrl: '/images/armors/light-composite.png' },
      { name: 'درع فولاذي خفيف',  def: 11, hpBonus: 25, price: 1700, rarity: 'uncommon', imageUrl: '/images/armors/light-steel.png' },
      
      // Rare Armors
      { name: 'درع كيفلر ثقيل',   def: 12, hpBonus: 25, price: 1800, rarity: 'rare', imageUrl: '/images/armors/heavy-kevlar.png' },
      { name: 'درع تكتيكي',       def: 15, hpBonus: 35, price: 2400, rarity: 'rare', imageUrl: '/images/armors/tactical-armor.png' },
      { name: 'درع مركب متوسط',    def: 14, hpBonus: 30, price: 2200, rarity: 'rare', imageUrl: '/images/armors/medium-composite.png' },
      { name: 'درع فولاذي متوسط', def: 16, hpBonus: 40, price: 2800, rarity: 'rare', imageUrl: '/images/armors/medium-steel.png' },
      { name: 'درع سيراميك',      def: 13, hpBonus: 28, price: 2000, rarity: 'rare', imageUrl: '/images/armors/ceramic-armor.png' },
      
      // Epic Armors
      { name: 'درع التيتانيوم',   def: 19, hpBonus: 45, price: 3200, rarity: 'epic', imageUrl: '/images/armors/titanium-armor.png' },
      { name: 'درع مركب متقدم',   def: 23, hpBonus: 55, price: 4000, rarity: 'epic', imageUrl: '/images/armors/advanced-composite.png' },
      { name: 'درع تكتيكي ثقيل',  def: 21, hpBonus: 50, price: 3600, rarity: 'epic', imageUrl: '/images/armors/heavy-tactical.png' },
      { name: 'درع فولاذي ثقيل',  def: 24, hpBonus: 60, price: 4200, rarity: 'epic', imageUrl: '/images/armors/heavy-steel.png' },
      { name: 'درع بلازما',       def: 20, hpBonus: 48, price: 3400, rarity: 'epic', imageUrl: '/images/armors/plasma-armor.png' },
      
      // Legendary Armors
      { name: 'درع نانوي خفيف',   def: 27, hpBonus: 65, price: 5200, rarity: 'legend', imageUrl: '/images/armors/light-nano.png' },
      { name: 'درع نانوي معزز',   def: 32, hpBonus: 80, price: 6500, rarity: 'legend', imageUrl: '/images/armors/enhanced-nano.png' },
      { name: 'درع بلازما متقدم', def: 30, hpBonus: 75, price: 5800, rarity: 'legend', imageUrl: '/images/armors/advanced-plasma.png' },
      { name: 'درع كريستالي',     def: 35, hpBonus: 90, price: 7200, rarity: 'legend', imageUrl: '/images/armors/crystal-armor.png' },
      { name: 'درع أسطوري',       def: 40, hpBonus: 100, price: 8500, rarity: 'legend', imageUrl: '/images/armors/legendary-armor.png' },
      // Add some blackcoin-only armors
      { name: 'Phantom Suit', def: 60, hpBonus: 150, price: 25, rarity: 'legend', imageUrl: '/images/armors/phantom-suit.png', currency: 'blackcoin' },
      { name: 'Dragon Scale Armor', def: 80, hpBonus: 200, price: 50, rarity: 'legend', imageUrl: '/images/armors/dragon-scale.png', currency: 'blackcoin' }
    ]);

    console.log('✅ Shop items seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding shop items:', error);
    throw error;
  }
}

async function seedVIPPackages() {
  try {
    console.log('👑 Seeding VIP packages...');
    await VIPPackage.bulkCreate([
      { name: '3 أيام', durationDays: 3, price: 10, isActive: true },
      { name: 'أسبوع', durationDays: 7, price: 20, isActive: true },
      { name: 'شهر', durationDays: 30, price: 60, isActive: true },
      { name: 'سنة', durationDays: 365, price: 500, isActive: true },
    ]);
    console.log('✅ VIP packages seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding VIP packages:', error);
    throw error;
  }
}

async function seedCrimes() {
  try {
    console.log('🦹‍♂️ Seeding crimes...');
    const crimes = [];
    for (let lvl = 1; lvl <= 100; lvl += 10) {
      crimes.push({
        name: `سرقة بسيطة (مستوى ${lvl})`,
        slug: `simple-theft-lvl-${lvl}`,
        isEnabled: true,
        req_level: lvl,
        req_intel: Math.max(1, Math.floor(lvl / 2)),
        energyCost: 5 + Math.floor(lvl/10),
        successRate: 0.8 - (lvl/200),
        minReward: 10 * lvl,
        maxReward: 20 * lvl,
        cooldown: 60 + lvl,
        failOutcome: 'jail',
        jailMinutes: 2 + Math.floor(lvl/20),
        hospitalMinutes: 0,
        hpLoss: 0,
        bailRate: 20 + lvl,
        healRate: 0,
      });
      crimes.push({
        name: `سطو عنيف (مستوى ${lvl})`,
        slug: `violent-robbery-lvl-${lvl}`,
        isEnabled: true,
        req_level: lvl,
        req_intel: Math.max(1, Math.floor(lvl / 2)),
        energyCost: 10 + Math.floor(lvl/10),
        successRate: 0.7 - (lvl/200),
        minReward: 20 * lvl,
        maxReward: 40 * lvl,
        cooldown: 120 + lvl,
        failOutcome: 'hospital',
        jailMinutes: 0,
        hospitalMinutes: 2 + Math.floor(lvl/20),
        hpLoss: 10 + Math.floor(lvl/5),
        bailRate: 0,
        healRate: 20 + lvl,
      });
    }
    await Crime.bulkCreate(crimes);
    console.log('✅ Crimes seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding crimes:', error);
    throw error;
  }
}

async function seedHouses() {
  try {
    console.log('🏠 Seeding houses...');
    await House.destroy({ where: {} });
    await House.bulkCreate([
      { name: 'غرفة في السطح',          cost:  1000,   energyRegen:  5,  defenseBonus:  2,  hpBonus: 100,   description: 'مكان متواضع للراحة بعد أول مهمة.' },
      { name: 'شقة في حي شعبي',          cost:  5000,   energyRegen: 10,  defenseBonus:  5,  hpBonus: 250,   description: 'أفضل من لا شيء، لكنها ليست آمنة بالكامل.' },
      { name: 'دور أرضي منعزل',         cost: 15000,   energyRegen: 15,  defenseBonus:  8,  hpBonus: 500,   description: 'هدوء وراحة نسبية.' },
      { name: 'فيلا صغيرة',             cost: 35000,   energyRegen: 20,  defenseBonus: 12,  hpBonus: 900,   description: 'مكان أنيق يوفر الحماية والطاقة.' },
      { name: 'قصر في ضواحي المدينة',    cost: 80000,   energyRegen: 30,  defenseBonus: 18,  hpBonus: 1600,  description: 'قصر واسع وآمن في مكان بعيد.' },
      { name: 'ملجأ تحت الأرض',         cost: 150000,  energyRegen: 40,  defenseBonus: 25,  hpBonus: 2500,  description: 'مكان مجهز بالكامل للبقاء والاختباء.' },
      { name: 'يخت خاص',                cost: 300000,  energyRegen: 50,  defenseBonus: 32,  hpBonus: 4000,  description: 'موقعك متغير دوماً — حماية عالية وراحة فاخرة.' },
      { name: 'بنتهاوس في ناطحة سحاب',  cost: 600000,  energyRegen: 60,  defenseBonus: 40,  hpBonus: 6000,  description: 'مستوى النخبة. الأفضل من كل شيء.' },
      { name: 'مخبأ في الجبال',         cost: 1200000, energyRegen: 70,  defenseBonus: 50,  hpBonus: 9000,  description: 'عزلة تامة، حماية قصوى.' },
      { name: 'قاعدة عمليات سرية',      cost: 2500000, energyRegen: 80,  defenseBonus: 60,  hpBonus: 14000, description: 'مجهزة بأحدث تقنيات الأمان والبقاء.' },
    ]);
    console.log('✅ Houses seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding houses:', error);
    throw error;
  }
}

async function seedCars() {
  try {
    console.log('🚗 Seeding cars...');
    await Car.destroy({ where: {} });
    await Car.bulkCreate([
      { name: 'سيارة قديمة', cost: 5000, attackBonus: 10, defenseBonus: 2, description: 'سيارة قديمة لكنها تعمل.' },
      { name: 'سيدان حديثة', cost: 20000, attackBonus: 25, defenseBonus: 4, description: 'سيدان مريحة وسريعة نسبياً.' },
      { name: 'سيارة رياضية', cost: 75000, attackBonus: 60, defenseBonus: 7, description: 'قوة وسرعة في كل منعطف.' },
      { name: 'جيب مدرع', cost: 200000, attackBonus: 90, defenseBonus: 12, description: 'حماية عالية وقوة دفع.' },
      { name: 'سيارة فاخرة', cost: 500000, attackBonus: 130, defenseBonus: 16, description: 'رمز الفخامة والقوة.' },
      { name: 'سيارة خارقة', cost: 1200000, attackBonus: 200, defenseBonus: 22, description: 'سرعة لا تصدق وهجوم مدمر.' },
      { name: 'دبابة خفيفة', cost: 3000000, attackBonus: 350, defenseBonus: 40, description: 'قوة هجومية ودفاعية لا مثيل لها.' },
    ]);
    console.log('✅ Cars seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding cars:', error);
    throw error;
  }
}

async function seedDogs() {
  try {
    console.log('🐕 Seeding dogs...');
    await Dog.destroy({ where: {} });
    await Dog.bulkCreate([
      { name: 'كلب حراسة صغير', cost: 3000, powerBonus: 15, description: 'كلب صغير لكنه شجاع.' },
      { name: 'بولدوغ قوي', cost: 12000, powerBonus: 40, description: 'قوة عضلية وحماية ممتازة.' },
      { name: 'دوبرمان مدرب', cost: 40000, powerBonus: 90, description: 'ذكي وسريع الاستجابة.' },
      { name: 'رودفايلر شرس', cost: 120000, powerBonus: 180, description: 'هجوم ودفاع لا يستهان به.' },
      { name: 'كلب ذئب نادر', cost: 350000, powerBonus: 350, description: 'قوة أسطورية وولاء مطلق.' },
    ]);
    console.log('✅ Dogs seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding dogs:', error);
    throw error;
  }
}

async function seedUsersAndCharacters() {
  try {
    console.log('👤 Seeding users and characters...');
    const levels = [1, 12, 23, 34, 45, 56, 67, 78, 89, 100];
    const users = await User.bulkCreate(
      levels.map((lvl, i) => ({
        username: `test${i+1}`,
        email: `test${i+1}@test.com`,
        age: 20 + i,
        gender: i % 2 === 0 ? 'male' : 'female',
        password: '123456',
        bio: `Seeded user level ${lvl}`,
        avatarUrl: '/avatars/default.png',
      })),
      { individualHooks: true }
    );
    const characters = await Character.bulkCreate(
      users.map((user, i) => {
        const lvl = levels[i];
        return {
          userId: user.id, // userId is now the primary key
          name: user.username,
          level: lvl,
          exp: lvl * 100,
          money: lvl * 1000,
          blackcoins: 0, // Set to 0 for all
          vipExpiresAt: null, // Not VIP by default
          strength: 10 + lvl,
          defense: 5 + Math.floor(lvl/2),
          maxEnergy: 100 + Math.floor(lvl/2),
          energy: 100 + Math.floor(lvl/2),
          maxHp: 1000 + (lvl * 100),
          hp: 1000 + (lvl * 100),
          quote: `I am level ${lvl}!`,
        };
      })
    );
    console.log('✅ Users and characters seeded successfully');
    return { users, characters };
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
      seedVIPPackages(),
      seedHouses(),
      seedCars(),
      seedDogs(),
    ]);

    await seedUsersAndCharacters();

    console.log('\n🎉 All seeding completed successfully!');
    console.log('📊 Database summary:');
    console.log('   - Shop items: Weapons, Armors');
    console.log('   - Crimes: 11 different crime types');
    console.log('   - Users: 5 test users with characters');
    console.log('\n🚀 Ready to start the application!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Seeding failed:', error);
    process.exit(1);
  }
}

main(); 