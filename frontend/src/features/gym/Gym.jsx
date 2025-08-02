/* ============================================================================
 *  src/features/gym/Gym.jsx – Enhanced Mobile-First 3D Design
 * ----------------------------------------------------------------------------*/
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useHud } from '@/hooks/useHud';
import { useSocket } from '@/hooks/useSocket';
import { 
  Dumbbell, 
  Clock, 
  Star, 
  TrendingUp, 
  Zap, 
  Timer, 
  Target,
  Crown,
  Activity,
  Plus,
  Minus,
  ImageIcon,
  Loader,
  Award,
  CheckCircle
} from 'lucide-react';
import MoneyIcon from '@/components/MoneyIcon';

function formatCooldown(sec) {
  const m = Math.floor((sec || 0) / 60);
  const s = (sec || 0) % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Helper function to calculate exp needed for any level
function calculateExpNeeded(level) {
  if (level <= 20) {
    return Math.floor(200 * Math.pow(1.15, level - 1));
  } else if (level <= 50) {
    const baseExp = Math.floor(200 * Math.pow(1.15, 19));
    return Math.floor(baseExp * Math.pow(1.12, level - 20));
  } else if (level <= 80) {
    const baseExp = Math.floor(200 * Math.pow(1.15, 19) * Math.pow(1.12, 30));
    return baseExp + (level - 50) * 15000;
  } else {
    const baseExp = Math.floor(200 * Math.pow(1.15, 19) * Math.pow(1.12, 30)) + (30 * 15000);
    return baseExp + (level - 80) * 25000;
  }
}

// Energy Input Component
const EnergyInput = ({ energy, setEnergy, maxEnergy, disabled }) => {
  return (
    <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
          <Zap className="w-3 h-3 text-white" />
        </div>
        <h3 className="font-semibold text-blue-400">كمية الطاقة للتدريب</h3>
      </div>
      
      <div className="flex items-center space-x-3 mb-4">
        <button
          onClick={() => setEnergy(Math.max(1, energy - 1))}
          disabled={disabled || energy <= 1}
          className="w-8 h-8 bg-blood-900/40 border border-blood-500/30 rounded flex items-center justify-center text-white hover:bg-blood-800/40 disabled:opacity-50 transition-all duration-300"
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <div className="flex-1 text-center">
          <div className="text-xl font-bold text-blue-400 mb-2">{energy}</div>
          <input
            type="range"
            min="1"
            max={maxEnergy}
            value={energy}
            onChange={(e) => setEnergy(parseInt(e.target.value))}
            disabled={disabled}
            className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #2563eb 0%, #2563eb ${(energy/maxEnergy)*100}%, #1f2937 ${(energy/maxEnergy)*100}%, #1f2937 100%)`
            }}
          />
          <div className="text-xs text-blood-300 mt-1">
            الحد الأقصى: {maxEnergy}
          </div>
        </div>
        
        <button
          onClick={() => setEnergy(Math.min(maxEnergy, energy + 1))}
          disabled={disabled || energy >= maxEnergy}
          className="w-8 h-8 bg-blood-900/40 border border-blood-500/30 rounded flex items-center justify-center text-white hover:bg-blood-800/40 disabled:opacity-50 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setEnergy(Math.min(maxEnergy, 5))}
          disabled={disabled}
          className="bg-blood-800/30 border border-blood-500/20 text-white py-1 rounded text-sm hover:bg-blood-700/30 transition-all duration-300"
        >
          5
        </button>
        <button
          onClick={() => setEnergy(maxEnergy)}
          disabled={disabled}
          className="bg-blood-800/30 border border-blood-500/20 text-white py-1 rounded text-sm hover:bg-blood-700/30 transition-all duration-300"
        >
          الكل
        </button>
      </div>
    </div>
  );
};

