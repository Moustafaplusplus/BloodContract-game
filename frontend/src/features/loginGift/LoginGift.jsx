import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { 
  Gift, 
  Calendar, 
  Star, 
  Zap, 
  Package, 
  Trophy, 
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Crown,
  Flame,
  ImageIcon,
  Heart
} from 'lucide-react';
import MoneyIcon from '@/components/MoneyIcon';
import BlackcoinIcon from '@/components/BlackcoinIcon';

const LoginGift = () => {
  const { customToken } = useFirebaseAuth();
  const queryClient = useQueryClient();
  const [isClaiming, setIsClaiming] = useState(false);

  // Fetch user status
  const { data: statusData, isLoading, error } = useQuery({
    queryKey: ['loginGiftStatus'],
    queryFn: async () => {
      const response = await fetch('/api/login-gift/status', {
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch status');
      return response.json();
    },
    enabled: !!customToken
  });

  // Claim daily reward mutation
  const claimMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/login-gift/claim', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${customToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to claim reward');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`تم جمع المكافأة بنجاح! اليوم ${data.data.dayClaimed}`);
      queryClient.invalidateQueries(['loginGiftStatus']);
      queryClient.invalidateQueries(['character']);
      
      if (data.data.isCompleted) {
        toast.success('مبروك! لقد أكملت جميع الـ 15 يوم!');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleClaim = async () => {
    if (isClaiming) return;
    setIsClaiming(true);
    try {
      await claimMutation.mutateAsync();
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen blood-gradient text-white flex items-center justify-center">
        <div className="text-center card-3d p-8">
          <div className="w-12 h-12 border border-yellow-500/50 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-yellow-300">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen blood-gradient text-white flex items-center justify-center">
        <div className="text-center card-3d p-8">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">خطأ في تحميل البيانات</p>
        </div>
      </div>
    );
  }

  const { data: status } = statusData || {};
  
  // If user has completed all 15 days, show completion message
  if (status?.isCompleted) {
    return (
      <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
        <div className="container mx-auto max-w-4xl p-3 space-y-4">
          
          {/* Enhanced Header with Background Image */}
          <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-900 via-gray-800 to-gold-900">
              <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23fbbf24\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M30 5l10 20-10 20-10-20z\"/%3E%3Ccircle cx=\"30\" cy=\"50\" r=\"5\"/%3E%3Cpath d=\"M20 15h20v5h-20z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
            </div>

            <div className="absolute inset-0 bg-black/60"></div>

            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-4 animate-pulse">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-yellow-400 drop-shadow-lg">مبروك! 🎉</h1>
                <p className="text-sm sm:text-base text-white/80 drop-shadow">لقد أكملت جميع الأيام</p>
              </div>
            </div>
          </div>
          
          {/* Achievement Card */}
          <div className="card-3d bg-gradient-to-br from-yellow-950/40 to-gold-950/30 border-yellow-500/50 p-6 text-center">
            <div className="flex items-center justify-center mb-6">
              <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
              <h2 className="text-2xl font-bold text-yellow-400">إنجاز مكتمل!</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="card-3d bg-green-950/40 border-green-500/30 p-3 text-center">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <span className="text-green-400 font-semibold text-sm">15/15 يوم مكتمل</span>
              </div>
              <div className="card-3d bg-blue-950/40 border-blue-500/30 p-3 text-center">
                <Gift className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <span className="text-blue-400 font-semibold text-sm">جميع المكافآت مجمعة</span>
              </div>
              <div className="card-3d bg-yellow-950/40 border-yellow-500/30 p-3 text-center">
                <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <span className="text-yellow-400 font-semibold text-sm">مستوى أسطوري</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const claimedDays = status?.userLoginGift?.claimedDays || [];
  const nextDay = status?.nextDayToClaim || 1;
  const canClaimToday = status?.canClaimToday;

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      <div className="container mx-auto max-w-6xl p-3 space-y-4">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-900 via-gray-800 to-orange-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f59e0b\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"8\"/%3E%3Cpath d=\"M15 15l6 6-6 6-6-6z\"/%3E%3Cpath d=\"M45 15l6 6-6 6-6-6z\"/%3E%3Cpath d=\"M15 45l6 6-6 6-6-6z\"/%3E%3Cpath d=\"M45 45l6 6-6 6-6-6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          <div className="absolute inset-0 bg-black/60"></div>

          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">مكافآت الدخول اليومية</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">Daily Login Gifts</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Heart className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-yellow-400" />
                  {claimedDays.length}/15
                </div>
                <div className="text-xs text-white/80 drop-shadow">يوم</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-3d bg-gradient-to-br from-blood-950/40 to-red-950/30 border-blood-500/50 p-4 text-center">
            <div className="flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-blood-400 mr-2" />
              <span className="text-sm text-white/80">الأيام المكتملة</span>
            </div>
            <div className="text-3xl font-bold text-blood-400 mb-2">
              {claimedDays.length}/15
            </div>
            <div className="progress-3d h-2">
              <div 
                className="progress-3d-fill bg-gradient-to-r from-blood-600 to-blood-400"
                style={{ width: `${(claimedDays.length / 15) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="card-3d bg-gradient-to-br from-green-950/40 to-emerald-950/30 border-green-500/50 p-4 text-center">
            <div className="flex items-center justify-center mb-3">
              <Flame className="w-6 h-6 text-green-400 mr-2" />
              <span className="text-sm text-white/80">المتتالية الحالية</span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {status?.userLoginGift?.currentStreak || 0}
            </div>
            <div className="text-xs text-green-300">أيام متتالية</div>
          </div>

          <div className="card-3d bg-gradient-to-br from-blue-950/40 to-cyan-950/30 border-blue-500/50 p-4 text-center">
            <div className="flex items-center justify-center mb-3">
              <ArrowRight className="w-6 h-6 text-blue-400 mr-2" />
              <span className="text-sm text-white/80">اليوم التالي</span>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {nextDay}
            </div>
            <div className="text-xs text-blue-300">في الطريق</div>
          </div>
        </div>

        {/* Claim Button */}
        {canClaimToday && (
          <div className="text-center">
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="btn-3d bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-4 px-12 text-xl transition-all duration-300 flex items-center justify-center mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:opacity-50"
            >
              {isClaiming ? (
                <>
                  <div className="w-6 h-6 border border-white/50 border-t-white rounded-full animate-spin mr-3"></div>
                  جاري الجمع...
                </>
              ) : (
                <>
                  <Gift className="w-6 h-6 mr-3" />
                  جمع مكافأة اليوم
                </>
              )}
            </button>
          </div>
        )}

        {!canClaimToday && (
          <div className="text-center">
            <div className="card-3d bg-gradient-to-br from-gray-800/50 to-gray-700/50 border-gray-600/30 p-6 max-w-md mx-auto">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">تم جمع مكافأة اليوم</h3>
              <p className="text-gray-400 text-sm">عد غداً لجمع مكافأتك التالية</p>
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="card-3d p-6">
          <h2 className="text-xl font-bold mb-6 text-center flex items-center justify-center text-yellow-400">
            <Calendar className="w-6 h-6 mr-3" />
            تقويم المكافآت
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 15 }, (_, index) => {
              const dayNumber = index + 1;
              const isClaimed = claimedDays.includes(dayNumber);
              const isToday = dayNumber === nextDay && canClaimToday;
              const isFuture = dayNumber > nextDay;
              const gift = status?.loginGifts?.find(g => g.dayNumber === dayNumber);

              return (
                <div
                  key={dayNumber}
                  className={`relative card-3d p-3 transition-all duration-300 hover:scale-105 ${
                    isClaimed
                      ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500/50'
                      : isToday
                      ? 'bg-gradient-to-br from-yellow-950/50 to-orange-950/50 border-yellow-500/50 animate-pulse'
                      : isFuture
                      ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/50 border-gray-600/50 opacity-50'
                      : 'bg-gradient-to-br from-hitman-700/50 to-hitman-800/50 border-hitman-600/50'
                  }`}
                >
                  {/* Day Number */}
                  <div className="text-center mb-3">
                    <div className={`text-lg font-bold ${
                      isClaimed ? 'text-green-400' : isToday ? 'text-yellow-400' : 'text-white/70'
                    }`}>
                      {dayNumber}
                    </div>
                  </div>

                  {/* Rewards */}
                  {gift && (
                    <div className="space-y-1">
                      {gift.expReward > 0 && (
                        <div className="flex items-center justify-center text-xs bg-yellow-900/30 rounded-lg py-1">
                          <Zap className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-yellow-400 font-semibold">{gift.expReward}</span>
                        </div>
                      )}
                      {gift.moneyReward > 0 && (
                        <div className="flex items-center justify-center text-xs bg-green-900/30 rounded-lg py-1">
                          <MoneyIcon className="w-3 h-3" />
                          <span className="text-green-400 font-semibold ml-1">{gift.moneyReward}</span>
                        </div>
                      )}
                      {gift.blackcoinReward > 0 && (
                        <div className="flex items-center justify-center text-xs bg-purple-900/30 rounded-lg py-1">
                          <BlackcoinIcon />
                          <span className="text-purple-400 font-semibold ml-1">{gift.blackcoinReward}</span>
                        </div>
                      )}
                      {gift.items && gift.items.length > 0 && (
                        <div className="flex items-center justify-center text-xs bg-blue-900/30 rounded-lg py-1">
                          <Gift className="w-3 h-3 text-blue-400 mr-1" />
                          <span className="text-blue-400 font-semibold">{gift.items.length}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status Icon */}
                  {isClaimed && (
                    <div className="absolute top-2 right-2">
                      <div className="badge-3d bg-green-500">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}

                  {isToday && !isClaimed && (
                    <div className="absolute top-2 right-2">
                      <div className="badge-3d bg-yellow-500 animate-pulse">
                        <Gift className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}

                  {isFuture && (
                    <div className="absolute top-2 right-2">
                      <div className="badge-3d bg-gray-500">
                        <XCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="card-3d p-6 bg-gradient-to-r from-blue-950/20 to-purple-950/20 border-blue-500/30">
          <h3 className="text-lg font-bold mb-4 flex items-center justify-center text-blue-400">
            <Sparkles className="w-6 h-6 mr-3" />
            نصائح مهمة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
              <span className="text-white/80">ادخل كل يوم لجمع مكافأتك</span>
            </div>
            <div className="flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-400 mr-2" />
              <span className="text-white/80">لا يمكن جمع مكافأة اليوم أكثر من مرة</span>
            </div>
            <div className="flex items-center justify-center">
              <Trophy className="w-4 h-4 text-yellow-400 mr-2" />
              <span className="text-white/80">أكمل جميع الـ 15 يوم للحصول على جميع المكافآت</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginGift;
