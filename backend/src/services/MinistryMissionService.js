import { MinistryMission, UserMinistryMission, Character } from '../models/index.js';
import { Op } from 'sequelize';

export class MinistryMissionService {
  // Calculate progressive rewards based on mission level
  static calculateRewards(missionLevel, ending) {
    const baseExp = 200; // Doubled from 100
    const baseMoney = 1000; // Doubled from 500
    const baseBlackcoins = 5; // Kept the same
    
    // Progressive scaling based on mission level (not player level)
    const levelMultiplier = Math.max(1, Math.floor(missionLevel / 10) + 1);
    
    let expReward, moneyReward, blackcoinsReward;
    
    switch (ending) {
      case 'ending_reject':
        expReward = Math.floor(baseExp * 0.5 * levelMultiplier);
        moneyReward = Math.floor(baseMoney * 0.3 * levelMultiplier);
        blackcoinsReward = 0;
        break;
      case 'ending_combat':
        expReward = Math.floor(baseExp * 1.2 * levelMultiplier);
        moneyReward = Math.floor(baseMoney * 1.5 * levelMultiplier);
        blackcoinsReward = 0;
        break;
      case 'ending_stealth':
        expReward = Math.floor(baseExp * 1.5 * levelMultiplier);
        moneyReward = Math.floor(baseMoney * 1.2 * levelMultiplier);
        blackcoinsReward = Math.floor(baseBlackcoins * 2 * levelMultiplier);
        break;
      case 'ending_reveal':
        expReward = Math.floor(baseExp * 1.3 * levelMultiplier);
        moneyReward = Math.floor(baseMoney * 1.8 * levelMultiplier);
        blackcoinsReward = 0;
        break;
      case 'ending_deception':
        expReward = Math.floor(baseExp * 1.4 * levelMultiplier);
        moneyReward = Math.floor(baseMoney * 1.0 * levelMultiplier);
        blackcoinsReward = Math.floor(baseBlackcoins * 3 * levelMultiplier);
        break;
      default:
        expReward = Math.floor(baseExp * levelMultiplier);
        moneyReward = Math.floor(baseMoney * levelMultiplier);
        blackcoinsReward = 0;
    }
    
    return {
      exp: expReward,
      money: moneyReward,
      blackcoins: blackcoinsReward
    };
  }

  // Get all missions with user progress
  static async getMissionsList(userId, characterLevel) {
    try {
      const missions = await MinistryMission.findAll({
        where: { isActive: true },
        order: [['order', 'ASC']],
        include: [{
          model: UserMinistryMission,
          where: { userId },
          required: false
        }]
      });

      return missions.map(mission => {
        const userProgress = mission.UserMinistryMissions?.[0];
        const isUnlocked = characterLevel >= mission.minLevel;
        const isCompleted = userProgress?.isCompleted || false;
        
        return {
          id: mission.id,
          missionId: mission.missionId,
          title: mission.title,
          description: mission.description,
          minLevel: mission.minLevel,
          thumbnail: mission.thumbnail,
          banner: mission.banner,
          isUnlocked,
          isCompleted,
          canPlay: isUnlocked && !isCompleted,
          completedAt: userProgress?.completedAt,
          ending: userProgress?.ending,
          reward: userProgress?.reward,
          expEarned: userProgress?.expEarned,
          moneyEarned: userProgress?.moneyEarned,
          blackcoinsEarned: userProgress?.blackcoinsEarned
        };
      });
    } catch (error) {
      console.error('Error fetching missions list:', error);
      throw error;
    }
  }

  // Get specific mission data
  static async getMissionData(missionId, userId) {
    try {
      const mission = await MinistryMission.findOne({
        where: { missionId, isActive: true },
        include: [{
          model: UserMinistryMission,
          where: { userId },
          required: false
        }]
      });

      if (!mission) {
        throw new Error('Mission not found');
      }

      const userProgress = mission.UserMinistryMissions?.[0];
      const isCompleted = userProgress?.isCompleted || false;

      return {
        ...mission.toJSON(),
        userProgress: userProgress ? {
          isCompleted,
          completedAt: userProgress.completedAt,
          ending: userProgress.ending,
          reward: userProgress.reward,
          expEarned: userProgress.expEarned,
          moneyEarned: userProgress.moneyEarned,
          blackcoinsEarned: userProgress.blackcoinsEarned
        } : null
      };
    } catch (error) {
      console.error('Error fetching mission data:', error);
      throw error;
    }
  }

