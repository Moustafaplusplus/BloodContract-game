// src/components/HUD/index.jsx
import React from "react";
import { useHud } from "@/hooks/useHud";

export default function HUD({ menuButton }) {
  const { stats, loading } = useHud();

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
    <div className="fixed top-0 left-0 right-0 bg-black/95 text-white py-2 px-4 flex flex-row items-center justify-between text-xs z-50 backdrop-blur-sm border-b border-red-900 gap-4">
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
      {/* Level & Money Column */}
      <div className="flex flex-row items-center gap-4 flex-shrink-0">
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
      </div>
      {/* Menu Button Slot */}
      <div className="flex-shrink-0">{menuButton}</div>
    </div>
  );
}
