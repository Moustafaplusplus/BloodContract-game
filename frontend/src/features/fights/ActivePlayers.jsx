import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useHud } from '@/hooks/useHud';
import { useNavigate, Link } from 'react-router-dom';
import { Sword, User, Clock, AlertTriangle } from 'lucide-react';
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';

const API = import.meta.env.VITE_API_URL;
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

// Improved avatar URL handling with better fallback
const getAvatarUrl = (url) => {
  if (!url) return null; // Return null instead of a non-existent file
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return backendUrl + url;
  return backendUrl + '/' + url;
};

function formatLastSeen(dateStr) {
  if (!dateStr) return 'غير متصل';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds
  if (diff < 60) return 'نشط الآن';
  if (diff < 3600) return `${Math.floor(diff / 60)} دقيقة مضت`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعة مضت`;
  return date.toLocaleString('ar-EG');
}

// Calculate XP warning based on level difference
function getXPWarning(attackerLevel, defenderLevel) {
  const levelDiff = attackerLevel - defenderLevel;
  
  if (levelDiff >= 15) {
    return {
      type: 'warning',
      message: 'مكافآت ضئيلة جداً - خصم ضعيف جداً',
      color: 'text-red-400',
      bgColor: 'bg-red-900/30',
      borderColor: 'border-red-500/30'
    };
  } else if (levelDiff >= 10) {
    return {
      type: 'warning',
      message: 'مكافآت منخفضة - خصم أضعف بكثير',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/30',
      borderColor: 'border-yellow-500/30'
    };
  } else if (levelDiff >= 5) {
    return {
      type: 'info',
      message: 'مكافآت متوسطة - خصم أضعف منك',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/30',
      borderColor: 'border-blue-500/30'
    };
  } else if (levelDiff <= -15) {
    return {
      type: 'bonus',
      message: 'مكافآت استثنائية - خصم قوي جداً!',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/30',
      borderColor: 'border-purple-500/30'
    };
  } else if (levelDiff <= -10) {
    return {
      type: 'bonus',
      message: 'مكافآت عالية جداً - خصم قوي جداً!',
      color: 'text-green-400',
      bgColor: 'bg-green-900/30',
      borderColor: 'border-green-500/30'
    };
  } else if (levelDiff <= -5) {
    return {
      type: 'bonus',
      message: 'مكافآت جيدة - خصم أقوى منك',
      color: 'text-green-400',
      bgColor: 'bg-green-900/30',
      borderColor: 'border-green-500/30'
    };
  }
  
  return null;
}

export default function ActivePlayers() {
  const { token } = useAuth();
  const { stats } = useHud();
  const navigate = useNavigate();
  const [attacking, setAttacking] = useState(null);

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['active-users'],
    queryFn: () => fetch(`${API}/api/users/active`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    refetchInterval: 60 * 1000,
  });

  const attackPlayer = async (userId) => {
    setAttacking(userId);
    try {
      const res = await fetch(`${API}/api/fight/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('فشل في الهجوم');
      const result = await res.json();
      navigate('/dashboard/fight-result', { state: { fightResult: result } });
      refetch();
    } catch (e) {
      alert(e.message || 'فشل في الهجوم');
    } finally {
      setAttacking(null);
    }
  };

  if (isLoading) {
    return <LoadingOrErrorPlaceholder loading loadingText="جاري تحميل اللاعبين النشطين..." />;
  }
  if (error) {
    return <LoadingOrErrorPlaceholder error errorText="حدث خطأ أثناء تحميل اللاعبين" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      <div className="relative w-full h-32 sm:h-48 md:h-64 rounded-2xl overflow-hidden mb-6 sm:mb-10 flex items-center justify-center bg-gradient-to-br from-accent-red/40 to-black/60 border-2 border-accent-red animate-fade-in">
        <User className="w-10 h-10 sm:w-16 sm:h-16 mx-auto text-accent-red mb-2 animate-bounce" />
        <div className="relative z-10 text-center">
          <h1 className="text-2xl sm:text-4xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">اللاعبون النشطون</h1>
          <p className="text-hitman-300 text-base sm:text-lg">شاهد جميع اللاعبين المتصلين أو النشطين خلال آخر 30 دقيقة</p>
        </div>
      </div>
      {users.length === 0 ? (
        <LoadingOrErrorPlaceholder error errorText="لا يوجد لاعبون نشطون حالياً" />
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {users.map((user) => {
            const xpWarning = getXPWarning(stats?.level || 1, user.level);
            
            return (
              <div key={user.userId} className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {getAvatarUrl(user.avatarUrl) ? (
                      <img 
                        src={getAvatarUrl(user.avatarUrl)} 
                        alt="avatar" 
                        className="w-14 h-14 rounded-full border-4 border-accent-red object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Fallback icon when no avatar or image fails to load */}
                    <div className={`absolute inset-0 w-14 h-14 rounded-full border-4 border-accent-red bg-hitman-800 flex items-center justify-center ${getAvatarUrl(user.avatarUrl) ? 'hidden' : 'flex'}`}>
                      <User className="w-6 h-6 text-accent-red" />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-lg text-white">{user.username}</div>
                    <div className="text-accent-red font-bold">المستوى {user.level}</div>
                    <div className="text-xs text-hitman-400 flex items-center gap-1"><Clock className="w-4 h-4 inline" /> آخر ظهور: {formatLastSeen(user.lastActive)}</div>
                    {xpWarning && (
                      <div className={`text-xs flex items-center gap-1 mt-1 ${xpWarning.color}`}>
                        <AlertTriangle className="w-3 h-3" />
                        {xpWarning.message}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[120px]">
                  <button
                    className={`px-4 py-2 bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      xpWarning?.type === 'warning' ? 'border-2 border-red-500' : 
                      xpWarning?.type === 'bonus' ? 'border-2 border-green-500' : ''
                    }`}
                    onClick={() => attackPlayer(user.userId)}
                    disabled={attacking === user.userId || stats?.userId === user.userId}
                    title={stats?.userId === user.userId ? 'لا يمكنك مهاجمة نفسك' : xpWarning?.message}
                  >
                    <Sword className="w-4 h-4" />
                    {attacking === user.userId ? '...' : 'هجوم'}
                  </button>
                  <Link
                    to={`/dashboard/profile/${user.username}`}
                    className="px-4 py-2 bg-gradient-to-r from-hitman-700 to-hitman-900 hover:from-accent-red hover:to-red-700 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    عرض الملف
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {attacking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gradient-to-br from-hitman-900 to-black border-2 border-accent-red rounded-2xl shadow-2xl max-w-md w-full mx-auto p-8 text-white animate-fade-in flex flex-col items-center">
            <Sword className="w-16 h-16 text-accent-red animate-bounce mb-4" />
            <div className="text-2xl font-bold text-white mb-2">جاري تنفيذ القتال...</div>
            <div className="text-hitman-300">يرجى الانتظار حتى انتهاء المعركة</div>
            <div className="mt-6">
              <div className="loading-spinner"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 