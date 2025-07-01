// backend/src/routes/weapons.js
import express from 'express';
import auth from '../middlewares/auth.js';
import { Weapon, UserWeapon } from '../models/weapon.js';
import User from '../models/user.js';

const router = express.Router();

// GET /api/weapons - all available weapons
router.get('/', auth, async (_req, res) => {
  const weapons = await Weapon.findAll();
  res.json(weapons);
});

// POST /api/weapons/buy - buy a weapon
router.post('/buy', auth, async (req, res) => {
  const { weaponId } = req.body;
  try {
    const weapon = await Weapon.findByPk(weaponId);
    const user = await User.findByPk(req.user.id);

    if (!weapon || !user) return res.status(404).json({ message: 'السلاح غير موجود' });
    if (user.money < weapon.price)
      return res.status(400).json({ message: 'لا تملك مالاً كافياً' });

    const alreadyOwned = await UserWeapon.findOne({
      where: { userId: user.id, weaponId },
    });
    if (alreadyOwned)
      return res.status(400).json({ message: 'لديك هذا السلاح بالفعل' });

    // Deduct money and give weapon
    await user.update({ money: user.money - weapon.price });
    const userWeapon = await UserWeapon.create({ userId: user.id, weaponId });

    res.json({ message: 'تم شراء السلاح بنجاح', weapon: userWeapon });
  } catch (err) {
    console.error('❌ شراء السلاح:', err);
    res.status(500).json({ message: 'فشل شراء السلاح' });
  }
});

export default router;
