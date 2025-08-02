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
  Clock,
  Loader,
  Search,
  Eye,
  X,
  CheckCircle
} from 'lucide-react';
import { handleImageError } from '@/utils/imageUtils';
import { useHud } from '@/hooks/useHud';
import { useSocket } from '@/hooks/useSocket';

const TABS = [
  { key: 'available', label: 'السوق السوداء', icon: ShoppingBag },
  { key: 'my', label: 'إعلاناتي', icon: TrendingUp },
];

// Rarity colors with blood theme
const rarityColors = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legend: 'text-yellow-400'
};

// Rarity background colors
const rarityBgs = {
  common: 'bg-gray-900/20 border-gray-500/20',
  uncommon: 'bg-green-900/20 border-green-500/20',
  rare: 'bg-blue-900/20 border-blue-500/20',
  epic: 'bg-purple-900/20 border-purple-500/20',
  legend: 'bg-yellow-900/20 border-yellow-500/20'
};

function BlackMarketItemCard({ item, isOwned = false, onBuy, onPost, onCancel, buying, posting, canceling }) {
  const rarity = item.rarity?.toLowerCase() || 'common';
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="bg-black/80 border border-blood-500/20 rounded-xl p-4 backdrop-blur-sm hover:border-blood-500/40 transition-all duration-300 hover:scale-[1.02]">
      {/* Item Header with Background */}
      <div className="relative h-16 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg mb-3 overflow-hidden">
        {/* Background Pattern */}
        <div className={`absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23${rarity === 'legend' ? 'fbbf24' : rarity === 'epic' ? 'a855f7' : rarity === 'rare' ? '3b82f6' : rarity === 'uncommon' ? '10b981' : '6b7280'}\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"10\" cy=\"10\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40`}></div>
        
        {/* Image or Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          {item.imageUrl && !imageError ? (
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <Package className="w-6 h-6 text-white/60" />
          )}
        </div>
        
        {/* Rarity Badge */}
        <div className="absolute top-1 right-1">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${rarityBgs[rarity]} ${rarityColors[rarity]}`}>
            {rarity.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Item Info */}
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold text-white text-sm mb-1 line-clamp-1">{item.name}</h4>
          {item.seller && (
            <div className="text-xs text-blood-300">البائع: {item.seller.name}</div>
          )}
        </div>

        {/* Item Stats */}
        {(item.stats?.damage || item.stats?.def || item.stats?.energyBonus || item.stats?.hpBonus) && (
          <div className="grid grid-cols-2 gap-1 text-xs">
            {item.stats?.damage > 0 && (
              <div className="flex items-center space-x-1 text-red-400">
                <Sword className="w-3 h-3" />
                <span>{item.stats.damage}</span>
              </div>
            )}
            {item.stats?.def > 0 && (
              <div className="flex items-center space-x-1 text-blue-400">
                <Shield className="w-3 h-3" />
                <span>{item.stats.def}</span>
              </div>
            )}
            {item.stats?.energyBonus > 0 && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <Zap className="w-3 h-3" />
                <span>+{item.stats.energyBonus}</span>
              </div>
            )}
            {item.stats?.hpBonus > 0 && (
              <div className="flex items-center space-x-1 text-green-400">
                <Heart className="w-3 h-3" />
                <span>+{item.stats.hpBonus}</span>
              </div>
            )}
          </div>
        )}

        {/* Price and Quantity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-green-400 font-bold">
            <DollarSign className="w-4 h-4" />
            <span>${item.price?.toLocaleString()}</span>
          </div>
          {item.quantity && (
            <div className="flex items-center space-x-1 text-blood-300 text-xs">
              <Package className="w-3 h-3" />
              <span>{item.quantity}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onBuy && (
            <button
              onClick={onBuy}
              disabled={buying}
              className="flex-1 bg-gradient-to-r from-blood-600 to-blood-700 hover:from-blood-700 hover:to-blood-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none text-xs flex items-center justify-center space-x-2"
            >
              {buying ? (
                <>
                  <Loader className="w-3 h-3 animate-spin" />
                  <span>جاري الشراء...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3" />
                  <span>شراء</span>
                </>
              )}
            </button>
          )}
          {onPost && (
            <button
              onClick={onPost}
              disabled={posting}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none text-xs flex items-center justify-center space-x-2"
            >
              {posting ? (
                <>
                  <Loader className="w-3 h-3 animate-spin" />
                  <span>جاري النشر...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>نشر إعلان</span>
                </>
              )}
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              disabled={canceling}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-2 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none text-xs flex items-center justify-center space-x-2"
            >
              {canceling ? (
                <>
                  <Loader className="w-3 h-3 animate-spin" />
                  <span>جاري الإلغاء...</span>
                </>
              ) : (
                <>
                  <X className="w-3 h-3" />
                  <span>إلغاء</span>
                </>
              )}
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
    <div className="min-h-screen bg-gradient-to-br from-black via-blood-900 to-blood-800 p-2 sm:p-4 space-y-4">
      
      {/* Black Market Header Banner with Background Image */}
      <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
        {/* Background Image Placeholder with 3 Circles Logo */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
          <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%236b7280\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3Ccircle cx=\"20\" cy=\"30\" r=\"3\"/%3E%3Ccircle cx=\"40\" cy=\"30\" r=\"3\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
        </div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">السوق السوداء</h1>
              <p className="text-xs sm:text-sm text-white/80 drop-shadow">تداول العناصر مع اللاعبين الآخرين</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-white">
            <div className="hidden sm:flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-white/60" />
              <Search className="w-4 h-4 text-gray-400 animate-pulse" />
            </div>
            <div className="text-right">
              <div className="text-lg sm:text-xl font-bold drop-shadow-lg">{availableListings?.length || 0}</div>
              <div className="text-xs text-white/80 drop-shadow">Items</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.key}
              className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center space-x-2 transition-all duration-300 ${
                tab === t.key 
                  ? 'bg-blood-600 border border-blood-500 text-white' 
                  : 'bg-black/60 border border-blood-500/20 text-blood-300 hover:border-blood-500/40'
              }`}
              onClick={() => setTab(t.key)}
            >
              <TabIcon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {tab === 'available' && (
        <div>
          {loadingAvailable && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blood-500/30 border-t-blood-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">جاري تحميل السوق...</p>
            </div>
          )}
          
          {errorAvailable && (
            <div className="text-center py-12">
              <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-red-400 text-lg mb-2">فشل في تحميل السوق</p>
                <p className="text-blood-300 text-sm">{extractErrorMessage(errorAvailable)}</p>
              </div>
            </div>
          )}

          {!loadingAvailable && !errorAvailable && (!availableListings || availableListings.length === 0) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blood-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-blood-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">السوق فارغ</h3>
              <p className="text-blood-300">لا توجد إعلانات متاحة في السوق حالياً</p>
            </div>
          )}

          {!loadingAvailable && !errorAvailable && availableListings && availableListings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        <div className="space-y-6">
          {/* My Listings */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blood-400" />
              <h2 className="text-lg font-bold text-white">إعلاناتي النشطة</h2>
            </div>
            
            {loadingMyListings && (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blood-500/30 border-t-blood-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">جاري تحميل إعلاناتك...</p>
              </div>
            )}

            {!loadingMyListings && !errorMyListings && (!myListings || myListings.length === 0) && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blood-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-blood-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">لا توجد إعلانات</h3>
                <p className="text-blood-300">لا توجد إعلانات نشطة</p>
              </div>
            )}

            {!loadingMyListings && !errorMyListings && myListings && myListings.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className="flex items-center space-x-2 mb-4">
              <Package className="w-5 h-5 text-green-400" />
              <h2 className="text-lg font-bold text-white">نشر إعلان جديد</h2>
            </div>

            {loadingInventory && (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-blood-500/30 border-t-blood-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">جاري تحميل الجرد...</p>
              </div>
            )}

            {!loadingInventory && !errorInventory && availableInventory.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blood-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-blood-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">لا توجد عناصر</h3>
                <p className="text-blood-300">لا توجد عناصر متاحة للنشر</p>
              </div>
            )}

            {!loadingInventory && !errorInventory && availableInventory.length > 0 && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
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
                  <div className="bg-black/80 border border-blood-500/20 rounded-xl p-6 max-w-md mx-auto backdrop-blur-sm">
                    <h3 className="text-lg font-bold mb-4 text-center text-white">نشر إعلان لـ {selectedItem.name}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-blood-300">السعر:</label>
                        <input
                          type="number"
                          min="1"
                          className="w-full p-3 rounded-lg bg-black/60 border border-blood-500/30 text-white placeholder-blood-300 focus:outline-none focus:border-blood-500 focus:ring-1 focus:ring-blood-500 transition-all duration-300"
                          value={adPrice}
                          onChange={(e) => setAdPrice(e.target.value)}
                          placeholder="حدد السعر"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handlePostListing(selectedItem)}
                          disabled={postListingMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2"
                        >
                          {postListingMutation.isPending ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              <span>جاري النشر...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>نشر الإعلان</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(null);
                            setAdPrice('');
                          }}
                          className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>إلغاء</span>
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
  );
}
