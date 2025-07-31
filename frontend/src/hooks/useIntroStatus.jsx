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

    try {
      const decoded = jwtDecode(token);
      // For now, we'll assume new users haven't seen intro
      // In a real implementation, you might want to check this from the backend
      setHasSeenIntro(false);
      setLoading(false);
    } catch (error) {
      console.error('Error decoding token:', error);
      setHasSeenIntro(false);
      setLoading(false);
    }
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