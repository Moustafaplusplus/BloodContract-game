import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { uploadToFirebase } from '../config/firebase.js';

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

// Configure multer for Firebase uploads (memory storage) - NO FALLBACKS
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    console.log('📁 File filter check:', { 
      originalname: file.originalname, 
      mimetype: file.mimetype, 
      size: file.size 
    });
    
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      console.log('❌ File type rejected:', file.mimetype);
      return cb(new Error('يُسمح فقط برفع صور من نوع jpeg, png, gif, webp'));
    }
    
    console.log('✅ File type accepted:', file.mimetype);
    cb(null, true);
  },
  limits: { 
    fileSize: 1 * 1024 * 1024 // 1MB - STRICT LIMIT
  }
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

// GET /api/users/:id - Get user by ID (for username preview)
router.get('/users/:id', UserController.getUserById);

// POST /api/avatar - Upload user avatar
router.post('/avatar', auth, (req, res, next) => {
  console.log('🎯 Avatar upload endpoint hit!');
  console.log('🎯 Request headers:', req.headers);
  console.log('🎯 Request body keys:', Object.keys(req.body || {}));
  next();
}, upload.single('avatar'), (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'حجم الملف كبير جداً. الحد الأقصى هو 1 ميجابايت.' 
      });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
}, UserController.uploadAvatar);

export default router; 