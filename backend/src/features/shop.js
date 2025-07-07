// =======================================================
//  backend/src/features/shop.js           (fixed version)
// =======================================================

import { Model, DataTypes } from 'sequelize';
import express  from 'express';
import jwt      from 'jsonwebtoken';

import { sequelize }  from '../config/db.js';
import { auth }       from './user.js';
import { Character }  from './character.js';
import { GoldTransaction } from './gold.js';

/* ── 1) Models ────────────────────────────────────────── */
export class Weapon extends Model {}
Weapon.init({
  name:        { type: DataTypes.STRING,  allowNull: false },
  type:        { type: DataTypes.STRING },
  damage:      { type: DataTypes.INTEGER, defaultValue: 5 },
  price:       { type: DataTypes.INTEGER, defaultValue: 100 },
  rarity:      { type: DataTypes.STRING,  defaultValue: 'common' },
  description: { type: DataTypes.TEXT },
}, { sequelize, modelName: 'Weapon', timestamps: false });

export class Armor extends Model {}
Armor.init({
  name:   { type: DataTypes.STRING,  allowNull: false },
  def:    { type: DataTypes.INTEGER, defaultValue: 5 },
  price:  { type: DataTypes.INTEGER, defaultValue: 100 },
  rarity: { type: DataTypes.STRING,  defaultValue: 'common' },
}, { sequelize, modelName: 'Armor', timestamps: false });

/* ── 2)  NOW we can safely pull InventoryItem ─────────── */
import { InventoryItem } from './inventory.js';   // ← after Weapon/Armor exist

/* ── 3) Helpers ───────────────────────────────────────── */
const router = express.Router();

const getUserId = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET).id; } catch { return null; }
};

const CASH_PER_GOLD = 100;

/* ── 4) Routes ────────────────────────────────────────── */
// list weapons
router.get('/weapons', async (_req, res) => {
  res.json(await Weapon.findAll());
});

// buy weapon
router.post('/buy/weapon/:weaponId', auth, async (req, res) => {
  const userId   = req.user.id;
  const weaponId = Number(req.params.weaponId);
  const weapon   = await Weapon.findByPk(weaponId);
  if (!weapon) return res.status(404).json({ message: 'السلاح غير موجود' });

  const char = await Character.findOne({ where: { userId } });
  if (!char || char.money < weapon.price)
    return res.status(400).json({ message: 'لا تملك مالاً كافياً' });

  if (await InventoryItem.findOne({ where: { userId, itemType: 'weapon', itemId: weaponId } }))
    return res.status(400).json({ message: 'لديك هذا السلاح بالفعل' });

  await Promise.all([
    char.update({ money: char.money - weapon.price }),
    InventoryItem.create({ userId, itemType: 'weapon', itemId: weaponId, equipped: false }),
  ]);

  res.json({ message: 'تم شراء السلاح بنجاح', weaponId });
});

// convert cash → gold
router.post('/buy/gold', auth, async (req, res) => {
  const amountGold = Number(req.body.amountGold);
  if (!amountGold || amountGold <= 0)
    return res.status(400).json({ message: 'amountGold مطلوب' });

  const cost = amountGold * CASH_PER_GOLD;
  const char = await Character.findOne({ where: { userId: req.user.id } });
  if (!char || char.money < cost)
    return res.status(400).json({ message: 'لا تملك مالاً كافياً' });

  await char.update({ money: char.money - cost, gold: (char.gold || 0) + amountGold });
  await GoldTransaction.create({
    character: char.id,
    amount:    amountGold,
    kind:      'buy',
    ref:       `cash-${Date.now()}`,
  }).catch(() => {});

  res.json({ message: 'Gold purchased with cash', goldGranted: amountGold, cashSpent: cost });
});

/* ── 5) Seed helpers (unchanged) ─────────────────────── */
export async function loadStarterWeapons() { /* …same as before… */ }
export async function loadStarterArmors()  { /* …same as before… */ }

/* ── 6) Barrel export ─────────────────────────────────── */
export { router };
export default { Weapon, Armor, router, loadStarterWeapons, loadStarterArmors };
