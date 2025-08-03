import express from 'express';
import { MinistryMissionController } from '../controllers/MinistryMissionController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';
import { adminAuth } from '../middleware/admin.js';
import multer from 'multer';
import path from 'path';
import { uploadToFirebase } from '../config/firebase.js';

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

// Get all missions list with user progress
router.get('/list', firebaseAuth, MinistryMissionController.getMissionsList);

// Get specific mission data
router.get('/:missionId', firebaseAuth, MinistryMissionController.getMissionData);

// Complete a mission
router.post('/complete', firebaseAuth, MinistryMissionController.completeMission);

// Get user mission statistics
router.get('/stats/user', firebaseAuth, MinistryMissionController.getUserMissionStats);

// Admin routes
router.get('/admin/list', firebaseAuth, adminAuth, MinistryMissionController.getAdminMissionsList);
router.post('/admin', firebaseAuth, adminAuth, MinistryMissionController.createMission);
router.put('/admin/:id', firebaseAuth, adminAuth, MinistryMissionController.updateMission);
router.delete('/admin/:id', firebaseAuth, adminAuth, MinistryMissionController.deleteMission);

// Admin: Upload mission image
router.post('/admin/upload-image', firebaseAuth, adminAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = `mission-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const result = await uploadToFirebase(req.file.buffer, 'missions', filename);
    
    res.json({
      success: true,
      url: result.publicUrl,
      filename: result.filename
    });
  } catch (error) {
    console.error('[Mission Image Upload] Error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router; 