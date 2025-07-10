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
    <section className="bg-black text-white rounded shadow p-6 space-y-6 max-w-md mx-auto border border-zinc-800">
      <h2 className="text-2xl font-bold text-red-600">💰 البنك</h2>

      <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
        <p className="text-lg font-semibold">
          الرصيد الحالي:&nbsp;
          <span className="text-red-500">
            {balance !== null ? `${balance}$` : '...'}
          </span>
        </p>
      </div>

      <label className="block text-sm">
        المبلغ
        <input
          type="number"
          min="1"
          className="mt-1 w-full rounded border border-zinc-700 p-2 bg-zinc-900 text-white"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <div className="flex gap-2">
        <button
          onClick={() => tx('deposit')}
          className="flex-1 rounded bg-red-600 hover:bg-red-700 text-white py-2 font-bold"
        >
          إيداع
        </button>
        <button
          onClick={() => tx('withdraw')}
          className="flex-1 rounded bg-zinc-800 hover:bg-zinc-700 text-red-500 border border-red-600 py-2 font-bold"
        >
          سحب
        </button>
      </div>
    </section>
  );
}
