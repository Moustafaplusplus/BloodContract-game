import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';
import { extractErrorMessage } from '@/utils/errorHandler';
import { 
  Dog, 
  Sword, 
  DollarSign, 
  Star,
  ImageIcon,
  ShoppingCart,
  Settings,
  Trash2
} from 'lucide-react';
import { handleImageError } from '@/utils/imageUtils';

const TABS = [
  { key: 'owned', label: 'كلابك' },
  { key: 'market', label: 'سوق الكلاب' },
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

function DogCard({ dog, isOwned = false, isActive = false, onBuy, onEquip, onUnequip, onSell, buying, equipping, unequipping, selling }) {
  const rarity = dog.rarity?.toLowerCase() || 'common';
  
  return (
    <div className={`relative bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border rounded-xl p-4 space-y-3 hover:bg-hitman-700/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-red/20 ${
      isActive ? 'border-accent-red shadow-lg shadow-accent-red/30' : 
      isOwned ? 'border-hitman-700 opacity-60' : 'border-hitman-700'
    }`}>
      {/* Active Badge */}
      {isActive && (
        <span className="absolute top-2 right-2 bg-accent-red text-white text-xs px-2 py-1 rounded font-bold z-10">
          الكلب الحالي
        </span>
      )}

      {/* Dog Image */}
      <div className="relative w-full h-24 bg-gradient-to-br from-hitman-700 to-hitman-800 rounded-lg flex items-center justify-center border border-hitman-600">
        {dog.imageUrl ? (
          <img 
            src={dog.imageUrl} 
            alt={dog.name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => handleImageError(e, dog.imageUrl)}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${dog.imageUrl ? 'hidden' : 'flex'}`}>
          <Dog className="w-8 h-8 text-hitman-400" />
        </div>
      </div>

      {/* Dog Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white text-sm truncate">{dog.name}</h4>
          <span className={`text-xs ${rarityColors[rarity]}`}>
            {rarityIcons[rarity]}
          </span>
        </div>

        {/* Dog Stats */}
        <div className="space-y-1 text-xs">
          {dog.powerBonus > 0 && (
            <div className="flex items-center text-red-400">
              <Sword className="w-3 h-3 mr-1" />
              <span>قوة الهجوم: +{dog.powerBonus}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center text-accent-green font-bold text-sm">
          {dog.currency === 'blackcoin' ? (
            <>
              <span className="inline-block w-4 h-4 rounded-full bg-black border border-accent-red flex items-center justify-center mr-1">
                <span className="text-xs text-accent-red font-bold">ع</span>
              </span>
              <span className="text-accent-red">{dog.cost?.toLocaleString()}</span>
            </>
          ) : (
            <>
              <DollarSign className="w-3 h-3 mr-1" />
              <span>{dog.cost?.toLocaleString()}</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {!isOwned ? (
          <button
            onClick={() => onBuy(dog.id)}
            disabled={buying === dog.id}
            className="w-full bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xs px-3 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center hover:scale-105 disabled:opacity-60"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            {buying === dog.id ? '...جاري الشراء' : 'شراء'}
          </button>
        ) : (
          <div className="flex space-x-2 rtl:space-x-reverse">
            {isActive ? (
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
                onClick={() => onEquip(dog.id)}
                disabled={equipping === dog.id}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-60"
              >
                <Settings className="w-3 h-3 mr-1" />
                {equipping === dog.id ? '...جاري التفعيل' : 'تفعيل'}
              </button>
            )}
            <button
              onClick={() => onSell(dog.id)}
              disabled={selling === dog.id}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-2 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center border border-accent-red disabled:opacity-60"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              {selling === dog.id ? '...جاري البيع' : 'بيع'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dogs() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('owned');
  const [activating, setActivating] = useState(null);
  const [selling, setSelling] = useState(null);
  const [buying, setBuying] = useState(null);
  const [unequipping, setUnequipping] = useState(null);

  // Fetch all available dogs (market) - only regular money dogs
  const {
    data: dogs = [],
    isLoading: dogsLoading,
    error: dogsError
  } = useQuery({
    queryKey: ['dogs'],
    queryFn: () => axios.get('/api/dogs').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all owned dogs
  const {
    data: ownedDogs = [],
    isLoading: ownedLoading,
    error: ownedError
  } = useQuery({
    queryKey: ['owned-dogs'],
    queryFn: () => axios.get('/api/dogs/user').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch character (to get active dog)
  const {
    data: character,
    isLoading: charLoading,
    error: charError
  } = useQuery({
    queryKey: ['character'],
    queryFn: () => axios.get('/api/character').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  // Activate dog mutation (equip)
  const activateMutation = useMutation({
    mutationFn: (dogId) => axios.post('/api/dogs/activate', { dogId }).then(res => res.data),
    onMutate: (dogId) => setActivating(dogId),
    onSettled: () => setActivating(null),
    onSuccess: () => {
      toast.success('تم تفعيل الكلب!');
      queryClient.invalidateQueries(['character']);
      queryClient.invalidateQueries(['owned-dogs']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Deactivate dog mutation (unequip)
  const deactivateMutation = useMutation({
    mutationFn: () => axios.post('/api/dogs/deactivate').then(res => res.data),
    onMutate: () => setUnequipping(true),
    onSettled: () => setUnequipping(null),
    onSuccess: () => {
      toast.success('تم إلغاء تفعيل الكلب!');
      queryClient.invalidateQueries(['character']);
      queryClient.invalidateQueries(['owned-dogs']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Sell dog mutation
  const sellMutation = useMutation({
    mutationFn: (dogId) => axios.post('/api/dogs/sell', { dogId }).then(res => res.data),
    onMutate: (dogId) => setSelling(dogId),
    onSettled: () => setSelling(null),
    onSuccess: (data) => {
      const currencyText = data.currency === 'blackcoin' ? 'عملة سوداء' : 'نقود';
      toast.success(`تم بيع الكلب! حصلت على ${data.refund} ${currencyText}`);
      queryClient.invalidateQueries(['owned-dogs']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Buy dog mutation
  const buyMutation = useMutation({
    mutationFn: (dogId) => axios.post('/api/dogs/buy', { dogId }).then(res => res.data),
    onMutate: (dogId) => setBuying(dogId),
    onSettled: () => setBuying(null),
    onSuccess: () => {
      toast.success('تم شراء الكلب!');
      queryClient.invalidateQueries(['owned-dogs']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  if (dogsLoading || ownedLoading || charLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner"></div>
            <Dog className="w-8 h-8 text-accent-red absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-lg font-medium animate-pulse">
            جاري تحميل الكلاب...
          </p>
        </div>
      </div>
    );
  }
  
  if (dogsError || ownedError || charError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 text-lg">خطأ في تحميل بيانات الكلاب</p>
        </div>
      </div>
    );
  }

  // Helper: is dog active
  const isActive = (dogId) => ownedDogs.find((ud) => ud.dogId === dogId && ud.isActive);
  // Helper: is dog owned
  const isOwned = (dogId) => ownedDogs.some((ud) => ud.dogId === dogId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      {/* Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 flex items-center justify-center bg-gradient-to-br from-accent-red/40 to-black/60 border-2 border-accent-red animate-fade-in">
        <div className="relative z-10 text-center">
          <Dog className="w-16 h-16 mx-auto text-accent-red mb-2 animate-bounce" />
          <h1 className="text-4xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">الكلاب</h1>
          <p className="text-hitman-300 text-lg">اختر كلبك وارتقِ بقوتك</p>
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
              <Dog className="w-5 h-5 mr-2" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dogs Grid */}
      <div className="max-w-7xl mx-auto">
        {tab === 'owned' && (
          <div>
            <h2 className="text-xl font-bold text-accent-red mb-6 text-center">كلابك</h2>
            {ownedDogs.length === 0 ? (
              <div className="text-center py-12">
                <Dog className="w-16 h-16 text-hitman-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-hitman-400 mb-2">لا تملك أي كلب بعد</h3>
                <p className="text-hitman-500">اذهب إلى سوق الكلاب لشراء أول كلب لك</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {ownedDogs.map(({ Dog: dogData, dogId, id, isActive: dogIsActive }) => (
                  <DogCard
                    key={id}
                    dog={dogData}
                    isOwned={true}
                    isActive={dogIsActive}
                    onEquip={activateMutation.mutate}
                    onUnequip={deactivateMutation.mutate}
                    onSell={sellMutation.mutate}
                    equipping={activating}
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
            <h2 className="text-xl font-bold text-accent-red mb-6 text-center">سوق الكلاب</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {dogs.map((dog) => (
                <DogCard
                  key={dog.id}
                  dog={dog}
                  isOwned={isOwned(dog.id)}
                  isActive={isActive(dog.id)}
                  onBuy={buyMutation.mutate}
                  onUnequip={deactivateMutation.mutate}
                  buying={buying}
                  unequipping={unequipping}
                />
              ))}
            </div>
            {dogs.length === 0 && (
              <div className="text-center py-12">
                <Dog className="w-16 h-16 text-hitman-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-hitman-400 mb-2">لا توجد كلاب متاحة</h3>
                <p className="text-hitman-500">لا توجد كلاب في السوق حالياً</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 