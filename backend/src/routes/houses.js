import express from 'express';
import auth from '../middlewares/auth.js';
import { House, UserHouse } from '../models/house.js';
import Character from '../models/character.js';

const router = express.Router();

router.get('/', auth, async (_req, res) => {
  const houses = await House.findAll();
  res.json(houses);
});

router.post('/buy', auth, async (req, res) => {
  const { houseId } = req.body;
  const char = await Character.findOne({ where: { userId: req.user.id } });
  const house = await House.findByPk(houseId);

  if (!char || !house) return res.status(404).json({ message: 'البيت غير موجود' });
  if (char.money < house.cost) return res.status(400).json({ message: 'لا تملك مالاً كافياً' });

  const existing = await UserHouse.findOne({ where: { userId: char.userId } });
  if (existing) return res.status(400).json({ message: 'لديك بيت بالفعل' });

  await UserHouse.create({ userId: char.userId, houseId });
  char.money -= house.cost;
  await char.save();

  res.json({ message: 'تم شراء البيت بنجاح', house });
});

router.get('/mine', auth, async (req, res) => {
  const userHouse = await UserHouse.findOne({
    where: { userId: req.user.id },
    include: House,
  });

  if (!userHouse) return res.status(404).json({ message: 'لم يتم شراء أي بيت بعد' });

  res.json(userHouse.house);
});

export default router;
