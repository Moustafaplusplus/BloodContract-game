
import { useState, useEffect } from 'react';
import { fetchLeaderboard } from '../api/leaderboardApi';

const METRICS = [
  { key: 'money', label: 'Richest' },
  { key: 'level', label: 'Highest Level' },
  { key: 'wins',  label: 'Most Wins' },
];

export default function Leaderboards() {
  const [metric, setMetric] = useState('money');
  const [rows, setRows]   = useState([]);

  useEffect(() => {
    fetchLeaderboard(metric).then(setRows);
  }, [metric]);

  const you = Number(localStorage.getItem('characterId'));

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Leaderboards</h1>
      <select value={metric} onChange={e => setMetric(e.target.value)} className="select select-bordered mb-4">
        {METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
      </select>
      <table className="table w-full">
        <thead><tr><th>#</th><th>Player</th><th>{metric}</th></tr></thead>
        <tbody>
        {rows.map((r, idx) => (
          <tr key={r.id} className={r.id === you ? 'bg-amber-300' : ''}>
            <td>{idx + 1}</td>
            <td>{r.user?.username || 'Unknown'}</td>
            <td>{r[metric]}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}
