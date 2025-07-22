// src/components/HUD/index.jsx
import React from "react";
import { useHud } from "@/hooks/useHud";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PlayerSearch from "@/features/profile/PlayerSearch";
import LevelUpModal from "@/components/LevelUpModal";
import { useModalManager } from "@/hooks/useModalManager";
import axios from "axios";

// Temporary Blackcoin icon
const BlackcoinIcon = () => (
  <span className="inline-block w-5 h-5 rounded-full bg-gradient-to-br from-black via-zinc-900 to-zinc-800 border-2 border-accent-red flex items-center justify-center mr-1">
    <span className="text-xs text-accent-red font-bold">B</span>
  </span>
);

// Search icon (copied from Navigation.jsx)
const SearchIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27c.98-1.14 1.57-2.62 1.57-4.23 0-3.59-2.91-6.5-6.5-6.5S3 5.91 3 9.5s2.91 6.5 6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

export default function HUD({ menuButton }) {
  const { stats, loading } = useHud();
  const navigate = useNavigate();
  const { showModal, hideModal, isModalVisible } = useModalManager();
  const [levelUpData, setLevelUpData] = useState(null);
  const previousLevelRef = useRef(null);

  // Detect level changes and show modal
  useEffect(() => {
    // Initialize previousLevel if it's null and we have stats
    if (stats && previousLevelRef.current === null) {
      previousLevelRef.current = stats.level;
      return;
    }
    
    if (stats && previousLevelRef.current !== null && stats.level > previousLevelRef.current) {
      if (stats.levelUpRewards && stats.levelsGained > 0) {
        setLevelUpData({
          levelUpRewards: stats.levelUpRewards,
          levelsGained: stats.levelsGained
        });
        showModal('levelUp', 100); // High priority for level-up modal
      }
    }
    previousLevelRef.current = stats?.level || null;
  }, [stats?.level, stats?.levelUpRewards, stats?.levelsGained]);

  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-red-900 text-white py-1 px-1 flex justify-center text-sm z-50 w-full max-w-full min-w-0">
        ⚠️ تعذر الاتصال بالخادم أو تحميل بيانات HUD
      </div>
    );
  }

  if (!stats) return null;

  // Calculate percentages
  const healthPercent = stats.maxHp
    ? Math.round((stats.hp / stats.maxHp) * 100)
    : 0;
  const energyPercent = stats.maxEnergy
    ? Math.round((stats.energy / stats.maxEnergy) * 100)
    : 0;
  const expPercent = stats.nextLevelExp
    ? Math.round((stats.exp / stats.nextLevelExp) * 100)
    : 0;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-black/95 text-white py-2 px-4 flex flex-row items-center justify-between text-xs z-50 backdrop-blur-sm border-b border-red-900 gap-4">
        {/* Search Icon (very left) */}
        <button
          className="mr-2 p-2 rounded-full bg-zinc-900 hover:bg-accent-red/30 border border-accent-red/40 transition-colors"
          onClick={() => navigate("/players")}
          aria-label="بحث اللاعبين"
        >
          <SearchIcon />
        </button>
        {/* Bars Column */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          {/* Health Bar */}
          <div className="flex items-center gap-2">
            <span className="text-red-500 flex-shrink-0">❤️</span>
            <div className="flex-1 bg-zinc-800 rounded-full h-3 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ width: `${healthPercent}%` }}
              >
                <span className="text-[10px] font-mono text-white drop-shadow-sm whitespace-nowrap">
                  ({healthPercent}%) {stats.hp}/{stats.maxHp}
                </span>
              </div>
            </div>
          </div>
          {/* Energy Bar */}
          <div className="flex items-center gap-2">
            <span className="text-red-500 flex-shrink-0">⚡</span>
            <div className="flex-1 bg-zinc-800 rounded-full h-3 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ width: `${energyPercent}%` }}
              >
                <span className="text-[10px] font-mono text-white drop-shadow-sm whitespace-nowrap">
                  ({energyPercent}%) {stats.energy}/{stats.maxEnergy}
                </span>
              </div>
            </div>
          </div>
          {/* Experience Bar */}
          <div className="flex items-center gap-2">
            <span className="text-red-400 flex-shrink-0">⭐</span>
            <div className="flex-1 bg-zinc-800 rounded-full h-3 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-red-700 to-red-800 h-3 rounded-full flex items-center justify-center transition-all duration-300"
                style={{ width: `${expPercent}%` }}
              >
                <span className="text-[10px] font-mono text-white drop-shadow-sm whitespace-nowrap">
                  ({expPercent}%) {stats.exp}/{stats.nextLevelExp}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Level, Money, and Blackcoin Column */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0 min-w-[80px]">
          <div className="flex items-center gap-1">
            <span className="text-red-400">⭐</span>
            <span className="font-mono text-sm whitespace-nowrap">
              Lv.{stats.level}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-red-500">💰</span>
            <span className="font-mono text-sm whitespace-nowrap">
              {stats.money?.toLocaleString()}
            </span>
          </div>
          {/* Blackcoin below money, icon and number only */}
          <div className="flex items-center gap-1 mt-1">
            <BlackcoinIcon />
            <span className="font-mono text-sm whitespace-nowrap text-accent-red">{stats.blackcoins?.toLocaleString() ?? 0}</span>
          </div>
        </div>
        {/* Menu Button Slot */}
        <div className="flex-shrink-0">{menuButton}</div>
      </div>

      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={isModalVisible('levelUp')}
        onClose={async () => {
          hideModal('levelUp');
          
          // Clear level-up rewards on the backend
          try {
            await axios.post('/api/character/clear-level-up-rewards');
          } catch {
            // Failed to clear level-up rewards
          }
          
          // Clear the data after a short delay to ensure modal has time to close
          setTimeout(() => {
            setLevelUpData(null);
          }, 100);
        }}
        levelUpRewards={levelUpData?.levelUpRewards}
        levelsGained={levelUpData?.levelsGained}
      />
      

    </>
  );
}
