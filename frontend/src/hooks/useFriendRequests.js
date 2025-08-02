import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useFirebaseAuth } from './useFirebaseAuth';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const useFriendRequests = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const { socket } = useSocket();
  const { customToken } = useFirebaseAuth();

  const fetchPendingCount = useCallback(async () => {
    try {
      if (!customToken) return;
      
      const response = await axios.get('/api/friendship/pending', {
        headers: {
          Authorization: `Bearer ${customToken}`
        }
      });
      
      // Count only received requests (not sent ones)
      const receivedRequests = response.data.filter(request => 
        request.addresseeId === (() => {
          try {
            const decoded = jwtDecode(customToken);
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
  }, [customToken]);

  // Listen for socket events
  useEffect(() => {
    if (!socket || !socket.connected) return;

    const handleFriendshipUpdate = () => {
      console.log('useFriendRequests: Refetching due to socket update');
      fetchPendingCount();
    };

    // Listen for all friendship-related socket events
    socket.on('friendship:updated', handleFriendshipUpdate);
    socket.on('friendship:request-sent', handleFriendshipUpdate);
    socket.on('friendship:request-received', handleFriendshipUpdate);
    socket.on('friendship:request-accepted', handleFriendshipUpdate);
    socket.on('friendship:request-rejected', handleFriendshipUpdate);
    socket.on('friendship:removed', handleFriendshipUpdate);

    return () => {
      socket.off('friendship:updated', handleFriendshipUpdate);
      socket.off('friendship:request-sent', handleFriendshipUpdate);
      socket.off('friendship:request-received', handleFriendshipUpdate);
      socket.off('friendship:request-accepted', handleFriendshipUpdate);
      socket.off('friendship:request-rejected', handleFriendshipUpdate);
      socket.off('friendship:removed', handleFriendshipUpdate);
    };
  }, [socket, fetchPendingCount]);

  // Initial fetch
  useEffect(() => {
    if (customToken) {
      fetchPendingCount();
    }
  }, [fetchPendingCount, customToken]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!customToken) return;
    
    const interval = setInterval(() => {
      fetchPendingCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchPendingCount, customToken]);

  return {
    pendingCount,
    fetchPendingCount,
    refetch: fetchPendingCount
  };
}; 