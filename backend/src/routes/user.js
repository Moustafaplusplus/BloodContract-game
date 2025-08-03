import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { uploadToFirebase } from '../config/firebase.js';
import { User } from '../models/User.js'; // Added missing import for User model

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
    
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('يُسمح فقط برفع صور من نوع jpeg, png, gif, webp'));
    }
    
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
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const file = req.file;
    const userId = req.user.id;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' });
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Upload to Firebase Storage
    const result = await uploadToFirebase(file, userId);
    
    // Update user's avatar URL
    user.avatarUrl = result.publicUrl;
    await user.save();
    
    res.json({
      success: true,
      avatarUrl: result.publicUrl,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

export default router; 