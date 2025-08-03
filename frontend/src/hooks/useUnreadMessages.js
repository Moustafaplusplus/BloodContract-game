import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useFirebaseAuth } from './useFirebaseAuth';
import axios from 'axios';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();
  const { customToken } = useFirebaseAuth();

  const fetchUnreadCount = useCallback(async () => {
    try {
      if (!customToken) return;
      
      const response = await axios.get('/api/messages/inbox');
      
      // Count conversations with unread messages
      const unreadConversations = response.data.filter(conversation => 
        conversation.hasUnreadMessages
      );
      
      setUnreadCount(unreadConversations.length);
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      setUnreadCount(0);
    }
  }, [customToken]);

  // Listen for socket events
  useEffect(() => {
    if (!socket || !socket.connected) return;

    const handleNewMessage = (message) => {
      // Increment count when receiving a new message
      setUnreadCount(prev => prev + 1);
    };

    const handleMessageRead = () => {
      // Refetch count when messages are marked as read
      fetchUnreadCount();
    };

    socket.on('receive_message', handleNewMessage);
    socket.on('message_read', handleMessageRead);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.off('message_read', handleMessageRead);
    };
  }, [socket, fetchUnreadCount]);

  // Also refetch when the component mounts or when the user navigates to messages
  useEffect(() => {
    const handleFocus = () => {
      fetchUnreadCount();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchUnreadCount]);

  // Initial fetch
  useEffect(() => {
    if (customToken) {
      fetchUnreadCount();
    }
  }, [fetchUnreadCount, customToken]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!customToken) return;
    
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount, customToken]);

  return {
    unreadCount,
    fetchUnreadCount,
    refetch: fetchUnreadCount
  };
}; 