import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useHud } from '@/hooks/useHud';
import { useSocket } from "@/hooks/useSocket";
import MoneyIcon from '@/components/MoneyIcon';
import { Star, ImageIcon, ShoppingCart, Shield, Sword, Home, Car, Dog, Gift, Coins, Zap, Heart, Package, DollarSign, Clock, Bomb } from 'lucide-react';
import { handleImageError, getImageUrl } from '@/utils/imageUtils';

const API = import.meta.env.VITE_API_URL;

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

function BlackcoinIcon() {
  return (
    <>
      <img 
        src="/images/blackcoins-icon.png" 
        alt="Blackcoin"
        className="w-5 h-5 object-contain"
        onError={(e) => {
          // Fallback to CSS icon if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'inline-block';
        }}
      />
      <span className="inline-block w-5 h-5 rounded-full bg-gradient-to-br from-black via-zinc-900 to-zinc-800 border-2 border-accent-red flex items-center justify-center mr-1 hidden">
        <span className="text-xs text-accent-red font-bold">ع</span>
      </span>
    </>
  );
}

// ItemCard component for weapons and armors
function ItemCard({ item, onBuy, type }) {
  const isSpecial = type === 'special';
  
  return (
    <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-xl p-4 space-y-3 hover:bg-hitman-700/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-red/20">
      {/* Item Image Placeholder */}
      <div className="relative w-full h-24 bg-gradient-to-br from-hitman-700 to-hitman-800 rounded-lg flex items-center justify-center border border-hitman-600">
        {item.imageUrl ? (
          <img 
            src={getImageUrl(item.imageUrl)} 
            alt={item.name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => handleImageError(e, item.imageUrl)}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${item.imageUrl ? 'hidden' : 'flex'}`}>
          <ImageIcon className="w-8 h-8 text-hitman-400" />
        </div>
      </div>

      {/* Item Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white text-sm truncate">{item.name}</h4>
        </div>

        {/* Item Stats */}
        <div className="space-y-1 text-xs">
          {item.damage && (
            <div className="flex items-center text-red-400">
              <Sword className="w-3 h-3 mr-1" />
              <span>ضرر: {item.damage}</span>
            </div>
          )}
          {item.def && (
            <div className="flex items-center text-blue-400">
              <Shield className="w-3 h-3 mr-1" />
              <span>دفاع: {item.def}</span>
            </div>
          )}
          {item.energyBonus && (
            <div className="flex items-center text-yellow-400">
              <Zap className="w-3 h-3 mr-1" />
              <span>طاقة: +{item.energyBonus}</span>
            </div>
          )}
          {item.hpBonus && (
            <div className="flex items-center text-green-400">
              <Heart className="w-3 h-3 mr-1" />
              <span>صحة: +{item.hpBonus}</span>
            </div>
          )}
          {isSpecial && item.effect && (
            <>
              {item.effect.health && (
                <div className="flex items-center text-green-400">
                  <Heart className="w-3 h-3 mr-1" />
                  <span className="text-xs">صحة: {item.effect.health === 'max' ? '100%' : `+${item.effect.health}`}</span>
                </div>
              )}
              {item.effect.energy && (
                <div className="flex items-center text-yellow-400">
                  <Zap className="w-3 h-3 mr-1" />
                  <span className="text-xs">طاقة: {item.effect.energy === 'max' ? '100%' : `+${item.effect.energy}`}</span>
                </div>
              )}
              {item.effect.experience && (
                <div className="flex items-center text-blue-400">
                  <Sword className="w-3 h-3 mr-1" />
                  <span className="text-xs">خبرة: +{item.effect.experience}</span>
                </div>
              )}
              {item.effect.nameChange && (
                <div className="flex items-center text-purple-400">
                  <Package className="w-3 h-3 mr-1" />
                  <span className="text-xs">تغيير الاسم</span>
                </div>
              )}
              {item.effect.gangBomb && (
                <div className="flex items-center text-red-400">
                  <Bomb className="w-3 h-3 mr-1" />
                  <span className="text-xs">قنبلة عصابة - إدخال جميع الأعضاء المستشفى</span>
                </div>
              )}
              {item.effect.attackImmunity && (
                <div className="flex items-center text-blue-400">
                  <Shield className="w-3 h-3 mr-1" />
                  <span className="text-xs">حماية من الهجمات - منع الهجمات المباشرة وقنابل العصابة</span>
                </div>
              )}
              {item.effect.cdReset && (
                <div className="flex items-center text-green-400">
                  <Clock className="w-3 h-3 mr-1" />
                  <span className="text-xs">إعادة تعيين أوقات الانتظار - إزالة جميع أوقات الانتظار فوراً</span>
                </div>
              )}
              {(item.type === 'EXPERIENCE_POTION' || item.type === 'GANG_BOMB' || item.type === 'ATTACK_IMMUNITY' || item.type === 'CD_RESET') && item.levelRequired && (
                <div className="flex items-center text-purple-400">
                  <Shield className="w-3 h-3 mr-1" />
                  <span>المستوى المطلوب: {item.levelRequired}</span>
                </div>
              )}
              {item.effect.duration > 0 && (
                <div className="flex items-center text-purple-400">
                  <Package className="w-3 h-3 mr-1" />
                  <span className="text-xs">المدة: {item.effect.duration} ثانية</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Price and Buy Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-accent-red font-bold text-sm">
            <BlackcoinIcon />
            <span>{item.price}</span>
          </div>
          <button
            onClick={() => onBuy(item, type)}
            className="bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xs px-3 py-1 rounded-lg font-bold transition-all duration-300 flex items-center hover:scale-105"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            شراء
          </button>
        </div>
      </div>
    </div>
  );
}

// CarCard component for cars
function CarCard({ car, onBuy }) {
  const rarity = car.rarity?.toLowerCase() || 'common';
  
  return (
    <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-xl p-4 space-y-3 hover:bg-hitman-700/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-red/20">
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
        </div>

        {/* Price and Buy Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-accent-red font-bold text-sm">
            <BlackcoinIcon />
            <span>{car.cost}</span>
          </div>
          <button
            onClick={() => onBuy(car)}
            className="bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xs px-3 py-1 rounded-lg font-bold transition-all duration-300 flex items-center hover:scale-105"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            شراء
          </button>
        </div>
      </div>
    </div>
  );
}

// HouseCard component for houses
function HouseCard({ house, onBuy }) {
  const rarity = house.rarity?.toLowerCase() || 'common';
  
  return (
    <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-xl p-4 space-y-3 hover:bg-hitman-700/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-red/20">
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

        {/* Price and Buy Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-accent-red font-bold text-sm">
            <BlackcoinIcon />
            <span>{house.cost}</span>
          </div>
          <button
            onClick={() => onBuy(house)}
            className="bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xs px-3 py-1 rounded-lg font-bold transition-all duration-300 flex items-center hover:scale-105"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            شراء
          </button>
        </div>
      </div>
    </div>
  );
}

// DogCard component for dogs
function DogCard({ dog, onBuy }) {
  const rarity = dog.rarity?.toLowerCase() || 'common';
  
  return (
    <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-xl p-4 space-y-3 hover:bg-hitman-700/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-red/20">
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

        {/* Price and Buy Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-accent-red font-bold text-sm">
            <BlackcoinIcon />
            <span>{dog.cost}</span>
          </div>
          <button
            onClick={() => onBuy(dog)}
            className="bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xs px-3 py-1 rounded-lg font-bold transition-all duration-300 flex items-center hover:scale-105"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            شراء
          </button>
        </div>
      </div>
    </div>
  );
}

// MoneyPackageCard component for money packages
function MoneyPackageCard({ pkg, onBuy, stats }) {
  return (
    <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden group hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
      {/* Money Image Container */}
      <div className="relative h-32 bg-gradient-to-br from-hitman-700 to-hitman-800 overflow-hidden">
        <img 
          src="/images/money.png" 
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
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 text-white group-hover:text-green-400 transition-colors">
          {pkg.name}
        </h3>
        
        {pkg.description && (
          <p className="text-sm text-hitman-400 mb-3">{pkg.description}</p>
        )}

        {/* Money Amount */}
        <div className="flex items-center mb-3">
          <MoneyIcon className="w-4 h-4 mr-2" />
          <span className="text-sm text-green-400 font-bold">
            {(pkg.moneyAmount + (pkg.bonus || 0)).toLocaleString()}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4 bg-hitman-800/30 rounded-lg p-3">
          <div className="flex items-center">
            <BlackcoinIcon />
            <span className="text-accent-red font-bold text-lg">{pkg.blackcoinCost}</span>
          </div>
          <span className="text-xs text-hitman-400">عملة سوداء</span>
        </div>

        {/* Bonus */}
        {pkg.bonus > 0 && (
          <div className="flex items-center mb-4 bg-green-900/30 border border-green-500/30 rounded-lg p-3">
            <Gift className="w-4 h-4 text-green-400 mr-2" />
            <span className="text-sm text-green-400 font-bold">+{pkg.bonus.toLocaleString()} مكافأة</span>
          </div>
        )}

        {/* Buy Button */}
        <button
          onClick={() => onBuy(pkg.id)}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={stats?.blackcoins < pkg.blackcoinCost}
        >
          <DollarSign className="w-4 h-4" />
          شراء المال
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { key: 'vip', label: 'متجر VIP', icon: <Star className="w-5 h-5 text-yellow-400" /> },
  { key: 'blackcoins', label: 'متجر العملة السوداء', icon: <img src="/images/blackcoins-icon.png" alt="Blackcoin" className="w-5 h-5 object-contain" /> },
  { key: 'money', label: 'شراء المال', icon: <MoneyIcon className="w-5 h-5" /> },
  { key: 'special', label: 'عناصر خاصة', icon: <Package className="w-5 h-5 text-purple-400" /> },
  { key: 'weapons', label: 'الأسلحة والدروع', icon: <Sword className="w-5 h-5 text-white" /> },
  { key: 'cars', label: 'السيارات', icon: <Car className="w-5 h-5 text-white" /> },
  { key: 'houses', label: 'المنازل', icon: <Home className="w-5 h-5 text-white" /> },
  { key: 'dogs', label: 'الكلاب', icon: <Dog className="w-5 h-5 text-white" /> },
];

export default function SpecialShop() {
  const { token } = useAuth();
  const { stats, invalidateHud } = useHud();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('vip');

  // --- VIP, Blackcoin, Special Items ---
  const [specialItems, setSpecialItems] = useState([]);
  const [blackcoinPackages, setBlackcoinPackages] = useState([]);
  const [vipPackages, setVipPackages] = useState([]);
  const [moneyPackages, setMoneyPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Weapons & Armors ---
  const [weapons, setWeapons] = useState([]);
  const [armors, setArmors] = useState([]);
  const [loadingWeapons, setLoadingWeapons] = useState(false);

  // --- Cars ---
  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(false);

  // --- Houses ---
  const [houses, setHouses] = useState([]);
  const [loadingHouses, setLoadingHouses] = useState(false);

  // --- Dogs ---
  const [dogs, setDogs] = useState([]);
  const [loadingDogs, setLoadingDogs] = useState(false);

  // --- Fetchers ---
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API}/api/special-items?currency=blackcoin`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API}/api/special-shop/blackcoin-packages`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API}/api/special-shop/vip-packages`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API}/api/special-shop/money-packages`, { headers: { Authorization: `Bearer ${token}` } })
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
  }, [token]);

  useEffect(() => {
    if (activeTab === 'weapons') {
      setLoadingWeapons(true);
      fetch(`${API}/api/special-shop/special`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          setWeapons(data.weapons || []);
          setArmors(data.armors || []);
          setLoadingWeapons(false);
        })
        .catch(() => { setWeapons([]); setArmors([]); setLoadingWeapons(false); });
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab === 'cars') {
      setLoadingCars(true);
      fetch(`${API}/api/special-shop/cars`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { setCars(data); setLoadingCars(false); })
        .catch(() => { setCars([]); setLoadingCars(false); });
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab === 'houses') {
      setLoadingHouses(true);
      fetch(`${API}/api/special-shop/houses`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { setHouses(data); setLoadingHouses(false); })
        .catch(() => { setHouses([]); setLoadingHouses(false); });
    }
  }, [activeTab, token]);

  useEffect(() => {
    if (activeTab === 'dogs') {
      setLoadingDogs(true);
      fetch(`${API}/api/special-shop/dogs`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => { setDogs(data); setLoadingDogs(false); })
        .catch(() => { setDogs([]); setLoadingDogs(false); });
    }
  }, [activeTab, token]);

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

  // --- Actions ---
  const buyVIP = async (packageId) => {
    try {
      const res = await fetch(`${API}/api/special-shop/buy/vip`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
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
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ dogId: dog.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message);
      toast.success('تم شراء الكلب بنجاح!');
      invalidateHud?.();
    } catch (err) { toast.error(err.message || 'فشل في شراء الكلب'); }
  };

  // --- Renderers ---
  function renderTabContent() {
    if (activeTab === 'vip') {
      return (
        <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-br from-hitman-800/60 to-hitman-900/60 border border-accent-red rounded-2xl p-6 shadow-lg animate-fade-in">
          <h2 className="text-2xl font-bouya text-accent-yellow mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            اشترِ عضوية VIP
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {vipPackages.map(pkg => (
              <div key={`vip-${pkg.id}`} className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden group hover:border-accent-yellow/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-yellow/20">
                {/* VIP Image Container */}
                <div className="relative h-32 bg-gradient-to-br from-hitman-700 to-hitman-800 overflow-hidden">
                  <img 
                    src="/images/VIP.png" 
                    alt="VIP Package"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center hidden">
                    <Star className="w-12 h-12 text-yellow-400" />
                  </div>
                  {/* VIP Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-sm text-yellow-400 border border-yellow-400/30">
                      VIP
                    </div>
                  </div>
                </div>

                {/* VIP Details */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-white group-hover:text-accent-yellow transition-colors">
                    {pkg.name}
                  </h3>
                  
                  {/* Duration */}
                  <div className="flex items-center mb-3">
                    <Clock className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-sm text-blue-400 font-bold">{pkg.durationDays} يوم</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4 bg-hitman-800/30 rounded-lg p-3">
                    <div className="flex items-center">
                      <BlackcoinIcon />
                      <span className="text-accent-red font-bold text-lg">{pkg.price}</span>
                    </div>
                    <span className="text-xs text-hitman-400">عملة سوداء</span>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => buyVIP(pkg.id)}
                    className="w-full bg-gradient-to-r from-accent-yellow to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-br from-hitman-800/60 to-hitman-900/60 border border-accent-red rounded-2xl p-6 shadow-lg animate-fade-in">
          <h2 className="text-2xl font-bouya text-accent-red mb-4 flex items-center gap-2">
            <BlackcoinIcon />
            اشترِ باقات العملة السوداء
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {blackcoinPackages.map(pkg => (
              <div key={`blackcoin-${pkg.id}`} className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden group hover:border-accent-red/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-red/20">
                {/* Blackcoin Image Container */}
                <div className="relative h-32 bg-gradient-to-br from-hitman-700 to-hitman-800 overflow-hidden">
                  <img 
                    src="/images/Blackcoins.png" 
                    alt="Blackcoin Package"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center hidden">
                    <BlackcoinIcon />
                  </div>
                  {/* Blackcoin Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-sm text-accent-red border border-accent-red/30">
                      عملة سوداء
                    </div>
                  </div>
                </div>

                {/* Blackcoin Details */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-white group-hover:text-accent-red transition-colors">
                    {pkg.name}
                  </h3>
                  
                  {/* USD Price */}
                  <div className="flex items-center mb-3">
                    <DollarSign className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-sm text-green-400 font-bold">${pkg.usdPrice}</span>
                  </div>

                  {/* Blackcoin Amount */}
                  <div className="flex items-center justify-between mb-3 bg-hitman-800/30 rounded-lg p-3">
                    <div className="flex items-center">
                      <BlackcoinIcon />
                      <span className="text-accent-yellow font-bold text-lg">{pkg.blackcoinAmount + (pkg.bonus || 0)}</span>
                    </div>
                    <span className="text-xs text-hitman-400">عملة سوداء</span>
                  </div>

                  {/* Bonus */}
                  {pkg.bonus > 0 && (
                    <div className="flex items-center mb-4 bg-green-900/30 border border-green-500/30 rounded-lg p-3">
                      <Gift className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-sm text-green-400 font-bold">+{pkg.bonus} مكافأة</span>
                    </div>
                  )}

                  {/* Buy Button */}
                  <button
                    onClick={() => buyBlackcoin(pkg.id)}
                    className="w-full bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105"
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
        <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-br from-hitman-800/60 to-hitman-900/60 border border-accent-red rounded-2xl p-6 shadow-lg animate-fade-in">
          <h2 className="text-2xl font-bouya text-green-400 mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-400" />
            اشترِ المال بالعملة السوداء
          </h2>
          <p className="text-hitman-300 mb-6">احصل على المال في اللعبة مقابل العملة السوداء</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {moneyPackages.length === 0 && (
              <div className="text-center text-hitman-400 col-span-full">لا توجد باقات مال متاحة حالياً.</div>
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
  
      if (loading) return <div className="text-center py-8">جاري تحميل العناصر الخاصة...</div>;
      return (
        <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-br from-hitman-800/60 to-hitman-900/60 border border-accent-red rounded-2xl p-6 shadow-lg animate-fade-in">
          <h2 className="text-2xl font-bouya text-accent-red mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-400" />
            العناصر الخاصة
          </h2>
          <p className="text-hitman-300 mb-6">جرعات ومواد خاصة لتعزيز قدراتك</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {specialItems.length === 0 && (
              <div className="text-center text-hitman-400 col-span-full">لا توجد عناصر خاصة حالياً.</div>
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
      if (loadingWeapons) return <div className="text-center py-8">جاري تحميل الأسلحة والدروع...</div>;
      // Filter to only blackcoin items
      const blackcoinWeapons = weapons.filter(item => item.currency === 'blackcoin');
      const blackcoinArmors = armors.filter(item => item.currency === 'blackcoin');
      return (
        <div className="max-w-5xl mx-auto mb-8 bg-gradient-to-br from-hitman-800/60 to-hitman-900/60 border border-accent-red rounded-2xl p-6 shadow-lg animate-fade-in">
          <h2 className="text-2xl font-bouya text-accent-red mb-4 flex items-center gap-2">
            <Sword className="w-6 h-6 text-white" />
            الأسلحة والدروع
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
      if (loadingCars) return <div className="text-center py-8">جاري تحميل السيارات...</div>;
      return (
        <div className="max-w-5xl mx-auto mb-8 bg-gradient-to-br from-hitman-800/60 to-hitman-900/60 border border-accent-red rounded-2xl p-6 shadow-lg animate-fade-in">
          <h2 className="text-2xl font-bouya text-accent-red mb-4 flex items-center gap-2">
            <Car className="w-6 h-6 text-white" />
            السيارات
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
      if (loadingHouses) return <div className="text-center py-8">جاري تحميل المنازل...</div>;
      return (
        <div className="max-w-5xl mx-auto mb-8 bg-gradient-to-br from-hitman-800/60 to-hitman-900/60 border border-accent-red rounded-2xl p-6 shadow-lg animate-fade-in">
          <h2 className="text-2xl font-bouya text-accent-red mb-4 flex items-center gap-2">
            <Home className="w-6 h-6 text-white" />
            المنازل
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
      if (loadingDogs) return <div className="text-center py-8">جاري تحميل الكلاب...</div>;
      return (
        <div className="max-w-5xl mx-auto mb-8 bg-gradient-to-br from-hitman-800/60 to-hitman-900/60 border border-accent-red rounded-2xl p-6 shadow-lg animate-fade-in">
          <h2 className="text-2xl font-bouya text-accent-red mb-4 flex items-center gap-2">
            <Dog className="w-6 h-6 text-white" />
            الكلاب
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner"></div>
          </div>
          <p className="text-white text-lg font-medium animate-pulse">
            جاري تحميل سوق العملة السوداء...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      <h1 className="text-4xl font-bouya text-center mb-10 animate-glow-red" style={{textShadow: '0 0 16px #ff1744, 0 0 32px #ff1744, 0 0 48px #ff1744'}}>
        سوق العملة السوداء
      </h1>
      <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 text-lg font-bold">
          <BlackcoinIcon />
          <span>رصيد العملة السوداء:</span>
          <span className="text-accent-red font-mono text-xl">{stats?.blackcoins ?? 0}</span>
        </div>
        {/* VIP Status */}
        {stats?.vipExpiresAt && new Date(stats.vipExpiresAt) > new Date() ? (
          <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 border border-yellow-600/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-yellow-400">
              <Star className="w-5 h-5" />
              <span className="font-bold">VIP نشط</span>
            </div>
          </div>
        ) : null}
      </div>
      {/* Tabs */}
      <div className="max-w-5xl mx-auto mb-8 flex flex-wrap gap-2 justify-center animate-fade-in">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 text-lg ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-accent-red to-red-700 text-white shadow-lg shadow-accent-red/30'
                : 'bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 text-hitman-300 hover:bg-hitman-700/50 hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="ml-2">{tab.label}</span>
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}

// Add this to your CSS (e.g., index.css or tailwind config):
// .animate-glow-red { animation: glow-red 2s infinite alternate; }
// @keyframes glow-red { 0% { text-shadow: 0 0 8px #ff1744; } 100% { text-shadow: 0 0 32px #ff1744, 0 0 48px #ff1744; } } 