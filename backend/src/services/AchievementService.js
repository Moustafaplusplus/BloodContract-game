import { Achievement, CharacterAchievement } from '../models/Achievement.js';
import { Character } from '../models/Character.js';
import { CharacterService } from './CharacterService.js';
import { sequelize } from '../config/db.js';
import cron from 'node-cron';

export class AchievementService {
  // Achievement rules
  static ACHIEVEMENT_RULES = [
    { 
      key: 'first_crime', 
      name: 'أول جريمة', 
      description: 'ارتكب أول جريمة',
      test: c => c.stats?.crimes >= 1, 
      xp: 50,
      category: 'CRIME'
    },
    { 
      key: 'level_10', 
      name: 'المستوى 10', 
      description: 'وصل إلى المستوى 10',
      test: c => c.level >= 10, 
      xp: 200,
      category: 'LEVEL'
    },
    { 
      key: 'wealth_100k', 
      name: 'ثروة 100K', 
      description: 'جمع 100,000 دولار',
      test: c => c.money >= 100000, 
      xp: 300,
      category: 'WEALTH'
    },
    { 
      key: 'strength_50', 
      name: 'قوة 50', 
      description: 'وصلت قوته إلى 50',
      test: c => c.strength >= 50, 
      xp: 150,
      category: 'STATS'
    },
    { 
      key: 'defense_50', 
      name: 'دفاع 50', 
      description: 'وصل دفاعه إلى 50',
      test: c => c.defense >= 50, 
      xp: 150,
      category: 'STATS'
    },
    { 
      key: 'first_house', 
      name: 'أول بيت', 
      description: 'اشترى أول بيت',
      test: c => c.stats?.houses >= 1, 
      xp: 100,
      category: 'PROPERTY'
    },
    { 
      key: 'first_car', 
      name: 'أول سيارة', 
      description: 'اشترى أول سيارة',
      test: c => c.stats?.cars >= 1, 
      xp: 75,
      category: 'VEHICLES'
    }
  ];

  // Seed default achievements
  static async seedAchievements() {
    for (const rule of this.ACHIEVEMENT_RULES) {
      await Achievement.findOrCreate({
        where: { key: rule.key },
        defaults: {
          name: rule.name,
          description: rule.description,
          xpReward: rule.xp,
          category: rule.category
        }
      });
    }
    console.log(`✅ Seeded ${this.ACHIEVEMENT_RULES.length} achievements`);
  }

  // Get all achievements
  static async getAllAchievements() {
    return await Achievement.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
  }

  // Get user's achievements
  static async getUserAchievements(characterId) {
    const achievements = await Achievement.findAll({
      include: [
        {
          model: CharacterAchievement,
          where: { characterId },
          required: false
        }
      ],
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    return achievements.map(achievement => ({
      ...achievement.toJSON(),
      unlocked: achievement.CharacterAchievements.length > 0,
      unlockedAt: achievement.CharacterAchievements[0]?.unlockedAt || null
    }));
  }

  // Check and award achievements for a character
  static async checkAchievements(characterId) {
    const character = await Character.findByPk(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const unlockedAchievements = [];

    for (const rule of this.ACHIEVEMENT_RULES) {
      // Check if achievement already unlocked
      const existing = await CharacterAchievement.findOne({
        where: { characterId, achievementKey: rule.key }
      });

      if (!existing && rule.test(character)) {
        // Award achievement
        await CharacterAchievement.create({
          characterId,
          achievementKey: rule.key
        });

        // Give XP reward
        await CharacterService.giveReward({
          character,
          action: 'ACHIEVEMENT_UNLOCK',
          context: { xp: rule.xp }
        });

        unlockedAchievements.push({
          key: rule.key,
          name: rule.name,
          xpReward: rule.xp
        });

        console.log(`🏆 Awarded ${rule.key} to character ${characterId}`);
      }
    }

    return unlockedAchievements;
  }

  // Get achievement statistics
  static async getAchievementStats() {
    const totalAchievements = await Achievement.count();
    const totalUnlocks = await CharacterAchievement.count();
    const uniqueUnlocks = await CharacterAchievement.count({
      distinct: true,
      col: 'characterId'
    });

    return {
      totalAchievements,
      totalUnlocks,
      uniqueUnlocks
    };
  }

  // Get leaderboard by achievement count
  static async getAchievementLeaderboard(limit = 10) {
    const characters = await Character.findAll({
      include: [
        {
          model: CharacterAchievement,
          attributes: []
        }
      ],
      attributes: [
        'id',
        'name',
        [sequelize.fn('COUNT', sequelize.col('CharacterAchievements.id')), 'achievementCount']
      ],
      group: ['Character.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('CharacterAchievements.id')), 'DESC']],
      limit
    });

    return characters;
  }

  // Start achievement checker cron job
  static startAchievementChecker() {
    cron.schedule('0 * * * *', async () => {
      console.log('[ACH] Scanning achievements...');
      try {
        const characters = await Character.findAll();
        for (const character of characters) {
          await this.checkAchievements(character.id);
        }
      } catch (err) {
        console.error('[ACH] Cron error:', err);
      }
    });
  }

  // Socket notification helper
  static socketNotify(characterId, achievementKey) {
    console.log(`[SOCKET] Notify character ${characterId} unlocked ${achievementKey}`);
    // e.g. io.to(characterId).emit("achievementUnlocked", { key: achievementKey });
  }
} 