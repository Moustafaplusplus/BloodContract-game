import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  isFeatureUnlocked, 
  getUnlockedFeatures, 
  getLockedFeatures, 
  getNextFeature,
  getFeaturesAtLevel,
  getFeatureUnlockProgress 
} from '@/utils/featureUnlock';

export const useFeatureUnlock = () => {
  // Get feature unlock data from API
  const { data: apiFeatureData, error: apiError } = useQuery({
    queryKey: ['feature-unlock'],
    queryFn: async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await fetch('/api/features/info', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    staleTime: 30000, // 30 seconds
    retry: (failureCount, error) => {
      // Don't retry on auth errors or when no token
      if (error.message.includes('401') || error.message.includes('No authentication token')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    enabled: !!localStorage.getItem('jwt'), // Only run when user is authenticated
  });

  const playerLevel = apiFeatureData?.playerLevel || 1;

  // Memoized feature unlock data
  const featureData = useMemo(() => {
    // Use API data if available, otherwise fall back to local calculation
    const unlocked = apiFeatureData?.unlockedFeatures || getUnlockedFeatures(playerLevel);
    const locked = apiFeatureData?.lockedFeatures || getLockedFeatures(playerLevel);
    const nextFeature = apiFeatureData?.nextFeature || getNextFeature(playerLevel);
    const featuresAtCurrentLevel = apiFeatureData?.featuresAtCurrentLevel || getFeaturesAtLevel(playerLevel);

    return {
      playerLevel,
      unlockedFeatures: unlocked,
      lockedFeatures: locked,
      nextFeature,
      featuresAtCurrentLevel,
      isFeatureUnlocked: (featureKey) => isFeatureUnlocked(featureKey, playerLevel),
      getFeatureProgress: (featureKey) => getFeatureUnlockProgress(featureKey, playerLevel),
    };
  }, [playerLevel, apiFeatureData]);

  return featureData;
};

// Hook for checking specific feature access
export const useFeatureAccess = (featureKey) => {
  const { playerLevel, isFeatureUnlocked, getFeatureProgress } = useFeatureUnlock();
  
  return {
    isUnlocked: isFeatureUnlocked(featureKey),
    progress: getFeatureProgress(featureKey),
    playerLevel,
  };
}; 