// ─────────────────────────────────────────────────────────────
// ── frontend/src/pages/Hospital.jsx
import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Hospital() {
  const [state, setState] = useState(null);

  useEffect(() => {
    let timer;
    async function fetchStatus() {
      try {
        const data = await api.get('/hospital');
        setState(data);
        if (data.inHospital) timer = setTimeout(fetchStatus, 1000);
      } catch (_) {}
    }
    fetchStatus();
    return () => clearTimeout(timer);
  }, []);

  if (!state) return null;
  if (!state.inHospital) return <div className="p-4">You are healthy.</div>;

  const m = Math.floor(state.remainingSeconds / 60);
  const s = (state.remainingSeconds % 60).toString().padStart(2, '0');

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto text-center">
      <h1 className="text-xl font-bold">In Hospital</h1>
      <p>Time left: {m}:{s}</p>
      <button
        className="btn btn-primary"
        onClick={async () => {
          await api.post('/hospital/heal');
          const fresh = await api.get('/hospital');
          setState(fresh);
        }}
      >
        Pay ${state.cost} to heal
      </button>
    </div>
  );
}