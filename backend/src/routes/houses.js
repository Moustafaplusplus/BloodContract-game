// File: backend/src/routes/houses.js

import express from 'express';
import auth from '../middlewares/auth.js';
import { House, UserHouse } from '../models/house.js';
import User from '../models/user.js';

const router = express.Router();

// GET /api/houses - all available houses
router.get('/', auth, async (_req, res) => {
  const houses = await House.findAll();
  res.json(houses);
});

// POST /api/houses/buy - buy a house
router.post('/buy', auth, async (req, res) => {
  const { houseId } = req.body;
  const user = await User.findByPk(req.user.id);
  const house = await House.findByPk(houseId);

  if (!user || !house) return res.status(404).json({ message: 'البيت غير موجود' });
  if (user.money < house.cost) return res.status(400).json({ message: 'لا تملك مالاً كافياً' });

  const existing = await UserHouse.findOne({ where: { userId: user.id } });
  if (existing) return res.status(400).json({ message: 'لديك بيت بالفعل' });

  await UserHouse.create({ userId: user.id, houseId });
  await user.update({ money: user.money - house.cost });

  res.json({ message: 'تم شراء البيت بنجاح', house });
});

// GET /api/houses/mine - get current user's house
router.get('/mine', auth, async (req, res) => {
  const userHouse = await UserHouse.findOne({
    where: { userId: req.user.id },
    include: House,
  });

  if (!userHouse) return res.status(404).json({ message: 'لم يتم شراء أي بيت بعد' });

  res.json(userHouse.house);
});

export default router;