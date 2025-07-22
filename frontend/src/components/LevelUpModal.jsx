import React from 'react';
import { X, TrendingUp, Zap, Heart, Shield, Star } from 'lucide-react';

const LevelUpModal = ({ isOpen, onClose, levelUpRewards, levelsGained }) => {
  if (!isOpen || !levelUpRewards || levelUpRewards.length === 0) {
    return null;
  }

  // Calculate total rewards across all levels
  const totalRewards = levelUpRewards.reduce((total, reward) => ({
    maxEnergy: total.maxEnergy + reward.maxEnergy,
    maxHp: total.maxHp + reward.maxHp,
    strength: total.strength + reward.strength,
    defense: total.defense + reward.defense,
    milestoneBonuses: total.milestoneBonuses + (reward.milestoneBonus ? 1 : 0)
  }), {
    maxEnergy: 0,
    maxHp: 0,
    strength: 0,
    defense: 0,
    milestoneBonuses: 0
  });

  const isMultipleLevels = levelsGained > 1;
  const hasMilestoneBonus = totalRewards.milestoneBonuses > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-hitman-900 to-black border-2 border-accent-red/30 rounded-2xl shadow-2xl max-w-lg w-full mx-auto p-8 text-white animate-fade-in">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent-red to-red-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red">
            {isMultipleLevels ? `مستوى جديد! +${levelsGained}` : 'مستوى جديد!'}
          </h2>

          {/* Subtitle */}
          <p className="text-hitman-300 text-lg mb-6">
            {isMultipleLevels 
              ? `لقد ارتقيت ${levelsGained} مستويات!` 
              : `لقد وصلت إلى المستوى ${levelUpRewards[0].level}!`
            }
          </p>

          {/* Divider */}
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto mb-6" />

          {/* Rewards Section */}
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-bold text-accent-red mb-4">المكافآت المكتسبة:</h3>
            
            {/* Total Rewards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Max Energy */}
              <div className="bg-hitman-800/50 border border-hitman-700 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-accent-yellow mr-2" />
                  <span className="text-lg font-bold text-accent-yellow">+{totalRewards.maxEnergy}</span>
                </div>
                <span className="text-sm text-hitman-300">الطاقة القصوى</span>
              </div>

              {/* Max HP */}
              <div className="bg-hitman-800/50 border border-hitman-700 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="w-6 h-6 text-accent-green mr-2" />
                  <span className="text-lg font-bold text-accent-green">+{totalRewards.maxHp}</span>
                </div>
                <span className="text-sm text-hitman-300">الصحة القصوى</span>
              </div>

              {/* Strength */}
              <div className="bg-hitman-800/50 border border-hitman-700 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-accent-red mr-2" />
                  <span className="text-lg font-bold text-accent-red">+{totalRewards.strength}</span>
                </div>
                <span className="text-sm text-hitman-300">القوة</span>
              </div>

              {/* Defense */}
              <div className="bg-hitman-800/50 border border-hitman-700 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="w-6 h-6 text-accent-blue mr-2" />
                  <span className="text-lg font-bold text-accent-blue">+{totalRewards.defense}</span>
                </div>
                <span className="text-sm text-hitman-300">الدفاع</span>
              </div>
            </div>

            {/* Milestone Bonus */}
            {hasMilestoneBonus && (
              <div className="bg-gradient-to-r from-accent-red/20 to-red-600/20 border border-accent-red/50 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-6 h-6 text-accent-red mr-2 animate-pulse" />
                  <span className="text-lg font-bold text-accent-red">مكافأة إضافية!</span>
                </div>
                <span className="text-sm text-hitman-300">
                  {totalRewards.milestoneBonuses === 1 
                    ? 'مكافأة خاصة للمستوى الخامس!'
                    : `مكافآت خاصة لـ ${totalRewards.milestoneBonuses} مستويات خامسة!`
                  }
                </span>
              </div>
            )}
          </div>

          {/* Level Details (if multiple levels) */}
          {isMultipleLevels && (
            <div className="mb-6">
              <h4 className="text-lg font-bold text-accent-red mb-3">تفاصيل المستويات:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {levelUpRewards.map((reward, index) => (
                  <div key={index} className="bg-hitman-800/30 border border-hitman-700 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-accent-red font-bold">المستوى {reward.level}</span>
                      <div className="flex gap-3 text-xs">
                        <span className="text-accent-yellow">⚡+{reward.maxEnergy}</span>
                        <span className="text-accent-green">❤️+{reward.maxHp}</span>
                        <span className="text-accent-red">⚔️+{reward.strength}</span>
                        <span className="text-accent-blue">🛡️+{reward.defense}</span>
                        {reward.milestoneBonus && <span className="text-accent-red">⭐</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Button */}
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            رائع!
          </button>
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal; 