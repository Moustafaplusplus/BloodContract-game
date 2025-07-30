import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ShopController } from '../controllers/ShopController.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/admin.js';
import { validate } from '../middleware/validation.js';
import { uploadToFirebase } from '../config/firebase.js';

const router = express.Router();

// Ensure directories exist
const weaponImageDir = 'public/weapons';
const armorImageDir = 'public/armors';

if (!fs.existsSync(weaponImageDir)) {
  fs.mkdirSync(weaponImageDir, { recursive: true });
}
if (!fs.existsSync(armorImageDir)) {
  fs.mkdirSync(armorImageDir, { recursive: true });
}

// Sanitize filename for safe storage
const sanitizeFilename = (filename) => {
  // Remove or replace problematic characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase(); // Convert to lowercase
};

// Configure multer for Firebase uploads (memory storage)
const weaponUpload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const armorUpload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// POST /api/shop/upload-weapon-image - Upload a weapon image (admin only)
router.post('/upload-weapon-image', auth, adminAuth, weaponUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = `weapon-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const result = await uploadToFirebase(req.file.buffer, 'weapons', filename);
    
    res.json({ 
      imageUrl: result.publicUrl,
      filename: result.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('[Weapon Image Upload] Error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// POST /api/shop/upload-armor-image - Upload an armor image (admin only)
router.post('/upload-armor-image', auth, adminAuth, armorUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = `armor-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const result = await uploadToFirebase(req.file.buffer, 'armors', filename);
    
    res.json({ 
      imageUrl: result.publicUrl,
      filename: result.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('[Armor Image Upload] Error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// GET /api/shop/weapons - Get all weapons
router.get('/weapons', ShopController.getWeapons);

// GET /api/shop/armors - Get all armors
router.get('/armors', ShopController.getArmors);

// Apply auth middleware to purchase routes
router.use(auth);

// POST /api/shop/buy/weapon/:id - Buy a weapon
router.post('/buy/weapon/:id', validate('buyItem'), ShopController.buyWeapon);

// POST /api/shop/buy/armor/:id - Buy an armor
router.post('/buy/armor/:id', validate('buyItem'), ShopController.buyArmor);

// Admin routes for weapon management
router.use(adminAuth);

// GET /api/shop/admin/weapons - Get all weapons for admin
router.get('/admin/weapons', ShopController.getAllWeapons);

// POST /api/shop/admin/weapons - Create a new weapon (admin only)
router.post('/admin/weapons', ShopController.createWeapon);

// PUT /api/shop/admin/weapons/:id - Update a weapon (admin only)
router.put('/admin/weapons/:id', ShopController.updateWeapon);

// DELETE /api/shop/admin/weapons/:id - Delete a weapon (admin only)
router.delete('/admin/weapons/:id', ShopController.deleteWeapon);

// Admin routes for armor management
// GET /api/shop/admin/armors - Get all armors for admin
router.get('/admin/armors', ShopController.getAllArmors);

// POST /api/shop/admin/armors - Create a new armor (admin only)
router.post('/admin/armors', ShopController.createArmor);

// PUT /api/shop/admin/armors/:id - Update an armor (admin only)
router.put('/admin/armors/:id', ShopController.updateArmor);

// DELETE /api/shop/admin/armors/:id - Delete an armor (admin only)
router.delete('/admin/armors/:id', ShopController.deleteArmor);

export default router; 