import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { extractErrorMessage } from "@/utils/errorHandler";
import './vipSparkle.css';
import VipName from './VipName.jsx';

function SparkleText({ children }) {
  return (
    <span className="vip-sparkle-text relative inline-block">
      {children}
      <span className="vip-sparkle-anim" aria-hidden="true"></span>
    </span>
  );
}

export default function PlayerSearch() {
  const [players, setPlayers] = useState([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('level');
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const getAvatarUrl = (url) => url?.startsWith('http') ? url : url ? backendUrl + url : '/default-avatar.png';

  useEffect(() => {
    const params = { sort, ...filters, limit: 50 };
    if (query.trim().length >= 2) {
      params.query = query;
    }
    setLoading(true);
    setError("");
    axios.get('/api/v1/search/users', { params })
      .then(res => setPlayers(res.data))
      .catch(err => {
        setPlayers([]);
        setError(extractErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, [query, sort, filters]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">🔍 بحث اللاعبين</h1>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto"></div>
        </div>
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-center flex-col sm:flex-row">
          <input
            className="bg-hitman-800 border border-accent-red/40 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-red transition w-full sm:w-64 text-center placeholder:text-hitman-400"
            placeholder="ابحث باسم المستخدم أو الشخصية..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select
            className="bg-hitman-800 border border-accent-red/40 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-red transition w-full sm:w-auto"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="level">المستوى</option>
            <option value="killCount">عدد القتل</option>
            <option value="daysInGame">الأيام في اللعبة</option>
            <option value="lastActive">آخر نشاط</option>
          </select>
        </div>
        {error && (
          <div className="text-center py-4 text-red-400 text-lg animate-fade-in">
            {error}
          </div>
        )}
        {loading ? (
          <div className="text-center py-12 text-accent-red animate-pulse text-lg">جاري التحميل...</div>
        ) : players.length === 0 && !error ? (
          <div className="text-center py-12 text-hitman-400 text-lg">لا يوجد نتائج مطابقة</div>
        ) : (
          <div className="flex flex-col gap-4">
            {players.map(player => (
              <div
                key={player.id}
                className="flex flex-col sm:flex-row items-center bg-gradient-to-br from-hitman-800/60 to-hitman-900/80 border border-accent-red/30 rounded-2xl px-4 sm:px-6 py-4 gap-4 sm:gap-6 hover:border-accent-red/70 hover:shadow-lg transition-all duration-300 group animate-slide-up"
              >
                <img
                  src={getAvatarUrl(player.character?.avatarUrl || player.avatarUrl)}
                  alt="avatar"
                  className="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-accent-red shadow-md group-hover:scale-105 transition-transform mb-2 sm:mb-0"
                />
                <div className="flex-1 min-w-0 w-full sm:w-auto text-center sm:text-right">
                  <div className="text-lg font-bold text-accent-red truncate">
                    <VipName isVIP={player.isVIP}>{player.username}</VipName>
                  </div>
                  {/* <div className="text-xs text-hitman-300 mb-1 truncate">{player.character?.name}</div> */}
                  <div className="flex flex-wrap gap-2 text-xs text-hitman-400 mb-2 justify-center sm:justify-start">
                    <span className="bg-accent-yellow/20 px-2 py-1 rounded-lg text-accent-yellow font-bold">المستوى: {player.character?.level}</span>
                    <span className="bg-accent-blue/20 px-2 py-1 rounded-lg text-accent-blue font-bold">عدد القتل: {player.character?.killCount}</span>
                    <span className="bg-accent-green/20 px-2 py-1 rounded-lg text-accent-green font-bold">الأيام: {player.character?.daysInGame}</span>
                    {player.character?.gangId && <span className="bg-accent-orange/20 px-2 py-1 rounded-lg text-accent-orange font-bold">العصابة: {player.character.gangId}</span>}
                  </div>
                  {/* Profile Link */}
                  <Link
                    to={`/dashboard/profile/${player.username}`}
                    className="inline-block mt-2 px-4 py-1 bg-accent-red text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-bold"
                  >
                    عرض الملف الشخصي
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 