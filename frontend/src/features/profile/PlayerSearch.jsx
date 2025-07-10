import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function PlayerSearch() {
  const [players, setPlayers] = useState([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('level');
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = { sort, ...filters, limit: 50 };
    if (query.trim().length >= 2) {
      params.query = query;
    }
    setLoading(true);
    axios.get('/api/v1/search/users', { params })
      .then(res => setPlayers(res.data))
      .finally(() => setLoading(false));
  }, [query, sort, filters]);

  return (
    <section className="bg-black min-h-screen text-white p-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">🔍 بحث اللاعبين</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          className="bg-zinc-800 text-white rounded px-3 py-2"
          placeholder="ابحث بالاسم أو اللقب..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select
          className="bg-zinc-800 text-white rounded px-3 py-2"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="level">المستوى</option>
          <option value="killCount">عدد القتل</option>
          <option value="daysInGame">الأيام في اللعبة</option>
          <option value="lastActive">آخر نشاط</option>
        </select>
        {/* Add more filters as needed */}
      </div>
      {loading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map(player => (
            <Link
              to={`/profile/${player.username}`}
              key={player.id}
              className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-center gap-4 hover:bg-zinc-800 transition"
            >
              <img
                src={player.character?.avatarUrl || '/default-avatar.png'}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-red-600"
              />
              <div>
                <div className="text-lg font-bold text-red-400">{player.character?.name}</div>
                <div className="text-sm text-gray-300">{player.username}</div>
                <div className="text-xs text-gray-400">{player.character?.title}</div>
                <div className="text-xs text-gray-400">المستوى: {player.character?.level}</div>
                <div className="text-xs text-gray-400">عدد القتل: {player.character?.killCount}</div>
                <div className="text-xs text-gray-400">الأيام: {player.character?.daysInGame}</div>
                <div className="text-xs text-gray-400">{player.character?.gang?.name && `العصابة: ${player.character.gang.name}`}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
} 