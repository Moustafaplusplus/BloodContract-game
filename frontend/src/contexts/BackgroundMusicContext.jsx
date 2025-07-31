import { createContext, useContext, useEffect } from 'react';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';

const BackgroundMusicContext = createContext();

export const useBackgroundMusicContext = () => {
  const context = useContext(BackgroundMusicContext);
  if (!context) {
    throw new Error('useBackgroundMusicContext must be used within a BackgroundMusicProvider');
  }
  return context;
};

export const BackgroundMusicProvider = ({ children }) => {
  const musicControls = useBackgroundMusic();

  // Auto-play music when user is authenticated and on dashboard
  useEffect(() => {
    const handleRouteChange = () => {
      const currentPath = window.location.pathname;
      const isOnDashboard = currentPath.startsWith('/dashboard') || 
                           currentPath === '/players' || 
                           currentPath === '/gangs' ||
                           currentPath === '/notifications' ||
                           currentPath === '/admin/panel';
      
      if (isOnDashboard && !musicControls.isPlaying && musicControls.userInteracted) {
        // Small delay to ensure the page has loaded
        setTimeout(() => {
          musicControls.play();
        }, 500);
      }
    };

    // Check on initial load
    handleRouteChange();

    // Listen for route changes
    const handlePopState = () => {
      setTimeout(handleRouteChange, 100);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Also listen for pushState/replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(handleRouteChange, 100);
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      setTimeout(handleRouteChange, 100);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [musicControls.isPlaying, musicControls.userInteracted, musicControls.play]);

  return (
    <BackgroundMusicContext.Provider value={musicControls}>
      {children}
    </BackgroundMusicContext.Provider>
  );
}; 