import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CrimeController } from '../controllers/CrimeController.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/admin.js';
import { validate } from '../middleware/validation.js';
import { Crime } from '../models/Crime.js';
import { uploadToFirebase } from '../config/firebase.js';

const router = express.Router();

// Ensure crime images directory exists
const crimeImageDir = 'public/crimes';
if (!fs.existsSync(crimeImageDir)) {
  fs.mkdirSync(crimeImageDir, { recursive: true });
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
const upload = multer({ 
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

// POST /api/crimes/upload-image - Upload a crime image (admin only)
router.post('/upload-image', auth, adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

          const filename = `crime-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const result = await uploadToFirebase(req.file.buffer, 'crimes', filename);
      
      res.json({ 
        imageUrl: result.publicUrl,
        filename: result.filename,
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

// GET /api/crimes/debug/:id - Debug endpoint to view crime data (admin only)
router.get('/debug/:id', auth, adminAuth, async (req, res) => {
  try {
    const crimeId = parseInt(req.params.id, 10);
    const crime = await Crime.findByPk(crimeId);
    if (!crime) {
      return res.status(404).json({ error: "Crime not found" });
    }
    res.json(crime.toJSON());
  } catch (error) {
    console.error('[Crime Debug] Error:', error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/crimes/execute - Execute a crime (alternative endpoint, auth required)
router.post('/execute', auth, validate('executeCrime'), CrimeController.executeCrime);

export default router; 