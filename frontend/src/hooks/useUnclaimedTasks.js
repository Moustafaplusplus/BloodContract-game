import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';

export function useUnclaimedTasks() {
  const [unclaimedCount, setUnclaimedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { socket } = useSocket();

  const fetchUnclaimedCount = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      
      // Use the efficient backend endpoint
      const response = await axios.get('/api/tasks/unclaimed-count', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUnclaimedCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unclaimed tasks count:', error);
      setUnclaimedCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnclaimedCount();
  }, [token]);

  // Listen for socket events to update count in real-time
  useEffect(() => {
    if (!socket) return;

    const handleUnclaimedCountUpdate = () => {
      fetchUnclaimedCount();
    };

    socket.on('tasks:unclaimed-count-updated', handleUnclaimedCountUpdate);

    return () => {
      socket.off('tasks:unclaimed-count-updated', handleUnclaimedCountUpdate);
    };
  }, [socket, token]);

  return {
    unclaimedCount,
    loading,
    refetch: fetchUnclaimedCount
  };
} 