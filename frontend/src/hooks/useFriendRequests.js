import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const useFriendRequests = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const { socket } = useSocket();

  const fetchPendingCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) return;
      
      const response = await axios.get('/api/friendship/pending', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Count only received requests (not sent ones)
      const receivedRequests = response.data.filter(request => 
        request.addresseeId === (() => {
          try {
            const decoded = jwtDecode(token);
            return decoded.id;
          } catch {
            return null;
          }
        })()
      );
      
      setPendingCount(receivedRequests.length);
    } catch (error) {
      console.error('Error fetching pending friend requests:', error);
      setPendingCount(0);
    }
  }, []);

  // Listen for socket events
  useEffect(() => {
    if (!socket || !socket.connected) return;

    const handleFriendshipUpdate = () => {
      fetchPendingCount();
    };

    socket.on('friendship:update', handleFriendshipUpdate);

    return () => {
      socket.off('friendship:update', handleFriendshipUpdate);
    };
  }, [socket, fetchPendingCount]);

  // Initial fetch
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      fetchPendingCount();
    }
  }, [fetchPendingCount]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchPendingCount]);

  return {
    pendingCount,
    fetchPendingCount,
    refetch: fetchPendingCount
  };
}; 