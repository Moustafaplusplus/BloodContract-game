import { LoginGift, LoginGiftItem, UserLoginGift, Character, InventoryItem, Weapon, Armor, SpecialItem } from '../models/index.js';
import { Op } from 'sequelize';

export class LoginGiftService {
  static async getUserStatus(userId) {
    try {
      let userLoginGift = await UserLoginGift.findOne({
        where: { userId }
      });

      if (!userLoginGift) {
        userLoginGift = await UserLoginGift.create({
          userId,
          currentStreak: 0,
          claimedDays: [],
          isCompleted: false
        });
      }

      // Get all login gifts configuration
      const loginGifts = await LoginGift.findAll({
        where: { isActive: true },
        order: [['dayNumber', 'ASC']],
        include: [{
          model: LoginGiftItem,
          as: 'items'
        }]
      });

      // Check if user can claim today
      const today = new Date();
      const lastClaimDate = userLoginGift.lastClaimDate;
      const canClaimToday = !lastClaimDate || 
        today.toDateString() !== new Date(lastClaimDate).toDateString();

      // Check if user has completed all 15 days
      const isCompleted = userLoginGift.isCompleted || userLoginGift.claimedDays.length >= 15;

      return {
        userLoginGift,
        loginGifts,
        canClaimToday,
        isCompleted,
        nextDayToClaim: userLoginGift.claimedDays.length + 1
      };
    } catch (error) {
      console.error('Error getting user login gift status:', error);
      throw error;
    }
  }

  static async claimDailyReward(userId) {
    try {
      const status = await this.getUserStatus(userId);
      
      if (status.isCompleted) {
        throw new Error('User has already completed all 15 days');
      }

      if (!status.canClaimToday) {
        throw new Error('Already claimed today\'s reward');
      }

      const nextDay = status.nextDayToClaim;
      const loginGift = status.loginGifts.find(gift => gift.dayNumber === nextDay);

      if (!loginGift) {
        throw new Error('No gift configuration found for this day');
      }

      // Get user character
      const character = await Character.findOne({ where: { userId } });
      if (!character) {
        throw new Error('Character not found');
      }

      // Update character stats
      await character.update({
        exp: character.exp + loginGift.expReward,
        money: character.money + loginGift.moneyReward,
        blackcoins: character.blackcoins + loginGift.blackcoinReward
      });

      // Add items to inventory if any
      if (loginGift.items && loginGift.items.length > 0) {
        for (const item of loginGift.items) {
          await InventoryItem.create({
            userId,
            itemType: item.itemType,
            itemId: item.itemId,
            quantity: item.quantity
          });
        }
      }

      // Update user login gift progress
      const claimedDays = [...status.userLoginGift.claimedDays, nextDay];
      const isCompleted = claimedDays.length >= 15;

      await status.userLoginGift.update({
        currentStreak: status.userLoginGift.currentStreak + 1,
        lastClaimDate: new Date(),
        claimedDays,
        isCompleted
      });

      return {
        success: true,
        rewards: {
          exp: loginGift.expReward,
          money: loginGift.moneyReward,
          blackcoins: loginGift.blackcoinReward,
          items: loginGift.items || []
        },
        dayClaimed: nextDay,
        isCompleted
      };
    } catch (error) {
      console.error('Error claiming daily reward:', error);
      throw error;
    }
  }

  static async getAdminConfiguration() {
    try {
      const loginGifts = await LoginGift.findAll({
        order: [['dayNumber', 'ASC']],
        include: [{
          model: LoginGiftItem,
          as: 'items'
        }]
      });

      return loginGifts;
    } catch (error) {
      console.error('Error getting admin configuration:', error);
      throw error;
    }
  }

  static async updateAdminConfiguration(dayNumber, config) {
    try {
      const loginGift = await LoginGift.findOne({
        where: { dayNumber }
      });

      if (!loginGift) {
        throw new Error('Login gift not found for this day');
      }

      await loginGift.update({
        expReward: config.expReward,
        moneyReward: config.moneyReward,
        blackcoinReward: config.blackcoinReward,
        isActive: config.isActive
      });

      // Update items if provided
      if (config.items) {
        // Remove existing items
        await LoginGiftItem.destroy({
          where: { loginGiftId: loginGift.id }
        });

        // Add new items
        for (const item of config.items) {
          await LoginGiftItem.create({
            loginGiftId: loginGift.id,
            itemType: item.itemType,
            itemId: item.itemId,
            quantity: item.quantity
          });
        }
      }

      return loginGift;
    } catch (error) {
      console.error('Error updating admin configuration:', error);
      throw error;
    }
  }

  static async getAvailableItems() {
    try {
      const [weapons, armors, specialItems] = await Promise.all([
        Weapon.findAll(),
        Armor.findAll(),
        SpecialItem.findAll({ where: { isAvailable: true } })
      ]);

      return {
        weapons,
        armors,
        specialItems
      };
    } catch (error) {
      console.error('Error getting available items:', error);
      throw error;
    }
  }

  static async resetUserProgress(userId) {
    try {
      await UserLoginGift.destroy({
        where: { userId }
      });

      return { success: true };
    } catch (error) {
      console.error('Error resetting user progress:', error);
      throw error;
    }
  }
} 