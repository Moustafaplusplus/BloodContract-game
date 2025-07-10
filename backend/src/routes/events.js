import express from 'express';
import { EventController } from '../controllers/EventController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/events - Get all active events (no auth required)
router.get('/', EventController.getActiveEvents);

// GET /api/events/all - Get all events including inactive (no auth required)
router.get('/all', EventController.getAllEvents);

// GET /api/events/:eventId - Get specific event (no auth required)
router.get('/:eventId', EventController.getEventById);

// GET /api/events/:eventId/leaderboard - Get event leaderboard (no auth required)
router.get('/:eventId/leaderboard', EventController.getEventLeaderboard);

// GET /api/events/:eventId/stats - Get event statistics (no auth required)
router.get('/:eventId/stats', EventController.getEventStats);

// Apply auth middleware to user-specific routes
router.use(auth);

// GET /api/events/user/participations - Get user's event participations
router.get('/user/participations', EventController.getUserEventParticipations);

// POST /api/events/:eventId/join - Join an event
router.post('/:eventId/join', EventController.joinEvent);

// DELETE /api/events/:eventId/leave - Leave an event
router.delete('/:eventId/leave', EventController.leaveEvent);

// PUT /api/events/:eventId/score - Update event score
router.put('/:eventId/score', EventController.updateEventScore);

// POST /api/events/:eventId/complete - Complete event participation
router.post('/:eventId/complete', EventController.completeEvent);

// POST /api/events/:eventId/claim-rewards - Claim event rewards
router.post('/:eventId/claim-rewards', EventController.claimEventRewards);

// Admin routes (could add admin middleware here)
// POST /api/events - Create new event
router.post('/', EventController.createEvent);

// PUT /api/events/:eventId - Update event
router.put('/:eventId', EventController.updateEvent);

// DELETE /api/events/:eventId - Delete event
router.delete('/:eventId', EventController.deleteEvent);

export default router; 