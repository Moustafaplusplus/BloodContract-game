import { Character } from '../models/index.js';
import { 
  isFeatureUnlocked, 
  getUnlockedFeatures, 
  getLockedFeatures 
} from '../middleware/featureAccess.js';

export class FeatureController {
  // Get feature unlock information for the current player
  static async getFeatureInfo(req, res) {
    try {
      const userId = req.user.id;
      const character = await Character.findOne({ where: { userId } });
      
      if (!character) {
        return res.status(404).json({ error: 'Character not found' });
      }
      
      const playerLevel = character.level;
      
      // Define features based on level
      const features = {
        bank: { unlocked: playerLevel >= 1, level: 1 },
        shop: { unlocked: playerLevel >= 1, level: 1 },
        crimes: { unlocked: playerLevel >= 1, level: 1 },
        fights: { unlocked: playerLevel >= 1, level: 1 },
        gym: { unlocked: playerLevel >= 2, level: 2 },
        jobs: { unlocked: playerLevel >= 3, level: 3 },
        gangs: { unlocked: playerLevel >= 5, level: 5 },
        houses: { unlocked: playerLevel >= 7, level: 7 },
        cars: { unlocked: playerLevel >= 8, level: 8 },
        dogs: { unlocked: playerLevel >= 9, level: 9 },
        bloodContracts: { unlocked: playerLevel >= 10, level: 10 },
        ministryMissions: { unlocked: playerLevel >= 12, level: 12 },
        blackMarket: { unlocked: playerLevel >= 15, level: 15 },
        specialShop: { unlocked: playerLevel >= 18, level: 18 },
        tasks: { unlocked: playerLevel >= 20, level: 20 }
      };
      
      const response = {
        playerLevel,
        features,
        nextLevel: playerLevel + 1,
        featuresUnlocked: Object.values(features).filter(f => f.unlocked).length,
        totalFeatures: Object.keys(features).length
      };
      
      res.json(response);
    } catch (error) {
      console.error('Get feature info error:', error);
      res.status(500).json({ error: 'Failed to get feature info' });
    }
  }

  // Check if a specific feature is unlocked
  static async checkFeatureAccess(req, res) {
    try {
      const { featureName } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ message: 'غير مصرح' });
      }

      const character = await Character.findOne({ where: { userId } });
      if (!character) {
        return res.status(404).json({ message: 'الشخصية غير موجودة' });
      }

      const isUnlocked = isFeatureUnlocked(featureName, character.level);
      
      res.json({
        featureName,
        isUnlocked,
        playerLevel: character.level,
        requiredLevel: isUnlocked ? null : getRequiredLevel(featureName)
      });
    } catch (error) {
      console.error('Feature access check error:', error);
      res.status(500).json({ message: 'خطأ في التحقق من صلاحية الميزة' });
    }
  }

  // Get features that unlock at a specific level
  static async getFeaturesAtLevel(req, res) {
    try {
      const { level } = req.params;
      const levelNum = parseInt(level);
      
      if (isNaN(levelNum)) {
        return res.status(400).json({ message: 'مستوى غير صحيح' });
      }

      const allFeatures = getUnlockedFeatures(levelNum);
      const previousLevelFeatures = getUnlockedFeatures(levelNum - 1);
      const featuresAtThisLevel = allFeatures.filter(feature => 
        !previousLevelFeatures.some(prev => prev.feature === feature.feature)
      );

      res.json({
        level: levelNum,
        features: featuresAtThisLevel
      });
    } catch (error) {
      console.error('Features at level error:', error);
      res.status(500).json({ message: 'خطأ في جلب الميزات' });
    }
  }
}

// Helper function to get required level for a feature
function getRequiredLevel(featureName) {
  const FEATURE_REQUIREMENTS = {
    dashboard: 1,
    character: 1,
    shop: 1,
    hospital: 1,
    jail: 1,
    inventory: 1,
    chat: 1,
    loginGift: 1,
    crimes: 1,
    gym: 1,
    jobs: 1,
    suggestions: 1,
    fights: 6,
    bloodContracts: 6,
    friends: 1,
    messages: 1,
    gangs: 10,
    ministryMissions: 5,
    bank: 11,
    specialShop: 1,
    houses: 16,
    cars: 18,
    blackMarket: 20,
    dogs: 21,
    tasks: 1,
    ranking: 30,
  };
  
  return FEATURE_REQUIREMENTS[featureName] || null;
} 