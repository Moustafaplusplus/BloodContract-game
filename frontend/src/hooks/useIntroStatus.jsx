import { useState, useEffect } from 'react';
import { useFirebaseAuth } from './useFirebaseAuth';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useIntroStatus() {
  const { customToken } = useFirebaseAuth();
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customToken) {
      setHasSeenIntro(false);
      setLoading(false);
      return;
    }

    const checkIntroStatus = async () => {
      try {
        const response = await axios.get('/api/auth/intro-status', {
          headers: {
            Authorization: `Bearer ${customToken}`
          }
        });
        setHasSeenIntro(response.data.hasSeenIntro || false);
        setLoading(false);
      } catch (error) {
        console.error('Error checking intro status:', error);
        // Default to false if we can't check
        setHasSeenIntro(false);
        setLoading(false);
      }
    };

    checkIntroStatus();
  }, [customToken]);

  const markIntroAsSeen = async () => {
    if (!customToken) return;

    try {
      await axios.post('/api/auth/mark-intro-seen', {}, {
        headers: {
          Authorization: `Bearer ${customToken}`
        }
      });
      setHasSeenIntro(true);
    } catch (error) {
      console.error('Failed to mark intro as seen:', error);
    }
  };

  return {
    hasSeenIntro,
    loading,
    markIntroAsSeen
  };
}; 