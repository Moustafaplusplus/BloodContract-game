// ============================
// backend/src/routes/houses.js – final
// ============================
import express from 'express';
import auth    from '../middlewares/auth.js';
import { House, UserHouse } from '../models/house.js';
import Character from '../models/character.js';

const router = express.Router();

/* ────── GET /api/houses ────── */
router.get('/', auth, async (_req, res, next) => {
  try {
    const houses = await House.findAll();
    res.json(houses);
  } catch (err) { next(err); }
});

/* ────── POST /api/houses/buy ────── */
router.post('/buy', auth, async (req, res, next) => {
  try {
    const { houseId } = req.body;
    const char  = await Character.findOne({ where: { userId: req.user.id } });
    const house = await House.findByPk(houseId);

    if (!char || !house)
      return res.status(404).json({ message: 'البيت غير موجود' });

    if (char.money < house.cost)
      return res.status(400).json({ message: 'لا تملك مالاً كافياً' });

    const existing = await UserHouse.findOne({ where: { userId: char.userId } });
    if (existing)
      return res.status(400).json({ message: 'لديك بيت بالفعل' });

    await UserHouse.create({ userId: char.userId, houseId });
    char.money -= house.cost;
    await char.save();

    res.json({ message: 'تم شراء البيت بنجاح', house });
  } catch (err) { next(err); }
});

/* ────── GET /api/houses/mine ────── */
router.get('/mine', auth, async (req, res, next) => {
  try {
    const userHouse = await UserHouse.findOne({
      where:   { userId: req.user.id },
      include: [{ model: House, as: 'house' }],
    });

    if (!userHouse)
      return res.status(404).json({ message: 'لم يتم شراء أي بيت بعد' });

    res.json(userHouse.house);
  } catch (err) { next(err); }
});

export default router;
