import express from 'express';
import FriendshipController from '../controllers/FriendshipController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';

const router = express.Router();

router.post('/add', firebaseAuth, FriendshipController.addFriend);
router.post('/remove', firebaseAuth, FriendshipController.removeFriend);
router.get('/list', firebaseAuth, FriendshipController.listFriends);
router.get('/is-friend', firebaseAuth, FriendshipController.isFriend);
// New endpoints for pending, accept, reject
router.get('/pending', firebaseAuth, FriendshipController.pending);
router.post('/accept', firebaseAuth, FriendshipController.accept);
router.post('/reject', firebaseAuth, FriendshipController.reject);
// Add this route to get friends of any user by userId
router.get('/list/:userId', firebaseAuth, FriendshipController.listFriendsOfUser);

export default router; 