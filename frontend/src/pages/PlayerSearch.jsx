// 📁 frontend/src/pages/PlayerSearch.jsx
import React, { useCallback, useEffect, useState } from 'react';
import api from '../utils/api';
import debounce from 'lodash.debounce';

export default function PlayerSearch() {
  const [q, setQ] = useState('');
  const [players, setPlayers] = useState([]);
  const [err, setErr] = useState('');

  const search = useCallback(debounce(term => {
    if (!term) return setPlayers([]);
    api.get(`/search/players?q=${encodeURIComponent(term)}`)
      .then(r => { setPlayers(r.data); setErr(''); })
      .catch(e => {
        if (e.response?.status === 429) setErr('Too many requests—slow down!');
      });
  }, 300), []);

  useEffect(() => { search(q); }, [q, search]);

  return (
    <div className="p-4">
      <input className="input input-bordered w-full" placeholder="Search players…"
             value={q} onChange={e => setQ(e.target.value)} />
      {err && <p className="text-red-600 mt-1">{err}</p>}
      <ul className="mt-4 space-y-2">
        {players.map(p => (
          <li key={p._id} className="p-2 bg-base-200 rounded">
            <a href={`/messenger/${p._id}`}>{p.username} • lvl {p.level}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}