import { useState, useEffect, useRef } from 'react';

export const useBackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3); // Default volume at 30%
  const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/backgroundmusic.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    audioRef.current.preload = 'auto';

    // Listen for user interaction to enable audio
    const handleUserInteraction = () => {
      console.log('User interaction detected, enabling audio...');
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
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = () => {
    console.log('Play called, userInteracted:', userInteracted, 'isPlaying:', isPlaying);
    if (!userInteracted) {
      console.log('Waiting for user interaction before playing music...');
      return;
    }

    if (audioRef.current && !isPlaying) {
      console.log('Attempting to play music...');
      audioRef.current.play()
        .then(() => {
          console.log('Music started successfully');
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
    console.log('Pause called, isPlaying:', isPlaying);
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('Music paused');
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
    console.log('Volume set to:', clampedVolume);
  };

  const toggle = () => {
    console.log('Toggle called, userInteracted:', userInteracted, 'isPlaying:', isPlaying);
    if (!userInteracted) {
      // If user hasn't interacted yet, this interaction will enable audio
      console.log('Enabling audio through user interaction...');
      setUserInteracted(true);
      setTimeout(() => {
        if (isPlaying) {
          pause();
        } else {
          play();
        }
      }, 100);
      return;
    }

    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return {
    isPlaying,
    volume,
    userInteracted,
    play,
    pause,
    stop,
    toggle,
    setVolume: setMusicVolume
  };
}; 