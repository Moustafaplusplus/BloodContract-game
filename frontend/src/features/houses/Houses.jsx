import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { 
  Home, 
  Shield, 
  Heart, 
  Star, 
  ShoppingCart, 
  Trash2, 
  Crown, 
  Activity,
  Building2,
  Target,
  Award,
  Eye,
  Settings,
  Check,
  X
} from 'lucide-react';

const houseService = {
  async getHouses() {
    const response = await fetch('/api/houses', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch houses');
    }
    return response.json();
  },

  async getOwnedHouses() {
    const response = await fetch('/api/houses/owned', {
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error('Failed to fetch owned houses');
    }
    return response.json();
  },

  async buyHouse(houseId) {
    const response = await fetch('/api/houses/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ houseId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to buy house');
    }
    return response.json();
  },

  async sellHouse(houseId) {
    const response = await fetch('/api/houses/sell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ houseId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sell house');
    }
    return response.json();
  },

  async equipHouse(houseId) {
    const response = await fetch('/api/houses/equip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ houseId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to equip house');
    }
    return response.json();
  },

  async unequipHouse() {
    const response = await fetch('/api/houses/unequip', {
      method: 'POST',
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unequip house');
    }
    return response.json();
  }
};

const Houses = () => {
  const { user } = useFirebaseAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('owned');

  const { data: availableHouses = [], isLoading: loadingHouses } = useQuery({
    queryKey: ['houses'],
    queryFn: houseService.getHouses,
    enabled: !!user && activeTab === 'market'
  });

  const { data: ownedHouses = [], isLoading: loadingOwned } = useQuery({
    queryKey: ['owned-houses'],
    queryFn: houseService.getOwnedHouses,
    enabled: !!user
  });

  const { data: character } = useQuery({
    queryKey: ['character'],
    queryFn: async () => {
      const response = await fetch('/api/character', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch character');
      return response.json();
    },
    enabled: !!user
  });

  const buyHouseMutation = useMutation({
    mutationFn: houseService.buyHouse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-houses'] });
      queryClient.invalidateQueries({ queryKey: ['houses'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'تم شراء المنزل بنجاح!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const sellHouseMutation = useMutation({
    mutationFn: houseService.sellHouse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-houses'] });
      queryClient.invalidateQueries({ queryKey: ['houses'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      const currencyText = data.currency === 'blackcoin' ? 'عملة سوداء' : 'نقود';
      toast.success(`تم بيع المنزل! حصلت على $${data.refund} ${currencyText}`);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const equipHouseMutation = useMutation({
    mutationFn: houseService.equipHouse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-houses'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'تم تجهيز المنزل بنجاح!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const unequipHouseMutation = useMutation({
    mutationFn: houseService.unequipHouse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owned-houses'] });
      queryClient.invalidateQueries({ queryKey: ['character'] });
      toast.success(data.message || 'تم إلغاء تجهيز المنزل بنجاح!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleBuyHouse = (houseId) => {
    buyHouseMutation.mutate(houseId);
  };

  const handleSellHouse = (houseId) => {
    if (window.confirm('هل أنت متأكد أنك تريد بيع هذا المنزل؟')) {
      sellHouseMutation.mutate(houseId);
    }
  };

  const handleEquipHouse = (houseId) => {
    equipHouseMutation.mutate(houseId);
  };

  const handleUnequipHouse = () => {
    unequipHouseMutation.mutate();
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

  const isEquipped = (houseId) => character?.equippedHouseId === houseId;

  const HouseCard = ({ house, type = 'owned', isHouseEquipped = false }) => {
    const isLoading = buyHouseMutation.isPending || sellHouseMutation.isPending || 
                     equipHouseMutation.isPending || unequipHouseMutation.isPending;

    return (
      <div className="card-3d p-4 hover:border-yellow-500/50 transition-all duration-300 group hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-950/30 to-amber-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg flex items-center justify-center shadow-lg">
                <Home className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm group-hover:text-yellow-300 transition-colors">{house.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              {isHouseEquipped && (
                <span className="bg-gradient-to-r from-green-600 to-green-700 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                  مجهز
                </span>
              )}
              <span className={`text-xs ${getRarityColor(house.rarity)} bg-black/40 px-2 py-1 rounded-full font-bold border border-current/30`}>
                {getRarityStars(house.rarity)}
              </span>
            </div>
          </div>

          <div className="relative w-full h-20 bg-gradient-to-br from-black/60 to-yellow-950/40 rounded-lg border border-yellow-500/20 overflow-hidden">
            {house.imageUrl ? (
              <img 
                src={house.imageUrl} 
                alt={house.name}
                className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center text-2xl ${house.imageUrl ? 'hidden' : 'flex'}`}>
              <Home className="w-8 h-8 text-yellow-400/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {house.defenseBonus > 0 && (
              <div className="card-3d bg-blue-950/20 border-blue-500/30 p-2 text-center">
                <Shield className="w-3 h-3 text-blue-400 mx-auto mb-1" />
                <div className="text-blue-400 font-bold">+{house.defenseBonus}</div>
                <div className="text-white/50">دفاع</div>
              </div>
            )}
            {house.hpBonus > 0 && (
              <div className="card-3d bg-green-950/20 border-green-500/30 p-2 text-center">
                <Heart className="w-3 h-3 text-green-400 mx-auto mb-1" />
                <div className="text-green-400 font-bold">+{house.hpBonus}</div>
                <div className="text-white/50">صحة</div>
              </div>
            )}
          </div>

          {type === 'market' && (
            <div className="card-3d bg-black/40 border-white/10 p-2 text-center">
              <div className="text-xs text-white/50 mb-1">السعر</div>
              <div className={`font-bold ${house.currency === 'blackcoin' ? 'text-blood-400' : 'text-green-400'} flex items-center justify-center gap-1`}>
                <span>{house.currency === 'blackcoin' ? '⚫' : '$'}</span>
                <span>{house.cost?.toLocaleString() || 'غير محدد'}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {type === 'owned' ? (
              <>
                {isHouseEquipped ? (
                  <button
                    onClick={handleUnequipHouse}
                    disabled={isLoading}
                    className="btn-3d-secondary flex-1 text-xs py-2 flex items-center justify-center gap-1 hover:border-yellow-500/50 disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                    إلغاء التجهيز
                  </button>
                ) : (
                  <button
                    onClick={() => handleEquipHouse(house.id)}
                    disabled={isLoading}
                    className="btn-3d flex-1 text-xs py-2 flex items-center justify-center gap-1 hover:border-green-500/50 disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" />
                    تجهيز
                  </button>
                )}
                <button
                  onClick={() => handleSellHouse(house.id)}
                  disabled={isLoading}
                  className="btn-3d-secondary flex-1 text-xs py-2 flex items-center justify-center gap-1 hover:border-red-500/50 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  بيع
                </button>
              </>
            ) : (
              <button
                onClick={() => handleBuyHouse(house.id)}
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
        
        {/* Enhanced Header */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-900 via-amber-800 to-yellow-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f59e0b\" fill-opacity=\"0.1\"%3E%3Crect x=\"20\" y=\"15\" width=\"20\" height=\"25\" rx=\"2\"/%3E%3Crect x=\"25\" y=\"20\" width=\"4\" height=\"6\" rx=\"1\"/%3E%3Crect x=\"31\" y=\"20\" width=\"4\" height=\"6\" rx=\"1\"/%3E%3Crect x=\"28\" y=\"30\" width=\"4\" height=\"8\" rx=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">المنازل</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">محفظة العقارات</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <Activity className="w-4 h-4 text-white/60" />
                <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg">{ownedHouses.length}</div>
                <div className="text-xs text-white/80 drop-shadow">منزل مملوك</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('owned')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'owned' 
                ? 'btn-3d border-yellow-500/50' 
                : 'btn-3d-secondary hover:border-yellow-500/30'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>منازلي ({ownedHouses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'market' 
                ? 'btn-3d border-yellow-500/50' 
                : 'btn-3d-secondary hover:border-yellow-500/30'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>سوق العقارات</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'owned' ? (
          <div>
            {loadingOwned ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
                  <p className="text-white">جاري تحميل منازلك...</p>
                </div>
              </div>
            ) : ownedHouses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ownedHouses.map((ownedHouse) => (
                  <HouseCard 
                    key={ownedHouse.id} 
                    house={ownedHouse.House || ownedHouse} 
                    type="owned" 
                    isHouseEquipped={isEquipped(ownedHouse.houseId)}
                  />
                ))}
              </div>
            ) : (
              <div className="card-3d p-8 text-center">
                <Home className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد منازل</h3>
                <p className="text-white/60">قم بزيارة سوق العقارات لشراء أول عقار لك</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {loadingHouses ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
                  <p className="text-white">جاري تحميل السوق...</p>
                </div>
              </div>
            ) : availableHouses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableHouses.map((house) => (
                  <HouseCard key={house.id} house={house} type="market" />
                ))}
              </div>
            ) : (
              <div className="card-3d p-8 text-center">
                <Home className="w-16 h-16 text-yellow-400/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد منازل متاحة</h3>
                <p className="text-white/60">تحقق مرة أخرى لاحقاً للحصول على عقارات جديدة</p>
              </div>
            )}
          </div>
        )}

        {/* Tips */}
        <div className="card-3d p-4 bg-gradient-to-r from-yellow-950/20 to-black/40 border-yellow-500/20">
          <h3 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            نصائح المنازل
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Award className="w-3 h-3 text-yellow-400" />
              <span>المنازل تزيد من الدفاع والصحة</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-green-400" />
              <span>جهز منزل واحد فقط في كل مرة</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="w-3 h-3 text-blue-400" />
              <span>يمكنك تغيير المنزل المجهز في أي وقت</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-3 h-3 text-purple-400" />
              <span>المنازل النادرة لها مكافآت أفضل</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Houses;
