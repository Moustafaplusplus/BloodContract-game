import React, { useState } from 'react';
import IntroSlideshow from '../components/IntroSlideshow';
import './IntroDemo.css';

const IntroDemo = () => {
  const [showIntro, setShowIntro] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);

  const handleStartIntro = () => {
    setShowIntro(true);
    setIntroCompleted(false);
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    setIntroCompleted(true);
  };

  const handleRestartIntro = () => {
    setShowIntro(true);
    setIntroCompleted(false);
  };

  if (showIntro) {
    return <IntroSlideshow onComplete={handleIntroComplete} />;
  }

  return (
    <div className="intro-demo">
      <div className="demo-container">
        <h1>عقد الدم - Intro Slideshow Demo</h1>
        
        {!introCompleted ? (
          <div className="demo-content">
            <p>Click the button below to start the intro slideshow:</p>
            <button 
              className="start-button"
              onClick={handleStartIntro}
            >
              بدء العرض التقديمي
            </button>
            
            <div className="features">
              <h3>Features:</h3>
              <ul>
                <li>✨ 7 slides with numbered images</li>
                <li>🎵 Background music synchronization</li>
                <li>⌨️ Live typing animation for text</li>
                <li>🎭 Fade in/out transitions</li>
                <li>📱 Responsive design</li>
                <li>⏭️ Skip button (appears after 3 seconds)</li>
                <li>🔊 Audio controls</li>
                <li>📊 Progress indicator</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="demo-content">
            <h2>🎉 Intro Completed!</h2>
            <p>The intro slideshow has finished successfully.</p>
            <button 
              className="restart-button"
              onClick={handleRestartIntro}
            >
              إعادة تشغيل
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntroDemo; 