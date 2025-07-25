import { Suggestion } from '../models/Suggestion.js';
import { User } from '../models/User.js';
import { Character } from '../models/Character.js';
import { TaskService } from './TaskService.js';

export class SuggestionService {
  // Create a new suggestion
  static async createSuggestion(userId, data) {
    const { type, title, message } = data;
    
    if (!title || !message) {
      throw new Error('Title and message are required');
    }

    const suggestion = await Suggestion.create({
      userId,
      type,
      title,
      message,
      status: 'unread'
    });

    await TaskService.updateProgress(userId, 'suggestions_submitted', 1);

    return suggestion;
  }

  // Get all suggestions for admin (with user info)
  static async getAllSuggestions(page = 1, limit = 20, status = null) {
    const offset = (page - 1) * limit;
    
    const whereClause = status ? { status } : {};

    const { count, rows } = await Suggestion.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['username', 'email'],
        include: [{
          model: Character,
          attributes: ['name']
        }]
      }],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      suggestions: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  // Get suggestion by ID
  static async getSuggestionById(id) {
    const suggestion = await Suggestion.findByPk(id, {
      include: [{
        model: User,
        attributes: ['username', 'email'],
        include: [{
          model: Character,
          attributes: ['name']
        }]
      }]
    });

    if (!suggestion) {
      throw new Error('Suggestion not found');
    }

    return suggestion;
  }

  // Update suggestion status
  static async updateSuggestionStatus(id, status, adminNotes = null, resolvedBy = null) {
    const suggestion = await Suggestion.findByPk(id);
    if (!suggestion) {
      throw new Error('Suggestion not found');
    }

    const updateData = {
      status,
      adminNotes: adminNotes !== null ? adminNotes : suggestion.adminNotes
    };

    if (status === 'done') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = resolvedBy;
    } else if (status !== 'done' && suggestion.status === 'done') {
      updateData.resolvedAt = null;
      updateData.resolvedBy = null;
    }

    await suggestion.update(updateData);
    return suggestion;
  }

  // Delete suggestion
  static async deleteSuggestion(id) {
    const suggestion = await Suggestion.findByPk(id);
    if (!suggestion) {
      throw new Error('Suggestion not found');
    }

    await suggestion.destroy();
    return { success: true };
  }

  // Get suggestions statistics
  static async getSuggestionStats() {
    const [total, unread, pending, done] = await Promise.all([
      Suggestion.count(),
      Suggestion.count({ where: { status: 'unread' } }),
      Suggestion.count({ where: { status: 'pending' } }),
      Suggestion.count({ where: { status: 'done' } })
    ]);

    return {
      total,
      unread,
      pending,
      done
    };
  }

  // Get user's suggestions
  static async getUserSuggestions(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Suggestion.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return {
      suggestions: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }
} 