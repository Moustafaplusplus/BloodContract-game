// backend/src/seed/crimes.js
import { sequelize } from '../config/db.js';
import Crime from '../models/crime.js';

await sequelize.sync();

await Crime.bulkCreate([
  { name: 'سرقة محفظة في الزحام', energyCost: 5, successRate: 0.9, minReward: 20, maxReward: 50, cooldown: 30 },
  { name: 'سطو على بقالة', energyCost: 10, successRate: 0.75, minReward: 60, maxReward: 120, cooldown: 60 },
  { name: 'تهريب بسيط على الحدود', energyCost: 15, successRate: 0.7, minReward: 100, maxReward: 180, cooldown: 90 },
  { name: 'تخويف صاحب متجر', energyCost: 8, successRate: 0.8, minReward: 50, maxReward: 90, cooldown: 45 },
  { name: 'سطو مسلح على بنك صغير', energyCost: 30, successRate: 0.6, minReward: 200, maxReward: 400, cooldown: 300 },
  { name: 'تفجير سيارة شخصية مستهدفة', energyCost: 25, successRate: 0.5, minReward: 150, maxReward: 300, cooldown: 180 },
  { name: 'اغتيال سياسي فاسد', energyCost: 40, successRate: 0.4, minReward: 500, maxReward: 1000, cooldown: 600 },
]);

console.log('✅ Crimes seeded');
process.exit();
