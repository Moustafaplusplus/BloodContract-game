import { Crime } from './src/models/Crime.js';
import { sequelize } from './src/config/db.js';

async function updateCrimes() {
  try {
    await sequelize.authenticate();
    console.log('🔗 Connected to database');

    // Updated crime data with new success rates
    const updatedCrimes = [
      { name: "سرقة محفظة في الزحام", successRate: 0.85 },
      { name: "رشّ كتابات على حائط عام", successRate: 0.83 },
      { name: "سرقة دراجة هوائية", successRate: 0.8 },
      { name: "سرقة سيارة", successRate: 0.75 },
      { name: "سرقة بنك صغير", successRate: 0.65 },
      { name: "سرقة متجر مجوهرات", successRate: 0.6 },
      { name: "سرقة بنك كبير", successRate: 0.55 },
      { name: "سرقة قصر", successRate: 0.45 },
    ];

    let updatedCount = 0;
    for (const crimeData of updatedCrimes) {
      const result = await Crime.update(
        { successRate: crimeData.successRate },
        { where: { name: crimeData.name } }
      );
      
      if (result[0] > 0) {
        console.log(`✅ Updated "${crimeData.name}" - Success rate: ${(crimeData.successRate * 100).toFixed(0)}%`);
        updatedCount++;
      } else {
        console.log(`⚠️  Crime "${crimeData.name}" not found`);
      }
    }

    console.log(`\n🎯 Updated ${updatedCount} crimes with new difficulty settings`);
    console.log('📊 New success rates:');
    updatedCrimes.forEach(crime => {
      console.log(`   ${crime.name}: ${(crime.successRate * 100).toFixed(0)}% success rate`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating crimes:', error);
    process.exit(1);
  }
}

updateCrimes(); 