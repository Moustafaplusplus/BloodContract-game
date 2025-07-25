import express from 'express';
import { ShopController } from '../controllers/ShopController.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/admin.js';
import { validate } from '../middleware/validation.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Set up multer storage for weapon images
const weaponImageDir = path.join(__dirname, '..', '..', 'public', 'weapons');
if (!fs.existsSync(weaponImageDir)) fs.mkdirSync(weaponImageDir, { recursive: true });

// Set up multer storage for armor images
const armorImageDir = path.join(__dirname, '..', '..', 'public', 'armors');
if (!fs.existsSync(armorImageDir)) fs.mkdirSync(armorImageDir, { recursive: true });

// Helper function to sanitize filenames
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
};

const weaponStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, weaponImageDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext);
    const sanitizedBase = sanitizeFilename(base);
    const timestamp = Date.now();
    const unique = `${sanitizedBase}_${timestamp}${ext}`;
    cb(null, unique);
  }
});

const armorStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, armorImageDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext);
    const sanitizedBase = sanitizeFilename(base);
    const timestamp = Date.now();
    const unique = `${sanitizedBase}_${timestamp}${ext}`;
    cb(null, unique);
  }
});

const weaponUpload = multer({ storage: weaponStorage });
const armorUpload = multer({ storage: armorStorage });

// POST /api/shop/upload-weapon-image - Upload a weapon image (admin only)
router.post('/upload-weapon-image', auth, adminAuth, weaponUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' 
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 5MB.' 
      });
    }

    // Public URL for the uploaded image
    const url = `/weapons/${req.file.filename}`;
    res.json({ 
      imageUrl: url,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('[Weapon Image Upload] Error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// POST /api/shop/upload-armor-image - Upload an armor image (admin only)
router.post('/upload-armor-image', auth, adminAuth, armorUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' 
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 5MB.' 
      });
    }

    // Public URL for the uploaded image
    const url = `/armors/${req.file.filename}`;
    res.json({ 
      imageUrl: url,
      filename: req.file.filename,
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