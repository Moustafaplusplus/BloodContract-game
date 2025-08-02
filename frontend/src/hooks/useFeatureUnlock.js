import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
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
      
      const response = await axios.get('/api/features/info', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    },
    staleTime: 60000, // 1 minute - increased to reduce requests
    retry: (failureCount, error) => {
      // Don't retry on auth errors or when no token
      if (error.message.includes('401') || error.message.includes('No authentication token')) {
        return false;
      }
      // Only retry once for other errors to prevent spam
      return failureCount < 1;
    },
    retryDelay: 2000, // 2 second delay between retries
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