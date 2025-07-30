import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import axios from 'axios';

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) return;
      
      const response = await axios.get('/api/notifications/unread-count', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async (page = 1, limit = 30) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('No authentication token');
      
      const response = await axios.get(`/api/notifications?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) return;
      
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) return;
      
      await axios.patch('/api/notifications/mark-all-read', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) return;
      
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  const addNotification = useCallback((notification) => {

    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Listen for socket events - improved to handle connection state changes
  useEffect(() => {
    if (!socket) {
  
      return;
    }



    const handleNewNotification = (notification) => {
      
      addNotification(notification);
      // Play notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5; // Set volume to 50%
        audio.play().catch((error) => {
  
        });
      } catch (error) {

      }
    };

    const handleConnect = () => {
      
      // Re-fetch unread count when socket connects
      fetchUnreadCount();
    };

    const handleDisconnect = () => {
      
    };

    // Always set up the notification listener, regardless of connection state
    socket.on('notification', handleNewNotification);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // If socket is already connected, fetch unread count immediately
    if (socket.connected) {
      
      fetchUnreadCount();
    }

    return () => {
      
      socket.off('notification', handleNewNotification);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket, addNotification, fetchUnreadCount]);

  // Initial fetch
  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (token) {
      fetchUnreadCount();
    }
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    notifications,
    loading,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  };
}; 