import express from 'express';
import { MinistryMissionController } from '../controllers/MinistryMissionController.js';
import { auth } from '../middleware/auth.js';
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
router.get('/list', auth, MinistryMissionController.getMissionsList);

// Get specific mission data
router.get('/:missionId', auth, MinistryMissionController.getMissionData);

// Complete a mission
router.post('/complete', auth, MinistryMissionController.completeMission);

// Get user mission statistics
router.get('/stats/user', auth, MinistryMissionController.getUserMissionStats);

// Admin routes
router.get('/admin/list', auth, adminAuth, MinistryMissionController.getAdminMissionsList);
router.post('/admin', auth, adminAuth, MinistryMissionController.createMission);
router.put('/admin/:id', auth, adminAuth, MinistryMissionController.updateMission);
router.delete('/admin/:id', auth, adminAuth, MinistryMissionController.deleteMission);

// Admin: Upload mission image
router.post('/admin/upload-image', auth, adminAuth, upload.single('image'), async (req, res) => {
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