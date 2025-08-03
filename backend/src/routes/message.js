import express from 'express';
import MessageController from '../controllers/MessageController.js';
import { firebaseAuth } from '../middleware/firebaseAuth.js';

const router = express.Router();

router.post('/', firebaseAuth, MessageController.sendMessage);
router.get('/inbox', firebaseAuth, MessageController.inbox);
router.get('/search/users', firebaseAuth, MessageController.searchUsers);
router.get('/:userId', firebaseAuth, MessageController.getMessages);
router.patch('/read/:messageId', firebaseAuth, MessageController.markAsRead);
router.patch('/:messageId', firebaseAuth, MessageController.editMessage);
router.delete('/:messageId', firebaseAuth, MessageController.deleteMessage);
router.post('/:messageId/reactions', firebaseAuth, MessageController.reactMessage);

export default router; 