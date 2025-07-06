// ─────────────────────────────────────────────────────────────
// ── frontend/src/pages/Jail.jsx
import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Jail() {
  const [state, setState] = useState(null);

  useEffect(() => {
    let timer;
    async function fetchStatus() {
      try {
        const data = await api.get('/jail');
        setState(data);
        if (data.inJail) timer = setTimeout(fetchStatus, 1000);
      } catch (_) {}
    }
    fetchStatus();
    return () => clearTimeout(timer);
  }, []);

  if (!state) return null;
  if (!state.inJail) return <div className="p-4">You are free.</div>;

  const m = Math.floor(state.remainingSeconds / 60);
  const s = (state.remainingSeconds % 60).toString().padStart(2, '0');

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto text-center">
      <h1 className="text-xl font-bold">You are in Jail</h1>
      <p>Time left: {m}:{s}</p>
      <button
        className="btn btn-primary"
        onClick={async () => {
          await api.post('/jail/bail');
          const fresh = await api.get('/jail');
          setState(fresh);
        }}
      >
        Pay ${state.cost} to bail out
      </button>
    </div>
  );
}