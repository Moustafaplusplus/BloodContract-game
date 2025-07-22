import express from 'express';
import MessageController from '../controllers/MessageController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, MessageController.sendMessage);
router.get('/inbox', auth, MessageController.inbox);
router.get('/search/users', auth, MessageController.searchUsers);
router.get('/:userId', auth, MessageController.getMessages);
router.patch('/read/:messageId', auth, MessageController.markAsRead);
router.patch('/:messageId', auth, MessageController.editMessage);
router.delete('/:messageId', auth, MessageController.deleteMessage);
router.post('/:messageId/reactions', auth, MessageController.reactMessage);

export default router; 