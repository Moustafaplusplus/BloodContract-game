// File: backend/src/seed/houses.js

import { sequelize } from '../config/db.js';
import { House } from '../models/house.js';

await sequelize.sync();

await House.bulkCreate([
  {
    name: 'غرفة في السطح',
    cost: 100,
    energyRegen: 5,
    defenseBonus: 1,
    description: 'مكان متواضع للراحة بعد أول مهمة.'
  },
  {
    name: 'شقة في حي شعبي',
    cost: 300,
    energyRegen: 10,
    defenseBonus: 3,
    description: 'أفضل من لا شيء، لكنها ليست آمنة بالكامل.'
  },
  {
    name: 'دور أرضي منعزل',
    cost: 700,
    energyRegen: 15,
    defenseBonus: 5,
    description: 'هدوء وراحة نسبية.'
  },
  {
    name: 'فيلا صغيرة',
    cost: 1500,
    energyRegen: 20,
    defenseBonus: 7,
    description: 'مكان أنيق يوفر الحماية والطاقة.'
  },
  {
    name: 'قصر في ضواحي المدينة',
    cost: 3000,
    energyRegen: 30,
    defenseBonus: 10,
    description: 'قصر واسع وآمن في مكان بعيد.'
  },
  {
    name: 'ملجأ تحت الأرض',
    cost: 5000,
    energyRegen: 40,
    defenseBonus: 15,
    description: 'مكان مجهز بالكامل للبقاء والاختباء.'
  },
  {
    name: 'يخت خاص',
    cost: 8000,
    energyRegen: 50,
    defenseBonus: 18,
    description: 'موقعك متغير دوماً — حماية عالية وراحة فاخرة.'
  },
  {
    name: 'بنتهاوس في ناطحة سحاب',
    cost: 12000,
    energyRegen: 60,
    defenseBonus: 20,
    description: 'مستوى النخبة. الأفضل من كل شيء.'
  },
  {
    name: 'مخبأ في الجبال',
    cost: 20000,
    energyRegen: 70,
    defenseBonus: 25,
    description: 'عزلة تامة، حماية قصوى.'
  },
  {
    name: 'قاعدة عمليات سرية',
    cost: 30000,
    energyRegen: 80,
    defenseBonus: 30,
    description: 'مجهزة بأحدث تقنيات الأمان والبقاء.'
  }
]);

console.log('✅ Houses seeded');
process.exit();