// =======================================================
//  backend/src/features/car.js
//  Player vehicles (cars) – power & defense boosters
//  Exports:
//    • Car Sequelize model
//    • seedCars() helper (15 balanced entries)
//    • carRouter (list + purchase)
// =======================================================

import { Model, DataTypes } from 'sequelize';
import express from 'express';

import { sequelize }   from '../config/db.js';
import { auth }        from './user.js';
import { Character }   from './character.js';
import { InventoryItem } from './inventory.js';

/* ╔══════════════════════════════════════════════════════╗
 * 1️⃣  Sequelize model
 * ╚══════════════════════════════════════════════════════╝ */
export class Car extends Model {}

Car.init({
  name:        { type: DataTypes.STRING,  allowNull: false },
  power:       { type: DataTypes.INTEGER, allowNull: false }, // attack bonus
  defense:     { type: DataTypes.INTEGER, allowNull: false }, // defense bonus
  speed:       { type: DataTypes.INTEGER, allowNull: false }, // extra stat
  price:       { type: DataTypes.INTEGER, allowNull: false },
  rarity:      { type: DataTypes.STRING,  defaultValue: 'common' },
  description: { type: DataTypes.TEXT },
}, { sequelize, modelName: 'Car', timestamps: false });

/* ╔══════════════════════════════════════════════════════╗
 * 2️⃣  Express router – /car-shop
 * ╚══════════════════════════════════════════════════════╝ */
export const carRouter = (() => {
  const router = express.Router();

  // GET /api/car-shop/cars
  router.get('/cars', async (_req, res) => {
    const cars = await Car.findAll();
    res.json(cars);
  });

  // POST /api/car-shop/buy/:carId
  router.post('/buy/:carId', auth, async (req, res) => {
    const userId = req.user.id;
    const carId  = Number(req.params.carId);
    const car    = await Car.findByPk(carId);
    if (!car) return res.status(404).json({ message: 'المركبة غير موجودة' });

    const char = await Character.findOne({ where: { userId } });
    if (!char || char.money < car.price)
      return res.status(400).json({ message: 'لا تملك مالاً كافياً' });

    const owned = await InventoryItem.findOne({ where: { userId, itemType: 'car', itemId: carId } });
    if (owned) return res.status(400).json({ message: 'لديك هذه المركبة بالفعل' });

    char.money -= car.price;
    await char.save();

    await InventoryItem.create({ userId, itemType: 'car', itemId: carId, equipped: false });
    res.json({ message: 'تم شراء المركبة بنجاح', carId });
  });

  return router;
})();

/* ╔══════════════════════════════════════════════════════╗
 * 3️⃣  Seed helper – 15 cars
 * ╚══════════════════════════════════════════════════════╝ */
export async function seedCars() {
  const cars = [
    { name: 'دراجة نارية قديمة', power: 5,  defense: 2,  speed: 40,  price: 200,  rarity: 'common',    description: 'وسيلة تنقل بدائية لكنها أسرع من المشي.' },
    { name: 'سيارة سيدان مستعملة', power: 8,  defense: 3,  speed: 60,  price: 600,  rarity: 'common',    description: 'مناسبة للتنقل اليومي دون لفت الانتباه.' },
    { name: 'فان شحن',          power: 10, defense: 5,  speed: 55,  price: 900,  rarity: 'common',    description: 'مساحة تخزين واسعة وحماية أفضل.' },
    { name: 'سيارة رياضية قديمة', power: 14, defense: 4,  speed: 85,  price: 1500, rarity: 'uncommon',  description: 'سرعة جيدة مقابل بعض الأعطال المحتملة.' },
    { name: 'جيب دفع رباعي',     power: 16, defense: 8,  speed: 70,  price: 2000, rarity: 'uncommon',  description: 'مثالية للطرق الوعرة والهروب السريع.' },
    { name: 'شاحنة مدرعة خفيفة',  power: 18, defense: 12, speed: 60,  price: 3000, rarity: 'uncommon',  description: 'حماية إضافية مقابل سرعة أقل.' },
    { name: 'سيارة كوبيه حديثة',  power: 22, defense: 6,  speed: 100, price: 4500, rarity: 'rare',      description: 'أداء عالٍ وتصميم أنيق.' },
    { name: 'سيارة عضلية',      power: 25, defense: 7,  speed: 105, price: 6000, rarity: 'rare',      description: 'قوة وعزم دوران هائل.' },
    { name: 'مدرعة شخصية',       power: 20, defense: 18, speed: 65,  price: 7500, rarity: 'rare',      description: 'تكاد تكون حصينة ضد الهجمات الخفيفة.' },
    { name: 'دراجة نارية رياضية', power: 28, defense: 4,  speed: 120, price: 8500, rarity: 'epic',     description: 'سرعة قصوى وقدرة مناورة عالية.' },
    { name: 'سوبركار',           power: 35, defense: 8,  speed: 160, price: 12000,rarity: 'epic',     description: 'تجربة قيادة لا مثيل لها وتسارع صاروخي.' },
    { name: 'شاحنة قتالية',      power: 32, defense: 22, speed: 75,  price: 14000,rarity: 'epic',     description: 'منصة إطلاق نيران متحركة.' },
    { name: 'سيارة ليموزين مدرعة', power: 24, defense: 25, speed: 70,  price: 16000,rarity: 'legendary',description: 'فخامة وحماية رئاسية.' },
    { name: 'عربة هجومية عالية السرعة', power: 40, defense: 20, speed: 150, price: 20000,rarity: 'legendary',description: 'عنصر مفاجأة وسرعة مدمرة.' },
    { name: 'دبابة خفيفة معدلة',  power: 50, defense: 40, speed: 40,  price: 30000,rarity: 'mythic',   description: 'قوة نيران هائلة وسلاح ردع نهائي.' },
  ];
  await Car.destroy({ where: {} });
  await Car.bulkCreate(cars);
  console.log(`✅ Seeded ${cars.length} cars`);
}

/* ╔══════════════════════════════════════════════════════╗
 * 4️⃣  Barrel
 * ╚══════════════════════════════════════════════════════╝ */
export default { Car, seedCars, carRouter };