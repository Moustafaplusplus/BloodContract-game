import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import multer from 'multer';
import rateLimit from 'express-rate-limit';

// Rate limiters
const signupLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'تم تجاوز الحد المسموح لمحاولات التسجيل. حاول لاحقاً.' }
});
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'تم تجاوز الحد المسموح لمحاولات الدخول. حاول لاحقاً.' }
});

// Use the same multer setup as in UserController
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + '/public/avatars');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, `user_${req.user.id}_${Date.now()}.${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('يُسمح فقط برفع صور من نوع jpeg, png, gif, webp'));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

const router = express.Router();

// POST /api/signup - Register new user
router.post('/signup', signupLimiter, validate('signup'), UserController.signup);

// POST /api/login - Login user
router.post('/login', loginLimiter, validate('login'), UserController.login);

// GET /api/users - Get all users (public endpoint)
router.get('/users', UserController.getAllUsers);

// GET /api/users/active - Get active users in the last 30 minutes
router.get('/users/active', UserController.getActiveUsers);

// POST /api/avatar - Upload user avatar
router.post('/avatar', auth, upload.single('avatar'), (err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
}, UserController.uploadAvatar);

export default router; 