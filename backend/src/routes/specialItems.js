import express from 'express';
import multer from 'multer';
import path from 'path';
import { SpecialItemController } from '../controllers/SpecialItemController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
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
router.post('/buy/:id', firebaseAuth, SpecialItemController.buySpecialItem);
router.post('/:id/use', firebaseAuth, SpecialItemController.useSpecialItem);
router.post('/sell/:id', firebaseAuth, SpecialItemController.sellSpecialItem);

// Admin routes
router.get('/admin', firebaseAuth, adminAuth, SpecialItemController.getAllSpecialItemsForAdmin);
router.post('/admin', firebaseAuth, adminAuth, SpecialItemController.createSpecialItem);
router.put('/admin/:id', firebaseAuth, adminAuth, SpecialItemController.updateSpecialItem);
router.delete('/admin/:id', firebaseAuth, adminAuth, SpecialItemController.deleteSpecialItem);
router.post('/upload-image', firebaseAuth, adminAuth, upload.single('image'), SpecialItemController.uploadImage);

export default router; 