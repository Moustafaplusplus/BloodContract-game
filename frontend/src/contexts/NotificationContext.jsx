import React, { createContext, useContext, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationContext = createContext();

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const notificationHook = useNotifications();

  // Poll for unread count every 30 seconds as a fallback
  useEffect(() => {
    const interval = setInterval(() => {
      notificationHook.fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [notificationHook.fetchUnreadCount]);

  // Log when notifications change for debugging
  useEffect(() => {

  }, [notificationHook.unreadCount]);

  return (
    <NotificationContext.Provider value={notificationHook}>
      {children}
    </NotificationContext.Provider>
  );
}; 