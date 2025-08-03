import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useHud } from '@/hooks/useHud';
import { useSocket } from "@/hooks/useSocket";
import MoneyIcon from '@/components/MoneyIcon';
import { 
  Star, 
  ShoppingCart, 
  Shield, 
  Sword, 
  Home, 
  Car, 
  Dog, 
  Gift, 
  Coins, 
  Zap, 
  Heart, 
  Package, 
  DollarSign, 
  Clock, 
  Bomb, 
  Crown,
  Gem,
  Sparkles,
  Target,
  Award,
  ChevronRight
} from 'lucide-react';
import { handleImageError, getImageUrl } from '@/utils/imageUtils';

const API = import.meta.env.VITE_API_URL;

// Enhanced rarity colors with blood theme
const rarityColors = {
  common: 'text-zinc-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legend: 'text-yellow-400'
};

// Enhanced rarity icons
const rarityIcons = {
  common: '⭐',
  uncommon: '⭐⭐',
  rare: '⭐⭐⭐',
  epic: '⭐⭐⭐⭐',
  legend: '⭐⭐⭐⭐⭐'
};

function BlackcoinIcon() {
  return (
    <>
      <img 
        src="/images/blackcoins-icon.png" 
        alt="Blackcoin"
        className="w-5 h-5 object-contain"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'inline-block';
        }}
      />
      <span className="inline-block w-5 h-5 rounded-full bg-gradient-to-br from-black via-zinc-900 to-zinc-800 border-2 border-blood-500 flex items-center justify-center mr-1 hidden">
        <span className="text-xs text-blood-400 font-bold">ع</span>
      </span>
    </>
  );
}

