/* ============================================================================
 *  src/features/gym/Gym.jsx – minimal MVP
 * ----------------------------------------------------------------------------
 *  • User enters how much energy to spend (1‑20, capped by current energy)
 *  • POST /api/api/gym/train  { energy }
 *  • Shows gained strength / defense; HUD auto‑updates via socket / refetch
 * ----------------------------------------------------------------------------*/
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useHud } from '@/hooks/useHud';
import { Dumbbell, Clock, Star, Shield, TrendingUp } from 'lucide-react';

function formatCooldown(sec) {
  const m = Math.floor((sec || 0) / 60);
  const s = (sec || 0) % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
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

  // Preview calculations
  const strengthPreview = (energy * 0.5).toFixed(2).replace(/\.00$/, '');
  const defensePreview = (energy * 0.25).toFixed(2).replace(/\.00$/, '');
  const expPreview = (energy * 2).toFixed(2).replace(/\.00$/, '');
  const cooldownPreview = energy * 5; // 5 seconds per energy (adjust if needed)

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
      toast.success(`💪 +${data.strengthGain} 🛡️ +${data.defenseGain} ⭐ +${data.expGain}`);
      qc.invalidateQueries(['hud']);
    },
    onError: (err) => {
      if (err.message.includes('wait before training')) {
        toast.error('يجب الانتظار قبل التمرين مرة أخرى!');
        setCooldownLeft(60); // fallback: 1 min
      } else {
        toast.error(err.message || 'Training failed');
      }
    },
  });

  if (!stats) return null;
  const maxSpend = stats.energy;

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      {/* Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-10 flex items-center justify-center bg-gradient-to-br from-accent-red/40 to-black/60 border-2 border-accent-red animate-fade-in">
        {/* Replace src with real gym image if available */}
        <img src="/placeholder-gym-banner.png" alt="Gym Banner" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative z-10 text-center">
          <Dumbbell className="w-16 h-16 mx-auto text-accent-red mb-2 animate-bounce" />
          <h1 className="text-4xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">النادي الرياضي</h1>
          <p className="text-hitman-300 text-lg">طور قوتك ودفاعك واكسب خبرة عبر التمارين المكثفة</p>
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
          <p className="text-hitman-300">كل نقطة طاقة تمنحك <span className="text-accent-yellow font-bold">0.5 قوة</span> و <span className="text-accent-blue font-bold">0.25 دفاع</span> و <span className="text-accent-green font-bold">2 خبرة</span>.</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-hitman-800/30 rounded-lg p-3 text-center">
            <Star className="w-6 h-6 text-accent-green mx-auto mb-1" />
            <div className="font-bold text-accent-green text-xl">{result ? `+${result.expGain}` : `+${expPreview}`}</div>
            <div className="text-xs text-hitman-400">الخبرة المكتسبة</div>
          </div>
          <div className="bg-hitman-800/30 rounded-lg p-3 text-center">
            <TrendingUp className="w-6 h-6 text-accent-yellow mx-auto mb-1" />
            <div className="font-bold text-accent-yellow text-xl">{result ? `+${result.strengthGain}` : `+${strengthPreview}`}</div>
            <div className="text-xs text-hitman-400">القوة المكتسبة</div>
          </div>
          <div className="bg-hitman-800/30 rounded-lg p-3 text-center">
            <Shield className="w-6 h-6 text-accent-blue mx-auto mb-1" />
            <div className="font-bold text-accent-blue text-xl">{result ? `+${result.defenseGain}` : `+${defensePreview}`}</div>
            <div className="text-xs text-hitman-400">الدفاع المكتسب</div>
          </div>
          <div className="bg-hitman-800/30 rounded-lg p-3 text-center">
            <Clock className="w-6 h-6 text-accent-red mx-auto mb-1" />
            <div className="font-bold text-accent-red text-xl">{cooldownLeft > 0 ? formatCooldown(cooldownLeft) : formatCooldown(cooldownPreview)}</div>
            <div className="text-xs text-hitman-400">حالة التبريد</div>
          </div>
        </div>
        <div className="text-center text-sm text-hitman-300 mt-8">
          طاقتك الحالية: <strong className="text-accent-red">{stats.energy}</strong>
        </div>
      </div>
    </div>
  );
}