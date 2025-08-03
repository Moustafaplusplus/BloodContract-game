import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFirebaseAuth } from './useFirebaseAuth';
import axios from 'axios';
import { useSocket } from './useSocket';

export function useUnclaimedTasks() {
  const { customToken } = useFirebaseAuth();
  const [unclaimedCount, setUnclaimedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchUnclaimedCount = async () => {
    if (!customToken) return;
    
    try {
      setLoading(true);
      
      // Use the efficient backend endpoint
      const response = await axios.get('/api/tasks/unclaimed-count');

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
  }, [customToken]);

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
  }, [socket, customToken]);

  return {
    unclaimedCount,
    loading,
    refetch: fetchUnclaimedCount
  };
} 