import express from 'express';
import { MinistryMissionController } from '../controllers/MinistryMissionController.js';
import { auth } from '../middleware/auth.js';
import { adminAuth } from '../middleware/admin.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/missions/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

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
router.post('/admin/upload-image', auth, adminAuth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // File uploaded successfully
    const imageUrl = `/missions/${req.file.filename}`;
    
    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('[Mission Image Upload] Error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router; 