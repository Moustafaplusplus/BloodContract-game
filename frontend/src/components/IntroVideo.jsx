import React, { useState, useEffect, useRef } from 'react';
import './IntroVideo.css';
import { useIntroStatus } from '@/hooks/useIntroStatus';

const IntroVideo = ({ onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef(null);
  const { markIntroAsSeen } = useIntroStatus();

  useEffect(() => {
    // Show skip button after 3 seconds
    const skipTimer = setTimeout(() => {
      setShowSkipButton(true);
    }, 3000);

    // Auto-play video
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(e => {
          console.log('Video autoplay blocked');
          setIsPlaying(false);
        });
    }

    return () => {
      clearTimeout(skipTimer);
    };
  }, []);

  const handleVideoEnd = async () => {
    // Mark intro as seen
    await markIntroAsSeen();
    
    // Video ended - show black screen for 2 seconds then complete
    setTimeout(() => {
      onComplete && onComplete();
    }, 2000);
  };

  const handleSkip = async () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    // Mark intro as seen even when skipped
    await markIntroAsSeen();
    
    onComplete && onComplete();
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleVideoClick = () => {
    setShowControls(prev => !prev);
  };

  return (
    <div className="intro-video">
      <video
        ref={videoRef}
        className="video-player"
        src="/intro/intro.mp4"
        onEnded={handleVideoEnd}
        onClick={handleVideoClick}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        muted={false}
        playsInline
      />
      
      {showSkipButton && (
        <button className="skip-button" onClick={handleSkip}>
          تخطي
        </button>
      )}

      {showControls && (
        <div className="video-controls">
          <button 
            onClick={togglePlayPause} 
            className="control-button"
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {!isPlaying && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>جاري تحميل الفيديو...</p>
        </div>
      )}
    </div>
  );
};

export default IntroVideo; 