  // Complete a mission
  static async completeMission(userId, missionId, ending) {
    const transaction = await MinistryMission.sequelize.transaction();
    
    try {
      // Get mission data
      const mission = await MinistryMission.findOne({
        where: { missionId, isActive: true }
      });

      if (!mission) {
        throw new Error('Mission not found');
      }

      // Check if already completed
      const existingProgress = await UserMinistryMission.findOne({
        where: { userId, missionId }
      });

      if (existingProgress?.isCompleted) {
        throw new Error('Mission already completed');
      }

      // Get character for level and rewards
      const character = await Character.findOne({
        where: { userId }
      });

      if (!character) {
        throw new Error('Character not found');
      }

      // Check level requirement
      if (character.level < mission.minLevel) {
        throw new Error('Level requirement not met');
      }

      // Calculate rewards based on mission level, not player level
      const rewards = this.calculateRewards(mission.minLevel, ending);
      const endingData = mission.missionData.endings[ending];
      
      if (!endingData) {
        throw new Error('Invalid ending');
      }

      // Create or update user progress
      const userProgress = await UserMinistryMission.upsert({
        userId,
        missionId,
        isCompleted: true,
        completedAt: new Date(),
        ending,
        reward: endingData.reward,
        expEarned: rewards.exp,
        moneyEarned: rewards.money,
        blackcoinsEarned: rewards.blackcoins
      }, { transaction });

      // Update character with rewards
      await character.update({
        exp: character.exp + rewards.exp,
        money: character.money + rewards.money,
        blackcoins: character.blackcoins + rewards.blackcoins
      }, { transaction });

      // Check for level up
      let levelsGained = 0;
      let levelUpRewards = null;
      
      while (character.exp >= character.expNeeded()) {
        character.exp -= character.expNeeded();
        character.level += 1;
        levelsGained += 1;
        
        // Level up bonuses
        character.maxHp = character.getMaxHp();
        character.hp = character.maxHp; // Full heal on level up
        character.maxEnergy = 100 + (character.level - 1) * 5;
        character.energy = character.maxEnergy; // Full energy on level up
      }

      if (levelsGained > 0) {
        await character.save({ transaction });
        levelUpRewards = {
          levelsGained,
          newLevel: character.level,
          newMaxHp: character.maxHp,
          newMaxEnergy: character.maxEnergy
        };
      }

      await transaction.commit();

      return {
        success: true,
        rewards,
        ending: endingData,
        levelUpRewards,
        character: await character.toSafeJSON()
      };

    } catch (error) {
      await transaction.rollback();
      console.error('Error completing mission:', error);
      throw error;
    }
  }

  // Get user's mission statistics
  static async getUserMissionStats(userId) {
    try {
      const completedMissions = await UserMinistryMission.findAll({
        where: { userId, isCompleted: true },
        include: [MinistryMission]
      });

      const totalExp = completedMissions.reduce((sum, mission) => sum + mission.expEarned, 0);
      const totalMoney = completedMissions.reduce((sum, mission) => sum + mission.moneyEarned, 0);
      const totalBlackcoins = completedMissions.reduce((sum, mission) => sum + mission.blackcoinsEarned, 0);

      return {
        totalMissionsCompleted: completedMissions.length,
        totalExpEarned: totalExp,
        totalMoneyEarned: totalMoney,
        totalBlackcoinsEarned: totalBlackcoins,
        missions: completedMissions.map(mission => ({
          missionId: mission.missionId,
          title: mission.MinistryMission.title,
          completedAt: mission.completedAt,
          ending: mission.ending,
          expEarned: mission.expEarned,
          moneyEarned: mission.moneyEarned,
          blackcoinsEarned: mission.blackcoinsEarned
        }))
      };
    } catch (error) {
      console.error('Error fetching user mission stats:', error);
      throw error;
    }
  }
} 