import { EventService } from '../services/EventService.js';
import { CharacterService } from '../services/CharacterService.js';

export class EventController {
  // Get all active events
  static async getActiveEvents(req, res) {
    try {
      const events = await EventService.getActiveEvents();
      res.json(events);
    } catch (error) {
      console.error('Get active events error:', error);
      res.status(500).json({ error: 'Failed to get active events' });
    }
  }

  // Get all events (including inactive)
  static async getAllEvents(req, res) {
    try {
      const events = await EventService.getAllEvents();
      res.json(events);
    } catch (error) {
      console.error('Get all events error:', error);
      res.status(500).json({ error: 'Failed to get events' });
    }
  }

  // Get event by ID
  static async getEventById(req, res) {
    try {
      const { eventId } = req.params;
      const event = await EventService.getEventById(parseInt(eventId));
      
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json(event);
    } catch (error) {
      console.error('Get event by ID error:', error);
      res.status(500).json({ error: 'Failed to get event' });
    }
  }

  // Get user's event participations
  static async getUserEventParticipations(req, res) {
    try {
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const participations = await EventService.getUserEventParticipations(character.id);
      res.json(participations);
    } catch (error) {
      console.error('Get user event participations error:', error);
      res.status(500).json({ error: 'Failed to get event participations' });
    }
  }

  // Join an event
  static async joinEvent(req, res) {
    try {
      const { eventId } = req.params;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const participation = await EventService.joinEvent(parseInt(eventId), character.id);
      res.json(participation);
    } catch (error) {
      console.error('Join event error:', error);
      if (error.message.includes('not found') || error.message.includes('not active') || 
          error.message.includes('not currently running') || error.message.includes('Already joined') ||
          error.message.includes('Event is full')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to join event' });
    }
  }

  // Leave an event
  static async leaveEvent(req, res) {
    try {
      const { eventId } = req.params;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const result = await EventService.leaveEvent(parseInt(eventId), character.id);
      res.json(result);
    } catch (error) {
      console.error('Leave event error:', error);
      if (error.message.includes('Not participating') || error.message.includes('Cannot leave completed')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to leave event' });
    }
  }

  // Update event score
  static async updateEventScore(req, res) {
    try {
      const { eventId } = req.params;
      const { score } = req.body;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      if (typeof score !== 'number' || score < 0) {
        return res.status(400).json({ error: 'Invalid score' });
      }

      const participation = await EventService.updateEventScore(parseInt(eventId), character.id, score);
      res.json(participation);
    } catch (error) {
      console.error('Update event score error:', error);
      if (error.message.includes('Not participating')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update event score' });
    }
  }

  // Complete event participation
  static async completeEvent(req, res) {
    try {
      const { eventId } = req.params;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const participation = await EventService.completeEvent(parseInt(eventId), character.id);
      res.json(participation);
    } catch (error) {
      console.error('Complete event error:', error);
      if (error.message.includes('Not participating') || error.message.includes('already completed')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to complete event' });
    }
  }

  // Claim event rewards
  static async claimEventRewards(req, res) {
    try {
      const { eventId } = req.params;
      const character = await CharacterService.getCharacterByUserId(req.user.id);
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const result = await EventService.claimEventRewards(parseInt(eventId), character.id);
      res.json(result);
    } catch (error) {
      console.error('Claim event rewards error:', error);
      if (error.message.includes('Not participating') || error.message.includes('not completed') ||
          error.message.includes('already claimed')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to claim event rewards' });
    }
  }

  // Get event leaderboard
  static async getEventLeaderboard(req, res) {
    try {
      const { eventId } = req.params;
      const { limit = 10 } = req.query;
      
      const leaderboard = await EventService.getEventLeaderboard(parseInt(eventId), parseInt(limit));
      res.json(leaderboard);
    } catch (error) {
      console.error('Get event leaderboard error:', error);
      res.status(500).json({ error: 'Failed to get event leaderboard' });
    }
  }

  // Get event statistics
  static async getEventStats(req, res) {
    try {
      const { eventId } = req.params;
      const stats = await EventService.getEventStats(parseInt(eventId));
      res.json(stats);
    } catch (error) {
      console.error('Get event stats error:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to get event statistics' });
    }
  }

  // Admin: Create a new event
  static async createEvent(req, res) {
    try {
      const eventData = req.body;
      const event = await EventService.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }

  // Admin: Update an event
  static async updateEvent(req, res) {
    try {
      const { eventId } = req.params;
      const updateData = req.body;
      
      const event = await EventService.updateEvent(parseInt(eventId), updateData);
      res.json(event);
    } catch (error) {
      console.error('Update event error:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update event' });
    }
  }

  // Admin: Delete an event
  static async deleteEvent(req, res) {
    try {
      const { eventId } = req.params;
      const result = await EventService.deleteEvent(parseInt(eventId));
      res.json(result);
    } catch (error) {
      console.error('Delete event error:', error);
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to delete event' });
    }
  }
} 