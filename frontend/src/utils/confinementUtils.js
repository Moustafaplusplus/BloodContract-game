import { toast } from 'react-hot-toast';
import { useConfinement } from '@/hooks/useConfinement';

/**
 * Wrapper for API calls that handles confinement errors
 */
export const withConfinementCheck = (apiCall) => {
  return async (...args) => {
    try {
      return await apiCall(...args);
    } catch (error) {
      // Check if it's a confinement error
      if (error.response?.status === 403) {
        const data = error.response.data;
        if (data.type === 'hospital' || data.type === 'jail') {
          // Show confinement message
          const message = data.type === 'hospital' 
            ? 'لا يمكن تنفيذ هذا الإجراء أثناء وجودك في المستشفى'
            : 'لا يمكن تنفيذ هذا الإجراء أثناء وجودك في السجن';
          
          toast.error(message, {
            duration: 4000,
            position: 'top-center',
            style: {
              background: '#1f2937',
              color: '#f87171',
              border: '1px solid #dc2626'
            }
          });
          
          // Return a special error object that can be handled by components
          throw {
            isConfinementError: true,
            type: data.type,
            message: data.message,
            remainingSeconds: data.remainingSeconds,
            cost: data.cost
          };
        }
      }
      
      // Re-throw the original error
      throw error;
    }
  };
};

/**
 * Hook to create API functions with confinement checking
 */
export const useConfinementAPI = () => {
  const { handleConfinementError } = useConfinement();
  
  const apiCall = withConfinementCheck(async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.response = response;
      throw error;
    }
    
    return response.json();
  });
  
  return { apiCall };
};

/**
 * Check if user can perform an action based on confinement status
 */
export const canPerformAction = (confinementStatus) => {
  if (!confinementStatus) return true;
  
  return !confinementStatus.isConfined();
};

/**
 * Get appropriate error message for confinement
 */
export const getConfinementErrorMessage = (type) => {
  const messages = {
    hospital: 'لا يمكن تنفيذ هذا الإجراء أثناء وجودك في المستشفى',
    jail: 'لا يمكن تنفيذ هذا الإجراء أثناء وجودك في السجن',
    default: 'لا يمكن تنفيذ هذا الإجراء حالياً'
  };
  
  return messages[type] || messages.default;
};

/**
 * Format confinement time for display
 */
export const formatConfinementTime = (seconds) => {
  if (!seconds) return '00:00:00';
  
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  
  return `${h}:${m}:${s}`;
}; 