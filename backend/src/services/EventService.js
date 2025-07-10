import { Event, EventParticipation } from '../models/Event.js';
import { Character } from '../models/Character.js';
import { CharacterService } from './CharacterService.js';
import { Op } from 'sequelize';

export class EventService {
  // Get all active events
  static async getActiveEvents() {
    const now = new Date();
    return await Event.findAll({
      where: {
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now }
      },
      order: [['startDate', 'ASC']]
    });
  }

  // Get all events (including inactive)
  static async getAllEvents() {
    return await Event.findAll({
      order: [['startDate', 'DESC']]
    });
  }

  // Get event by ID
  static async getEventById(eventId) {
    return await Event.findByPk(eventId);
  }

  // Get user's event participations
  static async getUserEventParticipations(characterId) {
    return await EventParticipation.findAll({
      where: { characterId },
      include: [
        {
          model: Event,
          attributes: ['id', 'title', 'description', 'type', 'startDate', 'endDate']
        }
      ],
      order: [['joinedAt', 'DESC']]
    });
  }

  // Join an event
  static async joinEvent(eventId, characterId) {
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (!event.isActive) {
      throw new Error('Event is not active');
    }

    const now = new Date();
    if (now < event.startDate || now > event.endDate) {
      throw new Error('Event is not currently running');
    }

    // Check if user already joined
    const existingParticipation = await EventParticipation.findOne({
      where: { eventId, characterId }
    });

    if (existingParticipation) {
      throw new Error('Already joined this event');
    }

    // Check participant limit
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      throw new Error('Event is full');
    }

    // Create participation
    const participation = await EventParticipation.create({
      eventId,
      characterId,
      joinedAt: now
    });

    // Update participant count
    await event.increment('currentParticipants');

    return participation;
  }

  // Leave an event
  static async leaveEvent(eventId, characterId) {
    const participation = await EventParticipation.findOne({
      where: { eventId, characterId }
    });

    if (!participation) {
      throw new Error('Not participating in this event');
    }

    if (participation.completedAt) {
      throw new Error('Cannot leave completed event');
    }

    await participation.destroy();

    // Update participant count
    await Event.decrement('currentParticipants', {
      where: { id: eventId }
    });

    return { success: true };
  }

  // Update event score
  static async updateEventScore(eventId, characterId, score) {
    const participation = await EventParticipation.findOne({
      where: { eventId, characterId }
    });

    if (!participation) {
      throw new Error('Not participating in this event');
    }

    await participation.update({ score });
    return participation;
  }

  // Complete event participation
  static async completeEvent(eventId, characterId) {
    const participation = await EventParticipation.findOne({
      where: { eventId, characterId }
    });

    if (!participation) {
      throw new Error('Not participating in this event');
    }

    if (participation.completedAt) {
      throw new Error('Event already completed');
    }

    await participation.update({
      completedAt: new Date()
    });

    return participation;
  }

  // Claim event rewards
  static async claimEventRewards(eventId, characterId) {
    const participation = await EventParticipation.findOne({
      where: { eventId, characterId },
      include: [{ model: Event }]
    });

    if (!participation) {
      throw new Error('Not participating in this event');
    }

    if (!participation.completedAt) {
      throw new Error('Event not completed yet');
    }

    if (participation.rewardsClaimed) {
      throw new Error('Rewards already claimed');
    }

    const character = await Character.findByPk(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Give rewards
    const rewards = participation.Event.rewards;
    if (rewards.money) {
      await CharacterService.giveReward({
        character,
        action: 'EVENT_REWARD',
        context: { money: rewards.money }
      });
    }

    if (rewards.xp) {
      await CharacterService.giveReward({
        character,
        action: 'EVENT_REWARD',
        context: { xp: rewards.xp }
      });
    }

    // Mark rewards as claimed
    await participation.update({ rewardsClaimed: true });

    return {
      success: true,
      rewards: rewards
    };
  }

  // Get event leaderboard
  static async getEventLeaderboard(eventId, limit = 10) {
    const participations = await EventParticipation.findAll({
      where: { eventId },
      include: [
        {
          model: Character,
          attributes: ['id', 'name', 'level']
        }
      ],
      order: [['score', 'DESC']],
      limit
    });

    return participations;
  }

  // Create a new event (admin function)
  static async createEvent(eventData) {
    return await Event.create(eventData);
  }

  // Update an event (admin function)
  static async updateEvent(eventId, updateData) {
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    await event.update(updateData);
    return event;
  }

  // Delete an event (admin function)
  static async deleteEvent(eventId) {
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Delete all participations first
    await EventParticipation.destroy({
      where: { eventId }
    });

    await event.destroy();
    return { success: true };
  }

  // Get event statistics
  static async getEventStats(eventId) {
    const event = await Event.findByPk(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const totalParticipants = await EventParticipation.count({
      where: { eventId }
    });

    const completedParticipants = await EventParticipation.count({
      where: { 
        eventId,
        completedAt: { [Op.ne]: null }
      }
    });

    const claimedRewards = await EventParticipation.count({
      where: { 
        eventId,
        rewardsClaimed: true
      }
    });

    return {
      event,
      totalParticipants,
      completedParticipants,
      claimedRewards,
      completionRate: totalParticipants > 0 ? (completedParticipants / totalParticipants) * 100 : 0
    };
  }
} 