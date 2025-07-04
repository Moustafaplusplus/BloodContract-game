// frontend/src/pages/CrimesList.jsx
import { useEffect, useState } from 'react';

export default function CrimesList() {
  const [crimes, setCrimes]   = useState([]);
  const [cooldowns, setCD]    = useState({});
  const [msg, setMsg]         = useState('');

  const token = localStorage.getItem('token');
  const api   = `${import.meta.env.VITE_API_URL}/api/crimes`;

  /* ── fetch crimes once ─────────────────────────── */
  useEffect(() => {
    fetch(api, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setCrimes)
      .catch(() => setMsg('⚠️ فشل تحميل الجرائم'));
  }, [api, token]);

  /* ── 1-second tick for cooldown labels only ─────── */
  useEffect(() => {
    const id = setInterval(() => setCD((c) => ({ ...c })), 1_000);
    return () => clearInterval(id);
  }, []);

  /* helpers */
  const cdLeft = (crimeId) => {
    if (!cooldowns[crimeId]) return 0;
    return Math.max(
      0,
      60 - Math.floor((Date.now() - cooldowns[crimeId]) / 1000),
    );
  };

  const execute = async (crimeId) => {
    const res = await fetch(`${api}/execute/${crimeId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setMsg('❌ فشل التنفيذ أو مهلة التبريد');
      return;
    }

    const data = await res.json();
    setMsg(
      data.success
        ? `✅ غنيمة: ${data.payout} 💵`
        : '🚔 فشلت! قد تكون في السجن أو المستشفى',
    );
    setCD((c) => ({ ...c, [crimeId]: Date.now() }));
  };

  /* ── UI ────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">🧨 قائمة الجرائم</h1>

      {msg && <p className="text-green-400">{msg}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {crimes.map((c) => {
          /* one-time success%: use backend field or deterministic clamp */
          const rawPct   = (c.successRate ?? 0.6) * 100;
          const successPct = Math.min(90, Math.max(15, Math.round(rawPct)));

          const cd = cdLeft(c.id);

          return (
            <div
              key={c.id}
              className="bg-gray-800 p-4 rounded shadow flex flex-col gap-2"
            >
              <h2 className="text-lg font-semibold">{c.name ?? c.title}</h2>

              <div className="text-sm text-gray-300 space-y-0.5">
                <p>🔒 المستوى المطلوب: {c.req_level ?? 1}</p>
                <p>🧠 Intel مطلوب: {c.req_intel ?? 1}</p>
                <p>⚔️ شجاعة: –{c.energyCost ?? c.courage_cost}</p>
                <p>💵 عائد أساسي: {c.minReward ?? c.base_payout}</p>
              </div>

              {/* fixed success bar */}
              <div className="w-full bg-gray-700 rounded h-2">
                <div
                  className="h-2 bg-emerald-500 rounded"
                  style={{ width: `${successPct}%` }}
                />
              </div>

              <button
                onClick={() => execute(c.id)}
                disabled={cd > 0}
                className="mt-2 bg-red-600 hover:bg-red-500 rounded px-4 py-2 disabled:opacity-40"
              >
                {cd > 0 ? `⏳ ${cd}s` : '🚨 تنفيذ'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
