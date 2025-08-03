import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { toast } from 'react-hot-toast';
import { 
  Dog, 
  Sword, 
  Star, 
  ShoppingCart, 
  Trash2, 
  Crown, 
  Activity,
  Target,
  Award,
  Eye,
  Settings,
  Check,
  X
} from 'lucide-react';

const dogService = {
  async getDogs() {
    const response = await fetch('/api/dogs', { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch dogs');
    return response.json();
  },

  async getMarketDogs() {
    const response = await fetch('/api/dogs/market', { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch market dogs');
    return response.json();
  },

  async buyDog(dogId) {
    const response = await fetch(`/api/dogs/buy/${dogId}`, { method: 'POST', credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to buy dog');
    }
    return response.json();
  },

  async sellDog(dogId) {
    const response = await fetch(`/api/dogs/sell/${dogId}`, { method: 'POST', credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sell dog');
    }
    return response.json();
  },

  async equipDog(dogId) {
    const response = await fetch(`/api/dogs/equip/${dogId}`, { method: 'POST', credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to equip dog');
    }
    return response.json();
  },

  async unequipDog(dogId) {
    const response = await fetch(`/api/dogs/unequip/${dogId}`, { method: 'POST', credentials: 'include' });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unequip dog');
    }
    return response.json();
  }
};

const Dogs = () => {
  const { user } = useFirebaseAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('owned');

  const { data: ownedDogs = [], isLoading: loadingOwned } = useQuery({
    queryKey: ['dogs'],
    queryFn: dogService.getDogs,
    enabled: !!user
  });

  const { data: marketDogs = [], isLoading: loadingMarket } = useQuery({
    queryKey: ['dogs', 'market'],
    queryFn: dogService.getMarketDogs,
    enabled: !!user && activeTab === 'market'
  });

  const buyDogMutation = useMutation({
    mutationFn: dogService.buyDog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      queryClient.invalidateQueries({ queryKey: ['dogs', 'market'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'تم شراء الكلب بنجاح!');
    },
    onError: (error) => toast.error(error.message)
  });

  const sellDogMutation = useMutation({
    mutationFn: dogService.sellDog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(`تم بيع الكلب! حصلت على $${data.refund}`);
    },
    onError: (error) => toast.error(error.message)
  });

  const equipDogMutation = useMutation({
    mutationFn: dogService.equipDog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'تم تجهيز الكلب بنجاح!');
    },
    onError: (error) => toast.error(error.message)
  });

  const unequipDogMutation = useMutation({
    mutationFn: dogService.unequipDog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dogs'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'تم إلغاء تجهيز الكلب بنجاح!');
    },
    onError: (error) => toast.error(error.message)
  });

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-zinc-400',
      uncommon: 'text-green-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legend: 'text-yellow-400'
    };
    return colors[rarity?.toLowerCase()] || colors.common;
  };

  const getRarityStars = (rarity) => {
    const stars = {
      common: '⭐',
      uncommon: '⭐⭐',
      rare: '⭐⭐⭐',
      epic: '⭐⭐⭐⭐',
      legend: '⭐⭐⭐⭐⭐'
    };
    return stars[rarity?.toLowerCase()] || stars.common;
  };

  const DogCard = ({ dog, type = 'owned' }) => {
    const isLoading = buyDogMutation.isPending || sellDogMutation.isPending || equipDogMutation.isPending || unequipDogMutation.isPending;
    const isEquipped = dog.equipped || dog.isEquipped;

    return (
      <div className="card-3d p-4 hover:border-orange-500/50 transition-all duration-300 group hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/30 to-amber-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center shadow-lg">
                <Dog className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm group-hover:text-orange-300 transition-colors">{dog.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              {isEquipped && (
                <span className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                  مجهز
                </span>
              )}
              <span className={`text-xs ${getRarityColor(dog.rarity)} bg-black/40 px-2 py-1 rounded-full font-bold border border-current/30`}>
                {getRarityStars(dog.rarity)}
              </span>
            </div>
          </div>

          <div className="relative w-full h-20 bg-gradient-to-br from-black/60 to-orange-950/40 rounded-lg border border-orange-500/20 overflow-hidden">
            {dog.imageUrl ? (
              <img 
                src={dog.imageUrl} 
                alt={dog.name}
                className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center text-2xl ${dog.imageUrl ? 'hidden' : 'flex'}`}>
              <Dog className="w-8 h-8 text-orange-400/50" />
            </div>
          </div>

          {dog.powerBonus > 0 && (
            <div className="card-3d bg-red-950/20 border-red-500/30 p-2 text-center">
              <Sword className="w-3 h-3 text-red-400 mx-auto mb-1" />
              <div className="text-red-400 font-bold">+{dog.powerBonus}</div>
              <div className="text-white/50">قوة هجوم</div>
            </div>
          )}

          {type === 'market' && (
            <div className="card-3d bg-black/40 border-white/10 p-2 text-center">
              <div className="text-xs text-white/50 mb-1">السعر</div>
              <div className={`font-bold ${dog.currency === 'blackcoin' ? 'text-blood-400' : 'text-green-400'} flex items-center justify-center gap-1`}>
                <span>{dog.currency === 'blackcoin' ? '⚫' : '$'}</span>
                <span>{dog.cost?.toLocaleString() || 'غير محدد'}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {type === 'owned' ? (
              <>
                {isEquipped ? (
                  <button
                    onClick={() => unequipDogMutation.mutate(dog.id)}
                    disabled={isLoading}
                    className="btn-3d-secondary flex-1 text-xs py-2 flex items-center justify-center gap-1 hover:border-orange-500/50 disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                    إلغاء التجهيز
                  </button>
                ) : (
                  <button
                    onClick={() => equipDogMutation.mutate(dog.id)}
                    disabled={isLoading}
                    className="btn-3d flex-1 text-xs py-2 flex items-center justify-center gap-1 hover:border-green-500/50 disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" />
                    تجهيز
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد أنك تريد بيع هذا الكلب؟')) {
                      sellDogMutation.mutate(dog.id);
                    }
                  }}
                  disabled={isLoading}
                  className="btn-3d-secondary flex-1 text-xs py-2 flex items-center justify-center gap-1 hover:border-red-500/50 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  بيع
                </button>
              </>
            ) : (
              <button
                onClick={() => buyDogMutation.mutate(dog.id)}
                disabled={isLoading}
                className="btn-3d w-full text-xs py-2 flex items-center justify-center gap-1 hover:border-green-500/50 disabled:opacity-50"
              >
                <ShoppingCart className="w-3 h-3" />
                شراء
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom">
      <div className="container mx-auto max-w-6xl p-3 space-y-6">
        
        {/* Header */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-900 via-amber-800 to-orange-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f97316\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"25\" r=\"8\"/%3E%3Cellipse cx=\"25\" cy=\"35\" rx=\"3\" ry=\"2\"/%3E%3Cellipse cx=\"35\" cy=\"35\" rx=\"3\" ry=\"2\"/%3E%3Cpath d=\"M30 32 L27 40 L33 40 Z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Dog className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">الكلاب</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">مجموعة الكلاب المقاتلة</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <Activity className="w-4 h-4 text-white/60" />
                <Target className="w-4 h-4 text-orange-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg">{ownedDogs.length}</div>
                <div className="text-xs text-white/80 drop-shadow">كلب مملوك</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('owned')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'owned' ? 'btn-3d border-orange-500/50' : 'btn-3d-secondary hover:border-orange-500/30'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>كلابي ({ownedDogs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'market' ? 'btn-3d border-orange-500/50' : 'btn-3d-secondary hover:border-orange-500/30'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>سوق الكلاب</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'owned' ? (
          <div>
            {loadingOwned ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
                  <p className="text-white">جاري تحميل كلابك...</p>
                </div>
              </div>
            ) : ownedDogs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ownedDogs.map((dog) => (
                  <DogCard key={dog.id} dog={dog} type="owned" />
                ))}
              </div>
            ) : (
              <div className="card-3d p-8 text-center">
                <Dog className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد كلاب</h3>
                <p className="text-white/60">قم بزيارة سوق الكلاب لشراء أول كلب مقاتل لك</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {loadingMarket ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
                  <p className="text-white">جاري تحميل السوق...</p>
                </div>
              </div>
            ) : marketDogs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {marketDogs.map((dog) => (
                  <DogCard key={dog.id} dog={dog} type="market" />
                ))}
              </div>
            ) : (
              <div className="card-3d p-8 text-center">
                <Dog className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد كلاب متاحة</h3>
                <p className="text-white/60">تحقق مرة أخرى لاحقاً للحصول على كلاب جديدة</p>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="card-3d p-4 bg-gradient-to-r from-orange-950/20 to-black/40 border-orange-500/20">
          <h3 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            نصائح الكلاب
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Award className="w-3 h-3 text-yellow-400" />
              <span>الكلاب تزيد من قوة الهجوم</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-green-400" />
              <span>جهز كلب واحد فقط في كل مرة</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-3 h-3 text-blue-400" />
              <span>يمكنك تغيير الكلب المجهز في أي وقت</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3 text-purple-400" />
              <span>الكلاب النادرة لها مكافآت أفضل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dogs;