// Training Result Component
const TrainingResult = ({ result, onClose }) => {
  if (!result) return null;

  return (
    <div className="bg-black/90 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-bold text-green-400">نتائج التدريب</h3>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white/80 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {result.moneyEarned > 0 && (
          <div className="bg-green-900/20 border border-green-500/20 rounded p-3 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <MoneyIcon className="w-4 h-4" />
              <span className="text-sm text-green-300">مال</span>
            </div>
            <div className="text-lg font-bold text-green-400">+{result.moneyEarned.toLocaleString()}</div>
          </div>
        )}
        
        {result.expGained > 0 && (
          <div className="bg-yellow-900/20 border border-yellow-500/20 rounded p-3 text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-300">خبرة</span>
            </div>
            <div className="text-lg font-bold text-yellow-400">+{result.expGained.toLocaleString()}</div>
          </div>
        )}
      </div>

      {result.levelUp && (
        <div className="mt-4 bg-purple-900/20 border border-purple-500/20 rounded p-3 text-center">
          <div className="flex items-center justify-center space-x-2 text-purple-400">
            <Crown className="w-5 h-5" />
            <span className="font-bold">تهانينا! لقد وصلت للمستوى {result.newLevel}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Gym() {
  const [energy, setEnergy] = useState(1);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [result, setResult] = useState(null);
  const { stats, loading } = useHud();
  const { socket } = useSocket();
  const qc = useQueryClient();

  // Cooldown timer
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    
    const interval = setInterval(() => {
      setCooldownLeft(prev => Math.max(prev - 1, 0));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [cooldownLeft]);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    
    const handleHudUpdate = (data) => {
      if (data?.gymCooldown !== undefined) {
        setCooldownLeft(data.gymCooldown);
      }
    };
    
    socket.on('hud:update', handleHudUpdate);
    
    return () => {
      socket.off('hud:update', handleHudUpdate);
    };
  }, [socket, stats?.gymCooldown]);

  const mutation = useMutation({
    mutationFn: async (energyAmount) => {
      const response = await fetch('/api/jobs/gym/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
        body: JSON.stringify({ energy: energyAmount }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في التدريب');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data);
      setCooldownLeft(data.cooldownLeft || 60);
      qc.invalidateQueries(['character']);
      qc.invalidateQueries(['hud']);
      toast.success('تم التدريب بنجاح!');
    },
    onError: (error) => {
      toast.error(error.message || 'فشل في التدريب');
    },
  });

  const currentEnergy = stats?.energy || 0;
  const maxEnergy = stats?.maxEnergy || 100;
  const level = stats?.level || 1;
  const currentExp = stats?.exp || 0;
  const nextLevelExp = stats?.nextLevelExp || calculateExpNeeded(level + 1);

  const canTrain = cooldownLeft <= 0 && currentEnergy >= energy && !mutation.isPending;
  const expProgress = nextLevelExp > 0 ? (currentExp / nextLevelExp) * 100 : 0;

  const handleTrain = () => {
    if (!canTrain) return;
    mutation.mutate(energy);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blood-900 to-blood-800 flex items-center justify-center p-4">
        <div className="text-center bg-black/90 backdrop-blur-md rounded-xl border border-blood-500/30 p-8">
          <div className="w-16 h-16 border-4 border-blood-500/30 border-t-blood-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">جاري تحميل النادي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blood-900 to-blood-800 p-2 sm:p-4 space-y-4">
      
      {/* Gym Header Banner with Background Image */}
      <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
        {/* Background Image Placeholder with 3 Circles Logo */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%232563eb\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3Ccircle cx=\"20\" cy=\"30\" r=\"3\"/%3E%3Ccircle cx=\"40\" cy=\"30\" r=\"3\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
        </div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">النادي الرياضي</h1>
              <p className="text-xs sm:text-sm text-white/80 drop-shadow">تدريب وتطوير قدراتك</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-white">
            <div className="hidden sm:flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-white/60" />
              <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold drop-shadow-lg">Lv.{level}</div>
              <div className="text-xs text-white/80 drop-shadow">Level</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Energy Status */}
        <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-blue-400">الطاقة</span>
            </div>
            <span className="text-white font-bold">{currentEnergy}/{maxEnergy}</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-300"
              style={{ width: `${(currentEnergy / maxEnergy) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Cooldown Status */}
        <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-yellow-600 rounded flex items-center justify-center">
                <Timer className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-yellow-400">التبريد</span>
            </div>
            <span className={`font-bold font-mono ${
              cooldownLeft > 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              {cooldownLeft > 0 ? formatCooldown(cooldownLeft) : 'جاهز'}
            </span>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-yellow-600 rounded flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </div>
              <span className="font-semibold text-yellow-400">المستوى {level}</span>
            </div>
            <span className="text-white text-sm">{Math.round(expProgress)}%</span>
          </div>
          <div className="w-full bg-black/40 rounded-full h-2 mb-1">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-300"
              style={{ width: `${expProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-blood-300">
            {currentExp.toLocaleString()} / {nextLevelExp.toLocaleString()} خبرة
          </div>
        </div>
      </div>

      {/* Training Result */}
      {result && (
        <TrainingResult 
          result={result} 
          onClose={() => setResult(null)} 
        />
      )}

      {/* Training Interface */}
      {!result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Energy Input */}
          <EnergyInput
            energy={energy}
            setEnergy={setEnergy}
            maxEnergy={Math.min(currentEnergy, 10)}
            disabled={!canTrain}
          />
          
          {/* Training Info & Action */}
          <div className="space-y-4">
            
            {/* Expected Rewards */}
            <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                <h3 className="font-semibold text-green-400">المكافآت المتوقعة</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-900/20 border border-green-500/20 rounded p-3 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <MoneyIcon className="w-3 h-3" />
                    <span className="text-xs text-green-300">مال</span>
                  </div>
                  <div className="text-lg font-bold text-green-400">
                    ~{(energy * 50).toLocaleString()}
                  </div>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-500/20 rounded p-3 text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-yellow-300">خبرة</span>
                  </div>
                  <div className="text-lg font-bold text-yellow-400">
                    ~{(energy * 10).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Training Action */}
            <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm">
              {cooldownLeft > 0 ? (
                <div className="text-center py-4">
                  <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <div className="text-yellow-400 font-bold mb-1">انتظر قليلاً</div>
                  <div className="text-white/80 text-sm mb-2">
                    يمكنك التدريب مرة أخرى خلال
                  </div>
                  <div className="text-xl font-mono font-bold text-red-400">
                    {formatCooldown(cooldownLeft)}
                  </div>
                </div>
              ) : currentEnergy < energy ? (
                <div className="text-center py-4">
                  <Zap className="w-8 h-8 text-red-400 mx-auto mb-3" />
                  <div className="text-red-400 font-bold mb-1">طاقة غير كافية</div>
                  <div className="text-white/80 text-sm">
                    تحتاج إلى {energy} طاقة للتدريب
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleTrain}
                  disabled={!canTrain}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>جاري التدريب...</span>
                    </>
                  ) : (
                    <>
                      <Dumbbell className="w-5 h-5" />
                      <span>تدريب ({energy} طاقة)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Training Tips */}
      <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
            <Activity className="w-3 h-3 text-white" />
          </div>
          <h3 className="font-semibold text-purple-400">نصائح التدريب</h3>
          <ImageIcon className="w-4 h-4 text-blood-300 ml-auto" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-blood-200">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-3 h-3 text-purple-400 flex-shrink-0" />
            <span>كلما زادت الطاقة المستخدمة، زادت المكافآت</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-3 h-3 text-purple-400 flex-shrink-0" />
            <span>التدريب يحسن من مستواك ويزيد خبرتك</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3 text-purple-400 flex-shrink-0" />
            <span>يمكنك التدريب مرة واحدة كل دقيقة</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-3 h-3 text-purple-400 flex-shrink-0" />
            <span>استخدم كل طاقتك للحصول على أفضل النتائج</span>
          </div>
        </div>
      </div>
    </div>
  );
}
