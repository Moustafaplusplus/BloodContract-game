import React, { useState } from 'react';
import IntroVideo from '../components/IntroVideo';
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
    return <IntroVideo onComplete={handleIntroComplete} />;
  }

  return (
    <div className="intro-demo">
      <div className="demo-container">
        <h1>عقد الدم - Intro Video Demo</h1>
        
        {!introCompleted ? (
          <div className="demo-content">
            <p>Click the button below to start the intro video:</p>
            <button 
              className="start-button"
              onClick={handleStartIntro}
            >
              بدء العرض التقديمي
            </button>
            
            <div className="features">
              <h3>Features:</h3>
              <ul>
                <li>🎬 Full video playback</li>
                <li>🎵 Synchronized audio</li>
                <li>⏭️ Skip button (appears after 3 seconds)</li>
                <li>🎮 Play/pause controls</li>
                <li>📱 Responsive design</li>
                <li>🖱️ Click to toggle controls</li>
                <li>⚡ Auto-play functionality</li>
                <li>🔄 Loading overlay</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="demo-content">
                          <h2>🎉 Intro Completed!</h2>
              <p>The intro video has finished successfully.</p>
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