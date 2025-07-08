/* ========================================================================
 *  InterestHistory.jsx
 *  Shows the last 30 interest-credit entries for the current user
 *  Needs:  GET /api/bank/history   (JWT protected)  → [{ id, amount, createdAt }]
 * =======================================================================*/
import { useEffect, useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import { toast }               from 'react-hot-toast';
import { useAuth }             from '@/hooks/useAuth';

const API = import.meta.env.VITE_API_URL;

export default function InterestHistory() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  const [rows, setRows] = useState(null);   // null = loading

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    fetch(`${API}/api/bank/history`, {
      headers: { Authorization: `Bearer ${token}` },
      cache:   'no-store',
    })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((data) =>
        setRows(
          (Array.isArray(data) ? data : []).slice(0, 30) // last 30 entries
        )
      )
      .catch(() => toast.error('تعذر تحميل سجل الفوائد'));
  }, [token, navigate]);

  /* ─── UI ─── */
  if (rows === null) {
    return (
      <div className="p-6 text-slate-400 animate-pulse">
        جارٍ تحميل سجل الفوائد…
      </div>
    );
  }

  return (
    <section className="max-w-lg mx-auto bg-slate-900 text-white p-6 rounded shadow space-y-4">
      <h2 className="text-2xl font-bold">📈 سجل الفوائد</h2>

      {rows.length === 0 ? (
        <p className="text-slate-400">لا توجد فوائد مسجلة بعد.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-slate-700">
              <th className="py-2">التاريخ</th>
              <th className="py-2 text-right">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ id, amount, createdAt }) => (
              <tr key={id} className="border-b border-slate-800">
                <td className="py-2">
                  {new Date(createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="py-2 text-right text-emerald-400">+{amount}$</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
