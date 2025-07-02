// frontend/src/pages/Players.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const res = await axios.get('http://localhost:5000/api/users'); // full URL to avoid proxy issues
        setPlayers(res.data);
      } catch (err) {
        console.error('Failed to load players', err);
        setError('فشل تحميل قائمة اللاعبين');
      }
    }
    fetchPlayers();
  }, []);

return (
  <div className="p-6 min-h-screen bg-gray-950 text-white space-y-6">
    <h1 className="text-2xl font-bold text-red-500">🎯 تحدى لاعبين آخرين</h1>

    {error && <p className="text-red-400">{error}</p>}

    {players.length === 0 ? (
      <p className="text-gray-400">لا يوجد لاعبين متاحين حالياً.</p>
    ) : (
      <div className="grid gap-4 md:grid-cols-2">
        {players.map(player => (
          <div key={player.id} className="bg-gray-800 p-4 rounded-xl flex items-center justify-between hover:bg-gray-700 transition">
            <div className="text-right">
              <p className="text-lg font-semibold">{player.username}</p>
              <p className="text-sm text-gray-400">القوة: {player.stats?.strength}</p>
            </div>
            <Link
              to={`/fight/${player.id}`}
              className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-1.5 rounded-md transition"
            >
              تحدي
            </Link>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
