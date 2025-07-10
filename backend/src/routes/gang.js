import express from 'express';
import { GangController } from '../controllers/GangController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all gang routes
router.use(auth);

// Gang management
router.post('/gangs', GangController.createGang);
router.get('/gangs', GangController.getAllGangs);
router.get('/gangs/:id', GangController.getGangById);
router.get('/gangs/user/mine', GangController.getUserGang);

// Gang membership
router.post('/gangs/:gangId/join', GangController.joinGang);
router.post('/gangs/leave', GangController.leaveGang);
router.post('/gangs/:gangId/transfer-leadership', GangController.transferLeadership);

// Gang finances
router.post('/gangs/:gangId/contribute', GangController.contributeMoney);

// Gang wars
router.get('/gangs/:gangId/wars', GangController.getGangWars);
router.post('/gangs/wars', GangController.startGangWar);

export default router; 