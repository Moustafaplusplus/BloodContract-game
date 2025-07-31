import { useState, useEffect, useRef } from 'react';

export const useBackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedVolume = localStorage.getItem('backgroundMusicVolume');
      const savedMuted = localStorage.getItem('backgroundMusicMuted');
      
      if (savedVolume !== null) {
        setVolume(parseFloat(savedVolume));
      }
      if (savedMuted !== null) {
        setIsMuted(JSON.parse(savedMuted));
      }
    } catch (error) {
      console.error('Failed to load music settings:', error);
    }
  }, []);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/backgroundmusic.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = isMuted ? 0 : volume;
    audioRef.current.preload = 'auto';

    // Listen for user interaction to enable audio
    const handleUserInteraction = () => {
      setUserInteracted(true);
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('backgroundMusicVolume', volume.toString());
      localStorage.setItem('backgroundMusicMuted', isMuted.toString());
    } catch (error) {
      console.error('Failed to save music settings:', error);
    }
  }, [volume, isMuted]);

  const play = () => {
    if (!userInteracted) {
      return;
    }

    // Don't play if muted
    if (isMuted) {
      return;
    }

    // Check if we're on intro page and don't play music
    const currentPath = window.location.pathname;
    if (currentPath.includes('/intro') || currentPath.includes('/demo')) {
      return;
    }

    if (audioRef.current && !isPlaying) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error('Failed to play background music:', error);
          // If autoplay fails, we'll try again on next user interaction
          setUserInteracted(false);
        });
    }
  };

  const pause = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const setMusicVolume = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState) {
      // If muting, pause the music
      if (isPlaying) {
        pause();
      }
    } else {
      // If unmuting and music was playing before, resume
      if (userInteracted && !isPlaying) {
        play();
      }
    }
  };

  const toggle = () => {
    if (!userInteracted) {
      // If user hasn't interacted yet, this interaction will enable audio
      setUserInteracted(true);
      setTimeout(() => {
        if (isMuted) {
          // If muted, unmute and play
          setIsMuted(false);
          setTimeout(() => play(), 100);
        } else if (isPlaying) {
          pause();
        } else {
          play();
        }
      }, 100);
      return;
    }

    if (isMuted) {
      // If muted, unmute and play
      setIsMuted(false);
      setTimeout(() => play(), 100);
    } else if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return {
    isPlaying,
    volume,
    userInteracted,
    isMuted,
    play,
    pause,
    stop,
    toggle,
    toggleMute,
    setVolume: setMusicVolume
  };
}; 