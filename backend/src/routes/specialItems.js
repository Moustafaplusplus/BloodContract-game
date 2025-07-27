import express from 'express';
import multer from 'multer';
import path from 'path';
import { SpecialItemController } from '../controllers/SpecialItemController.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/admin.js';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/special-items/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public routes (for viewing items)
router.get('/', SpecialItemController.getSpecialItems);

// Protected routes (require authentication)
router.post('/buy/:id', auth, SpecialItemController.buySpecialItem);
router.post('/use/:id', auth, SpecialItemController.useSpecialItem);
router.post('/sell/:id', auth, SpecialItemController.sellSpecialItem);

// Admin routes
router.get('/admin', auth, adminAuth, SpecialItemController.getAllSpecialItemsForAdmin);
router.post('/admin', auth, adminAuth, SpecialItemController.createSpecialItem);
router.put('/admin/:id', auth, adminAuth, SpecialItemController.updateSpecialItem);
router.delete('/admin/:id', auth, adminAuth, SpecialItemController.deleteSpecialItem);
router.post('/upload-image', auth, adminAuth, upload.single('image'), SpecialItemController.uploadImage);

export default router; 