// Enhanced ItemCard component with blood theme
function ItemCard({ item, onBuy, type }) {
  const isSpecial = type === 'special';
  
  return (
    <div className="card-3d p-4 hover:border-blood-500/50 transition-all duration-300 group hover:scale-[1.02]">
      {/* Enhanced Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${isSpecial ? 'from-purple-950/30 to-pink-950/20' : 'from-blood-950/30 to-red-950/20'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Item Image Placeholder */}
      <div className="relative w-full h-24 bg-gradient-to-br from-black/60 to-blood-950/40 rounded-lg flex items-center justify-center border border-blood-500/20 overflow-hidden mb-3">
        {item.imageUrl ? (
          <img 
            src={getImageUrl(item.imageUrl)} 
            alt={item.name}
            className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
            onError={(e) => handleImageError(e, item.imageUrl)}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${item.imageUrl ? 'hidden' : 'flex'}`}>
          <Package className="w-8 h-8 text-blood-400/50" />
        </div>
        
        {/* Rarity Badge */}
        {item.rarity && (
          <div className="absolute top-2 left-2">
            <div className={`px-2 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-sm ${rarityColors[item.rarity]} border border-current/30`}>
              {rarityIcons[item.rarity]}
            </div>
          </div>
        )}
      </div>

      {/* Item Info */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white text-sm truncate group-hover:text-blood-300 transition-colors">
            {item.name}
          </h4>
        </div>

        {/* Enhanced Item Stats */}
        <div className="space-y-2 text-xs">
          {item.damage && (
            <div className="flex items-center gap-2 text-red-400">
              <Sword className="w-3 h-3" />
              <span>ضرر: {item.damage}</span>
            </div>
          )}
          {item.def && (
            <div className="flex items-center gap-2 text-blue-400">
              <Shield className="w-3 h-3" />
              <span>دفاع: {item.def}</span>
            </div>
          )}
          {item.energyBonus && (
            <div className="flex items-center gap-2 text-yellow-400">
              <Zap className="w-3 h-3" />
              <span>طاقة: +{item.energyBonus}</span>
            </div>
          )}
          {item.hpBonus && (
            <div className="flex items-center gap-2 text-green-400">
              <Heart className="w-3 h-3" />
              <span>صحة: +{item.hpBonus}</span>
            </div>
          )}
          
          {/* Enhanced Special Item Effects */}
          {isSpecial && item.effect && (
            <div className="card-3d bg-purple-950/20 border-purple-500/30 p-2 space-y-1">
              {item.effect.health && (
                <div className="flex items-center gap-2 text-green-400">
                  <Heart className="w-3 h-3" />
                  <span className="text-xs">صحة: {item.effect.health === 'max' ? '100%' : `+${item.effect.health}`}</span>
                </div>
              )}
              {item.effect.energy && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Zap className="w-3 h-3" />
                  <span className="text-xs">طاقة: {item.effect.energy === 'max' ? '100%' : `+${item.effect.energy}`}</span>
                </div>
              )}
              {item.effect.experience && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Target className="w-3 h-3" />
                  <span className="text-xs">خبرة: +{item.effect.experience}</span>
                </div>
              )}
              {item.effect.nameChange && (
                <div className="flex items-center gap-2 text-purple-400">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-xs">تغيير الاسم</span>
                </div>
              )}
              {item.effect.gangBomb && (
                <div className="flex items-center gap-2 text-red-400">
                  <Bomb className="w-3 h-3" />
                  <span className="text-xs">قنبلة عصابة</span>
                </div>
              )}
              {item.effect.attackImmunity && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Shield className="w-3 h-3" />
                  <span className="text-xs">حماية من الهجمات</span>
                </div>
              )}
              {item.effect.cdReset && (
                <div className="flex items-center gap-2 text-green-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">إعادة تعيين الانتظار</span>
                </div>
              )}
              {item.effect.duration > 0 && (
                <div className="flex items-center gap-2 text-purple-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">المدة: {item.effect.duration} ثانية</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Price and Buy Button */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-1 text-blood-400 font-bold text-sm">
            <BlackcoinIcon />
            <span>{item.price}</span>
          </div>
          <button
            onClick={() => onBuy(item, type)}
            className="btn-3d text-xs px-3 py-2 flex items-center gap-1 hover:scale-105 transition-transform duration-300"
          >
            <ShoppingCart className="w-3 h-3" />
            شراء
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced CarCard component
function CarCard({ car, onBuy }) {
  const rarity = car.rarity?.toLowerCase() || 'common';
  
  return (
    <div className="card-3d p-4 hover:border-blue-500/50 transition-all duration-300 group hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-cyan-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Car Image */}
      <div className="relative w-full h-24 bg-gradient-to-br from-black/60 to-blue-950/40 rounded-lg flex items-center justify-center border border-blue-500/20 overflow-hidden mb-3">
        {car.imageUrl ? (
          <img 
            src={car.imageUrl} 
            alt={car.name}
            className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
            onError={(e) => handleImageError(e, car.imageUrl)}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${car.imageUrl ? 'hidden' : 'flex'}`}>
          <Car className="w-8 h-8 text-blue-400/50" />
        </div>
        
        <div className="absolute top-2 right-2">
          <span className={`text-xs ${rarityColors[rarity]} bg-black/60 px-2 py-1 rounded-full backdrop-blur-sm font-bold`}>
            {rarityIcons[rarity]}
          </span>
        </div>
      </div>

      {/* Car Info */}
      <div className="relative z-10 space-y-3">
        <h4 className="font-semibold text-white text-sm truncate group-hover:text-blue-300 transition-colors">
          {car.name}
        </h4>

        {/* Car Stats */}
        <div className="space-y-2 text-xs">
          {car.attackBonus > 0 && (
            <div className="flex items-center gap-2 text-red-400">
              <Sword className="w-3 h-3" />
              <span>هجوم: +{car.attackBonus}</span>
            </div>
          )}
          {car.defenseBonus > 0 && (
            <div className="flex items-center gap-2 text-blue-400">
              <Shield className="w-3 h-3" />
              <span>دفاع: +{car.defenseBonus}</span>
            </div>
          )}
        </div>

        {/* Price and Buy Button */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-1 text-blood-400 font-bold text-sm">
            <BlackcoinIcon />
            <span>{car.cost}</span>
          </div>
          <button
            onClick={() => onBuy(car)}
            className="btn-3d-secondary text-xs px-3 py-2 flex items-center gap-1 hover:scale-105 transition-transform duration-300"
          >
            <ShoppingCart className="w-3 h-3" />
            شراء
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced HouseCard component
function HouseCard({ house, onBuy }) {
  const rarity = house.rarity?.toLowerCase() || 'common';
  
  return (
    <div className="card-3d p-4 hover:border-yellow-500/50 transition-all duration-300 group hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-950/30 to-amber-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* House Image */}
      <div className="relative w-full h-24 bg-gradient-to-br from-black/60 to-yellow-950/40 rounded-lg flex items-center justify-center border border-yellow-500/20 overflow-hidden mb-3">
        {house.imageUrl ? (
          <img 
            src={house.imageUrl} 
            alt={house.name}
            className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
            onError={(e) => handleImageError(e, house.imageUrl)}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${house.imageUrl ? 'hidden' : 'flex'}`}>
          <Home className="w-8 h-8 text-yellow-400/50" />
        </div>
        
        <div className="absolute top-2 right-2">
          <span className={`text-xs ${rarityColors[rarity]} bg-black/60 px-2 py-1 rounded-full backdrop-blur-sm font-bold`}>
            {rarityIcons[rarity]}
          </span>
        </div>
      </div>

      {/* House Info */}
      <div className="relative z-10 space-y-3">
        <h4 className="font-semibold text-white text-sm truncate group-hover:text-yellow-300 transition-colors">
          {house.name}
        </h4>

        {/* House Stats */}
        <div className="space-y-2 text-xs">
          {house.defenseBonus > 0 && (
            <div className="flex items-center gap-2 text-blue-400">
              <Shield className="w-3 h-3" />
              <span>دفاع: +{house.defenseBonus}</span>
            </div>
          )}
          {house.hpBonus > 0 && (
            <div className="flex items-center gap-2 text-green-400">
              <Heart className="w-3 h-3" />
              <span>صحة: +{house.hpBonus}</span>
            </div>
          )}
        </div>

        {/* Price and Buy Button */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-1 text-blood-400 font-bold text-sm">
            <BlackcoinIcon />
            <span>{house.cost}</span>
          </div>
          <button
            onClick={() => onBuy(house)}
            className="btn-3d-secondary text-xs px-3 py-2 flex items-center gap-1 hover:scale-105 transition-transform duration-300"
          >
            <ShoppingCart className="w-3 h-3" />
            شراء
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced DogCard component
function DogCard({ dog, onBuy }) {
  const rarity = dog.rarity?.toLowerCase() || 'common';
  
  return (
    <div className="card-3d p-4 hover:border-orange-500/50 transition-all duration-300 group hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-950/30 to-amber-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Dog Image */}
      <div className="relative w-full h-24 bg-gradient-to-br from-black/60 to-orange-950/40 rounded-lg flex items-center justify-center border border-orange-500/20 overflow-hidden mb-3">
        {dog.imageUrl ? (
          <img 
            src={dog.imageUrl} 
            alt={dog.name}
            className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
            onError={(e) => handleImageError(e, dog.imageUrl)}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${dog.imageUrl ? 'hidden' : 'flex'}`}>
          <Dog className="w-8 h-8 text-orange-400/50" />
        </div>
        
        <div className="absolute top-2 right-2">
          <span className={`text-xs ${rarityColors[rarity]} bg-black/60 px-2 py-1 rounded-full backdrop-blur-sm font-bold`}>
            {rarityIcons[rarity]}
          </span>
        </div>
      </div>

      {/* Dog Info */}
      <div className="relative z-10 space-y-3">
        <h4 className="font-semibold text-white text-sm truncate group-hover:text-orange-300 transition-colors">
          {dog.name}
        </h4>

        {/* Dog Stats */}
        <div className="space-y-2 text-xs">
          {dog.powerBonus > 0 && (
            <div className="flex items-center gap-2 text-red-400">
              <Sword className="w-3 h-3" />
              <span>قوة الهجوم: +{dog.powerBonus}</span>
            </div>
          )}
        </div>

        {/* Price and Buy Button */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-1 text-blood-400 font-bold text-sm">
            <BlackcoinIcon />
            <span>{dog.cost}</span>
          </div>
          <button
            onClick={() => onBuy(dog)}
            className="btn-3d-secondary text-xs px-3 py-2 flex items-center gap-1 hover:scale-105 transition-transform duration-300"
          >
            <ShoppingCart className="w-3 h-3" />
            شراء
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced MoneyPackageCard component
function MoneyPackageCard({ pkg, onBuy, stats }) {
  return (
    <div className="card-3d p-4 hover:border-green-500/50 transition-all duration-300 group hover:scale-[1.02]">
      <div className="absolute inset-0 bg-gradient-to-br from-green-950/30 to-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Money Image Container */}
      <div className="relative h-32 bg-gradient-to-br from-black/60 to-green-950/40 rounded-lg overflow-hidden mb-4">
        <img 
          src="/images/money.jpeg" 
          alt="Money Package"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center hidden">
          <DollarSign className="w-12 h-12 text-green-400" />
        </div>
        
        {/* Money Badge */}
        <div className="absolute top-3 left-3">
          <div className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-sm text-green-400 border border-green-400/30">
            مال
          </div>
        </div>
      </div>

      {/* Money Details */}
      <div className="relative z-10 space-y-3">
        <h3 className="font-bold text-lg text-white group-hover:text-green-400 transition-colors">
          {pkg.name}
        </h3>
        
        {pkg.description && (
          <p className="text-sm text-white/60">{pkg.description}</p>
        )}

        {/* Money Amount */}
        <div className="flex items-center gap-2">
          <MoneyIcon className="w-4 h-4" />
          <span className="text-sm text-green-400 font-bold">
            {(pkg.moneyAmount + (pkg.bonus || 0)).toLocaleString()}
          </span>
        </div>

        {/* Bonus */}
        {pkg.bonus > 0 && (
          <div className="card-3d bg-green-950/20 border-green-500/30 p-2 flex items-center gap-2">
            <Gift className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-bold">+{pkg.bonus.toLocaleString()} مكافأة</span>
          </div>
        )}

        {/* Price and Buy Button */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-1">
            <BlackcoinIcon />
            <span className="text-blood-400 font-bold text-lg">{pkg.blackcoinCost}</span>
          </div>
          <button
            onClick={() => onBuy(pkg.id)}
            className="btn-3d text-xs px-3 py-2 flex items-center gap-1 hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={stats?.blackcoins < pkg.blackcoinCost}
          >
            <DollarSign className="w-3 h-3" />
            شراء
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Tab Configuration
const TABS = [
  { key: 'vip', label: 'متجر VIP', icon: Star, color: 'yellow' },
  { key: 'blackcoins', label: 'متجر العملة السوداء', icon: Coins, color: 'blood' },
  { key: 'money', label: 'شراء المال', icon: DollarSign, color: 'green' },
  { key: 'special', label: 'عناصر خاصة', icon: Package, color: 'purple' },
  { key: 'weapons', label: 'الأسلحة والدروع', icon: Sword, color: 'red' },
  { key: 'cars', label: 'السيارات', icon: Car, color: 'blue' },
  { key: 'houses', label: 'المنازل', icon: Home, color: 'yellow' },
  { key: 'dogs', label: 'الكلاب', icon: Dog, color: 'orange' },
];

export default function SpecialShop() {
  const { customToken } = useFirebaseAuth();
  const { stats, invalidateHud } = useHud();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('vip');

  // State management
  const [specialItems, setSpecialItems] = useState([]);
  const [blackcoinPackages, setBlackcoinPackages] = useState([]);
  const [vipPackages, setVipPackages] = useState([]);
  const [moneyPackages, setMoneyPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [weapons, setWeapons] = useState([]);
  const [armors, setArmors] = useState([]);
  const [loadingWeapons, setLoadingWeapons] = useState(false);

  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);

  const [houses, setHouses] = useState([]);
  const [loadingHouses, setLoadingHouses] = useState(false);

  const [dogs, setDogs] = useState([]);
  const [loadingDogs, setLoadingDogs] = useState(false);

  // Enhanced fetchers...
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/special-items?currency=blackcoin`, { headers: { Authorization: `Bearer ${customToken}` } }),
      fetch(`${API}/api/special-shop/blackcoin-packages`, { headers: { Authorization: `Bearer ${customToken}` } }),
      fetch(`${API}/api/special-shop/vip-packages`, { headers: { Authorization: `Bearer ${customToken}` } }),
      fetch(`${API}/api/special-shop/money-packages`, { headers: { Authorization: `Bearer ${customToken}` } })
    ]).then(async ([specialRes, packagesRes, vipRes, moneyRes]) => {
      if (specialRes.status === 401 || packagesRes.status === 401 || vipRes.status === 401 || moneyRes.status === 401) {
        toast.error('يجب تسجيل الدخول للوصول إلى سوق العملة السوداء');
        setSpecialItems([]); setBlackcoinPackages([]); setVipPackages([]); setMoneyPackages([]); setLoading(false); return;
      }
      const specialData = await specialRes.json();
  
      setSpecialItems(Array.isArray(specialData) ? specialData : []);
      setBlackcoinPackages(await packagesRes.json());
      setVipPackages(await vipRes.json());
      setMoneyPackages(await moneyRes.json());
      setLoading(false);
    }).catch(() => {
      toast.error('فشل في تحميل عناصر سوق العملة السوداء');
      setSpecialItems([]); setBlackcoinPackages([]); setVipPackages([]); setMoneyPackages([]); setLoading(false);
    });
  }, [customToken]);

  useEffect(() => {
    if (activeTab === 'weapons') {
      setLoadingWeapons(true);
      fetch(`${API}/api/special-shop/special`, { headers: { Authorization: `Bearer ${customToken}` } })
        .then(res => res.json())
        .then(data => {
          setWeapons(data.weapons || []);
          setArmors(data.armors || []);
          setLoadingWeapons(false);
        })
        .catch(() => { setWeapons([]); setArmors([]); setLoadingWeapons(false); });
    }
  }, [activeTab, customToken]);

  useEffect(() => {
    if (activeTab === 'cars') {
      setLoadingCars(true);
      fetch(`${API}/api/special-shop/cars`, { headers: { Authorization: `Bearer ${customToken}` } })
        .then(res => res.json())
        .then(data => { setCars(data); setLoadingCars(false); })
        .catch(() => { setCars([]); setLoadingCars(false); });
    }
  }, [activeTab, customToken]);

  useEffect(() => {
    if (activeTab === 'houses') {
      setLoadingHouses(true);
      fetch(`${API}/api/special-shop/houses`, { headers: { Authorization: `Bearer ${customToken}` } })
        .then(res => res.json())
        .then(data => { setHouses(data); setLoadingHouses(false); })
        .catch(() => { setHouses([]); setLoadingHouses(false); });
    }
  }, [activeTab, customToken]);

  useEffect(() => {
    if (activeTab === 'dogs') {
      setLoadingDogs(true);
      fetch(`${API}/api/special-shop/dogs`, { headers: { Authorization: `Bearer ${customToken}` } })
        .then(res => res.json())
        .then(data => { setDogs(data); setLoadingDogs(false); })
        .catch(() => { setDogs([]); setLoadingDogs(false); });
    }
  }, [activeTab, customToken]);

  // Real-time HUD updates
  useEffect(() => {
    if (!socket) return;
    const refetchHud = () => invalidateHud?.();
    socket.on('hud:update', refetchHud);
    const pollInterval = setInterval(refetchHud, 10000);
    return () => {
      socket.off('hud:update', refetchHud);
      clearInterval(pollInterval);
    };
  }, [socket, invalidateHud]);

  // Actions (same logic as before but with enhanced error handling)
  const buyVIP = async (packageId) => {
    try {
      const res = await fetch(`${API}/api/special-shop/buy/vip`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${customToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('تم شراء VIP بنجاح!');
      invalidateHud?.();
    } catch (err) { toast.error(err.message || 'فشل شراء VIP'); }
  };

  const buyBlackcoin = async (packageId) => {
    try {
      const res = await fetch(`${API}/api/special-shop/buy/blackcoin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${customToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('تم شراء الباقة بنجاح!');
      invalidateHud?.();
    } catch (err) { toast.error(err.message || 'فشل شراء العملة السوداء'); }
  };

  const buyMoney = async (packageId) => {
    try {
      const res = await fetch(`${API}/api/special-shop/buy/money`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${customToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('تم شراء المال بنجاح!');
      invalidateHud?.();
    } catch (err) { toast.error(err.message || 'فشل شراء المال'); }
  };

  const buySpecial = async (item) => {
    try {
      let quantity = 1;
      const input = window.prompt('كمية الشراء؟', '1');
      if (input !== null) {
        const parsed = parseInt(input);
        if (!isNaN(parsed) && parsed > 0) quantity = parsed;
      }
      const res = await fetch(`${API}/api/special-items/buy/${item.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${customToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('تم الشراء بنجاح!');
      invalidateHud?.();
    } catch (err) { toast.error(err.message || 'فشل في الشراء'); }
  };

  const buyWeapon = async (weapon) => {
    try {
      let quantity = 1;
      const input = window.prompt('كمية الشراء؟', '1');
      if (input !== null) {
        const parsed = parseInt(input);
        if (!isNaN(parsed) && parsed > 0) quantity = parsed;
      }
      const res = await fetch(`${API}/api/special-shop/buy/weapon/${weapon.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${customToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('تم شراء السلاح بنجاح!');
      invalidateHud?.();
    } catch (err) { toast.error(err.message || 'فشل في شراء السلاح'); }
  };

  const buyArmor = async (armor) => {
    try {
      let quantity = 1;
      const input = window.prompt('كمية الشراء؟', '1');
      if (input !== null) {
        const parsed = parseInt(input);
        if (!isNaN(parsed) && parsed > 0) quantity = parsed;
      }
      const res = await fetch(`${API}/api/special-shop/buy/armor/${armor.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${customToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('تم شراء الدرع بنجاح!');
      invalidateHud?.();
    } catch (err) { toast.error(err.message || 'فشل في شراء الدرع'); }
  };

  const buyCar = async (car) => {
    try {
      const res = await fetch(`${API}/api/cars/buy`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${customToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ carId: car.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      toast.success('تم شراء السيارة بنجاح!');
      invalidateHud?.();
    } catch (err) { toast.error(err.message || 'فشل في شراء السيارة'); }
  };

  const buyHouse = async (house) => {
    try {
      const res = await fetch(`${API}/api/houses/buy`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${customToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ houseId: house.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      toast.success('تم شراء المنزل بنجاح!');
      invalidateHud?.();
    } catch (err) { toast.error(err.message || 'فشل في شراء المنزل'); }
  };

  const buyDog = async (dog) => {
    try {
      const res = await fetch(`${API}/api/dogs/buy`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${customToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ dogId: dog.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      toast.success('تم شراء الكلب بنجاح!');
      invalidateHud?.();
    } catch (err) { toast.error(err.message || 'فشل في شراء الكلب'); }
  };

  // Enhanced Tab Content Renderer
  function renderTabContent() {
    if (activeTab === 'vip') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2 flex items-center justify-center gap-2">
              <Crown className="w-6 h-6" />
              اشترِ عضوية VIP
            </h2>
            <p className="text-white/60">احصل على مزايا حصرية وخبرة أفضل</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vipPackages.map(pkg => (
              <div key={`vip-${pkg.id}`} className="card-3d p-4 hover:border-yellow-500/50 transition-all duration-300 group hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-950/30 to-amber-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-white group-hover:text-yellow-400 transition-colors">
                      {pkg.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-400 font-bold">{pkg.durationDays} يوم</span>
                  </div>

                  <div className="card-3d bg-black/40 border-yellow-500/30 p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <BlackcoinIcon />
                      <span className="text-blood-400 font-bold text-lg">{pkg.price}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => buyVIP(pkg.id)}
                    className="w-full btn-3d py-3 flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={stats?.blackcoins < pkg.price}
                  >
                    <Star className="w-4 h-4" />
                    شراء VIP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'blackcoins') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blood-400 mb-2 flex items-center justify-center gap-2">
              <BlackcoinIcon />
              اشترِ باقات العملة السوداء
            </h2>
            <p className="text-white/60">العملة المميزة للمشتريات الحصرية</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {blackcoinPackages.map(pkg => (
              <div key={`blackcoin-${pkg.id}`} className="card-3d p-4 hover:border-blood-500/50 transition-all duration-300 group hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-blood-950/30 to-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blood-500 to-blood-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Coins className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-white group-hover:text-blood-400 transition-colors">
                      {pkg.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400 font-bold">${pkg.usdPrice}</span>
                  </div>

                  <div className="card-3d bg-black/40 border-blood-500/30 p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <BlackcoinIcon />
                      <span className="text-blood-400 font-bold text-lg">{pkg.blackcoinAmount + (pkg.bonus || 0)}</span>
                    </div>
                  </div>

                  {pkg.bonus > 0 && (
                    <div className="card-3d bg-green-950/20 border-green-500/30 p-2 flex items-center justify-center gap-2">
                      <Gift className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400 font-bold">+{pkg.bonus} مكافأة</span>
                    </div>
                  )}

                  <button
                    onClick={() => buyBlackcoin(pkg.id)}
                    className="w-full btn-3d py-3 flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300"
                  >
                    <BlackcoinIcon />
                    شراء الباقة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'money') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-2 flex items-center justify-center gap-2">
              <DollarSign className="w-6 h-6" />
              اشترِ المال بالعملة السوداء
            </h2>
            <p className="text-white/60">احصل على المال في اللعبة مقابل العملة السوداء</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {moneyPackages.length === 0 && (
              <div className="col-span-full text-center py-8">
                <div className="text-6xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد باقات مال</h3>
                <p className="text-white/60">لا توجد باقات مال متاحة حالياً</p>
              </div>
            )}
            {moneyPackages.map(pkg => (
              <MoneyPackageCard
                key={`money-${pkg.id}`}
                pkg={pkg}
                onBuy={buyMoney}
                stats={stats}
              />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'special') {
      if (loading) return (
        <div className="text-center py-8">
          <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
          <p className="text-white">جاري تحميل العناصر الخاصة...</p>
        </div>
      );
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-purple-400 mb-2 flex items-center justify-center gap-2">
              <Package className="w-6 h-6" />
              العناصر الخاصة
            </h2>
            <p className="text-white/60">جرعات ومواد خاصة لتعزيز قدراتك</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {specialItems.length === 0 && (
              <div className="col-span-full text-center py-8">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-white mb-2">لا توجد عناصر خاصة</h3>
                <p className="text-white/60">لا توجد عناصر خاصة حالياً</p>
              </div>
            )}
            {specialItems.map(item => (
              <ItemCard
                key={`special-${item.id}`}
                item={item}
                onBuy={buySpecial}
                type="special"
              />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'weapons') {
      if (loadingWeapons) return (
        <div className="text-center py-8">
          <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
          <p className="text-white">جاري تحميل الأسلحة والدروع...</p>
        </div>
      );
      
      const blackcoinWeapons = weapons.filter(item => item.currency === 'blackcoin');
      const blackcoinArmors = armors.filter(item => item.currency === 'blackcoin');
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-2 flex items-center justify-center gap-2">
              <Sword className="w-6 h-6" />
              الأسلحة والدروع
            </h2>
            <p className="text-white/60">أسلحة ودروع متقدمة بالعملة السوداء</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {blackcoinWeapons.map(item => (
              <ItemCard
                key={`weapon-${item.id}`}
                item={item}
                onBuy={buyWeapon}
                type="special"
              />
            ))}
            {blackcoinArmors.map(item => (
              <ItemCard
                key={`armor-${item.id}`}
                item={item}
                onBuy={buyArmor}
                type="special"
              />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'cars') {
      if (loadingCars) return (
        <div className="text-center py-8">
          <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
          <p className="text-white">جاري تحميل السيارات...</p>
        </div>
      );
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-400 mb-2 flex items-center justify-center gap-2">
              <Car className="w-6 h-6" />
              السيارات
            </h2>
            <p className="text-white/60">سيارات فاخرة لزيادة قوتك</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cars.map(car => (
              <CarCard
                key={car.id}
                car={car}
                onBuy={buyCar}
              />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'houses') {
      if (loadingHouses) return (
        <div className="text-center py-8">
          <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
          <p className="text-white">جاري تحميل المنازل...</p>
        </div>
      );
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2 flex items-center justify-center gap-2">
              <Home className="w-6 h-6" />
              المنازل
            </h2>
            <p className="text-white/60">منازل فاخرة لزيادة دفاعك وصحتك</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {houses.map(house => (
              <HouseCard
                key={house.id}
                house={house}
                onBuy={buyHouse}
              />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'dogs') {
      if (loadingDogs) return (
        <div className="text-center py-8">
          <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
          <p className="text-white">جاري تحميل الكلاب...</p>
        </div>
      );
      
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-orange-400 mb-2 flex items-center justify-center gap-2">
              <Dog className="w-6 h-6" />
              الكلاب
            </h2>
            <p className="text-white/60">كلاب مدربة لزيادة قوة الهجوم</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {dogs.map(dog => (
              <DogCard
                key={dog.id}
                dog={dog}
                onBuy={buyDog}
              />
            ))}
          </div>
        </div>
      );
    }

    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen blood-gradient flex items-center justify-center">
        <div className="text-center card-3d p-8">
          <div className="loading-shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium animate-pulse">
            جاري تحميل سوق العملة السوداء...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom">
      <div className="container mx-auto max-w-7xl p-3 space-y-6">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-blood-900 via-black to-purple-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"10\"/%3E%3Ccircle cx=\"15\" cy=\"15\" r=\"6\"/%3E%3Ccircle cx=\"45\" cy=\"45\" r=\"8\"/%3E%3Ccircle cx=\"45\" cy=\"15\" r=\"5\"/%3E%3Ccircle cx=\"15\" cy=\"45\" r=\"7\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blood-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">سوق العملة السوداء</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">المتجر المميز</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <Gem className="w-4 h-4 text-white/60" />
                <Sparkles className="w-4 h-4 text-blood-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg flex items-center gap-2">
                  <BlackcoinIcon />
                  {stats?.blackcoins ?? 0}
                </div>
                <div className="text-xs text-white/80 drop-shadow">رصيدك</div>
              </div>
            </div>
          </div>
        </div>

        {/* VIP Status */}
        {stats?.vipExpiresAt && new Date(stats.vipExpiresAt) > new Date() && (
          <div className="card-3d bg-gradient-to-r from-yellow-950/30 to-amber-950/20 border-yellow-500/50 p-4">
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Crown className="w-5 h-5 animate-pulse" />
              <span className="font-bold">عضو VIP نشط</span>
              <Award className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        )}

        {/* Enhanced Tabs */}
        <div className="flex flex-wrap gap-2 justify-center">
          {TABS.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all duration-300 text-sm ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-blood-600 to-blood-700 text-white border-blood-500/50 border shadow-lg shadow-blood-500/30'
                    : 'card-3d hover:border-blood-500/30 hover:bg-gradient-to-r hover:from-blood-950/20 hover:to-transparent'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
                {activeTab === tab.key && <ChevronRight className="w-4 h-4" />}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>

        {/* Enhanced Tips */}
        <div className="card-3d p-4 bg-gradient-to-r from-blood-950/20 to-black/40 border-blood-500/20">
          <h3 className="text-sm font-bold text-blood-400 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            نصائح التسوق
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Crown className="w-3 h-3 text-yellow-400" />
              <span>عضوية VIP تمنحك مزايا حصرية</span>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="w-3 h-3 text-purple-400" />
              <span>العناصر الخاصة لها تأثيرات قوية</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>احفظ العملة السوداء للعناصر النادرة</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-3 h-3 text-green-400" />
              <span>راقب العروض والمكافآت الإضافية</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
