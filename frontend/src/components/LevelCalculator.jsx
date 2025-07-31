import React, { useState } from 'react';
import { Calculator, X } from 'lucide-react';

const LevelCalculator = ({ isOpen, onClose }) => {
  const [level, setLevel] = useState(1);

  // Calculate default stats based on level
  const calculateStats = (level) => {
    // HP: 1000 + ((level - 1) * 100)
    const maxHp = 1000 + ((level - 1) * 100);
    
    // Strength: starts at 10, +2 per level, +10 every 5 levels
    let strength = 10 + ((level - 1) * 2);
    strength += Math.floor((level - 1) / 5) * 10;
    
    // Defense: starts at 5, +1 per level, +5 every 5 levels
    let defense = 5 + ((level - 1) * 1);
    defense += Math.floor((level - 1) / 5) * 5;
    
    // Fame: (level * 100) + (strength * 20) + (maxHp * 8) + (defense * 20)
    const fame = (level * 100) + (strength * 20) + (maxHp * 8) + (defense * 20);
    
    // Exp needed calculation (simplified version of backend logic)
    let expNeeded;
    if (level <= 20) {
      expNeeded = Math.floor(200 * Math.pow(1.15, level - 1));
    } else if (level <= 50) {
      const baseExp = Math.floor(200 * Math.pow(1.15, 19));
      expNeeded = Math.floor(baseExp * Math.pow(1.12, level - 20));
    } else if (level <= 80) {
      const baseExp = Math.floor(200 * Math.pow(1.15, 19) * Math.pow(1.12, 30));
      expNeeded = baseExp + (level - 50) * 15000;
    } else {
      const baseExp = Math.floor(200 * Math.pow(1.15, 19) * Math.pow(1.12, 30)) + (30 * 15000);
      expNeeded = baseExp + (level - 80) * 25000;
    }
    
    return {
      maxHp,
      strength,
      defense,
      fame: Math.round(fame),
      expNeeded
    };
  };

  const stats = calculateStats(level);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-hitman-800 border border-accent-red rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent-red" />
            <h3 className="text-lg font-bouya text-white">حاسبة المستوى</h3>
          </div>
          <button
            onClick={onClose}
            className="text-hitman-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-hitman-300 mb-2">
              مستوى اللاعب
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={level}
              onChange={(e) => setLevel(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-full bg-hitman-700 border border-hitman-600 rounded-md px-3 py-2 text-white focus:border-accent-red focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-hitman-700 rounded-md p-3">
              <div className="text-sm text-hitman-300 mb-1">الدم الأقصى</div>
              <div className="text-lg font-bold text-red-400">{stats.maxHp.toLocaleString()}</div>
            </div>
            
            <div className="bg-hitman-700 rounded-md p-3">
              <div className="text-sm text-hitman-300 mb-1">القوة</div>
              <div className="text-lg font-bold text-orange-400">{stats.strength}</div>
            </div>
            
            <div className="bg-hitman-700 rounded-md p-3">
              <div className="text-sm text-hitman-300 mb-1">الدفاع</div>
              <div className="text-lg font-bold text-blue-400">{stats.defense}</div>
            </div>
            
            <div className="bg-hitman-700 rounded-md p-3">
              <div className="text-sm text-hitman-300 mb-1">الشهرة</div>
              <div className="text-lg font-bold text-yellow-400">{stats.fame.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-hitman-700 rounded-md p-3">
            <div className="text-sm text-hitman-300 mb-1">الخبرة المطلوبة للترقية</div>
            <div className="text-lg font-bold text-green-400">{stats.expNeeded.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelCalculator; 