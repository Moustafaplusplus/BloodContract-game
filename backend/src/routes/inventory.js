// backend/src/routes/inventory.js
import express from 'express';
import jwt from 'jsonwebtoken';

import Weapon         from '../models/weapon.js';
import Armor          from '../models/armor.js';
import InventoryItem  from '../models/inventoryItem.js';
import Character      from '../models/character.js';

const router = express.Router();

/* helper — JWT → userId */
const authUserId = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  return jwt.verify(token, process.env.JWT_SECRET).id;
};

/* helper — normalise itemType */
const canonicalType = (t) =>
  ['weapon', 'melee', 'rifle', 'sniper'].includes(t) ? 'weapon'
  :  t === 'armor' ? 'armor'
  :  null;

/* ── GET /api/inventory ───────────────────────── */
router.get('/', async (req, res) => {
  const userId = authUserId(req);
  if (!userId) return res.sendStatus(401);

  const rows = await InventoryItem.findAll({ where: { userId } });

  const enriched = await Promise.all(
    rows.map(async (it) => {
      const type = canonicalType(it.itemType);           // 💡 normalised
      const ref  = type === 'armor'
        ? await Armor.findByPk(it.itemId)
        : await Weapon.findByPk(it.itemId);

      return {
        id:        it.itemId,
        type,                                      // always 'weapon' or 'armor'
        equipped:  it.equipped,
        ...ref?.toJSON(),
      };
    }),
  );

  res.json(enriched);
});

/* ── POST /api/inventory/equip/:type/:itemId ──── */
router.post('/equip/:type/:itemId', async (req, res) => {
  const userId = authUserId(req);
  if (!userId) return res.sendStatus(401);

  let { type, itemId } = req.params;
  type = canonicalType(type);                     // 💡 map 'melee' → 'weapon'
  if (!type) return res.status(400).send('invalid type');

  const item = await InventoryItem.findOne({
    where: { userId, itemType: type, itemId },
  });
  if (!item) return res.status(404).send('item not owned');

  await InventoryItem.update(
    { equipped: false },
    { where: { userId, itemType: type } },
  );

  item.equipped = true;
  await item.save();

  const char = await Character.findOne({ where: { userId } });
  if (type === 'weapon') char.equippedWeaponId = itemId;
  else                   char.equippedArmorId  = itemId;
  await char.save();

  res.json({ message: 'equipped', itemId });
});

/* ── POST /api/inventory/unequip/:type ────────── */
router.post('/unequip/:type', async (req, res) => {
  const userId = authUserId(req);
  if (!userId) return res.sendStatus(401);

  let { type } = req.params;
  type = canonicalType(type);
  if (!type) return res.status(400).send('invalid type');

  await InventoryItem.update(
    { equipped: false },
    { where: { userId, itemType: type } },
  );

  const char = await Character.findOne({ where: { userId } });
  if (type === 'weapon') char.equippedWeaponId = null;
  else                   char.equippedArmorId  = null;
  await char.save();

  res.json({ message: 'unequipped' });
});

export default router;
