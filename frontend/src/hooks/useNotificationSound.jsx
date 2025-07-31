import { useState, useEffect, useRef } from 'react';

export const useNotificationSound = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5); // Default volume at 50%
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio element for notification sound
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.preload = 'auto';

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playNotification = () => {
    if (audioRef.current && !isMuted) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.play()
        .then(() => {
          // Notification sound played successfully
        })
        .catch((error) => {
          console.error('Failed to play notification sound:', error);
        });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const setNotificationVolume = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
  };

  return {
    isMuted,
    volume,
    playNotification,
    toggleMute,
    setVolume: setNotificationVolume
  };
}; 