import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useHud } from '@/hooks/useHud';
import { useSocket } from '@/hooks/useSocket';

const FamePopupContext = createContext(null);

function FamePopupInner({ children }) {
  const { stats: hudStats } = useHud();
  const [famePopup, setFamePopup] = useState(null);
  const previousFameRef = useRef(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!hudStats?.fame) return;

    const currentFame = Number(hudStats.fame);
    const previousFame = previousFameRef.current;

    // Skip the first load to avoid showing popup on initial load
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      previousFameRef.current = currentFame;
      return;
    }

    // Only show popup if fame changed and we have a previous value
    if (previousFame !== null && previousFame !== currentFame) {
      const difference = currentFame - previousFame;
      const isIncrease = difference > 0;

      setFamePopup({
        value: currentFame,
        difference: Math.abs(difference),
        isIncrease,
        timestamp: Date.now()
      });

      // Auto-hide after 2 seconds
      const timer = setTimeout(() => {
        setFamePopup(null);
      }, 2000);

      return () => clearTimeout(timer);
    }

    // Update previous fame reference (only if we have a valid fame value)
    if (currentFame !== null && !isNaN(currentFame)) {
      previousFameRef.current = currentFame;
    }
  }, [hudStats?.fame]);

  const triggerFamePopup = (newFame, oldFame) => {
    const difference = newFame - oldFame;
    const isIncrease = difference > 0;

    setFamePopup({
      value: newFame,
      difference: Math.abs(difference),
      isIncrease,
      timestamp: Date.now()
    });

    // Auto-hide after 2 seconds
    setTimeout(() => {
      setFamePopup(null);
    }, 2000);
  };

  return (
    <FamePopupContext.Provider value={{ famePopup, triggerFamePopup }}>
      {children}
      {famePopup && <FamePopupComponent popup={famePopup} />}
    </FamePopupContext.Provider>
  );
}

export function FamePopupProvider({ children }) {
  const { socket } = useSocket();
  
  // Only render the inner component when socket is available
  if (!socket) {
    return (
      <FamePopupContext.Provider value={{ famePopup: null, triggerFamePopup: () => {} }}>
        {children}
      </FamePopupContext.Provider>
    );
  }
  
  return <FamePopupInner>{children}</FamePopupInner>;
}

function FamePopupComponent({ popup }) {
  const { value, difference, isIncrease } = popup;
  const [displayValue, setDisplayValue] = React.useState(0);
  const [displayDifference, setDisplayDifference] = React.useState(0);

  // Counter animation effect
  React.useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 30;
    const stepValue = value / steps;
    const stepDifference = difference / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setDisplayValue(Math.floor(stepValue * currentStep));
      setDisplayDifference(Math.floor(stepDifference * currentStep));
      
      if (currentStep >= steps) {
        setDisplayValue(value);
        setDisplayDifference(difference);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, difference]);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`
        relative card-3d bg-gradient-to-r from-blood-950/90 to-black/80 border-2 px-8 py-6
        ${isIncrease ? 'border-green-500/60' : 'border-blood-500/60'}
        animate-fame-popup
      `}>
        {/* Background glow effect */}
        <div className={`
          absolute inset-0 rounded-xl opacity-20 blur-sm
          ${isIncrease ? 'bg-green-500' : 'bg-blood-500'}
        `} />
        
        {/* Content */}
        <div className="relative flex items-center gap-6 text-white">
          {/* Icon */}
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${isIncrease ? 'bg-green-500' : 'bg-blood-500'}
            animate-pulse shadow-lg
          `}>
            <span className="text-white font-bold text-xl">
              {isIncrease ? '↑' : '↓'}
            </span>
          </div>
          
          {/* Text */}
          <div className="text-right space-y-2">
            <div className="text-white">
              <div className="text-lg font-medium mb-1">الشهرة الجديدة</div>
              <div className="text-3xl font-bold text-white">
                {displayValue.toLocaleString()}
              </div>
            </div>
            <div className={`
              text-base font-medium
              ${isIncrease ? 'text-green-400' : 'text-blood-400'}
            `}>
              {isIncrease ? 'زيادة' : 'نقصان'} بمقدار {displayDifference.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Animated border */}
        <div className={`
          absolute inset-0 rounded-xl border-2 border-transparent
          ${isIncrease ? 'animate-pulse-green' : 'animate-pulse-blood'}
        `} />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-1 h-1 rounded-full
                ${isIncrease ? 'bg-green-400' : 'bg-blood-400'}
                animate-float
              `}
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + i * 0.5}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function useFamePopup() {
  const context = useContext(FamePopupContext);
  if (!context) {
    throw new Error('useFamePopup must be used within a FamePopupProvider');
  }
  return context;
}
