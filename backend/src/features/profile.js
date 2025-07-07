// =======================================================
//  backend/src/features/profile.js
//  Avatar upload + profile CRUD + player search (v1)
//  Enhancements:
//    • v1 route prefix for future‑proofing
//    • Multer validation: image‑only, 2 MB max
//    • Safer avatar filenames (png default)
//    • Removed unused inventory import
// =======================================================

/* ───────── externals ───────── */
import express from 'express';
import path    from 'path';
import fs      from 'fs';
import multer  from 'multer';
import rateLimit from 'express-rate-limit';
import { Op }  from 'sequelize';

/* ───────── internals ───────── */
import { auth, User } from './user.js';

/* ╔══════════════════════════════════════════════════════╗
 * 1️⃣  Avatar‑upload middleware (disk + validation)
 * ╚══════════════════════════════════════════════════════╝ */
const uploadDir = path.resolve('public/avatars');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    cb(null, `${req.user.id}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const isImg = /^image\/(png|jpe?g|gif|webp)$/i.test(file.mimetype);
  cb(null, isImg);
}

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter,
}).single('avatar');

/* ╔══════════════════════════════════════════════════════╗
 * 2️⃣  Error‑handler helper
 * ╚══════════════════════════════════════════════════════╝ */
export function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
}

/* ╔══════════════════════════════════════════════════════╗
 * 3️⃣  Profile service
 * ╚══════════════════════════════════════════════════════╝ */
export async function getProfile(req, res) {
  const userId = req.params.id || req.user.id;
  const user = await User.findByPk(userId, {
    attributes: ['id', 'username', 'bio', 'avatarUrl'],
  });
  if (!user) return res.status(404).json({ msg: 'User not found' });
  res.json(user);
}

export async function updateProfile(req, res) {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });
  if (req.body.bio !== undefined) user.bio = String(req.body.bio).slice(0, 500);
  if (req.file) user.avatarUrl = `/avatars/${req.file.filename}`;
  await user.save();
  res.json(user);
}

/* ╔══════════════════════════════════════════════════════╗
 * 4️⃣  Routers
 * ╚══════════════════════════════════════════════════════╝ */
export const profileRouter = express.Router();
export const searchRouter  = express.Router();

// profile routes (v1)
profileRouter.use(auth);
profileRouter.get('/',        getProfile);             // own
profileRouter.get('/:id',     getProfile);             // others
profileRouter.put('/', uploadAvatar, updateProfile);   // update

// search players
searchRouter.get('/players', auth, rateLimit({ windowMs: 10_000, max: 60 }), async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const players = await User.findAll({
      where: { username: { [Op.iLike]: `${q}%` } },
      attributes: ['id', 'username'],
      limit: 20,
    });
    res.json(players);
  } catch (err) { next(err); }
});

/* ╔══════════════════════════════════════════════════════╗
 * 5️⃣  Barrel export
 * ╚══════════════════════════════════════════════════════╝ */
export default { uploadAvatar, errorHandler, profileRouter, searchRouter, getProfile, updateProfile };
