// ─────────────────────────  Page: Gold Market  ────────────────
// File: frontend/src/pages/GoldMarket.jsx
// -------------------------------------------------------------
import { useState } from 'react';
import { buyGold, buyVip } from '../api/marketApi.js';

export default function GoldMarket() {
  const [usd, setUsd] = useState('');
  const [tier, setTier] = useState('silver');
  const [loading, setLoading] = useState(false);

  async function handleGold(e) {
    e.preventDefault(); if (!usd) return;
    setLoading(true);
    try {
      const res = await buyGold(Number(usd));
      alert(`Purchased ${res.goldGranted} gold`);
      setUsd('');
    } catch (e) {
      alert(e.message);
    } finally { setLoading(false); }
  }

  async function handleVip(e) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await buyVip(tier);
      alert(res.message);
    } catch (e) {
      alert(e.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Gold Market</h1>

      <form onSubmit={handleGold} className="space-y-2">
        <label className="block font-semibold">Buy Gold (USD)</label>
        <input type="number" value={usd} onChange={e => setUsd(e.target.value)}
          className="input input-bordered w-full" placeholder="10" min="1" required />
        <button type="submit" className="btn btn-success w-full" disabled={loading}>
          {loading ? 'Processing…' : 'Buy Gold'}
        </button>
      </form>

      <form onSubmit={handleVip} className="space-y-2">
        <label className="block font-semibold">Buy VIP Perks</label>
        <select value={tier} onChange={e => setTier(e.target.value)} className="select select-bordered w-full">
          <option value="silver">Silver – 500 Gold</option>
          <option value="gold">Gold – 1000 Gold</option>
          <option value="platinum">Platinum – 2000 Gold</option>
        </select>
        <button type="submit" className="btn btn-warning w-full" disabled={loading}>
          {loading ? 'Processing…' : 'Activate VIP'}
        </button>
      </form>
    </div>
  );
}
