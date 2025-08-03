import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { extractErrorMessage } from "@/utils/errorHandler";
import './vipSparkle.css';
import VipName from './VipName.jsx';
import { Star, Award, Calendar, Target, User, Search, ImageIcon, Crown, Loader } from 'lucide-react';
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';

function StatBadge({ icon: Icon, label, value, color, bgGrad }) {
  return (
    <div className={`card-3d bg-gradient-to-br ${bgGrad} border-${color}-500/30 px-3 py-1 text-center group hover:border-${color}-500/50 transition-colors duration-300`}>
      <div className="flex items-center justify-center gap-1">
        {Icon && <Icon className={`w-3 h-3 text-${color}-400`} />}
        <span className={`text-xs font-bold text-${color}-400`}>{label}: {value}</span>
      </div>
    </div>
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
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      <div className="container mx-auto max-w-4xl p-4 space-y-6">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">بحث اللاعبين</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">Player Search</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Search className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg">البحث</div>
                <div className="text-xs text-white/80 drop-shadow">Search</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Controls */}
        <div className="card-3d p-4">
          <h2 className="text-lg font-bold text-blood-400 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            البحث والفلترة
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white/90 mb-2">البحث بالاسم</label>
              <input
                className="input-3d text-center"
                placeholder="ابحث باسم المستخدم أو اسم الشخصية..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white/90 mb-2">ترتيب حسب</label>
              <select
                className="input-3d"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="level">المستوى</option>
                <option value="killCount">عدد القتل</option>
                <option value="daysInGame">الأيام في اللعبة</option>
                <option value="lastActive">آخر نشاط</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="card-3d p-4">
          <h2 className="text-lg font-bold text-blood-400 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            نتائج البحث
          </h2>
          
          {players.length === 0 && !error ? (
            <div className="text-center py-12">
              <div className="card-3d bg-black/40 border-white/20 p-6 inline-block">
                <Search className="w-12 h-12 text-white/50 mx-auto mb-3" />
                <p className="text-white/60">لا يوجد نتائج مطابقة</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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
                    className="card-3d p-4 hover:border-blood-500/50 transition-colors duration-300"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="avatar"
                            className="w-16 h-16 rounded-full object-cover border-2 border-blood-500/50 bg-black/40"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        {/* Fallback icon when no avatar or image fails to load */}
                        <div className={`w-16 h-16 rounded-full border-2 border-blood-500/50 bg-gradient-to-br from-blood-950/60 to-black/40 flex items-center justify-center ${avatarUrl ? 'hidden' : 'flex'}`}>
                          <span className="text-lg font-bold text-blood-400">
                            {(player.displayName || player.name || player.username || "?")[0]}
                          </span>
                        </div>
                        {isVIP && (
                          <div className="absolute -bottom-1 -right-1 card-3d bg-yellow-500/20 border-yellow-500/40 px-2 py-0.5">
                            <span className="text-xs font-bold text-yellow-400">VIP</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <VipName user={player} />
                          {/* Show user ID */}
                          <span className="text-xs text-blood-400 card-3d bg-black/40 border-blood-500/20 px-2 py-0.5 font-bold">ID: {player.userId || player.id}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <StatBadge 
                            icon={Star} 
                            label="المستوى" 
                            value={level ?? '--'} 
                            color="yellow" 
                            bgGrad="from-yellow-950/30 to-amber-950/20" 
                          />
                          <StatBadge 
                            icon={Target} 
                            label="القتل" 
                            value={killCount ?? '--'} 
                            color="red" 
                            bgGrad="from-red-950/30 to-blood-950/20" 
                          />
                          <StatBadge 
                            icon={Calendar} 
                            label="الأيام" 
                            value={daysInGame ?? '--'} 
                            color="green" 
                            bgGrad="from-green-950/30 to-emerald-950/20" 
                          />
                        </div>
                      </div>
                      
                      {/* Profile Link */}
                      <div className="flex-shrink-0">
                        <Link
                          to={player.username ? `/dashboard/profile/${player.username}` : '/dashboard/profile'}
                          className="btn-3d text-sm py-2 px-4 flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          عرض الملف
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
