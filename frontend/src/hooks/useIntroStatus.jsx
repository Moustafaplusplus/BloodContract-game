import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const useIntroStatus = () => {
  const { token } = useAuth();
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setHasSeenIntro(false);
      setLoading(false);
      return;
    }

    const checkIntroStatus = async () => {
      try {
        const response = await axios.get('/api/auth/intro-status', {
          headers: {
            Authorization: `Bearer ${token}`
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
  }, [token]);

  const markIntroAsSeen = async () => {
    if (!token) return;

    try {
      await axios.post('/api/auth/mark-intro-seen', {}, {
        headers: {
          Authorization: `Bearer ${token}`
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