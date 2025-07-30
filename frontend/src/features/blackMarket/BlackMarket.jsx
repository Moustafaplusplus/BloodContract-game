import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { extractErrorMessage } from '@/utils/errorHandler';
import { 
  ShoppingBag, 
  Sword, 
  Shield, 
  Zap, 
  Heart, 
  DollarSign, 
  Star,
  ImageIcon,
  ShoppingCart,
  Settings,
  Trash2,
  Package,
  TrendingUp,
  Clock
} from 'lucide-react';
import { handleImageError } from '@/utils/imageUtils';
import { useHud } from '@/hooks/useHud';
import { useSocket } from '@/hooks/useSocket';

const TABS = [
  { key: 'available', label: 'السوق السوداء' },
  { key: 'my', label: 'إعلاناتي' },
];

// Rarity colors
const rarityColors = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legend: 'text-yellow-400'
};

// Rarity icons
const rarityIcons = {
  common: '⭐',
  uncommon: '⭐⭐',
  rare: '⭐⭐⭐',
  epic: '⭐⭐⭐⭐',
  legend: '⭐⭐⭐⭐⭐'
};

function Stat({ icon: Icon, color, value, label }) {
  return (
    <div className="flex items-center gap-1 text-xs font-bold">
      {Icon && <Icon className={`w-3 h-3 ${color}`} />}
      <span className={color}>{value}</span>
      <span className="text-hitman-300 font-normal text-xs">{label}</span>
    </div>
  );
}

