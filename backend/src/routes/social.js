import express from 'express';
import { SocialController } from '../controllers/SocialController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all social routes
router.use(auth);

// Friendship routes
// POST /api/social/friends/request - Send friend request
router.post('/friends/request', SocialController.sendFriendRequest);

// POST /api/social/friends/:friendshipId/accept - Accept friend request
router.post('/friends/:friendshipId/accept', SocialController.acceptFriendRequest);

// POST /api/social/friends/:friendshipId/reject - Reject friend request
router.post('/friends/:friendshipId/reject', SocialController.rejectFriendRequest);

// POST /api/social/friends/block - Block user
router.post('/friends/block', SocialController.blockUser);

// GET /api/social/friends - Get user's friends
router.get('/friends', SocialController.getFriends);

// GET /api/social/friendships - Get all friendships (including pending)
router.get('/friendships', SocialController.getFriendships);

// Messaging routes
// POST /api/social/messages - Send message
router.post('/messages', SocialController.sendMessage);

// GET /api/social/messages/:otherUserId - Get conversation with user
router.get('/messages/:otherUserId', SocialController.getMessages);

// PUT /api/social/messages/:messageId/read - Mark message as read
router.put('/messages/:messageId/read', SocialController.markMessageAsRead);

// GET /api/social/messages/unread/count - Get unread message count
router.get('/messages/unread/count', SocialController.getUnreadMessageCount);

// Notification routes
// GET /api/social/notifications - Get user notifications
router.get('/notifications', SocialController.getUserNotifications);

// PUT /api/social/notifications/:notificationId/read - Mark notification as read
router.put('/notifications/:notificationId/read', SocialController.markNotificationAsRead);

// PUT /api/social/notifications/read-all - Mark all notifications as read
router.put('/notifications/read-all', SocialController.markAllNotificationsAsRead);

// GET /api/social/notifications/unread/count - Get unread notification count
router.get('/notifications/unread/count', SocialController.getUnreadNotificationCount);

// Search routes
// GET /api/social/search/users - Search users
router.get('/search/users', SocialController.searchUsers);

export default router; 