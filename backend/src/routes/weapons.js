import express from 'express';
import auth from '../middlewares/auth.js';
import { Weapon, UserWeapon } from '../models/weapon.js';
import Character from '../models/character.js';

const router = express.Router();

router.get('/', auth, async (_req, res) => {
  const weapons = await Weapon.findAll();
  res.json(weapons);
});

router.post('/buy', auth, async (req, res) => {
  const { weaponId } = req.body;
  try {
    const weapon = await Weapon.findByPk(weaponId);
    const char = await Character.findOne({ where: { userId: req.user.id } });

    if (!weapon || !char) return res.status(404).json({ message: 'السلاح غير موجود' });
    if (char.money < weapon.price)
      return res.status(400).json({ message: 'لا تملك مالاً كافياً' });

    const alreadyOwned = await UserWeapon.findOne({
      where: { userId: char.userId, weaponId },
    });
    if (alreadyOwned)
      return res.status(400).json({ message: 'لديك هذا السلاح بالفعل' });

    char.money -= weapon.price;
    await char.save();

    const userWeapon = await UserWeapon.create({ userId: char.userId, weaponId });
    res.json({ message: 'تم شراء السلاح بنجاح', weapon: userWeapon });
  } catch (err) {
    console.error('❌ شراء السلاح:', err);
    res.status(500).json({ message: 'فشل شراء السلاح' });
  }
});

export default router;