function BlackMarketItemCard({ item, isOwned = false, onBuy, onPost, onCancel, buying, posting, canceling }) {
  const rarity = item.rarity?.toLowerCase() || 'common';
  
  return (
    <div className={`relative bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border rounded-xl p-4 space-y-3 hover:bg-hitman-700/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-red/20 ${
      isOwned ? 'border-hitman-700 opacity-60' : 'border-hitman-700'
    }`}>
      {/* Item Image */}
      <div className="relative w-full h-24 bg-gradient-to-br from-hitman-700 to-hitman-800 rounded-lg flex items-center justify-center border border-hitman-600">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => handleImageError(e, item.imageUrl)}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${item.imageUrl ? 'hidden' : 'flex'}`}>
          <Package className="w-8 h-8 text-hitman-400" />
        </div>
      </div>

      {/* Item Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white text-sm truncate">{item.name}</h4>
          <span className={`text-xs ${rarityColors[rarity]}`}>
            {rarityIcons[rarity]}
          </span>
        </div>

        {/* Item Stats */}
        <div className="space-y-1 text-xs">
          {item.stats?.damage !== undefined && item.stats.damage !== null && (
            <div className="flex items-center text-red-400">
              <Sword className="w-3 h-3 mr-1" />
              <span>ضرر: {item.stats.damage}</span>
            </div>
          )}
          {item.stats?.def !== undefined && item.stats.def !== null && (
            <div className="flex items-center text-blue-400">
              <Shield className="w-3 h-3 mr-1" />
              <span>دفاع: {item.stats.def}</span>
            </div>
          )}
          {item.stats?.energyBonus !== undefined && item.stats.energyBonus !== null && item.stats.energyBonus !== 0 && (
            <div className="flex items-center text-yellow-400">
              <Zap className="w-3 h-3 mr-1" />
              <span>طاقة: +{item.stats.energyBonus}</span>
            </div>
          )}
          {item.stats?.hpBonus !== undefined && item.stats.hpBonus !== null && item.stats.hpBonus !== 0 && (
            <div className="flex items-center text-green-400">
              <Heart className="w-3 h-3 mr-1" />
              <span>صحة: +{item.stats.hpBonus}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-accent-green font-bold text-sm">
            <DollarSign className="w-4 h-4 mr-1" />
            <span>{item.price?.toLocaleString()}</span>
          </div>
          {item.quantity && (
            <div className="flex items-center text-hitman-400 text-xs">
              <Package className="w-3 h-3 mr-1" />
              <span>{item.quantity}</span>
            </div>
          )}
        </div>

        {/* Seller Info */}
        {item.seller && (
          <div className="flex items-center text-hitman-400 text-xs">
            <span>البائع: {item.seller.name}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onBuy && (
            <button
              onClick={onBuy}
              disabled={buying}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                buying 
                  ? 'bg-hitman-700 text-hitman-400 cursor-not-allowed' 
                  : 'bg-accent-red hover:bg-red-700 text-white'
              }`}
            >
              {buying ? 'جاري الشراء...' : 'شراء'}
            </button>
          )}
          {onPost && (
            <button
              onClick={onPost}
              disabled={posting}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                posting 
                  ? 'bg-hitman-700 text-hitman-400 cursor-not-allowed' 
                  : 'bg-accent-green hover:bg-green-700 text-white'
              }`}
            >
              {posting ? 'جاري النشر...' : 'نشر إعلان'}
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={canceling}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                canceling 
                  ? 'bg-hitman-700 text-hitman-400 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {canceling ? 'جاري الإلغاء...' : 'إلغاء'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BlackMarket() {
  const { stats, invalidateHud } = useHud();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('available');
  const [selectedItem, setSelectedItem] = useState(null);
  const [adPrice, setAdPrice] = useState('');

  // Fetch available listings (user-to-user)
  const { data: availableListings, isLoading: loadingAvailable, error: errorAvailable } = useQuery({
    queryKey: ['blackMarket', 'listings'],
    queryFn: () => axios.get('/api/black-market/listings').then(res => res.data),
  });

  // Fetch my listings
  const { data: myListings, isLoading: loadingMyListings, error: errorMyListings } = useQuery({
    queryKey: ['blackMarket', 'my'],
    queryFn: () => axios.get('/api/black-market/listings/my').then(res => res.data),
    enabled: tab === 'my',
  });

  // Fetch inventory for posting ads
  const { data: inventory, isLoading: loadingInventory, error: errorInventory } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => axios.get('/api/inventory').then(res => res.data),
    enabled: tab === 'my',
  });

  // Buy listing mutation
  const buyListingMutation = useMutation({
    mutationFn: ({ listingId }) => 
      axios.post('/api/black-market/listings/buy', { listingId }),
    onSuccess: (data) => {
      toast.success('تم شراء العنصر بنجاح!');
      invalidateHud?.();
      queryClient.invalidateQueries(['blackMarket']);
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });

  // Post listing mutation
  const postListingMutation = useMutation({
    mutationFn: ({ itemType, itemId, price, quantity = 1 }) => 
      axios.post('/api/black-market/listings', { itemType, itemId, price, quantity }),
    onSuccess: (data) => {
      toast.success('تم نشر الإعلان بنجاح!');
      setSelectedItem(null);
      setAdPrice('');
      queryClient.invalidateQueries(['blackMarket']);
      queryClient.invalidateQueries(['inventory']);
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });

  // Cancel listing mutation
  const cancelListingMutation = useMutation({
    mutationFn: ({ listingId }) => 
      axios.post('/api/black-market/listings/cancel', { listingId }),
    onSuccess: (data) => {
      toast.success('تم إلغاء الإعلان واستعادة العنصر!');
      queryClient.invalidateQueries(['blackMarket']);
      queryClient.invalidateQueries(['inventory']);
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
    },
  });

  // Real-time updates
  React.useEffect(() => {
    if (!socket) return;
    const refetchHud = () => invalidateHud?.();
    socket.on('hud:update', refetchHud);
    const pollInterval = setInterval(refetchHud, 10000);
    return () => {
      socket.off('hud:update', refetchHud);
      clearInterval(pollInterval);
    };
  }, [socket, invalidateHud]);

  const handleBuyListing = (listing) => {
    buyListingMutation.mutate({ listingId: listing.id });
  };

  const handlePostListing = (item) => {
    if (!adPrice || isNaN(adPrice) || Number(adPrice) < 1) {
      toast.error('يرجى تحديد سعر صحيح');
      return;
    }
    postListingMutation.mutate({
      itemType: item.type,
      itemId: item.itemId,
      price: Number(adPrice),
      quantity: 1,
    });
  };

  const handleCancelListing = (listing) => {
    cancelListingMutation.mutate({ listingId: listing.id });
  };

  const availableInventory = inventory?.items?.filter(item => !item.equipped && item.quantity > 0) || [];

  return (
    <div className="min-h-screen bg-black text-white p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
            🖤 السوق السوداء
          </h1>
          <p className="text-zinc-400 text-lg">تداول العناصر مع اللاعبين الآخرين</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                tab === t.key
                  ? 'bg-accent-red text-white shadow-lg shadow-accent-red/30'
                  : 'bg-hitman-800 text-hitman-300 hover:text-white hover:bg-hitman-700'
              }`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'available' && (
          <div>
            {loadingAvailable && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red"></div>
                <span className="mr-4 text-hitman-300">جاري تحميل السوق...</span>
              </div>
            )}
            
            {errorAvailable && (
              <div className="text-center py-12">
                <div className="bg-red-950/50 border border-red-700/50 rounded-lg p-6">
                  <p className="text-red-400 text-lg mb-2">⚠️ فشل في تحميل السوق</p>
                  <p className="text-zinc-400 text-sm">{extractErrorMessage(errorAvailable)}</p>
                </div>
              </div>
            )}

            {!loadingAvailable && !errorAvailable && (!availableListings || availableListings.length === 0) && (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-hitman-600 mx-auto mb-4" />
                <p className="text-hitman-400 text-lg">لا توجد إعلانات متاحة في السوق حالياً</p>
              </div>
            )}

            {!loadingAvailable && !errorAvailable && availableListings && availableListings.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {availableListings.map((listing) => (
                  <BlackMarketItemCard
                    key={listing.id}
                    item={listing}
                    onBuy={() => handleBuyListing(listing)}
                    buying={buyListingMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'my' && (
          <div className="space-y-8">
            {/* My Listings */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 ml-3 text-accent-red" />
                إعلاناتي النشطة
              </h2>
              
              {loadingMyListings && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red"></div>
                  <span className="mr-4 text-hitman-300">جاري تحميل إعلاناتك...</span>
                </div>
              )}

              {errorMyListings && (
                <div className="text-center py-12">
                  <div className="bg-red-950/50 border border-red-700/50 rounded-lg p-6">
                    <p className="text-red-400 text-lg mb-2">⚠️ فشل في تحميل إعلاناتك</p>
                    <p className="text-zinc-400 text-sm">{extractErrorMessage(errorMyListings)}</p>
                  </div>
                </div>
              )}

              {!loadingMyListings && !errorMyListings && (!myListings || myListings.length === 0) && (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-hitman-600 mx-auto mb-4" />
                  <p className="text-hitman-400 text-lg">لا توجد إعلانات نشطة</p>
                </div>
              )}

              {!loadingMyListings && !errorMyListings && myListings && myListings.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {myListings.filter(item => item.status === 'active').map((item) => (
                    <BlackMarketItemCard
                      key={item.id}
                      item={item}
                      isOwned={true}
                      onCancel={() => handleCancelListing(item)}
                      canceling={cancelListingMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Post New Ad */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Package className="w-6 h-6 ml-3 text-accent-green" />
                نشر إعلان جديد
              </h2>

              {loadingInventory && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-red"></div>
                  <span className="mr-4 text-hitman-300">جاري تحميل الجرد...</span>
                </div>
              )}

              {errorInventory && (
                <div className="text-center py-12">
                  <div className="bg-red-950/50 border border-red-700/50 rounded-lg p-6">
                    <p className="text-red-400 text-lg mb-2">⚠️ فشل في تحميل الجرد</p>
                    <p className="text-zinc-400 text-sm">{extractErrorMessage(errorInventory)}</p>
                  </div>
                </div>
              )}

              {!loadingInventory && !errorInventory && availableInventory.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-hitman-600 mx-auto mb-4" />
                  <p className="text-hitman-400 text-lg">لا توجد عناصر متاحة للنشر</p>
                </div>
              )}

              {!loadingInventory && !errorInventory && availableInventory.length > 0 && (
                <div>
                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8">
                    {availableInventory.map((item, idx) => (
                      <BlackMarketItemCard
                        key={`${item.type}-${item.itemId}-${idx}`}
                        item={item}
                        onPost={() => setSelectedItem(item)}
                        posting={postListingMutation.isPending}
                      />
                    ))}
                  </div>

                  {selectedItem && (
                    <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-xl p-6 max-w-md mx-auto">
                      <h3 className="text-lg font-bold mb-4 text-center">نشر إعلان لـ {selectedItem.name}</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">السعر:</label>
                          <input
                            type="number"
                            min="1"
                            className="w-full p-3 rounded-lg bg-hitman-700 text-white border border-hitman-600 focus:border-accent-red focus:outline-none"
                            value={adPrice}
                            onChange={(e) => setAdPrice(e.target.value)}
                            placeholder="حدد السعر"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handlePostListing(selectedItem)}
                            disabled={postListingMutation.isPending}
                            className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all ${
                              postListingMutation.isPending 
                                ? 'bg-hitman-700 text-hitman-400 cursor-not-allowed' 
                                : 'bg-accent-green hover:bg-green-700 text-white'
                            }`}
                          >
                            {postListingMutation.isPending ? 'جاري النشر...' : 'نشر الإعلان'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(null);
                              setAdPrice('');
                            }}
                            className="flex-1 py-3 px-4 rounded-lg font-bold bg-hitman-700 hover:bg-hitman-600 text-white transition-all"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
