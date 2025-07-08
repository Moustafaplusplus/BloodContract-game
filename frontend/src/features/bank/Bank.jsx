/* ========================================================================
 *  Bank.jsx – synced with new backend (balance + money)
 * =======================================================================*/
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { toast }               from 'react-hot-toast';
import { useAuth }             from '@/hooks/useAuth';
import { useHud }              from '@/hooks/useHud';

const API = import.meta.env.VITE_API_URL;

export default function Bank() {
  const { token } = useAuth();
  const { invalidateHud } = useHud();     // ← tell HUD to refetch after tx
  const navigate = useNavigate();

  const [balance, setBalance] = useState(null);
  const [amount,  setAmount]  = useState('');

  /* ───── initial fetch ───── */
  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    fetch(`${API}/api/bank`, {
      headers: { Authorization: `Bearer ${token}` },
      cache:   'no-store',
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(({ balance }) => setBalance(balance))
      .catch(() => toast.error('فشل جلب الرصيد'));
  }, [token, navigate]);

  /* ───── tx handler ───── */
  const tx = async (type) => {
    const amt = Number(amount);
    if (!amt || amt <= 0) { toast.error('أدخل قيمة صحيحة'); return; }

    try {
      const res = await fetch(`${API}/api/bank/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amt }),
      });
      if (!res.ok) throw new Error(await res.text());

      const { balance } = await res.json();   // money handled via HUD
      setBalance(balance);
      setAmount('');
      invalidateHud?.();                      // trigger HUD refresh
      toast.success( type === 'deposit'
        ? `تم إيداع ${amt}$`
        : `تم سحب ${amt}$`
      );
    } catch (err) {
      toast.error(err.message || 'فشل العملية');
    }
  };

  /* ───── UI ───── */
  return (
    <section className="bg-slate-900 text-white rounded shadow p-6 space-y-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">💰 البنك</h2>

      <div className="bg-slate-800 border border-slate-700 rounded p-4">
        <p className="text-lg font-semibold">
          الرصيد الحالي:&nbsp;
          <span className="text-emerald-400">
            {balance !== null ? `${balance}$` : '...'}
          </span>
        </p>
      </div>

      <label className="block text-sm">
        المبلغ
        <input
          type="number"
          min="1"
          className="mt-1 w-full rounded border border-slate-600 p-2 bg-slate-700 text-white"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <div className="flex gap-2">
        <button
          onClick={() => tx('deposit')}
          className="flex-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white py-2"
        >
          إيداع
        </button>
        <button
          onClick={() => tx('withdraw')}
          className="flex-1 rounded bg-rose-500 hover:bg-rose-600 text-white py-2"
        >
          سحب
        </button>
      </div>
    </section>
  );
}
