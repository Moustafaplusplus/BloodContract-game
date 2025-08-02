import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { extractErrorMessage } from "@/utils/errorHandler";
import './vipSparkle.css';
import VipName from './VipName.jsx';
import { Star, Award, Calendar, Target, User } from 'lucide-react';
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';

function StatBadge({ icon: Icon, label, value, color }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${color} bg-opacity-20 bg-${color}`.replace('bg-bg-', 'bg-')}
      style={{ backgroundColor: `rgba(var(--${color}-rgb), 0.15)` }}>
      {Icon && <Icon className="w-4 h-4" />}
      {label}: {value}
    </span>
  );
}

export default function PlayerSearch() {
  const [players, setPlayers] = useState([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('level');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://bloodcontract-game-production.up.railway.app";
  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return backendUrl + url;
    return backendUrl + '/' + url;
  };

  useEffect(() => {
    const params = { sort, limit: 50 };
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
  }, [query, sort]);

  if (loading) {
    return <LoadingOrErrorPlaceholder loading loadingText="جاري تحميل اللاعبين..." />;
  }
  if (error) {
    return <LoadingOrErrorPlaceholder error errorText={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">🔍 بحث اللاعبين</h1>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto"></div>
        </div>
        <div className="flex flex-wrap gap-4 mb-8 items-center justify-center flex-col sm:flex-row">
          <input
            className="bg-hitman-800 border border-accent-red/40 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent-red transition w-full sm:w-64 text-center placeholder:text-hitman-400"
            placeholder="ابحث باسم المستخدم أو اسم الشخصية..."
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
        {players.length === 0 && !error ? (
          <div className="text-center py-12 text-hitman-400 text-lg">لا يوجد نتائج مطابقة</div>
        ) : (
          <div className="flex flex-col gap-6">
            {players.map(player => {
              // Fallback for missing avatar
              const avatarUrl = getAvatarUrl(player.avatarUrl);
              // VIP badge
              const isVIP = player.isVip || player.isVIP;
              // Stats
              const level = player.level ?? player.dataValues?.level;
              const killCount = player.killCount ?? player.dataValues?.killCount;
              const daysInGame = player.daysInGame ?? player.dataValues?.daysInGame;
              return (
                <div
                  key={player.userId || player.id || player.username}
                  className="relative flex flex-col sm:flex-row items-center bg-gradient-to-br from-hitman-800/80 to-hitman-900/90 border border-accent-red/40 rounded-2xl px-6 py-5 gap-4 sm:gap-8 shadow-lg hover:shadow-2xl transition-all duration-300 group animate-slide-up"
                  style={{ minHeight: 120 }}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-20 h-20 rounded-full object-cover border-4 border-accent-red shadow-md group-hover:scale-105 transition-transform bg-hitman-900"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Fallback icon when no avatar or image fails to load */}
                    <div className={`w-20 h-20 rounded-full border-4 border-accent-red shadow-md group-hover:scale-105 transition-transform bg-gradient-to-br from-hitman-700 to-hitman-800 flex items-center justify-center ${avatarUrl ? 'hidden' : 'flex'}`}>
                      <span className="text-3xl font-bold text-accent-red">
                        {(player.displayName || player.name || player.username || "?")[0]}
                      </span>
                    </div>
                    {isVIP && (
                      <span className="absolute -bottom-2 -right-2 bg-accent-yellow text-black rounded-full px-2 py-1 text-xs font-bold shadow-lg border-2 border-hitman-900">VIP</span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto text-center sm:text-right flex flex-col gap-2">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <VipName user={player} />
                      {/* Show user ID */}
                      <span className="text-xs text-accent-red bg-hitman-900 px-2 py-1 rounded font-bold">ID: {player.userId || player.id}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-1">
                      <StatBadge icon={Star} label="المستوى" value={level ?? '--'} color="accent-yellow" />
                      <StatBadge icon={Target} label="عدد القتل" value={killCount ?? '--'} color="accent-blue" />
                      <StatBadge icon={Calendar} label="الأيام" value={daysInGame ?? '--'} color="accent-green" />
                    </div>
                  </div>
                  {/* Profile Link */}
                  <div className="flex flex-col items-center sm:items-end gap-2">
                    <Link
                      to={player.username ? `/dashboard/profile/${player.username}` : '/dashboard/profile'}
                      className="inline-block px-6 py-2 bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg font-bold text-base shadow-md transition-colors duration-200"
                    >
                      عرض الملف الشخصي
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 