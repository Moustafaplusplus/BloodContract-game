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
router.get('/user/join-requests', GangController.getUserJoinRequests);
router.post('/leave', GangController.leaveGang);



// Gang vault
router.get('/:id/vault', GangController.getVault);
router.patch('/:id/vault', GangController.updateVault);
// Gang board
router.patch('/:id/board', GangController.updateBoard);

// Gang details
router.get('/:id', GangController.getGangById);

// Gang membership
router.post('/:id/join', GangController.joinGang);
router.post('/:id/transfer-leadership', GangController.transferLeadership);
router.post('/:id/kick', GangController.kickMember);
router.post('/:id/promote', GangController.promoteMember);
router.post('/:id/demote', GangController.demoteOfficer);

// Join requests
router.get('/:id/join-requests', GangController.getJoinRequests);
router.post('/:id/join-requests/accept', GangController.acceptJoinRequest);
router.post('/:id/join-requests/reject', GangController.rejectJoinRequest);
router.delete('/:id/join-requests/cancel', GangController.cancelJoinRequest);

// Gang finances
router.post('/:id/contribute', GangController.contributeMoney);
// Gang owner actions
router.delete('/:id', GangController.deleteGang);
router.post('/:id/transfer-money', GangController.transferFromVault);


export default router;