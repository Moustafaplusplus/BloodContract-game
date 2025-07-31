// Feature unlocking schema and utilities
export const FEATURE_UNLOCKS = {
  // Core features (Level 1)
  dashboard: { level: 1, name: "الرئيسية" },
  character: { level: 1, name: "الشخصية" },
  shop: { level: 1, name: "المتجر" },
  hospital: { level: 1, name: "المستشفى" },
  jail: { level: 1, name: "السجن" },
  inventory: { level: 1, name: "الحقيبة" },
  chat: { level: 1, name: "الدردشة العامة" },
  loginGift: { level: 1, name: "مكافآت الدخول" },
  crimes: { level: 1, name: "الجرائم" },
  gym: { level: 1, name: "النادي الرياضي" },
  jobs: { level: 1, name: "الوظائف" },
  suggestions: { level: 1, name: "الاقتراحات" },

  // Social & Combat (Level 6-10)
  fights: { level: 6, name: "اللاعبون النشطون" },
  bloodContracts: { level: 6, name: "عقود الدم" },
  friends: { level: 1, name: "الأصدقاء" },
  messages: { level: 1, name: "الرسائل" },
  gangs: { level: 10, name: "العصابات" },
  ministryMissions: { level: 5, name: "مهام الوزارة" },

  // Economy & Property (Level 11-20)
  bank: { level: 11, name: "البنك" },
  specialShop: { level: 1, name: "سوق العملة السوداء" },
  houses: { level: 16, name: "المنازل" },
  cars: { level: 18, name: "السيارات" },
  blackMarket: { level: 20, name: "السوق السوداء" },

  // Advanced Features (Level 21-30)
  dogs: { level: 21, name: "الكلاب" },
  tasks: { level: 1, name: "المهام" },
  ranking: { level: 30, name: "تصنيف اللاعبين" },
};

// Helper function to check if a feature is unlocked
export const isFeatureUnlocked = (featureKey, playerLevel) => {
  const feature = FEATURE_UNLOCKS[featureKey];
  if (!feature) {
    console.warn(`Unknown feature: ${featureKey}`);
    return false;
  }
  return playerLevel >= feature.level;
};

// Get all unlocked features for a player level
export const getUnlockedFeatures = (playerLevel) => {
  return Object.entries(FEATURE_UNLOCKS)
    .filter(([key, feature]) => playerLevel >= feature.level)
    .map(([key, feature]) => ({ key, ...feature }));
};

// Get all locked features for a player level
export const getLockedFeatures = (playerLevel) => {
  return Object.entries(FEATURE_UNLOCKS)
    .filter(([key, feature]) => playerLevel < feature.level)
    .map(([key, feature]) => ({ key, ...feature }));
};

// Get next feature to unlock
export const getNextFeature = (playerLevel) => {
  const lockedFeatures = getLockedFeatures(playerLevel);
  if (lockedFeatures.length === 0) return null;
  
  return lockedFeatures.sort((a, b) => a.level - b.level)[0];
};

// Get features that unlock at a specific level
export const getFeaturesAtLevel = (level) => {
  return Object.entries(FEATURE_UNLOCKS)
    .filter(([key, feature]) => feature.level === level)
    .map(([key, feature]) => ({ key, ...feature }));
};

// Get feature unlock progress (0-1)
export const getFeatureUnlockProgress = (featureKey, playerLevel) => {
  const feature = FEATURE_UNLOCKS[featureKey];
  if (!feature) return 0;
  
  if (playerLevel >= feature.level) return 1;
  
  // Calculate progress based on how close the player is to unlocking
  const levelsNeeded = feature.level - playerLevel;
  const maxLevelsNeeded = 5; // Assume max 5 levels needed for progress calculation
  const progress = Math.max(0, 1 - (levelsNeeded / maxLevelsNeeded));
  
  return Math.min(progress, 0.9); // Cap at 90% until actually unlocked
}; 