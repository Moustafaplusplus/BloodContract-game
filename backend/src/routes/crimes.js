import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CrimeController } from '../controllers/CrimeController.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/admin.js';
import { validate } from '../middleware/validation.js';
import { checkConfinementAccess } from '../middleware/confinement.js';
import { Crime } from '../models/Crime.js';
import { uploadToFirebase } from '../config/firebase.js';

const router = express.Router();





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
    fileSize: 5 * 1024 * 1024
  }
});

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

router.post('/', auth, adminAuth, CrimeController.createCrime);
router.get('/', auth, CrimeController.getCrimes);
router.get('/admin', auth, adminAuth, CrimeController.getAllCrimes);
router.get('/:id', auth, CrimeController.getCrimeById);
router.put('/:id', auth, adminAuth, CrimeController.updateCrime);
router.delete('/:id', auth, adminAuth, CrimeController.deleteCrime);
router.post('/execute/:crimeId', auth, checkConfinementAccess, validate('executeCrime'), CrimeController.executeCrime);

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

router.post('/execute', auth, validate('executeCrime'), CrimeController.executeCrime);

export default router; 