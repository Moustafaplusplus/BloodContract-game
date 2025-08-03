import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useSocket } from '@/hooks/useSocket';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sword, 
  User, 
  Clock, 
  AlertTriangle, 
  Users, 
  Crown, 
  Eye, 
  Target,
  Zap,
  Shield,
  ChevronRight,
  Activity
} from 'lucide-react';
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';
import VipName from '../profile/VipName.jsx';
import { handleConfinementError } from '@/utils/errorHandler';
import { toast } from 'react-hot-toast';

const API = import.meta.env.VITE_API_URL;
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://bloodcontract-game-production.up.railway.app';

// Enhanced avatar URL handling with better fallback
const getAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return backendUrl + url;
  return backendUrl + '/' + url;
};

function formatLastSeen(dateStr) {
  if (!dateStr) return 'غير متصل';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'نشط الآن';
  if (diff < 3600) return `${Math.floor(diff / 60)} دقيقة مضت`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ساعة مضت`;
  return date.toLocaleString('ar-EG');
}

// Enhanced XP warning with blood theme
function getXPWarning(attackerLevel, defenderLevel) {
  const levelDiff = attackerLevel - defenderLevel;
  
  if (levelDiff >= 15) {
    return {
      type: 'warning',
      message: 'مكافآت ضئيلة جداً - خصم ضعيف جداً',
      color: 'text-red-400',
      bgColor: 'bg-red-950/20',
      borderColor: 'border-red-500/30'
    };
  } else if (levelDiff >= 10) {
    return {
      type: 'warning',
      message: 'مكافآت منخفضة - خصم أضعف بكثير',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-950/20',
      borderColor: 'border-yellow-500/30'
    };
  } else if (levelDiff >= 5) {
    return {
      type: 'info',
      message: 'مكافآت متوسطة - خصم أضعف منك',
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/20',
      borderColor: 'border-blue-500/30'
    };
  } else if (levelDiff <= -15) {
    return {
      type: 'bonus',
      message: 'مكافآت استثنائية - خصم قوي جداً!',
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/20',
      borderColor: 'border-purple-500/30'
    };
  } else if (levelDiff <= -10) {
    return {
      type: 'bonus',
      message: 'مكافآت عالية جداً - خصم قوي جداً!',
      color: 'text-green-400',
      bgColor: 'bg-green-950/20',
      borderColor: 'border-green-500/30'
    };
  } else if (levelDiff <= -5) {
    return {
      type: 'bonus',
      message: 'مكافآت جيدة - خصم أقوى منك',
      color: 'text-green-400',
      bgColor: 'bg-green-950/20',
      borderColor: 'border-green-500/30'
    };
  }
  
  return null;
}

// Enhanced Player Card Component
const PlayerCard = ({ user, hudData, onAttack, attacking }) => {
  const xpWarning = getXPWarning(hudData?.level || 1, user.level);
  const isOwnCharacter = hudData?.userId === user.userId;
  
  return (
    <div className="card-3d p-4 hover:border-blood-500/50 transition-all duration-300 group">
      {/* XP Warning Banner */}
      {xpWarning && (
        <div className={`${xpWarning.bgColor} ${xpWarning.borderColor} border rounded-lg p-2 mb-3`}>
          <div className={`flex items-center gap-2 text-xs ${xpWarning.color}`}>
            <AlertTriangle className="w-3 h-3" />
            <span>{xpWarning.message}</span>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Enhanced Avatar */}
          <div className="relative">
            {getAvatarUrl(user.avatarUrl) ? (
              <img 
                src={getAvatarUrl(user.avatarUrl)} 
                alt="avatar" 
                className="w-12 h-12 rounded-full border-2 border-blood-500/50 object-cover group-hover:border-blood-500 transition-colors duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-12 h-12 rounded-full border-2 border-blood-500/50 bg-gradient-to-br from-blood-950/60 to-black/40 flex items-center justify-center ${getAvatarUrl(user.avatarUrl) ? 'hidden' : 'flex'} group-hover:border-blood-500 transition-colors duration-300`}>
              <span className="text-sm font-bold text-blood-400">
                {(user.name || user.username || "?")[0]}
              </span>
            </div>
            
            {/* Level Badge */}
            <div className="absolute -bottom-1 -right-1 bg-yellow-500/20 border border-yellow-500/40 rounded px-1.5 py-0.5">
              <span className="text-xs font-bold text-yellow-400">Lv.{user.level}</span>
            </div>
          </div>
          
          {/* Player Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <VipName user={user} />
              <span className="text-xs text-blood-400 bg-black/40 px-2 py-0.5 rounded border border-blood-500/20">
                ID: {user.userId}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-white/70">
              <Clock className="w-3 h-3" />
              <span>{formatLastSeen(user.lastActive)}</span>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-xs">
                <Zap className="w-3 h-3 text-orange-400" />
                <span className="text-white/60">قوة: <span className="text-orange-400">{user.strength || 0}</span></span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Shield className="w-3 h-3 text-blue-400" />
                <span className="text-white/60">دفاع: <span className="text-blue-400">{user.defense || 0}</span></span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2 min-w-[100px]">
          <button
            className={`btn-3d text-xs px-3 py-2 flex items-center justify-center gap-1 group-hover:scale-105 transition-transform duration-300 ${
              isOwnCharacter 
                ? 'opacity-50 cursor-not-allowed' 
                : xpWarning?.type === 'warning' 
                  ? 'border-red-500/40 hover:border-red-500' 
                  : xpWarning?.type === 'bonus' 
                    ? 'border-green-500/40 hover:border-green-500' 
                    : 'hover:border-blood-500/50'
            }`}
            onClick={() => !isOwnCharacter && onAttack(user.userId)}
            disabled={attacking === user.userId || isOwnCharacter}
            title={isOwnCharacter ? 'لا يمكنك مهاجمة نفسك' : xpWarning?.message}
          >
            {attacking === user.userId ? (
              <div className="loading-shimmer w-3 h-3 rounded-full"></div>
            ) : (
              <Sword className="w-3 h-3" />
            )}
            <span>{attacking === user.userId ? 'جاري...' : 'هجوم'}</span>
          </button>
          
          <Link
            to={`/dashboard/profile/${user.username}`}
            className="btn-3d-secondary text-xs px-3 py-2 flex items-center justify-center gap-1 hover:border-blue-500/50"
          >
            <User className="w-3 h-3" />
            <span>الملف</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function ActivePlayers() {
  const { customToken } = useFirebaseAuth();
  const { 
    socket, 
    fightData, 
    hudData,
    requestFight 
  } = useSocket();
  const navigate = useNavigate();
  const [attacking, setAttacking] = useState(null);

  // Request initial fight data when component mounts
  useEffect(() => {
    if (socket && socket.connected) {
      requestFight();
    }
  }, [socket, requestFight]);

  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['active-users'],
    queryFn: () => fetch(`${API}/api/users/active`, { 
      headers: { Authorization: `Bearer ${customToken}` } 
    }).then(r => r.json()),
    refetchInterval: 60 * 1000,
  });

  const attackPlayer = async (userId) => {
    setAttacking(userId);
    try {
      const res = await fetch(`${API}/api/fight/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${customToken}` },
      });
      if (!res.ok) {
        let errorMsg = "فشل في الهجوم";
        let responseData = null;
        
        try {
          const responseClone = res.clone();
          responseData = await responseClone.json();
          errorMsg = responseData.message || responseData.error || errorMsg;
        } catch (parseError) {
          try {
            const responseClone = res.clone();
            const text = await responseClone.text();
            try {
              responseData = JSON.parse(text);
              errorMsg = responseData.message || responseData.error || errorMsg;
            } catch {
              errorMsg = text || errorMsg;
            }
          } catch (textError) {
            console.error('Error parsing response:', textError);
          }
        }
        
        const error = new Error(errorMsg);
        error.response = { status: res.status, data: responseData };
        throw error;
      }
      const result = await res.json();
      navigate('/dashboard/fight-result', { state: { fightResult: result } });
      refetch();
    } catch (e) {
      const confinementResult = handleConfinementError(e, toast);
      if (!confinementResult.isConfinementError) {
        toast.error(e.message || 'فشل في الهجوم');
      }
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
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom">
      <div className="container mx-auto max-w-4xl p-3 space-y-4">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-blood-900 via-red-800 to-orange-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M30 30m-20 0a20,20 0 1,1 40,0a20,20 0 1,1 -40,0M30 30m-15 0a15,15 0 1,1 30,0a15,15 0 1,1 -30,0M30 30m-10 0a10,10 0 1,1 20,0a10,10 0 1,1 -20,0\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blood-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">اللاعبون النشطون</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">اختر هدفك التالي</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <Eye className="w-4 h-4 text-white/60" />
                <Sword className="w-4 h-4 text-blood-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg">{users.length}</div>
                <div className="text-xs text-white/80 drop-shadow">لاعب نشط</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="card-3d p-4">
          <h3 className="text-sm font-bold text-blood-400 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            إحصائيات سريعة
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card-3d bg-green-950/20 border-green-500/30 p-3 text-center">
              <div className="text-sm font-bold text-green-400">{users.filter(u => u.level >= (hudData?.level || 1) + 5).length}</div>
              <div className="text-xs text-white/60">أقوى منك</div>
            </div>
            <div className="card-3d bg-blue-950/20 border-blue-500/30 p-3 text-center">
              <div className="text-sm font-bold text-blue-400">{users.filter(u => Math.abs(u.level - (hudData?.level || 1)) <= 4).length}</div>
              <div className="text-xs text-white/60">في مستواك</div>
            </div>
            <div className="card-3d bg-yellow-950/20 border-yellow-500/30 p-3 text-center">
              <div className="text-sm font-bold text-yellow-400">{users.filter(u => u.level < (hudData?.level || 1) - 5).length}</div>
              <div className="text-xs text-white/60">أضعف منك</div>
            </div>
            <div className="card-3d bg-blood-950/20 border-blood-500/30 p-3 text-center">
              <div className="text-sm font-bold text-blood-400">{users.length}</div>
              <div className="text-xs text-white/60">المجموع</div>
            </div>
          </div>
        </div>

        {/* Players List */}
        {users.length === 0 ? (
          <div className="card-3d p-8 text-center">
            <Users className="w-16 h-16 text-blood-400/50 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-blood-400 mb-2">لا يوجد لاعبون نشطون</h3>
            <p className="text-white/60 text-sm">لا يوجد لاعبون متصلون أو نشطون حالياً</p>
            <p className="text-white/40 text-xs mt-2">تحقق مرة أخرى خلال دقائق</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-blood-400" />
                الأهداف المتاحة ({users.length})
              </h3>
              <div className="text-xs text-white/50">
                آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
              </div>
            </div>
            
            {users.map((user) => (
              <PlayerCard
                key={user.userId}
                user={user}
                hudData={hudData}
                onAttack={attackPlayer}
                attacking={attacking}
              />
            ))}
          </div>
        )}

        {/* Enhanced Fight Tips */}
        <div className="card-3d p-4 bg-gradient-to-r from-blood-950/20 to-black/40 border-blood-500/20">
          <h3 className="text-sm font-bold text-blood-400 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            نصائح القتال
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Crown className="w-3 h-3 text-yellow-400" />
              <span>حارب أقوى منك للحصول على مكافآت أفضل</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-orange-400" />
              <span>طور قوتك ودفاعك في النادي قبل القتال</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-blue-400" />
              <span>تجنب القتال عند انخفاض الصحة</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>الخسارة قد تؤدي لدخول المستشفى</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Attack Loading Modal */}
      {attacking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="card-3d bg-gradient-to-br from-blood-950/90 to-black/90 border-blood-500/50 p-8 max-w-md w-full mx-4 text-center">
            <div className="relative mb-6">
              <div className="loading-shimmer w-16 h-16 rounded-full mx-auto"></div>
              <Sword className="w-8 h-8 text-blood-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-blood-400 mb-2">جاري تنفيذ الهجوم</h3>
            <p className="text-white/70 text-sm">يرجى الانتظار حتى انتهاء المعركة...</p>
            <div className="progress-3d mt-4 h-2">
              <div className="progress-3d-fill bg-gradient-to-r from-blood-600 to-blood-400 animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
