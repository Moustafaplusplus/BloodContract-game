// ================================================
//  backend/src/features/user.js
//  Unified User barrel – auth & profile only
//  Gameplay fields moved to Character model for consistency
// ================================================

/* ---------- external deps ---------- */
import { Model, DataTypes } from 'sequelize';
import bcrypt   from 'bcryptjs';
import express  from 'express';
import jwt      from 'jsonwebtoken';

/* ---------- local deps ---------- */
import { sequelize } from '../config/db.js';
import { Character } from './character.js'; // imported early to avoid circulars later

/* =====================================================================
 * 1) Sequelize Model (identity + auth)
 * =====================================================================*/
export class User extends Model {
  async validPassword(password) {
    return bcrypt.compare(password, this.password);
  }

  static associate(models) {
    this.hasOne(models.Character, { foreignKey: 'userId' });
  }
}

User.init({
  /* ── Identity ───────────────────────────────────────────── */
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { notEmpty: true, len: [3, 30] },
  },
  nickname: { type: DataTypes.STRING, allowNull: true },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  age: { type: DataTypes.INTEGER, validate: { min: 13, max: 120 } },

  /* ── Auth ───────────────────────────────────────────────── */
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: [6, 100] },
  },

  /* ── Profile ────────────────────────────────────────────── */
  bio:       { type: DataTypes.TEXT,   defaultValue: '' },
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

/* =====================================================================
 * 2) JWT Auth middleware
 * =====================================================================*/
const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET env var is required');

export function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, SECRET);
    if (!decoded?.id) return res.status(403).json({ message: 'Invalid token' });
    req.user = { id: decoded.id, characterId: decoded.characterId };
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    res.status(401).json({ message: msg });
  }
}

/* =====================================================================
 * 3) Express routes (/signup, /login, /users)
 * =====================================================================*/
export const router = express.Router();

const makeCharacterDefaults = (user) => ({ userId: user.id, name: user.nickname || user.username });

router.post('/signup', async (req, res) => {
  const { username, nickname, email, password, age } = req.body;
  try {
    if (await User.findOne({ where: { email } }))      return res.status(400).json({ message: 'البريد مستخدم مسبقاً' });
    if (await User.findOne({ where: { username } }))   return res.status(400).json({ message: 'اسم المستخدم مستخدم مسبقاً' });

    const user = await User.create({ username, nickname, email, password, age });
    const character = await Character.create(makeCharacterDefaults(user));

    const token = jwt.sign({ id: user.id, characterId: character.id }, SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    console.error('🔥 Signup error:', err);
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
    console.error('🔥 Login error:', err);
    res.status(500).json({ message: 'فشل تسجيل الدخول', error: err.message });
  }
});

router.get('/users', async (_req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'nickname'] });
    res.json(users);
  } catch (err) {
    console.error('Error loading users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/* =====================================================================
 * 4) Barrel export
 * =====================================================================*/
export default { User, auth, router };
