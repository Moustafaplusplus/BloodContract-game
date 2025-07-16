import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useHud } from '@/hooks/useHud';
import { useNavigate, Link } from 'react-router-dom';
import { Sword, User, Clock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const getAvatarUrl = (url) => url?.startsWith('http') ? url : url ? backendUrl + url : '/default-avatar.png';

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

export default function ActiveUsers() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      <div className="relative w-full h-32 sm:h-48 md:h-64 rounded-2xl overflow-hidden mb-6 sm:mb-10 flex items-center justify-center bg-gradient-to-br from-accent-red/40 to-black/60 border-2 border-accent-red animate-fade-in">
        <User className="w-10 h-10 sm:w-16 sm:h-16 mx-auto text-accent-red mb-2 animate-bounce" />
        <div className="relative z-10 text-center">
          <h1 className="text-2xl sm:text-4xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">المستخدمون النشطون</h1>
          <p className="text-hitman-300 text-base sm:text-lg">شاهد جميع اللاعبين المتصلين أو النشطين خلال آخر 30 دقيقة</p>
        </div>
      </div>
      {isLoading ? (
        <div className="text-center py-8">جاري تحميل المستخدمين النشطين...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">حدث خطأ أثناء تحميل المستخدمين</div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-8 text-gray-400">لا يوجد مستخدمون نشطون حالياً</div>
          ) : users.map((user) => (
            <div key={user.userId} className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-4">
                <img src={getAvatarUrl(user.avatarUrl)} alt="avatar" className="w-14 h-14 rounded-full border-4 border-accent-red object-cover" />
                <div>
                  <div className="font-bold text-lg text-white">{user.username}</div>
                  <div className="text-accent-red font-bold">المستوى {user.level}</div>
                  <div className="text-xs text-hitman-400 flex items-center gap-1"><Clock className="w-4 h-4 inline" /> آخر ظهور: {formatLastSeen(user.lastActive)}</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[120px]">
                <button
                  className="px-4 py-2 bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => attackPlayer(user.userId)}
                  disabled={attacking === user.userId || stats?.userId === user.userId}
                  title={stats?.userId === user.userId ? 'لا يمكنك مهاجمة نفسك' : undefined}
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
          ))}
        </div>
      )}
    </div>
  );
} 