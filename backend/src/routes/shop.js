import express from 'express';
import jwt from 'jsonwebtoken';

import { Weapon }     from '../models/weapon.js';
import InventoryItem  from '../models/inventoryItem.js';
import Character      from '../models/character.js';

const router = express.Router();

/* helper → get userId from JWT */
const authUserId = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return null;
  return jwt.verify(token, process.env.JWT_SECRET).id;
};

/* ────────────────────────────────────────────────
   GET  /api/shop/weapons   → list store weapons
   ─────────────────────────────────────────────── */
router.get('/weapons', async (_req, res) => {
  const weapons = await Weapon.findAll();
  res.json(weapons);
});

/* ────────────────────────────────────────────────
   POST /api/shop/buy/weapon/:weaponId
   Body not needed (weaponId is in URL)
   ─────────────────────────────────────────────── */
router.post('/buy/weapon/:weaponId', async (req, res) => {
  const userId   = authUserId(req);
  if (!userId) return res.sendStatus(401);

  const weaponId = Number(req.params.weaponId);
  const weapon   = await Weapon.findByPk(weaponId);
  if (!weapon) return res.status(404).json({ message: 'السلاح غير موجود' });

  /* charge the player */
  const char = await Character.findOne({ where: { userId } });
  if (!char || char.money < weapon.price)
    return res.status(400).json({ message: 'لا تملك مالاً كافياً' });

  /* already owned? */
  const owned = await InventoryItem.findOne({
    where: { userId, itemType: 'weapon', itemId: weaponId },
  });
  if (owned) return res.status(400).json({ message: 'لديك هذا السلاح بالفعل' });

  /* pay & add to inventory */
  char.money -= weapon.price;
  await char.save();

  await InventoryItem.create({
    userId,
    itemType: 'weapon',
    itemId: weaponId,
    equipped: false,
  });

  res.json({ message: 'تم شراء السلاح بنجاح', weaponId });
});

export default router;
