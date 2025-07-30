/* ============================================================================
 *  src/features/gym/Gym.jsx – minimal MVP
 * ----------------------------------------------------------------------------
 *  • User enters how much energy to spend (1‑10, capped by current energy)
 *  • POST /api/jobs/gym/train  { energy }
 *  • Shows gained money / exp; HUD auto‑updates via socket / refetch
 * ----------------------------------------------------------------------------*/
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useHud } from '@/hooks/useHud';
import { useSocket } from '@/hooks/useSocket';
import { Dumbbell, Clock, Star, TrendingUp } from 'lucide-react';
import MoneyIcon from '@/components/MoneyIcon';

function formatCooldown(sec) {
  const m = Math.floor((sec || 0) / 60);
  const s = (sec || 0) % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Helper function to calculate exp needed for any level (exponential/linear system)
function calculateExpNeeded(level) {
  if (level <= 20) {
    // Steep exponential scaling for early game: 200 * 1.15^(level-1)
    return Math.floor(200 * Math.pow(1.15, level - 1));
  } else if (level <= 50) {
    // Moderate exponential scaling for mid game: baseExp * 1.12^(level-20)
    const baseExp = Math.floor(200 * Math.pow(1.15, 19)); // exp needed for level 20
    return Math.floor(baseExp * Math.pow(1.12, level - 20));
  } else if (level <= 80) {
    // Steep linear scaling for late game: baseExp + (level-50) * 15000
    const baseExp = Math.floor(200 * Math.pow(1.15, 19) * Math.pow(1.12, 30)); // exp needed for level 50
    return baseExp + (level - 50) * 15000;
  } else {
    // Very steep linear scaling for end game: baseExp + (level-80) * 25000
    const baseExp = Math.floor(200 * Math.pow(1.15, 19) * Math.pow(1.12, 30)) + (30 * 15000); // exp needed for level 80
    return baseExp + (level - 80) * 25000;
  }
}

export default function Gym() {
  const { stats } = useHud();
  const { socket } = useSocket();
  const [energy, setEnergy] = useState(1);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [result, setResult] = useState(null);
  const qc = useQueryClient();

  // Initialize cooldown from HUD data
  useEffect(() => {
    if (stats?.gymCooldown && stats.gymCooldown > 0) {
      setCooldownLeft(stats.gymCooldown);
    }
  }, [stats?.gymCooldown]);

  // Live countdown timer
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    
    const timer = setInterval(() => {
      setCooldownLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [cooldownLeft]);

  // Listen for HUD updates to sync cooldown
  useEffect(() => {
    if (!socket) return;
    
    const handleHudUpdate = () => {
      // The HUD data will be updated via the useHud hook
      // We just need to re-initialize the cooldown when stats change
      if (stats?.gymCooldown && stats.gymCooldown > 0) {
        setCooldownLeft(stats.gymCooldown);
      }
    };
    
    socket.on('hud:update', handleHudUpdate);
    
    // Also poll for updates every 10 seconds as a fallback
    const pollInterval = setInterval(() => {
      if (stats?.gymCooldown && stats.gymCooldown > 0) {
        setCooldownLeft(stats.gymCooldown);
      }
    }, 10000);
    
    return () => {
      socket.off('hud:update', handleHudUpdate);
      clearInterval(pollInterval);
    };
  }, [socket, stats?.gymCooldown]);

  // Preview calculations (match backend logic, including VIP)
  const safeLevel = result?.level ?? stats?.level ?? 1;
  const isVip = stats?.vipExpiresAt && new Date(stats.vipExpiresAt) > new Date();
  const maxEnergyPerSession = 20;
  
  // Money reward: Scalable like EXP
  // Base: $5 per energy
  // Level scaling: 1 + (level / 10) - so level 10 gets 2x, level 20 gets 3x
  const baseMoney = energy * 5 * (1 + safeLevel / 10);
  
  // Experience: Much more conservative to prevent level jumping
  // Base: 2 exp per energy (reduced from 3)
  // Level scaling: 1 + (level / 10) - so level 10 gets 2x, level 20 gets 3x
  const baseExp = energy * 2 * (1 + safeLevel / 10);
  
  // Additional level scaling: Diminishing returns (logarithmic scaling)
  // Formula: 1 + log10(level) * 0.1 (reduced from 0.2)
  const levelScaling = 1 + Math.log10(Math.max(1, safeLevel)) * 0.1;
  
  // Apply level scaling to both money and exp
  const levelMoney = Math.floor(baseMoney * levelScaling);
  const levelExp = Math.floor(baseExp * levelScaling);
  
  // VIP bonus: 50% bonus for money and exp
  const vipMoney = isVip ? Math.floor(levelMoney * 1.5) : levelMoney;
  const vipExp = isVip ? Math.floor(levelExp * 1.5) : levelExp;
  
  // Safety check: Limit exp gain to prevent level jumping
  // Calculate how much exp is needed for next level using the exponential/linear system
  const expNeededForNextLevel = calculateExpNeeded(safeLevel);
  const maxExpGain = Math.min(vipExp, Math.floor(expNeededForNextLevel * 0.3)); // Max 30% of next level's exp
  
  // For display - round money to whole numbers
  const moneyPreview = Math.round(vipMoney);
  const expPreview = maxExpGain;
  const cooldownPreview = energy * 10; // 10 seconds per energy (match backend)

  const train = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/jobs/gym`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
        body: JSON.stringify({ energy }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      setCooldownLeft(Math.floor((data.cooldown || 0)));
      toast.success(`+${data.moneyGain}$ مال ⭐ +${data.expGain} خبرة`);
      qc.invalidateQueries(['hud']);
    },
    onError: (err) => {
      if (err.message.includes('wait before training')) {
        toast.error('يجب الانتظار قبل التمرين مرة أخرى!');
        setCooldownLeft(60); // fallback: 1 min
      } else if (err.message.includes('Maximum')) {
        toast.error(err.message);
      } else {
        toast.error(err.message || 'Training failed');
      }
    },
  });

  if (!stats) return null;
  const maxSpend = Math.min(stats.energy, maxEnergyPerSession);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      {/* Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-10 flex items-center justify-center bg-gradient-to-br from-accent-red/40 to-black/60 border-2 border-accent-red animate-fade-in">
        {/* Replace src with real gym image if available */}
        <img src="/placeholder-gym-banner.png" alt="Gym Banner" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-10 text-center">
          <Dumbbell className="w-16 h-16 mx-auto text-accent-red mb-2 animate-bounce" />
          <h1 className="text-4xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">النادي الرياضي</h1>
          <p className="text-hitman-300 text-lg">اكسب المال والخبرة عبر التمارين المكثفة</p>
        </div>
      </div>

      {/* Cooldown Warning */}
      {cooldownLeft > 0 && (
        <div className="mb-8 animate-slide-up">
          <div className="bg-gradient-to-r from-accent-red/20 to-accent-orange/20 border border-accent-red/30 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-accent-red mr-3 animate-pulse" />
                <h3 className="text-xl font-bold text-accent-red">فترة هدوء مطلوبة</h3>
              </div>
              
              {/* Timer Display */}
              <div className="text-center mb-4">
                <div className="text-4xl font-mono text-accent-red mb-2 font-bold">
                  {formatCooldown(cooldownLeft)}
                </div>
                <p className="text-hitman-300 text-sm">الوقت المتبقي قبل التمرين التالي</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-hitman-300">تقدم فترة الهدوء</span>
                  <span className="text-accent-red font-bold">
                    {Math.round(((cooldownPreview - cooldownLeft) / cooldownPreview) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-hitman-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-accent-red to-red-600 h-3 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${Math.max(0, Math.min(100, ((cooldownPreview - cooldownLeft) / cooldownPreview) * 100))}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gym Form & Stats */}
      <div className="max-w-xl mx-auto bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-2xl p-8 shadow-lg animate-fade-in">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2 text-accent-red">ابدأ التمرين</h2>
          <p className="text-hitman-300">
            كل نقطة طاقة تمنحك <span className="text-accent-green font-bold">مال وخبرة تزدادان مع المستوى</span>.
            <br />
            <span className="text-accent-green">يشمل زيادة المستوى وVIP تلقائياً في الحساب</span>
            <br />
            <span className="text-accent-yellow">الحد الأقصى: {maxEnergyPerSession} طاقة لكل تمرين</span>
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-6">
          <label className="flex-1">
            <span className="block text-sm mb-1">كم طاقة تريد إنفاقها؟ (1‑{maxSpend})</span>
            <input
              type="number"
              min="1"
              max={maxSpend}
              value={energy}
              disabled={train.isLoading || cooldownLeft > 0}
              onChange={e => setEnergy(Math.max(1, Math.min(maxSpend, Number(e.target.value))))}
              className="w-full rounded border p-2 bg-zinc-900 border-zinc-700 text-white text-center text-lg font-bold"
            />
          </label>
          <button
            disabled={train.isLoading || cooldownLeft > 0}
            onClick={() => train.mutate()}
            className="w-full md:w-40 py-3 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white transform hover:scale-105 hover:shadow-lg disabled:opacity-60"
          >
            {train.isLoading ? 'جاري التمرين…' : 'ابدأ التمرين'}
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-hitman-800/30 rounded-lg p-3 text-center">
            <MoneyIcon className="w-6 h-6 mx-auto mb-1" />
            <div className="font-bold text-accent-green text-xl">+{result ? Math.round(result.moneyGain) : moneyPreview}$</div>
            <div className="text-xs text-hitman-400">المال المكتسب</div>
          </div>
          <div className="bg-hitman-800/30 rounded-lg p-3 text-center">
            <Star className="w-6 h-6 text-accent-blue mx-auto mb-1" />
            <div className="font-bold text-accent-blue text-xl">+{result ? result.expGain : expPreview}</div>
            <div className="text-xs text-hitman-400">الخبرة المكتسبة</div>
          </div>
          <div className="bg-hitman-800/30 rounded-lg p-3 text-center">
            <Clock className="w-6 h-6 text-accent-red mx-auto mb-1" />
            <div className="font-bold text-accent-red text-xl">{cooldownLeft > 0 ? formatCooldown(cooldownLeft) : formatCooldown(cooldownPreview)}</div>
            <div className="text-xs text-hitman-400">حالة التبريد</div>
          </div>
        </div>
        {/* Bonus breakdown rows */}
        <div className="text-center text-sm text-hitman-300 mt-8">
          <div>مجموع البونص من المستوى: <span className="text-accent-green font-bold">+{Math.round(levelMoney - baseMoney)}$</span> مال، <span className="text-accent-blue font-bold">+{Math.round(levelExp - baseExp)}</span> خبرة</div>
          {isVip && (
            <div>مجموع بونص VIP: <span className="text-accent-green font-bold">+{Math.round(vipMoney - levelMoney)}$</span> مال، <span className="text-accent-blue font-bold">+{Math.round(vipExp - levelExp)}</span> خبرة</div>
          )}
          <div className="mt-2">طاقتك الحالية: <strong className="text-accent-red">{stats.energy}</strong></div>
          <div className="text-xs text-accent-yellow mt-1">الخبرة المطلوبة للمستوى التالي: {expNeededForNextLevel}</div>
        </div>
      </div>
    </div>
  );
}