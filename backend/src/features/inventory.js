// =======================================================
//  backend/src/features/inventory.js
// =======================================================

import express from 'express';
import { DataTypes } from 'sequelize';
import jwt from 'jsonwebtoken';

import { sequelize } from '../config/db.js';
import { Character } from './character.js';
import { Weapon, Armor } from './shop.js';
import { House, UserHouse } from './houses.js';
import { Car } from './car.js';            // will be defined once car feature lands

/* ── 1) Sequelize model ───────────────────────────────── */
export const InventoryItem = sequelize.define('InventoryItem', {
  userId:   { type: DataTypes.INTEGER, allowNull: false },
  itemType: { type: DataTypes.STRING },   // weapon | armor | car
  itemId:   { type: DataTypes.INTEGER },
  equipped: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: false });

/* ── 2) Helpers ───────────────────────────────────────── */
const getUserId = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET).id; } catch { return null; }
};

const canonicalType = (t) => {
  if (['weapon', 'melee', 'rifle', 'sniper'].includes(t)) return 'weapon';
  if (t === 'armor') return 'armor';
  if (t === 'car')   return 'car';
  return null;
};

// **new** – defer model lookup to runtime to avoid circular import
const modelFor = (type) =>
  type === 'weapon' ? Weapon
  : type === 'armor' ? Armor
  : type === 'car'   ? Car
  : null;

/* ── 3) Router ────────────────────────────────────────── */
export const router = express.Router();

/* GET /api/inventory – weapons + armor + car + house */
router.get('/', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.sendStatus(401);

  const [items, userHouse] = await Promise.all([
    InventoryItem.findAll({ where: { userId } }),
    UserHouse.findOne({ where: { userId }, include: [House] }),
  ]);

  const enriched = await Promise.all(items.map(async (it) => {
    const refModel = modelFor(it.itemType);
    const ref = refModel ? await refModel.findByPk(it.itemId) : null;
    return { id: it.itemId, type: it.itemType, equipped: it.equipped, ...ref?.toJSON() };
  }));

  res.json({ house: userHouse?.House || null, items: enriched });
});

/* POST /api/inventory/equip  { type, itemId } */
router.post('/equip', async (req, res) => {
  const userId = getUserId(req); if (!userId) return res.sendStatus(401);
  const { type, itemId } = req.body;
  const slot = canonicalType(type);
  if (!slot) return res.status(400).json({ message: 'invalid type' });

  const item = await InventoryItem.findOne({ where: { userId, itemType: slot, itemId } });
  if (!item) return res.status(404).json({ message: 'item not owned' });

  await InventoryItem.update({ equipped: false }, { where: { userId, itemType: slot } });
  item.equipped = true; await item.save();

  const char = await Character.findOne({ where: { userId } });
  if (slot === 'weapon')      char.equippedWeaponId = itemId;
  else if (slot === 'armor')  char.equippedArmorId  = itemId;
  else if (slot === 'car')    char.equippedCarId    = itemId;
  await char.save();

  res.json({ message: 'equipped', slot, itemId });
});

/* POST /api/inventory/unequip  { type } */
router.post('/unequip', async (req, res) => {
  const userId = getUserId(req); if (!userId) return res.sendStatus(401);
  const slot = canonicalType(req.body.type);
  if (!slot) return res.status(400).json({ message: 'invalid type' });

  await InventoryItem.update({ equipped: false }, { where: { userId, itemType: slot } });

  const char = await Character.findOne({ where: { userId } });
  if (slot === 'weapon')      char.equippedWeaponId = null;
  else if (slot === 'armor')  char.equippedArmorId  = null;
  else if (slot === 'car')    char.equippedCarId    = null;
  await char.save();

  res.json({ message: 'unequipped', slot });
});

/* POST /api/inventory/sell  { type, itemId } */
router.post('/sell', async (req, res) => {
  const userId = getUserId(req); if (!userId) return res.sendStatus(401);
  const { type, itemId } = req.body;
  const slot = canonicalType(type);
  if (!slot) return res.status(400).json({ message: 'invalid type' });

  const itemRow = await InventoryItem.findOne({ where: { userId, itemType: slot, itemId } });
  if (!itemRow) return res.status(404).json({ message: 'item not owned' });

  const refModel = modelFor(slot);
  const ref      = refModel ? await refModel.findByPk(itemId) : null;
  const sellPrice = Math.round((ref?.price || 0) * 0.5);

  const char = await Character.findOne({ where: { userId } });
  char.money += sellPrice; await char.save();

  await itemRow.destroy();
  res.json({ message: 'sold', sellPrice });
});

/* ── 4) Barrel export ─────────────────────────────────── */
export default { InventoryItem, router };
