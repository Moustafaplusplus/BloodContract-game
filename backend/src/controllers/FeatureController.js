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
      const userId = req.user?.id;
      if (!userId) {
        console.error('Feature info error: No user ID in request');
        return res.status(401).json({ message: 'غير مصرح' });
      }

      console.log('Fetching character for userId:', userId);
      const character = await Character.findOne({ where: { userId } });
      if (!character) {
        console.error('Feature info error: Character not found for userId:', userId);
        return res.status(404).json({ message: 'الشخصية غير موجودة' });
      }

      const playerLevel = character.level || 1;
      console.log('Player level:', playerLevel);
      
      const unlockedFeatures = getUnlockedFeatures(playerLevel);
      const lockedFeatures = getLockedFeatures(playerLevel);

      // Get next feature to unlock
      const nextFeature = lockedFeatures.length > 0 
        ? lockedFeatures.sort((a, b) => a.requiredLevel - b.requiredLevel)[0]
        : null;

      const response = {
        playerLevel,
        unlockedFeatures,
        lockedFeatures,
        nextFeature,
        totalFeatures: unlockedFeatures.length + lockedFeatures.length,
        unlockedCount: unlockedFeatures.length,
        lockedCount: lockedFeatures.length
      };

      console.log('Feature info response:', response);
      res.json(response);
    } catch (error) {
      console.error('Feature info error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'خطأ في جلب معلومات الميزات' });
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