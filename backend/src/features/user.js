// Updated backend/src/features/user.js (user.js)
import { Model, DataTypes } from 'sequelize';
import bcrypt   from 'bcryptjs';
import express  from 'express';
import jwt      from 'jsonwebtoken';
import { sequelize } from '../config/db.js';
import { Character }  from './character.js';

export class User extends Model {
  async validPassword(password) {
    return bcrypt.compare(password, this.password);
  }

  static associate(models) {
    this.hasOne(models.Character, { foreignKey: 'userId' });
  }
}

User.init({
  username: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { notEmpty: true, len: [3, 30] } },
  nickname: { type: DataTypes.STRING, allowNull: true },
  email:    { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  age:      { type: DataTypes.INTEGER, validate: { min: 13, max: 120 } },
  password: { type: DataTypes.STRING, allowNull: false, validate: { len: [6, 100] } },
  bio:       { type: DataTypes.TEXT, defaultValue: '' },
  avatarUrl: { type: DataTypes.STRING, defaultValue: '/avatars/default.png' },
}, {
  sequelize,
  modelName:  'User',
  tableName:  'Users',
  timestamps: false,
  hooks: {
    async beforeCreate(user) { user.password = await bcrypt.hash(user.password, 10); },
    async beforeUpdate(user) {
      if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
    },
  },
});

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('متغير البيئة JWT_SECRET مطلوب');

export function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'لم يتم توفير رمز التوثيق' });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (!decoded?.id) return res.status(403).json({ message: 'رمز توثيق غير صالح' });
    req.user = { id: decoded.id, characterId: decoded.characterId };
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'انتهت صلاحية رمز التوثيق' : 'رمز توثيق غير صالح';
    res.status(401).json({ message: msg });
  }
}

export const router = express.Router();

const makeCharacterDefaults = (user) => ({ userId: user.id, name: user.nickname || user.username });

router.post('/signup', async (req, res) => {
  const { username, nickname, email, password, age } = req.body;
  try {
    if (await User.findOne({ where: { email } }))    return res.status(400).json({ message: 'البريد مستخدم مسبقاً' });
    if (await User.findOne({ where: { username } })) return res.status(400).json({ message: 'اسم المستخدم مستخدم مسبقاً' });

    const user = await User.create({ username, nickname, email, password, age });
    const character = await Character.create(makeCharacterDefaults(user));

    const token = jwt.sign({ id: user.id, characterId: character.id }, SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error('🔥 خطأ في التسجيل:', err);
    res.status(500).json({ message: 'فشل التسجيل', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !(await user.validPassword(password)))
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });

    const [character] = await Character.findOrCreate({ where: { userId: user.id }, defaults: makeCharacterDefaults(user) });
    const token = jwt.sign({ id: user.id, characterId: character.id }, SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error('🔥 خطأ في تسجيل الدخول:', err);
    res.status(500).json({ message: 'فشل تسجيل الدخول', error: err.message });
  }
});

router.get('/users', async (_req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'nickname'] });
    res.json(users);
  } catch (err) {
    console.error('خطأ في جلب المستخدمين:', err);
    res.status(500).json({ error: 'فشل جلب المستخدمين' });
  }
});

export default { User, auth, router };