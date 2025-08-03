import React, { useState, useEffect } from 'react';
import { useFeatureUnlock } from '@/hooks/useFeatureUnlock';
import { Lock, Unlock, Star, TrendingUp } from 'lucide-react';

export const FeatureUnlockNotification = () => {
  const { playerLevel, featuresAtCurrentLevel, nextFeature, isFeatureUnlocked } = useFeatureUnlock();
  const [showNotification, setShowNotification] = useState(false);
  const [newFeatures, setNewFeatures] = useState([]);
  const [lastLevel, setLastLevel] = useState(playerLevel);

  // Check for newly unlocked features
  useEffect(() => {
    if (playerLevel > lastLevel && featuresAtCurrentLevel.length > 0) {
      setNewFeatures(featuresAtCurrentLevel);
      setShowNotification(true);
      setLastLevel(playerLevel);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    }
  }, [playerLevel, lastLevel, featuresAtCurrentLevel]);

  if (!showNotification || newFeatures.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className="card-3d bg-gradient-to-r from-green-900/80 to-green-800/60 border-green-500/50 p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Unlock className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-green-300 font-bold text-lg mb-1">
              ميزات جديدة مفتوحة!
            </h3>
            <div className="space-y-1">
              {newFeatures.map((feature, index) => (
                <div key={feature.key || feature.feature || `new-feature-${index}`} className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-green-200 text-sm">{feature.name || feature.feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeatureProgressCard = () => {
  const { playerLevel, nextFeature, lockedFeatures } = useFeatureUnlock();

  // Don't show after level 32
  if (playerLevel >= 32) {
    return null;
  }

  if (!nextFeature) {
    return (
      <div className="card-3d bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-purple-500/50 p-4">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-purple-300 font-bold">جميع الميزات مفتوحة!</h3>
            <p className="text-purple-200 text-sm">مبروك! لقد وصلت للمستوى الأقصى</p>
          </div>
        </div>
      </div>
    );
  }

  const levelsNeeded = nextFeature.level - playerLevel;
  const progress = Math.max(0, 1 - (levelsNeeded / 5));

  return (
    <div className="card-3d bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-blue-500/50 p-4">
      <div className="flex items-center gap-3 mb-3">
        <Lock className="w-6 h-6 text-blue-400" />
        <div>
          <h3 className="text-blue-300 font-bold">تقدم الميزات</h3>
          <p className="text-blue-200 text-sm">{nextFeature.name} - المستوى {nextFeature.level}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-blue-300">المستوى المطلوب: {nextFeature.level}</span>
            <span className="text-blue-300">مستواك الحالي: {playerLevel}</span>
          </div>
          
          <div className="progress-3d h-3">
            <div 
              className="progress-3d-fill bg-gradient-to-r from-blue-400 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          
          <p className="text-blue-200 text-xs text-center">
            {levelsNeeded > 0 ? `تحتاج ${levelsNeeded} مستوى إضافي` : 'تقريباً هناك!'}
          </p>
        </div>

        {/* Locked Features List */}
        {lockedFeatures.length > 0 && (
          <div className="border-t border-blue-700 pt-3">
            <h4 className="text-blue-300 text-sm font-medium mb-2">الميزات المقفلة:</h4>
            <div className="space-y-1">
              {lockedFeatures.slice(0, 3).map((feature, index) => (
                <div key={feature.key || feature.feature || `locked-feature-${index}`} className="flex items-center justify-between p-1 bg-black/20 rounded text-xs">
                  <span className="text-blue-200">{feature.name || feature.feature}</span>
                  <span className="text-blue-400">المستوى {feature.level || feature.requiredLevel}</span>
                </div>
              ))}
              
              {lockedFeatures.length > 3 && (
                <p className="text-blue-400 text-xs text-center">
                  و {lockedFeatures.length - 3} ميزة أخرى...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const FeatureUnlockList = () => {
  const { playerLevel, lockedFeatures } = useFeatureUnlock();

  // Don't show after level 32
  if (playerLevel >= 32 || lockedFeatures.length === 0) {
    return null;
  }

  return (
    <div className="card-3d bg-gradient-to-r from-gray-900/30 to-gray-800/20 border-gray-500/50 p-4">
      <h3 className="text-gray-300 font-bold mb-3 flex items-center gap-2">
        <Lock className="w-5 h-5" />
        الميزات المقفلة
      </h3>
      
      <div className="space-y-2">
        {lockedFeatures.slice(0, 5).map((feature, index) => (
          <div key={feature.key || feature.feature || `locked-feature-${index}`} className="flex items-center justify-between p-2 bg-black/20 rounded">
            <span className="text-gray-300 text-sm">{feature.name || feature.feature}</span>
            <span className="text-gray-400 text-xs">المستوى {feature.level || feature.requiredLevel}</span>
          </div>
        ))}
        
        {lockedFeatures.length > 5 && (
          <p className="text-gray-400 text-xs text-center">
            و {lockedFeatures.length - 5} ميزة أخرى...
          </p>
        )}
      </div>
    </div>
  );
};
