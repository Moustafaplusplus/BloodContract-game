import express from 'express';
import { GangController } from '../controllers/GangController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Apply auth middleware to all gang routes
router.use(auth);

// Gang management - specific routes first
router.post('/', validate('createGang'), GangController.createGang);
router.get('/', GangController.getAllGangs);
router.get('/user/mine', GangController.getUserGang);
router.post('/leave', GangController.leaveGang);



// Gang vault
router.get('/:gangId/vault', GangController.getVault);
router.patch('/:gangId/vault', GangController.updateVault);
// Gang board
router.patch('/:gangId/board', GangController.updateBoard);

// Gang details
router.get('/:id', GangController.getGangById);

// Gang membership
router.post('/:gangId/join', GangController.joinGang);
router.post('/:gangId/transfer-leadership', GangController.transferLeadership);
router.post('/:gangId/kick', GangController.kickMember);
router.post('/:gangId/promote', GangController.promoteMember);
router.post('/:gangId/demote', GangController.demoteOfficer);

// Join requests
router.get('/:gangId/join-requests', GangController.getJoinRequests);
router.post('/:gangId/join-requests/accept', GangController.acceptJoinRequest);
router.post('/:gangId/join-requests/reject', GangController.rejectJoinRequest);
router.delete('/:gangId/join-requests/cancel', GangController.cancelJoinRequest);
router.get('/user/join-requests', GangController.getUserJoinRequests);

// Gang finances
router.post('/:gangId/contribute', GangController.contributeMoney);
// Gang owner actions
router.delete('/:gangId', GangController.deleteGang);
router.post('/:gangId/transfer-money', GangController.transferFromVault);


export default router;