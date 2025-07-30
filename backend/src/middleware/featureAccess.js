import { Character } from '../models/index.js';

// Feature unlock requirements
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
  tasks: 23,
  ranking: 30,
};

export const checkFeatureAccess = (featureName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'غير مصرح' });
      }

      // Get character level
      const character = await Character.findOne({ where: { userId } });
      if (!character) {
        return res.status(404).json({ message: 'الشخصية غير موجودة' });
      }

      const requiredLevel = FEATURE_REQUIREMENTS[featureName];
      if (requiredLevel === undefined) {
        // If feature is not in the list, allow access (for admin features, etc.)
        return next();
      }

      if (character.level < requiredLevel) {
        return res.status(403).json({ 
          message: `هذه الميزة تتطلب المستوى ${requiredLevel}`,
          requiredLevel,
          currentLevel: character.level
        });
      }

      next();
    } catch (error) {
      console.error('Feature access check error:', error);
      res.status(500).json({ message: 'خطأ في التحقق من صلاحية الميزة' });
    }
  };
};

// Helper function to check if a feature is unlocked
export const isFeatureUnlocked = (featureName, playerLevel) => {
  const requiredLevel = FEATURE_REQUIREMENTS[featureName];
  if (requiredLevel === undefined) return true; // Allow access to undefined features
  return playerLevel >= requiredLevel;
};

// Get all unlocked features for a player level
export const getUnlockedFeatures = (playerLevel) => {
  return Object.entries(FEATURE_REQUIREMENTS)
    .filter(([feature, requiredLevel]) => playerLevel >= requiredLevel)
    .map(([feature, requiredLevel]) => ({ feature, requiredLevel }));
};

// Get all locked features for a player level
export const getLockedFeatures = (playerLevel) => {
  return Object.entries(FEATURE_REQUIREMENTS)
    .filter(([feature, requiredLevel]) => playerLevel < requiredLevel)
    .map(([feature, requiredLevel]) => ({ feature, requiredLevel }));
}; 