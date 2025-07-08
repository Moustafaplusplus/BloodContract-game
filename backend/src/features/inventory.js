// =======================================================
//  backend/src/features/inventory.js  (HUD emit + bonuses)
// =======================================================
import express       from 'express';
import { DataTypes } from 'sequelize';
import jwt           from 'jsonwebtoken';

import { sequelize } from '../config/db.js';
import { Character } from './character.js';
import { Weapon, Armor } from './shop.js';
import { Car }      from './car.js';

/* 1) Model --------------------------------------------------------------- */
export const InventoryItem = sequelize.define('InventoryItem', {
  userId:   { type: DataTypes.INTEGER, allowNull: false },
  itemType: { type: DataTypes.STRING },   // weapon | armor | car
  itemId:   { type: DataTypes.INTEGER },
  equipped: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: false });

/* 2) Helpers -------------------------------------------------------------- */
const getUserId = (req) => {
  const t = req.headers.authorization?.split(' ')[1];
  if (!t) return null;
  try { return jwt.verify(t, process.env.JWT_SECRET).id; } catch { return null; }
};

const canonicalType = (t) =>
  ['weapon','melee','rifle','sniper'].includes(t) ? 'weapon'
  : t === 'armor' ? 'armor'
  : t === 'car'   ? 'car'
  : null;

const modelFor = (t) =>
  t === 'weapon' ? Weapon :
  t === 'armor'  ? Armor  :
  t === 'car'    ? Car    : null;

/* 3) Router --------------------------------------------------------------- */
export const router = express.Router();

/* GET /api/inventory */
router.get('/', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.sendStatus(401);

  try {
    const rows = await InventoryItem.findAll({ where: { userId } });

    const items = await Promise.all(rows.map(async (row) => {
      const refModel = modelFor(row.itemType);
      const ref      = refModel ? await refModel.findByPk(row.itemId) : null;
      return { id: row.itemId, type: row.itemType, equipped: row.equipped, ...ref?.toJSON() };
    }));

    res.json({ items });
  } catch (err) {
    console.error('[Inventory] GET failed', err);
    res.sendStatus(500);
  }
});

/* POST /api/inventory/equip */
router.post('/equip', async (req, res) => {
  const userId = getUserId(req); if (!userId) return res.sendStatus(401);
  const { type, itemId } = req.body;
  const slot = canonicalType(type);
  if (!slot) return res.status(400).json({ message: 'invalid type' });

  const itemRow = await InventoryItem.findOne({ where: { userId, itemType: slot, itemId } });
  if (!itemRow) return res.status(404).json({ message: 'item not owned' });

  await InventoryItem.update({ equipped: false }, { where: { userId, itemType: slot } });
  itemRow.equipped = true; await itemRow.save();

  const char = await Character.findOne({ where: { userId } });
  if (slot === 'weapon') char.equippedWeaponId = itemId;
  else if (slot === 'armor') char.equippedArmorId = itemId;
  else if (slot === 'car') char.equippedCarId = itemId;
  await char.save();

  /* push new HUD */
  req.app.get('io')?.to(String(userId))
     .emit('hud:update', await char.toSafeJSON());

  res.json({ message: 'equipped', slot, itemId });
});

/* POST /api/inventory/unequip */
router.post('/unequip', async (req, res) => {
  const userId = getUserId(req); if (!userId) return res.sendStatus(401);
  const slot = canonicalType(req.body.type);
  if (!slot) return res.status(400).json({ message: 'invalid type' });

  await InventoryItem.update({ equipped: false }, { where: { userId, itemType: slot } });

  const char = await Character.findOne({ where: { userId } });
  if (slot === 'weapon') char.equippedWeaponId = null;
  else if (slot === 'armor') char.equippedArmorId = null;
  else if (slot === 'car') char.equippedCarId = null;
  await char.save();

  req.app.get('io')?.to(String(userId))
     .emit('hud:update', await char.toSafeJSON());

  res.json({ message: 'unequipped', slot });
});

/* POST /api/inventory/sell */
router.post('/sell', async (req, res) => {
  const userId = getUserId(req); if (!userId) return res.sendStatus(401);
  const { type, itemId } = req.body;
  const slot = canonicalType(type);
  if (!slot) return res.status(400).json({ message: 'invalid type' });

  const row = await InventoryItem.findOne({ where: { userId, itemType: slot, itemId } });
  if (!row) return res.status(404).json({ message: 'item not owned' });

  const refModel = modelFor(slot);
  const ref      = refModel ? await refModel.findByPk(itemId) : null;
  const sellPrice = Math.round((ref?.price || 0) * 0.5);

  const char = await Character.findOne({ where: { userId } });
  char.money += sellPrice; await char.save();

  await row.destroy();

  req.app.get('io')?.to(String(userId))
     .emit('hud:update', await char.toSafeJSON());

  res.json({ message: 'sold', sellPrice });
});

/* 4) Barrel export -------------------------------------------------------- */
export default { InventoryItem, router };
