import { createContext, useContext } from 'react';
import { useNotificationSound } from '@/hooks/useNotificationSound';

const NotificationSoundContext = createContext();

export const useNotificationSoundContext = () => {
  const context = useContext(NotificationSoundContext);
  if (!context) {
    throw new Error('useNotificationSoundContext must be used within a NotificationSoundProvider');
  }
  return context;
};

export const NotificationSoundProvider = ({ children }) => {
  const notificationControls = useNotificationSound();

  return (
    <NotificationSoundContext.Provider value={notificationControls}>
      {children}
    </NotificationSoundContext.Provider>
  );
}; 