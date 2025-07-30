import express from 'express';
import multer from 'multer';
import path from 'path';
import { SpecialItemController } from '../controllers/SpecialItemController.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/admin.js';

const router = express.Router();

// Configure multer for Firebase uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
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
router.post('/:id/use', auth, SpecialItemController.useSpecialItem);
router.post('/sell/:id', auth, SpecialItemController.sellSpecialItem);

// Admin routes
router.get('/admin', auth, adminAuth, SpecialItemController.getAllSpecialItemsForAdmin);
router.post('/admin', auth, adminAuth, SpecialItemController.createSpecialItem);
router.put('/admin/:id', auth, adminAuth, SpecialItemController.updateSpecialItem);
router.delete('/admin/:id', auth, adminAuth, SpecialItemController.deleteSpecialItem);
router.post('/upload-image', auth, adminAuth, upload.single('image'), SpecialItemController.uploadImage);

export default router; 