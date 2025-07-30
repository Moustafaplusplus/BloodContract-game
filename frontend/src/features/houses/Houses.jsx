import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';
import { extractErrorMessage } from '@/utils/errorHandler';
import { 
  Home, 
  Shield, 
  Heart, 
  DollarSign, 
  Star,
  ImageIcon,
  ShoppingCart,
  Settings,
  Trash2
} from 'lucide-react';
import { handleImageError } from '@/utils/imageUtils';

const TABS = [
  { key: 'owned', label: 'منازلك' },
  { key: 'market', label: 'سوق العقارات' },
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

function HouseCard({ house, isOwned = false, isEquipped = false, onBuy, onEquip, onUnequip, onSell, buying, equipping, unequipping, selling }) {
  const rarity = house.rarity?.toLowerCase() || 'common';
  
  return (
    <div className={`relative bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border rounded-xl p-4 space-y-3 hover:bg-hitman-700/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-red/20 ${
      isEquipped ? 'border-accent-red shadow-lg shadow-accent-red/30' : 
      isOwned ? 'border-hitman-700 opacity-60' : 'border-hitman-700'
    }`}>
      {/* Equipped Badge */}
      {isEquipped && (
        <span className="absolute top-2 right-2 bg-accent-red text-white text-xs px-2 py-1 rounded font-bold z-10">
          المنزل الحالي
        </span>
      )}

      {/* House Image */}
      <div className="relative w-full h-24 bg-gradient-to-br from-hitman-700 to-hitman-800 rounded-lg flex items-center justify-center border border-hitman-600">
        {house.imageUrl ? (
          <img 
            src={house.imageUrl} 
            alt={house.name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => handleImageError(e, house.imageUrl)}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${house.imageUrl ? 'hidden' : 'flex'}`}>
          <Home className="w-8 h-8 text-hitman-400" />
        </div>
      </div>

      {/* House Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white text-sm truncate">{house.name}</h4>
          <span className={`text-xs ${rarityColors[rarity]}`}>
            {rarityIcons[rarity]}
          </span>
        </div>

        {/* House Stats */}
        <div className="space-y-1 text-xs">
          {house.defenseBonus > 0 && (
            <div className="flex items-center text-blue-400">
              <Shield className="w-3 h-3 mr-1" />
              <span>دفاع: +{house.defenseBonus}</span>
            </div>
          )}
          {house.hpBonus > 0 && (
            <div className="flex items-center text-green-400">
              <Heart className="w-3 h-3 mr-1" />
              <span>صحة: +{house.hpBonus}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center text-accent-green font-bold text-sm">
          {house.currency === 'blackcoin' ? (
            <>
              <span className="inline-block w-4 h-4 rounded-full bg-black border border-accent-red flex items-center justify-center mr-1">
                <span className="text-xs text-accent-red font-bold">ع</span>
              </span>
              <span className="text-accent-red">{house.cost?.toLocaleString()}</span>
            </>
          ) : (
            <>
              <DollarSign className="w-3 h-3 mr-1" />
              <span>{house.cost?.toLocaleString()}</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {!isOwned ? (
          <button
            onClick={() => onBuy(house.id)}
            disabled={buying === house.id}
            className="w-full bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xs px-3 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center hover:scale-105 disabled:opacity-60"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            {buying === house.id ? '...جاري الشراء' : 'شراء'}
          </button>
        ) : (
          <div className="flex space-x-2 rtl:space-x-reverse">
            {isEquipped ? (
              <button
                onClick={() => onUnequip()}
                disabled={unequipping}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white text-xs px-2 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-60"
              >
                <Settings className="w-3 h-3 mr-1" />
                {unequipping ? '...جاري الإلغاء' : 'إلغاء التفعيل'}
              </button>
            ) : (
              <button
                onClick={() => onEquip(house.id)}
                disabled={equipping === house.id}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-60"
              >
                <Settings className="w-3 h-3 mr-1" />
                {equipping === house.id ? '...جاري التفعيل' : 'تفعيل'}
              </button>
            )}
            <button
              onClick={() => onSell(house.id)}
              disabled={selling === house.id}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-2 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center border border-accent-red disabled:opacity-60"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              {selling === house.id ? '...جاري البيع' : 'بيع'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Houses() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('owned');
  const [equipping, setEquipping] = useState(null);
  const [selling, setSelling] = useState(null);
  const [buying, setBuying] = useState(null);
  const [unequipping, setUnequipping] = useState(null);

  // Fetch all available houses (market) - only regular money houses
  const {
    data: houses = [],
    isLoading: housesLoading,
    error: housesError
  } = useQuery({
    queryKey: ['houses'],
    queryFn: () => axios.get('/api/houses').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all owned houses
  const {
    data: ownedHouses = [],
    isLoading: ownedLoading,
    error: ownedError
  } = useQuery({
    queryKey: ['owned-houses'],
    queryFn: () => axios.get('/api/houses/owned').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch character (to get equippedHouseId)
  const {
    data: character,
    isLoading: charLoading,
    error: charError
  } = useQuery({
    queryKey: ['character'],
    queryFn: () => axios.get('/api/character').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  // Equip house mutation
  const equipMutation = useMutation({
    mutationFn: (houseId) => axios.post('/api/houses/equip', { houseId }).then(res => res.data),
    onMutate: (houseId) => setEquipping(houseId),
    onSettled: () => setEquipping(null),
    onSuccess: () => {
      toast.success('تم اختيار المنزل!');
      queryClient.invalidateQueries(['character']);
      queryClient.invalidateQueries(['owned-houses']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Unequip house mutation
  const unequipMutation = useMutation({
    mutationFn: () => axios.post('/api/houses/unequip').then(res => res.data),
    onMutate: () => setUnequipping(true),
    onSettled: () => setUnequipping(null),
    onSuccess: () => {
      toast.success('تم إلغاء تفعيل المنزل!');
      queryClient.invalidateQueries(['character']);
      queryClient.invalidateQueries(['owned-houses']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Sell house mutation
  const sellMutation = useMutation({
    mutationFn: (houseId) => axios.post('/api/houses/sell', { houseId }).then(res => res.data),
    onMutate: (houseId) => setSelling(houseId),
    onSettled: () => setSelling(null),
    onSuccess: (data) => {
      const currencyText = data.currency === 'blackcoin' ? 'عملة سوداء' : 'نقود';
      toast.success(`تم بيع المنزل! حصلت على ${data.refund} ${currencyText}`);
      queryClient.invalidateQueries(['owned-houses']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Buy house mutation
  const buyMutation = useMutation({
    mutationFn: (houseId) => axios.post('/api/houses/buy', { houseId }).then(res => res.data),
    onMutate: (houseId) => setBuying(houseId),
    onSettled: () => setBuying(null),
    onSuccess: () => {
      toast.success('تم شراء المنزل!');
      queryClient.invalidateQueries(['owned-houses']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  if (housesLoading || ownedLoading || charLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner"></div>
            <Home className="w-8 h-8 text-accent-red absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-lg font-medium animate-pulse">
            جاري تحميل المنازل...
          </p>
        </div>
      </div>
    );
  }
  
  if (housesError || ownedError || charError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 text-lg">خطأ في تحميل بيانات المنازل</p>
        </div>
      </div>
    );
  }

  // Helper: is house equipped
  const isEquipped = (houseId) => character?.equippedHouseId === houseId;
  // Helper: is house owned
  const isOwned = (houseId) => ownedHouses.some((uh) => uh.houseId === houseId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      {/* Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 flex items-center justify-center bg-gradient-to-br from-accent-red/40 to-black/60 border-2 border-accent-red animate-fade-in">
        <div className="relative z-10 text-center">
          <Home className="w-16 h-16 mx-auto text-accent-red mb-2 animate-bounce" />
          <h1 className="text-4xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">المنازل</h1>
          <p className="text-hitman-300 text-lg">اختر منزلك وارتقِ بحياتك</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                tab === t.key
                  ? 'bg-gradient-to-r from-accent-red to-red-700 text-white shadow-lg shadow-accent-red/30'
                  : 'bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 text-hitman-300 hover:bg-hitman-700/50 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5 mr-2" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Houses Grid */}
      <div className="max-w-7xl mx-auto">
        {tab === 'owned' && (
          <div>
            <h2 className="text-xl font-bold text-accent-red mb-6 text-center">منازلك</h2>
            {ownedHouses.length === 0 ? (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-hitman-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-hitman-400 mb-2">لا تملك أي منزل بعد</h3>
                <p className="text-hitman-500">اذهب إلى سوق العقارات لشراء أول منزل لك</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {ownedHouses.map(({ House: houseData, houseId, id }) => (
                  <HouseCard
                    key={id}
                    house={houseData}
                    isOwned={true}
                    isEquipped={isEquipped(houseId)}
                    onEquip={equipMutation.mutate}
                    onUnequip={unequipMutation.mutate}
                    onSell={sellMutation.mutate}
                    equipping={equipping}
                    unequipping={unequipping}
                    selling={selling}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'market' && (
          <div>
            <h2 className="text-xl font-bold text-accent-red mb-6 text-center">سوق العقارات</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {houses.map((house) => (
                <HouseCard
                  key={house.id}
                  house={house}
                  isOwned={isOwned(house.id)}
                  isEquipped={isEquipped(house.id)}
                  onBuy={buyMutation.mutate}
                  onUnequip={unequipMutation.mutate}
                  buying={buying}
                  unequipping={unequipping}
                />
              ))}
            </div>
            {houses.length === 0 && (
              <div className="text-center py-12">
                <Home className="w-16 h-16 text-hitman-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-hitman-400 mb-2">لا توجد منازل متاحة</h3>
                <p className="text-hitman-500">لا توجد منازل في السوق حالياً</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 