import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import axios from 'axios';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useSocket();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) return;
      
      const response = await axios.get('/api/messages/inbox', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Count conversations with unread messages
      const unreadConversations = response.data.filter(conversation => 
        conversation.hasUnreadMessages
      );
      
      setUnreadCount(unreadConversations.length);
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      setUnreadCount(0);
    }
  }, []);

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
    const token = localStorage.getItem('jwt');
    if (token) {
      fetchUnreadCount();
    }
  }, [fetchUnreadCount]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    fetchUnreadCount,
    refetch: fetchUnreadCount
  };
}; 