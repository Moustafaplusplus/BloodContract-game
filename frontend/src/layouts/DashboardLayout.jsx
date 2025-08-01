/* ============================================================================
 *  src/layouts/DashboardLayout.jsx – Mobile-friendly layout
 * ----------------------------------------------------------------------------*/
import React, { useState } from "react";
import Navigation, { MenuButton } from "@/components/Navigation";
import HUD from "@/components/HUD";
import { FeatureUnlockNotification } from "@/components/FeatureUnlockNotification";

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Minimal HUD with menu button */}
      <HUD menuButton={<MenuButton isOpen={isOpen} setIsOpen={setIsOpen} />} />
      
      {/* Navigation sidebar */}
      <Navigation isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {/* Feature unlock notification */}
      <FeatureUnlockNotification />
      
      {/* Main content - pushed to the right to account for HUD */}
      <main className="flex-1 overflow-auto ml-16">
        {children}
      </main>
    </div>
  );
}
