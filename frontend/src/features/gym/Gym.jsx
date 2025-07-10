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

export default function Gym() {
  const { hud } = useHud();
  const [energy, setEnergy] = useState(1);
  const qc = useQueryClient();

  const train = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gym/train`, {
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
      toast.success(`💪 +${data.gained.strength}  🛡️ +${data.gained.defense}`);
      qc.invalidateQueries(['hud']); // refresh HUD cache
    },
    onError: (err) => toast.error(err.message || 'Training failed'),
  });

  if (!hud) return null;
  const maxSpend = Math.min(20, hud.energy);

  return (
    <section className="max-w-md mx-auto space-y-6 bg-black min-h-screen text-white p-4">
      <h1 className="text-2xl font-bold text-center text-red-600">🏋️‍♂️ النادي الرياضي</h1>
      <p className="text-sm text-gray-200">
        كل نقطة طاقة تمنحك زيادة تقريبية <strong className="text-red-500">0.2‑5</strong> قوة و نصفها دفاع.
      </p>
      <label className="block space-y-1">
        <span className="text-sm">كم طاقة تريد إنفاقها؟ (1‑{maxSpend})</span>
        <input
          type="number"
          min="1"
          max={maxSpend}
          value={energy}
          onChange={(e) => setEnergy(Math.max(1, Math.min(maxSpend, Number(e.target.value))))}
          className="w-full rounded border p-2 bg-zinc-900 border-zinc-700 text-white"
        />
      </label>
      <button
        disabled={train.isLoading}
        onClick={() => train.mutate()}
        className="w-full py-2 rounded bg-red-600 text-white hover:bg-red-700 font-bold disabled:opacity-60"
      >
        {train.isLoading ? 'جاري التمرين…' : 'ابدأ التمرين'}
      </button>
      <div className="text-center text-sm text-gray-400">
        طاقتك الحالية: <strong className="text-red-500">{hud.energy}</strong>
      </div>
    </section>
  );
}