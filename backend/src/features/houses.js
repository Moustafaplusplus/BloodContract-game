// =======================================================
//  backend/src/features/houses.js
//  Feature barrel – house catalog & purchase flow
//  Enhancements:
//    • Transaction-safe purchase (no double-spend)
//    • Validation on numeric IDs
//    • Added /mine/sell to sell current house back for 70 % value
//    • Seed helper wipes then inserts defaults
// =======================================================

import { Model, DataTypes } from 'sequelize';
import express from 'express';
import { sequelize } from '../config/db.js';
import { auth } from './user.js';
import { Character } from './character.js';

/* ╔══════════════════════════════════════════════════════╗
 * 1️⃣  Sequelize models
 * ╚══════════════════════════════════════════════════════╝ */
export class House extends Model {}
export class UserHouse extends Model {}

House.init({
  name:         { type: DataTypes.STRING,  allowNull: false },
  cost:         { type: DataTypes.INTEGER, allowNull: false },
  energyRegen:  { type: DataTypes.INTEGER, allowNull: false },
  defenseBonus: { type: DataTypes.INTEGER, allowNull: false },
  description:  { type: DataTypes.TEXT,    allowNull: false },
}, { sequelize, modelName: 'House', tableName: 'Houses', timestamps: false });

UserHouse.init({
  userId:      { type: DataTypes.INTEGER, allowNull: false },
  houseId:     { type: DataTypes.INTEGER, allowNull: false },
  purchasedAt: { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
}, { sequelize, modelName: 'UserHouse', tableName: 'UserHouses', timestamps: false });

/* ╔══════════════════════════════════════════════════════╗
 * 2️⃣  Seed helper
 * ╚══════════════════════════════════════════════════════╝ */
export async function seedHouses() {
  const defaults = [
    { name: 'غرفة في السطح',          cost:  100,  energyRegen:  5, defenseBonus:  1, description: 'مكان متواضع للراحة بعد أول مهمة.' },
    { name: 'شقة في حي شعبي',          cost:  300,  energyRegen: 10, defenseBonus:  3, description: 'أفضل من لا شيء، لكنها ليست آمنة بالكامل.' },
    { name: 'دور أرضي منعزل',         cost:  700,  energyRegen: 15, defenseBonus:  5, description: 'هدوء وراحة نسبية.' },
    { name: 'فيلا صغيرة',             cost: 1500,  energyRegen: 20, defenseBonus:  7, description: 'مكان أنيق يوفر الحماية والطاقة.' },
    { name: 'قصر في ضواحي المدينة',    cost: 3000,  energyRegen: 30, defenseBonus: 10, description: 'قصر واسع وآمن في مكان بعيد.' },
    { name: 'ملجأ تحت الأرض',         cost: 5000,  energyRegen: 40, defenseBonus: 15, description: 'مكان مجهز بالكامل للبقاء والاختباء.' },
    { name: 'يخت خاص',                cost: 8000,  energyRegen: 50, defenseBonus: 18, description: 'موقعك متغير دوماً — حماية عالية وراحة فاخرة.' },
    { name: 'بنتهاوس في ناطحة سحاب',  cost:12000,  energyRegen: 60, defenseBonus: 20, description: 'مستوى النخبة. الأفضل من كل شيء.' },
    { name: 'مخبأ في الجبال',         cost:20000,  energyRegen: 70, defenseBonus: 25, description: 'عزلة تامة، حماية قصوى.' },
    { name: 'قاعدة عمليات سرية',      cost:30000,  energyRegen: 80, defenseBonus: 30, description: 'مجهزة بأحدث تقنيات الأمان والبقاء.' },
  ];
  await House.destroy({ where: {} });
  await House.bulkCreate(defaults);
  console.log(`✅ Seeded ${defaults.length} houses`);
}

/* ╔══════════════════════════════════════════════════════╗
 * 3️⃣  Router
 * ╚══════════════════════════════════════════════════════╝ */
export const router = express.Router();

// GET /api/houses
router.get('/', auth, async (_req, res, next) => {
  try {
    const houses = await House.findAll();
    res.json(houses);
  } catch (err) { next(err); }
});

// POST /api/houses/buy
router.post('/buy', auth, async (req, res, next) => {
  const houseId = Number(req.body.houseId);
  if (!houseId) return res.status(400).json({ message: 'houseId مطلوب' });

  const t = await sequelize.transaction();
  try {
    const [char, house] = await Promise.all([
      Character.findOne({ where: { userId: req.user.id }, transaction: t, lock: t.LOCK.UPDATE }),
      House.findByPk(houseId, { transaction: t }),
    ]);

    if (!char || !house) throw { status: 404, msg: 'البيت غير موجود' };
    if (char.money < house.cost) throw { status: 400, msg: 'لا تملك مالاً كافياً' };

    const existing = await UserHouse.findOne({ where: { userId: char.userId }, transaction: t, lock: t.LOCK.UPDATE });
    if (existing) throw { status: 400, msg: 'لديك بيت بالفعل' };

    await UserHouse.create({ userId: char.userId, houseId }, { transaction: t });
    char.money -= house.cost;
    char.maxEnergy += house.energyRegen; // Buffs apply instantly
    char.defense  += house.defenseBonus;
    await char.save({ transaction: t });

    await t.commit();
    res.json({ message: 'تم شراء البيت بنجاح', house });
  } catch (err) {
    await t.rollback();
    res.status(err.status || 500).json({ message: err.msg || 'خطأ' });
  }
});

// POST /api/houses/mine/sell – sell current house for 70 % value
router.post('/mine/sell', auth, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const record = await UserHouse.findOne({ where: { userId: req.user.id }, transaction: t, lock: t.LOCK.UPDATE, include: [House] });
    if (!record) throw { status: 400, msg: 'لا تملك بيتاً لبيعه' };

    const house = record.House;
    const refund = Math.round(house.cost * 0.7);

    const char = await Character.findOne({ where: { userId: req.user.id }, transaction: t, lock: t.LOCK.UPDATE });
    char.money += refund;
    char.maxEnergy -= house.energyRegen;
    char.defense  -= house.defenseBonus;
    await char.save({ transaction: t });

    await record.destroy({ transaction: t });
    await t.commit();

    res.json({ message: 'تم بيع البيت', refund });
  } catch (err) {
    await t.rollback();
    res.status(err.status || 500).json({ message: err.msg || 'خطأ' });
  }
});

// GET /api/houses/mine
router.get('/mine', auth, async (req, res, next) => {
  try {
    const record = await UserHouse.findOne({ where: { userId: req.user.id }, include: [{ model: House }] });
    if (!record) return res.status(404).json({ message: 'لم يتم شراء أي بيت بعد' });
    res.json(record.House);
  } catch (err) { next(err); }
});

/* ╔══════════════════════════════════════════════════════╗
 * 4️⃣  Barrel
 * ╚══════════════════════════════════════════════════════╝ */
export default { House, UserHouse, seedHouses, router };