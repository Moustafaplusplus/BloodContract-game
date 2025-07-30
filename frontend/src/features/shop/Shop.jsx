/* ========================================================================
 *  Shop.jsx – Enhanced shop with category tabs and better styling
 * =======================================================================*/
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useHud } from '@/hooks/useHud';
import { useSocket } from "@/hooks/useSocket";
import { 
  Sword, 
  Shield, 
  Package, 
  DollarSign, 
  Zap, 
  Heart, 
  Star,
  ImageIcon,
  ShoppingCart,
  Gem,
  Bomb,
  Clock
} from 'lucide-react';
import { handleImageError, getImageUrl } from '@/utils/imageUtils';

const API = import.meta.env.VITE_API_URL;



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
              {item.effect.cdReset && (
                <div className="flex items-center text-green-400">
                  <Clock className="w-3 h-3 mr-1" />
                  <span className="text-xs">إعادة تعيين أوقات الانتظار - إزالة جميع أوقات الانتظار فوراً</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Price and Buy Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-accent-green font-bold text-sm">
            {item.currency === 'blackcoin' ? (
              <Gem className="w-3 h-3 mr-1 text-yellow-400" />
            ) : (
              <DollarSign className="w-3 h-3 mr-1" />
            )}
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

export default function Shop() {
  const { token } = useAuth();
  const { invalidateHud } = useHud();
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState('weapons');
  const [weapons, setWeapons] = useState([]);
  const [armors, setArmors] = useState([]);
  const [specialItems, setSpecialItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [weaponsRes, armorsRes, specialItemsRes] = await Promise.all([
          fetch(`${API}/api/shop/weapons`),
          fetch(`${API}/api/shop/armors`),
          fetch(`${API}/api/special-items?currency=money`)
        ]);
        const weaponsData = await weaponsRes.json();
        const armorsData = await armorsRes.json();
        const specialItemsData = await specialItemsRes.json();
        setWeapons(weaponsData);
        setArmors(armorsData);
        setSpecialItems(specialItemsData);
      } catch (error) {
        console.error('Failed to fetch shop items:', error);
        toast.error('فشل في تحميل عناصر المتجر');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

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

  const buy = async (item, type) => {
    try {
      let quantity = 1;
      const input = window.prompt('كمية الشراء؟', '1');
      if (input !== null) {
        const parsed = parseInt(input);
        if (!isNaN(parsed) && parsed > 0) quantity = parsed;
      }
      const endpoint = type === 'special' ? `${API}/api/special-items/buy/${item.id}` : `${API}/api/shop/buy/${type}/${item.id}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('تم الشراء بنجاح!');
      invalidateHud?.();
    } catch (err) {
      toast.error(err.message || 'فشل في الشراء');
    }
  };

  const tabs = [
    { id: 'weapons', name: 'الأسلحة', icon: Sword, count: weapons.length },
    { id: 'armors', name: 'الدروع', icon: Shield, count: armors.length },
    { id: 'special', name: 'العناصر الخاصة', icon: Gem, count: specialItems.length }
  ];

  const getCurrentItems = () => {
    switch (activeTab) {
      case 'weapons': return weapons;
      case 'armors': return armors;
      case 'special': return specialItems;
      default: return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner"></div>
            <ShoppingCart className="w-8 h-8 text-accent-red absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-lg font-medium animate-pulse">
            جاري تحميل المتجر...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
      {/* Banner */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 flex items-center justify-center bg-gradient-to-br from-accent-red/40 to-black/60 border-2 border-accent-red animate-fade-in">
        <div className="relative z-10 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-accent-red mb-2 animate-bounce" />
          <h1 className="text-4xl font-bouya mb-2 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">المتجر</h1>
          <p className="text-hitman-300 text-lg">اشترِ أفضل الأسلحة والدروع</p>
        </div>
      </div>
      {/* Category Tabs */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-accent-red to-red-700 text-white shadow-lg shadow-accent-red/30'
                  : 'bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 text-hitman-300 hover:bg-hitman-700/50 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              <span>{tab.name}</span>
              <span className="ml-2 bg-hitman-700 text-white text-xs px-2 py-1 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* Items Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {getCurrentItems().map((item) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onBuy={buy} 
              type={activeTab === 'special' ? 'special' : activeTab.slice(0, -1)} // Fix for special items
            />
          ))}
        </div>
        {/* Empty State */}
        {getCurrentItems().length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-hitman-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-hitman-400 mb-2">لا توجد عناصر</h3>
            <p className="text-hitman-500">لا توجد عناصر متاحة في هذه الفئة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
