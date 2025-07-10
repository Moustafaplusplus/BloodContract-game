/* ============================================================================
 *  src/layouts/DashboardLayout.jsx – added Gym nav link
 * ----------------------------------------------------------------------------*/
import React, { useState } from "react";
import Navigation, { MenuButton } from "@/components/Navigation";
import HUD from "@/components/HUD";

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* HUD with menu button inside */}
      <HUD menuButton={<MenuButton isOpen={isOpen} setIsOpen={setIsOpen} />} />
      {/* Navigation sidebar */}
      <Navigation isOpen={isOpen} setIsOpen={setIsOpen} />
      {/* Main content */}
      <main className="flex-1 lg:mr-64 p-4 lg:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
