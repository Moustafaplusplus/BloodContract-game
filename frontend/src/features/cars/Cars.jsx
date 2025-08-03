import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { 
  Car, 
  Sword, 
  Shield, 
  Star, 
  ShoppingCart, 
  Trash2, 
  Crown, 
  Activity,
  Zap,
  Target,
  Award,
  Eye,
  Settings,
  Play,
  Pause
} from 'lucide-react';

const carService = {
  async getCars() {
    const response = await fetch('/api/cars', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch cars');
    }
    return response.json();
  },

  async getOwnedCars() {
    const response = await fetch('/api/cars/user', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch owned cars');
    }
    return response.json();
  },

  async buyCar(carId) {
    const response = await fetch('/api/cars/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ carId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to buy car');
    }
    return response.json();
  },

  async sellCar(carId) {
    const response = await fetch(`/api/cars/${carId}/sell`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sell car');
    }
    return response.json();
  },

  async activateCar(carId) {
    const response = await fetch(`/api/cars/${carId}/activate`, {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to activate car');
    }
    return response.json();
  },

  async deactivateCar() {
    const response = await fetch('/api/cars/deactivate', {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to deactivate car');
    }
    return response.json();
  }
};

const Cars = () => {
  const { user } = useFirebaseAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('owned');

  const { data: availableCars = [], isLoading: loadingCars } = useQuery({
    queryKey: ['cars'],
    queryFn: carService.getCars,
    enabled: !!user && activeTab === 'market'
  });

  const { data: ownedCars = [], isLoading: loadingOwned } = useQuery({
    queryKey: ['owned-cars'],
    queryFn: carService.getOwnedCars,
    enabled: !!user
  });

  const buyCarMutation = useMutation({
    mutationFn: carService.buyCar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'تم شراء السيارة بنجاح!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const sellCarMutation = useMutation({
    mutationFn: carService.sellCar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-cars'] });
      queryClient.invalidateQueries({ queryKey: ['cars'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      const currencyText = data.currency === 'blackcoin' ? 'عملة سوداء' : 'نقود';
      toast.success(`تم بيع السيارة! حصلت على $${data.refund} ${currencyText}`);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const activateCarMutation = useMutation({
    mutationFn: carService.activateCar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-cars'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'تم تفعيل السيارة بنجاح!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const deactivateCarMutation = useMutation({
    mutationFn: carService.deactivateCar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-cars'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'تم إلغاء تفعيل السيارة بنجاح!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleBuyCar = (carId) => {
    buyCarMutation.mutate(carId);
  };

  const handleSellCar = (carId) => {
    if (window.confirm('هل أنت متأكد أنك تريد بيع هذه السيارة؟')) {
      sellCarMutation.mutate(carId);
    }
  };

  const handleActivateCar = (carId) => {
    activateCarMutation.mutate(carId);
  };

  const handleDeactivateCar = () => {
    deactivateCarMutation.mutate();
  };

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

  const CarCard = ({ car, type = 'owned', isActive = false }) => {
    const isLoading = buyCarMutation.isPending || sellCarMutation.isPending || 
                     activateCarMutation.isPending || deactivateCarMutation.isPending;

    return (
      <div className="card-3d p-4 hover:border-blue-500/50 transition-all duration-300 group hover:scale-[1.02]">
        {/* Enhanced Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-cyan-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10 space-y-3">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <Car className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">{car.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              {isActive && (
                <span className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                  نشط
                </span>
              )}
              <span className={`text-xs ${getRarityColor(car.rarity)} bg-black/40 px-2 py-1 rounded-full font-bold border border-current/30`}>
                {getRarityStars(car.rarity)}
              </span>
            </div>
          </div>

          {/* Enhanced Car Image */}
          <div className="relative w-full h-20 bg-gradient-to-br from-black/60 to-blue-950/40 rounded-lg border border-blue-500/20 overflow-hidden">
            {car.imageUrl ? (
              <img 
                src={car.imageUrl} 
                alt={car.name}
                className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center text-2xl ${car.imageUrl ? 'hidden' : 'flex'}`}>
              <Car className="w-8 h-8 text-blue-400/50" />
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {car.attackBonus > 0 && (
              <div className="card-3d bg-red-950/20 border-red-500/30 p-2 text-center">
                <Sword className="w-3 h-3 text-red-400 mx-auto mb-1" />
                <div className="text-red-400 font-bold">+{car.attackBonus}</div>
                <div className="text-white/50">هجوم</div>
              </div>
            )}
            {car.defenseBonus > 0 && (
              <div className="card-3d bg-blue-950/20 border-blue-500/30 p-2 text-center">
                <Shield className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                <div className="text-blue-400 font-bold">+{car.defenseBonus}</div>
                <div className="text-white/50">دفاع</div>
              </div>
            )}
          </div>

          {/* Enhanced Price Display */}
          {type === 'market' && (
            <div className="card-3d bg-black/40 border-white/10 p-2 text-center">
              <div className="text-xs text-white/50 mb-1">السعر</div>
              <div className={`font-bold ${car.currency === 'blackcoin' ? 'text-blood-400' : 'text-green-400'} flex items-center justify-center gap-1`}>
                <span>{car.currency === 'blackcoin' ? '⚫' : '$'}</span>
                <span>{car.cost?.toLocaleString() || 'غير محدد'}</span>
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex gap-2">
            {type === 'owned' ? (
              <>
                {isActive ? (
                  <button
                    onClick={handleDeactivateCar}
                    disabled={isLoading}
                    className="btn-3d-secondary flex-1 text-xs py-2 flex items-center justify-center gap-1 hover:border-yellow-500/50 disabled:opacity-50"
                  >
                    <Pause className="w-3 h-3" />
                    إلغاء التفعيل
                  </button>
                ) : (
                  <button
                    onClick={() => handleActivateCar(car.id)}
                    disabled={isLoading}
                    className="btn-3d flex-1 text-xs py-2 flex items-center justify-center gap-1 hover:border-green-500/50 disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    تفعيل
                  </button>
                )}
                <button
                  onClick={() => handleSellCar(car.id)}
                  disabled={isLoading}
                  className="btn-3d-secondary flex-1 text-xs py-2 flex items-center justify-center gap-1 hover:border-red-500/50 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  بيع
                </button>
              </>
            ) : (
              <button
                onClick={() => handleBuyCar(car.id)}
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
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-cyan-800 to-blue-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%233b82f6\" fill-opacity=\"0.1\"%3E%3Crect x=\"15\" y=\"25\" width=\"30\" height=\"10\" rx=\"5\"/%3E%3Ccircle cx=\"20\" cy=\"35\" r=\"5\"/%3E%3Ccircle cx=\"40\" cy=\"35\" r=\"5\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">السيارات</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">مجموعة المركبات</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <Activity className="w-4 h-4 text-white/60" />
                <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg">{ownedCars.length}</div>
                <div className="text-xs text-white/80 drop-shadow">سيارة مملوكة</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('owned')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'owned' 
                ? 'btn-3d border-blue-500/50' 
                : 'btn-3d-secondary hover:border-blue-500/30'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>سياراتي ({ownedCars.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'market' 
                ? 'btn-3d border-blue-500/50' 
                : 'btn-3d-secondary hover:border-blue-500/30'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>سوق السيارات</span>
          </button>
        </div>

        {/* Enhanced Content */}
        {activeTab === 'owned' ? (
          <div>
            {loadingOwned ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
                  <p className="text-white">جاري تحميل سياراتك...</p>
                </div>
              </div>
            ) : ownedCars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ownedCars.map((ownedCar) => (
                  <CarCard 
                    key={ownedCar.id} 
                    car={ownedCar.Car || ownedCar} 
                    type="owned" 
                    isActive={ownedCar.isActive}
                  />
                ))}
              </div>
            ) : (
              <div className="card-3d p-8 text-center">
                <Car className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد سيارات</h3>
                <p className="text-white/60">قم بزيارة سوق السيارات لشراء أول مركبة لك</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {loadingCars ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
                  <p className="text-white">جاري تحميل السوق...</p>
                </div>
              </div>
            ) : availableCars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableCars.map((car) => (
                  <CarCard key={car.id} car={car} type="market" />
                ))}
              </div>
            ) : (
              <div className="card-3d p-8 text-center">
                <Car className="w-16 h-16 text-blue-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد سيارات متاحة</h3>
                <p className="text-white/60">تحقق مرة أخرى لاحقاً للحصول على مركبات جديدة</p>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Tips */}
        <div className="card-3d p-4 bg-gradient-to-r from-blue-950/20 to-black/40 border-blue-500/20">
          <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            نصائح السيارات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Award className="w-3 h-3 text-yellow-400" />
              <span>السيارات تزيد من قوة الهجوم والدفاع</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-green-400" />
              <span>فعل سيارة واحدة فقط في كل مرة</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-3 h-3 text-blue-400" />
              <span>يمكنك تغيير السيارة النشطة في أي وقت</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3 text-purple-400" />
              <span>السيارات النادرة لها مكافآت أفضل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cars;
