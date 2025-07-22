import express from 'express';
import FriendshipController from '../controllers/FriendshipController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/add', auth, FriendshipController.addFriend);
router.post('/remove', auth, FriendshipController.removeFriend);
router.get('/list', auth, FriendshipController.listFriends);
router.get('/is-friend', auth, FriendshipController.isFriend);
// New endpoints for pending, accept, reject
router.get('/pending', auth, FriendshipController.pending);
router.post('/accept', auth, FriendshipController.accept);
router.post('/reject', auth, FriendshipController.reject);

export default router; 