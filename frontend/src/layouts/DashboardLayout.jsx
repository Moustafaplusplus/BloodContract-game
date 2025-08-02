/* ============================================================================
 *  src/layouts/DashboardLayout.jsx – Enhanced Mobile-first 3D Layout
 * ----------------------------------------------------------------------------*/
import React, { useState, useEffect } from "react";
import Navigation, { MenuButton } from "@/components/Navigation";
import HUD from "@/components/HUD";
import { FeatureUnlockNotification } from "@/components/FeatureUnlockNotification";

export default function DashboardLayout({ children }) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isHudExpanded, setIsHudExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile device and handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-collapse on mobile
      if (mobile) {
        setIsNavOpen(false);
        setIsHudExpanded(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close overlays when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile) {
      setIsNavOpen(false);
    }
  };

  return (
    <div className="min-h-screen hitman-gradient text-white overflow-hidden flex flex-col safe-area-top safe-area-bottom">
      
      {/* HUD Sidebar */}
      <HUD 
        menuButton={
          <MenuButton 
            isOpen={isNavOpen} 
            setIsOpen={setIsNavOpen} 
          />
        } 
      />
      
      {/* Navigation Sidebar */}
      <Navigation 
        isOpen={isNavOpen} 
        setIsOpen={setIsNavOpen} 
      />
      
      {/* Feature unlock notification */}
      <FeatureUnlockNotification />
      
      {/* Main content area */}
      <main 
        className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
          isMobile ? 'ml-16' : 'ml-16'
        } safe-area-left safe-area-right`}
      >
        {/* Content wrapper with enhanced styling */}
        <div className="min-h-full relative">
          {/* Background effects */}
          <div className="fixed inset-0 pointer-events-none">
            {/* Grid pattern */}
            <div 
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
            
            {/* Subtle animated particles */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-red-500/20 rounded-full animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${3 + Math.random() * 4}s`,
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
      
      {/* Mobile navigation overlay */}
      {isMobile && isNavOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}
    </div>
  );
}
