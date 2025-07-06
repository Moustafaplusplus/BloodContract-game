import { useEffect, useState } from "react";
import api from "../lib/api";

function formatSecs(sec) {
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function CrimeCard({ crime, cooldown, onCooldown }) {
  const id = crime.id;
  const cost = crime.energyCost;
  const pct = crime.chance ?? 0;
  const bar = pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-600";

  const handle = async () => {
    try {
      const result = await api.post(`/crimes/execute/${id}`);
      alert(result.success ? `تمت بنجاح! +$${result.payout}` : "فشلت العملية!");
      if (result.cooldownLeft) {
        onCooldown(id, result.cooldownLeft);
      }
      if (result.redirect) {
        window.location.href = result.redirect;
      }
    } catch (e) {
      const errPayload = typeof e === 'object' ? e : {};
      const remaining = errPayload.cooldownLeft;
      if (remaining) {
        onCooldown(id, remaining);
      } else {
        alert(errPayload.error || "خطأ");
      }
    }
  };

  return (
    <article className="bg-neutral-900 rounded-2xl p-5 shadow-lg shadow-black/40">
      <header className="flex justify-between mb-2">
        <h2 className="font-semibold text-gray-100 truncate" title={crime.name}>
          {crime.name}
        </h2>
        <span className="text-xs text-gray-400">المستوى ≥ {crime.req_level}</span>
      </header>

      <div className="mb-3">
        <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
          <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-xs text-gray-400">نسبة النجاح {pct}%</p>
      </div>

      <ul className="text-xs text-gray-400 space-y-1 mb-4">
        <li>⚡ التكلفة <span className="text-gray-200">{cost}</span></li>
        <li>⏱️ الانتظار <span className="text-gray-200">{formatSecs(crime.cooldown)}</span></li>
        <li>💰 المكافأة <span className="text-gray-200">${crime.minReward}–{crime.maxReward}</span></li>
      </ul>

      <button
        className="w-full py-2 rounded-xl bg-yellow-600 hover:bg-yellow-500 disabled:bg-neutral-700 disabled:text-gray-500"
        disabled={cooldown > 0}
        onClick={handle}
      >
        {cooldown > 0 ? `انتظار ${formatSecs(cooldown)}` : "جريمة"}
      </button>
    </article>
  );
}

export default function CrimesList() {
  const [list, setList] = useState([]);
  const [cd, setCd] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const crimes = await api.get("/crimes");
        setList(Array.isArray(crimes) ? crimes : []);
      } catch (e) {
        const errPayload = typeof e === 'object' ? e : {};
        setError(errPayload.error || "تعذّر تحميل الجرائم");
      }
    })();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCd(prev => {
        const next = { ...prev };
        for (const k in next) next[k] = Math.max(0, next[k] - 1);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const setCooldown = (id, secs) => setCd(prev => ({ ...prev, [id]: secs }));

  return (
    <div className="min-h-screen bg-black/95 text-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">الجرائم</h1>

        {error && <p className="text-center text-red-500 mb-4">{error}</p>}

        {!error && list.length === 0 && (
          <p className="text-center text-gray-400">لا توجد جرائم متاحة لمستواك.</p>
        )}

        {list.length > 0 && (
          <div className="grid gap-6">
            {list.map(c => (
              <CrimeCard
                key={c.id}
                crime={c}
                cooldown={cd[c.id] ?? 0}
                onCooldown={setCooldown}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
