import { Promotion, UserPromotion } from '../models/Task.js';
import { Character } from '../models/Character.js';

export class PromotionService {
  // Add progress points and check for promotion
  static async addProgressPoints(userId, points) {
    let userPromotion = await UserPromotion.findOne({ where: { userId } });
    
    if (!userPromotion) {
      userPromotion = await UserPromotion.create({
        userId,
        currentRank: 0,
        totalProgressPoints: 0
      });
    }

    // Add points
    userPromotion.totalProgressPoints += points;
    
    // Check for promotion
    const newRank = await this.checkForPromotion(userPromotion.totalProgressPoints);
    
    if (newRank > userPromotion.currentRank) {
      userPromotion.currentRank = newRank;
      userPromotion.lastPromotionDate = new Date();
      
      // Update character stats with promotion bonuses
      await this.applyPromotionBonuses(userId, newRank);
    }
    
    await userPromotion.save();
    return userPromotion;
  }

  // Check what rank the user should be based on points
  static async checkForPromotion(totalPoints) {
    const promotions = await Promotion.findAll({
      where: { isActive: true },
      order: [['rank', 'DESC']]
    });

    for (const promotion of promotions) {
      if (totalPoints >= promotion.requiredPoints) {
        return promotion.rank;
      }
    }
    
    return 0; // No promotion
  }

  // Apply promotion bonuses to character stats
  static async applyPromotionBonuses(userId, rank) {
    const promotion = await Promotion.findOne({ where: { rank } });
    if (!promotion) return;

    const character = await Character.findOne({ where: { userId } });
    if (!character) return;

    // Apply bonuses
    character.power += promotion.powerBonus;
    character.defense += promotion.defenseBonus;
    
    await character.save();
  }

  // Get user's current promotion status
  static async getUserPromotionStatus(userId) {
    let userPromotion = await UserPromotion.findOne({ where: { userId } });
    
    if (!userPromotion) {
      userPromotion = await UserPromotion.create({
        userId,
        currentRank: 0,
        totalProgressPoints: 0
      });
    }

    const currentPromotion = await Promotion.findOne({ 
      where: { rank: userPromotion.currentRank } 
    });

    const nextPromotion = await Promotion.findOne({
      where: { 
        rank: userPromotion.currentRank + 1,
        isActive: true
      }
    });

    return {
      currentRank: userPromotion.currentRank,
      currentTitle: currentPromotion?.title || 'مبتدئ',
      currentTitleEn: currentPromotion?.titleEn || 'Beginner',
      totalProgressPoints: userPromotion.totalProgressPoints,
      nextRank: nextPromotion ? userPromotion.currentRank + 1 : null,
      nextTitle: nextPromotion?.title || null,
      nextRequiredPoints: nextPromotion?.requiredPoints || null,
      pointsForNextRank: nextPromotion ? nextPromotion.requiredPoints - userPromotion.totalProgressPoints : 0,
      progressPercentage: nextPromotion ? 
        Math.min(((userPromotion.totalProgressPoints - currentPromotion?.requiredPoints || 0) / 
        (nextPromotion.requiredPoints - (currentPromotion?.requiredPoints || 0))) * 100, 100) : 100,
      powerBonus: currentPromotion?.powerBonus || 0,
      defenseBonus: currentPromotion?.defenseBonus || 0,
      lastPromotionDate: userPromotion.lastPromotionDate
    };
  }

  // Get all promotions for admin panel
  static async getAllPromotions() {
    return await Promotion.findAll({
      where: { isActive: true },
      order: [['rank', 'ASC']]
    });
  }

  // Update promotion (admin only)
  static async updatePromotion(promotionId, data) {
    const promotion = await Promotion.findByPk(promotionId);
    if (!promotion) throw new Error('Promotion not found');
    
    await promotion.update(data);
    return promotion;
  }

  // Create new promotion (admin only)
  static async createPromotion(data) {
    return await Promotion.create(data);
  }

  // Delete promotion (admin only)
  static async deletePromotion(promotionId) {
    const promotion = await Promotion.findByPk(promotionId);
    if (!promotion) throw new Error('Promotion not found');
    
    await promotion.destroy();
    return { success: true };
  }
} 