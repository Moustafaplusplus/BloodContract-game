import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';
import { extractErrorMessage } from '@/utils/errorHandler';
import { 
  Car, 
  Shield, 
  Zap, 
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
  { key: 'owned', label: 'سياراتك' },
  { key: 'market', label: 'سوق السيارات' },
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

function CarCard({ car, isOwned = false, isActive = false, onBuy, onActivate, onSell, buying, activating, selling }) {
  const rarity = car.rarity?.toLowerCase() || 'common';
  
  return (
    <div className={`relative bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border rounded-xl p-4 space-y-3 hover:bg-hitman-700/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-red/20 ${
      isActive ? 'border-accent-red shadow-lg shadow-accent-red/30' : 
      isOwned ? 'border-hitman-700 opacity-60' : 'border-hitman-700'
    }`}>
      {/* Active Badge */}
      {isActive && (
        <span className="absolute top-2 right-2 bg-accent-red text-white text-xs px-2 py-1 rounded font-bold z-10">
          السيارة الحالية
        </span>
      )}

      {/* Car Image */}
      <div className="relative w-full h-24 bg-gradient-to-br from-hitman-700 to-hitman-800 rounded-lg flex items-center justify-center border border-hitman-600">
        {car.imageUrl ? (
          <img 
            src={car.imageUrl} 
            alt={car.name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => handleImageError(e, car.imageUrl)}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${car.imageUrl ? 'hidden' : 'flex'}`}>
          <Car className="w-8 h-8 text-hitman-400" />
        </div>
      </div>

      {/* Car Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white text-sm truncate">{car.name}</h4>
          <span className={`text-xs ${rarityColors[rarity]}`}>
            {rarityIcons[rarity]}
          </span>
        </div>

        {/* Car Stats */}
        <div className="space-y-1 text-xs">
          {car.attackBonus > 0 && (
            <div className="flex items-center text-red-400">
              <Sword className="w-3 h-3 mr-1" />
              <span>هجوم: +{car.attackBonus}</span>
            </div>
          )}
          {car.defenseBonus > 0 && (
            <div className="flex items-center text-blue-400">
              <Shield className="w-3 h-3 mr-1" />
              <span>دفاع: +{car.defenseBonus}</span>
            </div>
          )}
          {car.energyRegen > 0 && (
            <div className="flex items-center text-yellow-400">
              <Zap className="w-3 h-3 mr-1" />
              <span>طاقة: +{car.energyRegen}</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center text-accent-green font-bold text-sm">
          {car.currency === 'blackcoin' ? (
            <>
              <span className="inline-block w-4 h-4 rounded-full bg-black border border-accent-red flex items-center justify-center mr-1">
                <span className="text-xs text-accent-red font-bold">ع</span>
              </span>
              <span className="text-accent-red">{car.cost?.toLocaleString()}</span>
            </>
          ) : (
            <>
              <DollarSign className="w-3 h-3 mr-1" />
              <span>{car.cost?.toLocaleString()}</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {!isOwned ? (
          <button
            onClick={() => onBuy(car.id)}
            disabled={buying === car.id}
            className="w-full bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xs px-3 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center hover:scale-105 disabled:opacity-60"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            {buying === car.id ? '...جاري الشراء' : 'شراء'}
          </button>
        ) : (
          <div className="flex space-x-2 rtl:space-x-reverse">
            {!isActive && (
              <button
                onClick={() => onActivate(car.id)}
                disabled={activating === car.id}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center disabled:opacity-60"
              >
                <Settings className="w-3 h-3 mr-1" />
                {activating === car.id ? '...جاري التفعيل' : 'تفعيل'}
              </button>
            )}
            <button
              onClick={() => onSell(car.id)}
              disabled={selling === car.id || isActive}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-2 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center border border-accent-red disabled:opacity-60"
              title={isActive ? 'لا يمكنك بيع السيارة الحالية' : ''}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              {selling === car.id ? '...جاري البيع' : 'بيع'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Cars() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('owned');
  const [activating, setActivating] = useState(null);
  const [selling, setSelling] = useState(null);
  const [buying, setBuying] = useState(null);

  // Fetch all available cars (market) - only regular money cars
  const {
    data: cars = [],
    isLoading: carsLoading,
    error: carsError
  } = useQuery({
    queryKey: ['cars'],
    queryFn: () => axios.get('/api/cars').then(res => res.data.filter(car => car.currency === 'money')),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all owned cars
  const {
    data: ownedCars = [],
    isLoading: ownedLoading,
    error: ownedError
  } = useQuery({
    queryKey: ['owned-cars'],
    queryFn: () => axios.get('/api/cars/user').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  // Fetch character (to get active car)
  const {
    data: character,
    isLoading: charLoading,
    error: charError
  } = useQuery({
    queryKey: ['character'],
    queryFn: () => axios.get('/api/character').then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  // Activate car mutation
  const activateMutation = useMutation({
    mutationFn: (carId) => axios.post(`/api/cars/${carId}/activate`).then(res => res.data),
    onMutate: (carId) => setActivating(carId),
    onSettled: () => setActivating(null),
    onSuccess: () => {
      toast.success('تم تفعيل السيارة!');
      queryClient.invalidateQueries(['character']);
      queryClient.invalidateQueries(['owned-cars']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Sell car mutation
  const sellMutation = useMutation({
    mutationFn: (carId) => axios.delete(`/api/cars/${carId}/sell`).then(res => res.data),
    onMutate: (carId) => setSelling(carId),
    onSettled: () => setSelling(null),
    onSuccess: (data) => {
      toast.success(`تم بيع السيارة! حصلت على ${data.refund} نقود`);
      queryClient.invalidateQueries(['owned-cars']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  // Buy car mutation
  const buyMutation = useMutation({
    mutationFn: (carId) => axios.post('/api/cars/buy', { carId }).then(res => res.data),
    onMutate: (carId) => setBuying(carId),
    onSettled: () => setBuying(null),
    onSuccess: () => {
      toast.success('تم شراء السيارة!');
      queryClient.invalidateQueries(['owned-cars']);
      queryClient.invalidateQueries(['character']);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  if (carsLoading || ownedLoading || charLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner"></div>
            <Car className="w-8 h-8 text-accent-red absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-lg font-medium animate-pulse">
            جاري تحميل السيارات...
          </p>
        </div>
      </div>
    );
  }
  
  if (carsError || ownedError || charError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 text-lg">خطأ في تحميل بيانات السيارات</p>
        </div>
      </div>
    );
  }

  // Helper: is car active
  const isActive = (carId) => ownedCars.find((uc) => uc.carId === carId && uc.isActive);
  // Helper: is car owned
  const isOwned = (carId) => ownedCars.some((uc) => uc.carId === carId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      {/* Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 flex items-center justify-center bg-gradient-to-br from-accent-red/40 to-black/60 border-2 border-accent-red animate-fade-in">
        <div className="relative z-10 text-center">
          <Car className="w-16 h-16 mx-auto text-accent-red mb-2 animate-bounce" />
          <h1 className="text-4xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">السيارات</h1>
          <p className="text-hitman-300 text-lg">ادفع سيارتك وارتقِ بقوتك</p>
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
              <Car className="w-5 h-5 mr-2" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cars Grid */}
      <div className="max-w-7xl mx-auto">
        {tab === 'owned' && (
          <div>
            <h2 className="text-xl font-bold text-accent-red mb-6 text-center">سياراتك</h2>
            {ownedCars.length === 0 ? (
              <div className="text-center py-12">
                <Car className="w-16 h-16 text-hitman-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-hitman-400 mb-2">لا تملك أي سيارة بعد</h3>
                <p className="text-hitman-500">اذهب إلى سوق السيارات لشراء أول سيارة لك</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {ownedCars.map(({ Car: carData, carId, id, isActive: carIsActive }) => (
                  <CarCard
                    key={id}
                    car={carData}
                    isOwned={true}
                    isActive={carIsActive}
                    onActivate={activateMutation.mutate}
                    onSell={sellMutation.mutate}
                    activating={activating}
                    selling={selling}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'market' && (
          <div>
            <h2 className="text-xl font-bold text-accent-red mb-6 text-center">سوق السيارات</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  isOwned={isOwned(car.id)}
                  isActive={isActive(car.id)}
                  onBuy={buyMutation.mutate}
                  buying={buying}
                />
              ))}
            </div>
            {cars.length === 0 && (
              <div className="text-center py-12">
                <Car className="w-16 h-16 text-hitman-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-hitman-400 mb-2">لا توجد سيارات متاحة</h3>
                <p className="text-hitman-500">لا توجد سيارات في السوق حالياً</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 