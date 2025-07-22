import express from 'express';
import { CrimeController } from '../controllers/CrimeController.js';
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

// Set up multer storage for crime images
const crimeImageDir = path.join(__dirname, '..', '..', 'public', 'crimes');
if (!fs.existsSync(crimeImageDir)) fs.mkdirSync(crimeImageDir, { recursive: true });

// Helper function to sanitize filenames
const sanitizeFilename = (filename) => {
  // Remove or replace problematic characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .toLowerCase(); // Convert to lowercase
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, crimeImageDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext);
    const sanitizedBase = sanitizeFilename(base);
    const timestamp = Date.now();
    const unique = `${sanitizedBase}_${timestamp}${ext}`;
    cb(null, unique);
  }
});
const upload = multer({ storage });

// POST /api/crimes/upload-image - Upload a crime image (admin only)
router.post('/upload-image', auth, adminAuth, upload.single('image'), (req, res) => {
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

          // File uploaded successfully
    
    // Public URL for the uploaded image
    const url = `/crimes/${req.file.filename}`;
    res.json({ 
      imageUrl: url,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('[Crime Image Upload] Error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// POST /api/crimes - Create a new crime (admin only)
router.post('/', auth, adminAuth, CrimeController.createCrime);

// GET /api/crimes - Get available crimes for user's level (auth required)
router.get('/', auth, CrimeController.getCrimes);

// GET /api/crimes/admin - Get all crimes for admin (admin only)
router.get('/admin', auth, adminAuth, CrimeController.getAllCrimes);

// GET /api/crimes/:id - Get a specific crime by ID (auth required)
router.get('/:id', auth, CrimeController.getCrimeById);

// PUT /api/crimes/:id - Update a crime (admin only)
router.put('/:id', auth, adminAuth, CrimeController.updateCrime);

// DELETE /api/crimes/:id - Delete a crime (admin only)
router.delete('/:id', auth, adminAuth, CrimeController.deleteCrime);

// POST /api/crimes/execute/:crimeId - Execute a specific crime (auth required)
router.post('/execute/:crimeId', auth, validate('executeCrime'), CrimeController.executeCrime);

// POST /api/crimes/execute - Execute a crime (alternative endpoint, auth required)
router.post('/execute', auth, validate('executeCrime'), CrimeController.executeCrime);

export default router; 