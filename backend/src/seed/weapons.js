// backend/src/seed/weapons.js
import { sequelize } from '../config/db.js';
import { Weapon } from '../models/weapon.js';

await sequelize.sync();

await Weapon.bulkCreate([
  { name: 'سكين قديم', type: 'melee', damage: 3, price: 50, description: 'بداية بدائية، فعال في الصمت' },
  { name: 'عصا حديدية', type: 'melee', damage: 6, price: 120, description: 'ضربة قوية لمن لا يتوقعك' },
  { name: 'فرد كاتم الصوت', type: 'pistol', damage: 10, price: 250, description: 'سلاح صغير بصوت منخفض' },
  { name: 'مسدس نصف آلي', type: 'pistol', damage: 15, price: 400, description: 'مناسب للمواجهات القريبة' },
  { name: 'Uzi', type: 'smg', damage: 18, price: 600, description: 'إطلاق نار سريع لكن دقة منخفضة' },
  { name: 'AK-47', type: 'rifle', damage: 25, price: 900, description: 'كلاسيكية حروب العصابات' },
  { name: 'M4A1', type: 'rifle', damage: 30, price: 1200, description: 'قوة، دقة، وسرعة في آن واحد' },
  { name: 'بندقية قنص', type: 'sniper', damage: 45, price: 1800, description: 'ضرر عالٍ، بطيئة، لكنها قاتلة' },
  { name: 'قاذف قنابل يدوي', type: 'special', damage: 60, price: 3000, description: 'فوضى جماعية' },
  { name: 'سيف ياباني نادر', type: 'melee', damage: 40, price: 2200, description: 'للاغتيالات الشرسة بأسلوب محترف' },
]);

console.log('✅ Weapons seeded');
process.exit();
