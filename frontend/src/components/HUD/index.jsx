// src/components/HUD/index.jsx
import React from "react";
import { useHud } from "@/hooks/useHud";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PlayerSearch from "@/features/profile/PlayerSearch";
import LevelUpModal from "@/components/LevelUpModal";
import NotificationIcon from "@/components/NotificationIcon";
import { useModalManager } from "@/hooks/useModalManager";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

// Blackcoin icon
const BlackcoinIcon = () => (
  <img 
    src="/images/blackcoins-icon.png" 
    alt="Blackcoin"
    className="w-4 h-4 object-contain"
    onError={(e) => {
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'inline-block';
    }}
  />
);

// Search icon
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27c.98-1.14 1.57-2.62 1.57-4.23 0-3.59-2.91-6.5-6.5-6.5S3 5.91 3 9.5s2.91 6.5 6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

// Status indicator component
const StatusIndicator = ({ icon, isActive, timeLeft, className = "" }) => {
  const formatTime = (seconds) => {
    if (seconds <= 0) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative group ${className}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all duration-200 ${
        isActive 
          ? 'bg-red-900/80 border border-red-600 text-red-300' 
          : 'bg-zinc-800/60 border border-zinc-600 text-zinc-400'
      }`}>
        {icon}
      </div>
      {isActive && timeLeft > 0 && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/90 border border-red-600 rounded px-2 py-1 text-xs font-mono text-red-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {formatTime(timeLeft)}
        </div>
      )}
    </div>
  );
};

export default function HUD({ menuButton }) {
  const { stats, loading } = useHud();
  const { isAuthed, token } = useAuth();
  const navigate = useNavigate();
  const { showModal, hideModal, isModalVisible } = useModalManager();
  const [levelUpData, setLevelUpData] = useState(null);
  const previousLevelRef = useRef(null);

  // Reset level tracking when user changes
  useEffect(() => {
    previousLevelRef.current = null;
  }, [token]);

  // Detect level changes and show modal
  useEffect(() => {
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
        showModal('levelUp', 100);
      }
    }
    previousLevelRef.current = stats?.level || null;
  }, [stats?.level, stats?.levelUpRewards, stats?.levelsGained]);

  // Clear level up data when user changes
  useEffect(() => {
    setLevelUpData(null);
  }, [token]);

  if (!isAuthed) return null;

  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-black/95 text-white py-1 px-4 flex justify-center text-xs z-50">
        <div className="animate-pulse">جاري تحميل بيانات اللاعب...</div>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate percentages
  const healthPercent = stats.maxHp ? Math.round((stats.hp / stats.maxHp) * 100) : 0;
  const energyPercent = stats.maxEnergy ? Math.round((stats.energy / stats.maxEnergy) * 100) : 0;
  const expPercent = stats.nextLevelExp ? Math.round((stats.exp / stats.nextLevelExp) * 100) : 0;

  // Extract status data
  const hospitalStatus = stats.hospitalStatus || { inHospital: false, remainingSeconds: 0 };
  const jailStatus = stats.jailStatus || { inJail: false, remainingSeconds: 0 };
  const crimeCooldown = stats.crimeCooldown || 0;
  const gymCooldown = stats.gymCooldown || 0;

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-red-900/50 z-50">
        {/* Mobile Layout - 3 Rows */}
        <div className="block lg:hidden">
          {/* Row 1: Navigation & Actions */}
          <div className="flex items-center justify-between px-3 py-1">
            <div className="flex items-center gap-2">
              <button
                className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-red-900/60 border border-zinc-600 hover:border-red-600 transition-all duration-200"
                onClick={() => navigate("/players")}
                aria-label="بحث اللاعبين"
              >
                <SearchIcon />
              </button>
              {menuButton}
            </div>
            <div className="flex items-center gap-2">
              <NotificationIcon />
            </div>
          </div>

          {/* Row 2: Main Stats */}
          <div className="flex items-center justify-between px-3 py-1">
            {/* Health */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-red-400 text-sm">❤️</span>
              <div className="flex-1 bg-zinc-800 rounded-full h-2 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(healthPercent, 100)}%` }}
                />
              </div>
              <span className="text-xs font-mono text-white min-w-0">
                {stats.hp}/{stats.maxHp}
              </span>
            </div>
          </div>

          {/* Row 3: Energy, Experience & Status */}
          <div className="flex items-center justify-between px-3 py-1">
            {/* Energy & Experience */}
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-sm">⚡</span>
                <div className="w-16 bg-zinc-800 rounded-full h-2 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${energyPercent}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-white">
                  {stats.energy}/{stats.maxEnergy}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-sm">⭐</span>
                <div className="w-16 bg-zinc-800 rounded-full h-2 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${expPercent}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-white">
                  {stats.exp}/{stats.nextLevelExp}
                </span>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-1">
              <StatusIndicator
                icon="🏥"
                isActive={hospitalStatus.inHospital}
                timeLeft={hospitalStatus.remainingSeconds}
              />
              <StatusIndicator
                icon="🔒"
                isActive={jailStatus.inJail}
                timeLeft={jailStatus.remainingSeconds}
              />
              <StatusIndicator
                icon="🎯"
                isActive={crimeCooldown > 0}
                timeLeft={crimeCooldown}
              />
              <StatusIndicator
                icon="💪"
                isActive={gymCooldown > 0}
                timeLeft={gymCooldown}
              />
            </div>
          </div>

          {/* Row 4: Level, Money, Blackcoins */}
          <div className="flex items-center justify-between px-3 py-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-800/60 border border-zinc-600 rounded-lg px-2 py-1">
                <span className="text-yellow-400 text-xs">⭐</span>
                <span className="text-xs font-mono text-white">Lv.{stats.level}</span>
              </div>
              <div className="flex items-center gap-1 bg-zinc-800/60 border border-zinc-600 rounded-lg px-2 py-1">
                <span className="text-green-400 text-xs">💰</span>
                <span className="text-xs font-mono text-white">
                  {stats.money?.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-zinc-800/60 border border-zinc-600 rounded-lg px-2 py-1">
              <BlackcoinIcon />
              <span className="text-xs font-mono text-red-400">
                {stats.blackcoins?.toLocaleString() ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Single Row */}
        <div className="hidden lg:flex items-center justify-between px-6 py-2 gap-4">
          {/* Left Section: Search & Menu */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              className="p-2 rounded-lg bg-zinc-800/60 hover:bg-red-900/60 border border-zinc-600 hover:border-red-600 transition-all duration-200"
              onClick={() => navigate("/players")}
              aria-label="بحث اللاعبين"
            >
              <SearchIcon />
            </button>
            {menuButton}
          </div>

          {/* Center Section: Main Stats */}
          <div className="flex items-center gap-6 flex-1 justify-center">
            {/* Health */}
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-sm">❤️</span>
              <div className="w-24 bg-zinc-800 rounded-full h-2 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(healthPercent, 100)}%` }}
                />
              </div>
              <span className="text-sm font-mono text-white">
                {stats.hp}/{stats.maxHp}
              </span>
            </div>

            {/* Energy */}
            <div className="flex items-center gap-3">
              <span className="text-blue-400 text-sm">⚡</span>
              <div className="w-24 bg-zinc-800 rounded-full h-2 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${energyPercent}%` }}
                />
              </div>
              <span className="text-sm font-mono text-white">
                {stats.energy}/{stats.maxEnergy}
              </span>
            </div>

            {/* Experience */}
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-sm">⭐</span>
              <div className="w-24 bg-zinc-800 rounded-full h-2 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
              <span className="text-sm font-mono text-white">
                {stats.exp}/{stats.nextLevelExp}
              </span>
            </div>
          </div>

          {/* Right Section: Status, Level, Money, Blackcoins */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Status Indicators */}
            <div className="flex items-center gap-2">
              <StatusIndicator
                icon="🏥"
                isActive={hospitalStatus.inHospital}
                timeLeft={hospitalStatus.remainingSeconds}
              />
              <StatusIndicator
                icon="🔒"
                isActive={jailStatus.inJail}
                timeLeft={jailStatus.remainingSeconds}
              />
              <StatusIndicator
                icon="🎯"
                isActive={crimeCooldown > 0}
                timeLeft={crimeCooldown}
              />
              <StatusIndicator
                icon="💪"
                isActive={gymCooldown > 0}
                timeLeft={gymCooldown}
              />
            </div>

            {/* Level */}
            <div className="flex items-center gap-2 bg-zinc-800/60 border border-zinc-600 rounded-lg px-3 py-1">
              <span className="text-yellow-400 text-sm">⭐</span>
              <span className="text-sm font-mono text-white">Lv.{stats.level}</span>
            </div>

            {/* Money */}
            <div className="flex items-center gap-2 bg-zinc-800/60 border border-zinc-600 rounded-lg px-3 py-1">
              <span className="text-green-400 text-sm">💰</span>
              <span className="text-sm font-mono text-white">
                {stats.money?.toLocaleString()}
              </span>
            </div>

            {/* Blackcoins */}
            <div className="flex items-center gap-2 bg-zinc-800/60 border border-zinc-600 rounded-lg px-3 py-1">
              <BlackcoinIcon />
              <span className="text-sm font-mono text-red-400">
                {stats.blackcoins?.toLocaleString() ?? 0}
              </span>
            </div>

            {/* Notifications */}
            <NotificationIcon />
          </div>
        </div>
      </div>

      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={isModalVisible('levelUp')}
        onClose={async () => {
          hideModal('levelUp');
          try {
            await axios.post('/api/character/clear-level-up-rewards');
          } catch {
            // Failed to clear level-up rewards
          }
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
