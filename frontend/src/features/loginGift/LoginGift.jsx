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
  Crown
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
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red mx-auto mb-4"></div>
          <p className="text-white">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">خطأ في تحميل البيانات</p>
        </div>
      </div>
    );
  }

  const { data: status } = statusData || {};
  
  // If user has completed all 15 days, show completion message
  if (status?.isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            {/* Celebration Animation */}
            <div className="relative mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-6 animate-pulse">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              مبروك! 🎉
            </h1>
            <p className="text-xl text-gray-300 mb-8">لقد أكملت جميع الـ 15 يوم من نظام المكافآت اليومية</p>
            
            {/* Achievement Card */}
            <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/50 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-6">
                <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-yellow-400">إنجاز مكتمل!</h2>
              </div>
              
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <span className="text-green-400 font-semibold">15/15 يوم مكتمل</span>
                </div>
                <div className="flex items-center justify-center">
                  <Gift className="w-5 h-5 text-blue-400 mr-2" />
                  <span className="text-blue-400 font-semibold">جميع المكافآت مجمعة</span>
                </div>
                <div className="flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-yellow-400 font-semibold">مستوى أسطوري</span>
                </div>
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
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-red to-red-600 rounded-full mb-6 shadow-lg">
            <Gift className="w-10 h-10 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-accent-red to-red-400 bg-clip-text text-transparent">
            مكافآت الدخول اليومية
          </h1>
          <p className="text-gray-300 text-lg">ادخل كل يوم لجمع مكافآتك الخاصة</p>
        </div>

        {/* Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-900/50 to-red-800/50 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-accent-red mr-2" />
              <span className="text-sm text-gray-300">الأيام المكتملة</span>
            </div>
            <div className="text-3xl font-bold text-accent-red mb-2">
              {claimedDays.length}/15
            </div>
            <div className="w-full bg-hitman-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-accent-red to-red-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(claimedDays.length / 15) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-green-400 mr-2" />
              <span className="text-sm text-gray-300">المتتالية الحالية</span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              {status?.userLoginGift?.currentStreak || 0}
            </div>
            <div className="text-xs text-green-300">أيام متتالية</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center mb-3">
              <ArrowRight className="w-6 h-6 text-blue-400 mr-2" />
              <span className="text-sm text-gray-300">اليوم التالي</span>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {nextDay}
            </div>
            <div className="text-xs text-blue-300">في الطريق</div>
          </div>
        </div>

        {/* Claim Button */}
        {canClaimToday && (
          <div className="text-center mb-12">
            <button
              onClick={handleClaim}
              disabled={isClaiming}
              className="bg-gradient-to-r from-accent-red to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-12 rounded-2xl text-xl transition-all duration-300 flex items-center justify-center mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {isClaiming ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
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
          <div className="text-center mb-12">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-8 max-w-md mx-auto">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">تم جمع مكافأة اليوم</h3>
              <p className="text-gray-400 text-sm">عد غداً لجمع مكافأتك التالية</p>
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center">
            <Calendar className="w-6 h-6 mr-3" />
            تقويم المكافآت
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 15 }, (_, index) => {
              const dayNumber = index + 1;
              const isClaimed = claimedDays.includes(dayNumber);
              const isToday = dayNumber === nextDay && canClaimToday;
              const isFuture = dayNumber > nextDay;
              const gift = status?.loginGifts?.find(g => g.dayNumber === dayNumber);

              return (
                <div
                  key={dayNumber}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                    isClaimed
                      ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500/50 shadow-lg'
                      : isToday
                      ? 'bg-gradient-to-br from-accent-red/50 to-red-600/50 border-accent-red/50 animate-pulse shadow-lg'
                      : isFuture
                      ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/50 border-gray-600/50 opacity-50'
                      : 'bg-gradient-to-br from-hitman-700/50 to-hitman-800/50 border-hitman-600/50'
                  }`}
                >
                  {/* Day Number */}
                  <div className="text-center mb-3">
                    <div className={`text-xl font-bold ${
                      isClaimed ? 'text-green-400' : isToday ? 'text-white' : 'text-gray-400'
                    }`}>
                      {dayNumber}
                    </div>
                  </div>

                  {/* Rewards */}
                  {gift && (
                    <div className="space-y-2">
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
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  {isToday && !isClaimed && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-accent-red rounded-full flex items-center justify-center animate-pulse shadow-lg">
                        <Gift className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}

                  {isFuture && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                        <XCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-6 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-400 mr-3" />
              نصائح مهمة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-gray-300">ادخل كل يوم لجمع مكافأتك</span>
              </div>
              <div className="flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-400 mr-2" />
                <span className="text-gray-300">لا يمكن جمع مكافأة اليوم أكثر من مرة</span>
              </div>
              <div className="flex items-center justify-center">
                <Trophy className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-gray-300">أكمل جميع الـ 15 يوم للحصول على جميع المكافآت</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginGift; 