/* ============================================================================
 *  src/features/gym/Gym.jsx – minimal MVP
 * ----------------------------------------------------------------------------
 *  • User enters how much energy to spend (1‑10, capped by current energy)
 *  • POST /api/jobs/gym/train  { energy }
 *  • Shows gained money / exp; HUD auto‑updates via socket / refetch
 * ----------------------------------------------------------------------------*/
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useHud } from '@/hooks/useHud';
import { Dumbbell, Clock, Star, DollarSign, TrendingUp } from 'lucide-react';

function formatCooldown(sec) {
  const m = Math.floor((sec || 0) / 60);
  const s = (sec || 0) % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Helper function to calculate exp needed for any level (exponential/linear system)
function calculateExpNeeded(level) {
  if (level <= 50) {
    // Exponential scaling up to level 50: 100 * 1.1^(level-1)
    return Math.floor(100 * Math.pow(1.1, level - 1));
  } else {
    // Linear scaling after level 50: base + (level - 50) * increment
    const baseExp = Math.floor(100 * Math.pow(1.1, 49)); // exp needed for level 50
    const increment = 5000; // 5000 exp per level after 50
    return baseExp + (level - 50) * increment;
  }
}

export default function Gym() {
  const { stats } = useHud();
  const [energy, setEnergy] = useState(1);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [result, setResult] = useState(null);
  const qc = useQueryClient();

  // Cooldown timer
  useState(() => {
    if (cooldownLeft <= 0) return;
    const t = setInterval(() => {
      setCooldownLeft((sec) => (sec > 1 ? sec - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownLeft]);

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
  
  // For display
  const moneyPreview = vipMoney;
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
      setCooldownLeft(Math.ceil((data.cooldown || 0)));
      toast.success(`💰 +${data.moneyGain}$ ⭐ +${data.expGain} exp`);
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
            <div className="flex items-center justify-center">
              <Clock className="w-6 h-6 text-accent-red mr-3" />
              <div className="text-center">
                <p className="text-white font-semibold text-lg">فترة هدوء مطلوبة</p>
                <p className="text-accent-red font-mono text-xl">{formatCooldown(cooldownLeft)}</p>
                <p className="text-hitman-300 text-sm">يجب الانتظار قبل التمرين التالي</p>
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
            <DollarSign className="w-6 h-6 text-accent-green mx-auto mb-1" />
            <div className="font-bold text-accent-green text-xl">+{result ? result.moneyGain : moneyPreview}$</div>
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
          <div>مجموع البونص من المستوى: <span className="text-accent-green font-bold">+{levelMoney - baseMoney}$</span> مال، <span className="text-accent-blue font-bold">+{levelExp - baseExp}</span> خبرة</div>
          {isVip && (
            <div>مجموع بونص VIP: <span className="text-accent-green font-bold">+{vipMoney - levelMoney}$</span> مال، <span className="text-accent-blue font-bold">+{vipExp - levelExp}</span> خبرة</div>
          )}
          <div className="mt-2">طاقتك الحالية: <strong className="text-accent-red">{stats.energy}</strong></div>
          <div className="text-xs text-accent-yellow mt-1">الخبرة المطلوبة للمستوى التالي: {expNeededForNextLevel}</div>
        </div>
      </div>
    </div>
  );
}