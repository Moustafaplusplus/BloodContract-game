import React, { useState, useEffect, useRef } from 'react';
import './IntroSlideshow.css';

const IntroSlideshow = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const audioRef = useRef(null);

  // Total duration: 1:24 (84 seconds)
  // 7 slides, each slide gets 12 seconds (84/7 = 12)
  const slides = [
    {
      image: '/intro/page1.png',
      text: '> في مدينة لا تعرف النوم…\nحيث تُشترى الأرواح وتُباع بالعقود…\nكان هناك اسم لا يُذكر، لكن يُخشى...',
      duration: 12000 // 12 seconds
    },
    {
      image: '/intro/page2.png',
      text: '> لم يكن قاتلًا مأجورًا…\nبل كان وعدًا بالانتقام…\nيمشي على خيط رفيع بين العدل والدم.',
      duration: 12000 // 12 seconds
    },
    {
      image: '/intro/page3.png',
      text: '> قبل خمس سنوات...\nتم كسر القاعدة...\nدُفع ثمن لم يقبضه أحد.',
      duration: 12000 // 12 seconds
    },
    {
      image: '/intro/page4.png',
      text: '> ظنّوا أنه مات...\nلكنه عاد...\nلا يبحث عن مال... بل عن شيء واحد.',
      duration: 12000 // 12 seconds
    },
    {
      image: '/intro/page5.png',
      text: '> العقد الجديد... ليس كأي عقد.\nمن يخون الدم... يُراق دمه.',
      duration: 12000 // 12 seconds
    },
    {
      image: '/intro/page6.png',
      text: '> أنت الهدف... وأنت القاتل.\nاختر طريقك...\nلكن تذكّر: لا أحد يخرج من هذا العالم كما دخل.',
      duration: 12000 // 12 seconds
    },
    {
      image: '/intro/page7.png',
      text: '> عقد الدم\n"عندما تُوقّع، لا رجعة."',
      duration: 12000 // 12 seconds
    }
  ];

  useEffect(() => {
    // Show skip button after 3 seconds
    const skipTimer = setTimeout(() => {
      setShowSkipButton(true);
    }, 3000);

    // Start background music with sound on by default
    if (audioRef.current) {
      audioRef.current.volume = 0.4;
      audioRef.current.play()
        .then(() => {
          setIsAudioPlaying(true);
        })
        .catch(e => {
          console.log('Audio autoplay blocked');
          setIsAudioPlaying(false);
        });
    }

    // Show first slide
    setIsVisible(true);

    return () => {
      clearTimeout(skipTimer);
    };
  }, []);

  useEffect(() => {
    if (currentSlide >= slides.length) {
      // Slideshow complete - show black screen for 2 seconds
      setTimeout(() => {
        onComplete && onComplete();
      }, 2000);
      return;
    }

    const slide = slides[currentSlide];
    
    // Show current slide
    setIsVisible(true);
    
    // Move to next slide after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
      }, 1000); // Fade out duration
    }, slide.duration);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  const handleSkip = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onComplete && onComplete();
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      } else {
        audioRef.current.play();
        setIsAudioPlaying(true);
      }
    }
  };

  if (currentSlide >= slides.length) {
    return (
      <div className="intro-slideshow">
        <audio ref={audioRef} src="/intro/intro.mp3" loop />
        <div className="slideshow-container fade-out">
          <div className="black-screen">
            {/* Black blank page - no text */}
          </div>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="intro-slideshow">
      <audio ref={audioRef} src="/intro/intro.mp3" loop />
      
      {showSkipButton && (
        <button className="skip-button" onClick={handleSkip}>
          تخطي
        </button>
      )}

      <div className="audio-controls">
        <button onClick={toggleAudio} title={isAudioPlaying ? 'كتم الصوت' : 'تشغيل الصوت'}>
          {isAudioPlaying ? '🔊' : '🔇'}
        </button>
      </div>
      
      <div className={`slideshow-container ${isVisible ? 'fade-in' : 'fade-out'}`}>
        <div 
          className="slide-background"
          style={{ backgroundImage: `url(${slide.image})` }}
        />
        
        <div className="slide-content">
          <div className="text-container">
            <div className="slide-text">
              {slide.text.split('\n').map((line, index) => (
                <div key={index} className="text-line">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroSlideshow; 