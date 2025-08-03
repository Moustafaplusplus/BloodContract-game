/* ========================================================================
 *  Shop.jsx – Enhanced Blood Contract Shop with visual elements
 * =======================================================================*/
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useHud } from '@/hooks/useHud';
import { useSocket } from "@/hooks/useSocket";
import { 
  Sword, 
  Shield, 
  Gem, 
  ShoppingCart, 
  Package, 
  Star,
  Zap,
  Crown,
  Check,
  X,
  ImageIcon,
  Flame,
  Skull,
  Target,
  Coins,
  TrendingUp,
  Eye,
  Award,
  ShoppingBag,
  Users
} from 'lucide-react';
import MoneyIcon from '@/components/MoneyIcon';
import BlackcoinIcon from '@/components/BlackcoinIcon';

const API = import.meta.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app';

// Enhanced Item Card Component with visual elements
function ItemCard({ item, onBuy, type, userMoney, userBlackcoins }) {
  const [buying, setBuying] = useState(false);
  const currency = item.currency === 'blackcoins' ? 'blackcoins' : 'money';
  const IconComponent = currency === 'blackcoins' ? BlackcoinIcon : MoneyIcon;
  const userCurrency = currency === 'blackcoins' ? userBlackcoins : userMoney;
  const canAfford = userCurrency >= item.price;

  const handleBuy = async () => {
    if (!canAfford) {
      toast.warning(`${currency === 'blackcoins' ? 'بلاك كوين' : 'مال'} غير كافي`);
      return;
    }
    
    setBuying(true);
    try {
      await onBuy(item, type);
    } finally {
      setBuying(false);
    }
  };

  // Item type visuals
  const getItemVisuals = (itemType, rarity) => {
    const types = {
      weapons: {
        icon: type === 'weapons' ? (item.subtype === 'gun' ? Zap : item.subtype === 'knife' ? Sword : Sword) : Sword,
        color: 'red',
        bgGrad: 'from-red-950/40 to-blood-950/20'
      },
      armors: {
        icon: Shield,
        color: 'blue',
        bgGrad: 'from-blue-950/40 to-cyan-950/20'
      },
      'special-items': {
        icon: Gem,
        color: 'purple',
        bgGrad: 'from-purple-950/40 to-pink-950/20'
      }
    };
    return types[itemType] || types.weapons;
  };

  // Rarity colors
  const getRarityColor = (rarity) => {
    const rarities = {
      common: 'white',
      uncommon: 'green',
      rare: 'blue', 
      epic: 'purple',
      legendary: 'yellow'
    };
    return rarities[rarity] || 'white';
  };

  const visuals = getItemVisuals(type, item.rarity);
  const rarityColor = getRarityColor(item.rarity);
  const IconComponent2 = visuals.icon;
  
  return (
    <div className={`card-3d p-3 transition-all duration-300 relative overflow-hidden ${
      canAfford ? 'hover:scale-[1.02] cursor-pointer hover:border-green-500/50 hover:shadow-md hover:shadow-green-500/20' : 'opacity-60'
    }`}>
      
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${visuals.bgGrad} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Item Banner Image Placeholder */}
      <div className="relative mb-3 h-16 bg-gradient-to-r from-black/60 via-blood-950/40 to-black/60 rounded border border-blood-500/20 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-blood-400/30">
            <ImageIcon className="w-8 h-8" />
          </div>
        </div>
        {/* Item type overlay */}
        <div className="absolute top-1 right-1 flex items-center gap-1">
          <div className={`p-1 rounded bg-${visuals.color}-500/30 border border-${visuals.color}-500/40`}>
            <IconComponent2 className={`w-3 h-3 text-${visuals.color}-400`} />
          </div>
        </div>
        {/* Rarity indicator */}
        <div className="absolute bottom-1 left-1">
          <div className={`px-1 py-0.5 rounded bg-${rarityColor}-500/30 border border-${rarityColor}-500/40`}>
            <span className={`text-xs text-${rarityColor}-400 font-bold`}>
              {item.rarity || 'عادي'}
            </span>
          </div>
        </div>
        {/* Affordability indicator */}
        <div className="absolute bottom-1 right-1">
          <div className={`p-1 rounded-full ${
            canAfford ? 'bg-green-500/30 border border-green-500/40' : 'bg-red-500/30 border border-red-500/40'
          }`}>
            {canAfford ? (
              <Check className="w-2 h-2 text-green-400" />
            ) : (
              <X className="w-2 h-2 text-red-400" />
            )}
          </div>
        </div>
      </div>

      {/* Item Content */}
      <div className="relative z-10">
        {/* Item Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm truncate">{item.name}</h3>
            <p className="text-white/60 text-xs line-clamp-1">{item.description}</p>
          </div>
        </div>
        
        {/* Item Stats */}
        {item.stats && (
          <div className="card-3d bg-black/40 border-white/10 p-2 mb-2">
            <div className="grid grid-cols-2 gap-1 text-xs">
              {Object.entries(item.stats).slice(0, 4).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-white/50">{key}:</span>
                  <span className="text-green-400 font-bold">+{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Price Section */}
        <div className="space-y-2">
          <div className={`card-3d p-2 text-center ${
            currency === 'blackcoins' 
              ? 'bg-blood-500/10 border-blood-500/30' 
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            <div className="flex items-center justify-center gap-1">
              <IconComponent className="w-3 h-3" />
              <span className={`font-bold text-xs ${
                currency === 'blackcoins' ? 'text-blood-400' : 'text-green-400'
              }`}>
                {item.price.toLocaleString()}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleBuy}
            disabled={!canAfford || buying}
            className={`btn-3d w-full text-xs py-1 ${
              !canAfford ? 'opacity-50 cursor-not-allowed' : ''
            } ${buying ? 'opacity-50' : ''}`}
          >
            {buying ? (
              <div className="flex items-center justify-center gap-1">
                <div className="loading-shimmer w-3 h-3 rounded-full"></div>
                <span>شراء...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <ShoppingCart className="w-3 h-3" />
                <span>شراء</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Category Tab Component
const CategoryTab = ({ icon: Icon, label, active, onClick, count }) => (
  <button
    onClick={onClick}
    className={`btn-3d flex-1 text-xs py-2 ${
      active ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'btn-3d-secondary'
    }`}
  >
    <div className="flex items-center justify-center gap-2">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count > 0 && (
        <span className="badge-3d text-xs">
          {count}
        </span>
      )}
    </div>
  </button>
);

export default function Shop() {
  const { customToken } = useFirebaseAuth();
  const { stats, invalidateHud } = useHud();
  const { socket } = useSocket();
  
  const [categories, setCategories] = useState(['weapons', 'armors', 'special-items']);
  const [activeCategory, setActiveCategory] = useState('weapons');
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch shop data
  useEffect(() => {
    const fetchShopData = async () => {
      if (!customToken) return;
      
      setLoading(true);
      try {
        const shopData = {};
        
        for (const category of categories) {
          let endpoint;
          if (category === 'special-items') {
            endpoint = `${API}/api/special-items`;
          } else {
            endpoint = `${API}/api/shop/${category}`;
          }
          
          const response = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${customToken}` },
          });
          
          if (response.ok) {
            const data = await response.json();
            shopData[category] = Array.isArray(data) ? data : [];
          } else {
            shopData[category] = [];
          }
        }
        
        setItems(shopData);
      } catch (error) {
        toast.error('فشل في تحميل ا��متجر');
        setItems({});
      } finally {
        setLoading(false);
      }
    };

    fetchShopData();
  }, [customToken, categories]);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    
    const handleUpdate = () => {
      // Refetch data when inventory updates
      setTimeout(() => {
        invalidateHud();
      }, 1000);
    };
    
    socket.on('shop:update', handleUpdate);
    socket.on('inventory:update', handleUpdate);
    
    return () => {
      socket.off('shop:update', handleUpdate);
      socket.off('inventory:update', handleUpdate);
    };
  }, [socket, invalidateHud]);

  const buyItem = async (item, category) => {
    if (!customToken) return;
    
    try {
      let endpoint;
      if (category === 'weapons') {
        endpoint = `${API}/api/shop/buy/weapon/${item.id}`;
      } else if (category === 'armors') {
        endpoint = `${API}/api/shop/buy/armor/${item.id}`;
      } else if (category === 'special-items') {
        endpoint = `${API}/api/special-items/buy/${item.id}`;
      } else {
        throw new Error('فئة غير معروفة');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في الشراء');
      }

      const result = await response.json();
      toast.success(result.message || 'تم الشراء بنجاح!');
      invalidateHud();
      
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen blood-gradient flex items-center justify-center">
        <div className="text-center card-3d p-6">
          <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
          <p className="text-white text-sm">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  const currentItems = items[activeCategory] || [];
  const userMoney = stats?.money || 0;
  const userBlackcoins = stats?.blackcoins || 0;

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom">
      <div className="container mx-auto max-w-6xl p-3 space-y-4">
        
        {/* Enhanced Header with Shop Banner */}
        <div className="relative">
          {/* Shop Banner Image Placeholder */}
          <div className="relative h-20 bg-gradient-to-r from-purple-950/60 via-black/40 to-purple-950/60 rounded-lg border border-purple-500/30 overflow-hidden mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <ShoppingBag className="w-6 h-6 text-purple-400" />
                  <h1 className="text-lg font-bold text-purple-400 animate-glow">
                    متجر الأسلحة
                  </h1>
                  <Crown className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto"></div>
              </div>
            </div>
            {/* Shop indicators */}
            <div className="absolute top-2 left-2">
              <Gem className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <div className="absolute top-2 right-2">
              <TrendingUp className="w-4 h-4 text-green-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Enhanced User Currency Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="card-3d p-3 bg-gradient-to-br from-green-950/30 to-emerald-950/20 border-green-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-green-500/20 border border-green-500/40">
                  <MoneyIcon className="w-4 h-4 text-green-400" />
                </div>
                <span className="font-bold text-green-400 text-sm">المال</span>
              </div>
              <span className="text-sm font-bold text-green-400">
                {userMoney.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="card-3d p-3 bg-gradient-to-br from-blood-950/30 to-red-950/20 border-blood-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-blood-500/20 border border-blood-500/40">
                  <BlackcoinIcon className="w-4 h-4 text-blood-400" />
                </div>
                <span className="font-bold text-blood-400 text-sm">البلاك كوين</span>
              </div>
              <span className="text-sm font-bold text-blood-400">
                {userBlackcoins.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <CategoryTab
            icon={Sword}
            label="الأسلحة"
            active={activeCategory === 'weapons'}
            onClick={() => setActiveCategory('weapons')}
            count={items.weapons?.length || 0}
          />
          <CategoryTab
            icon={Shield}
            label="الدروع"
            active={activeCategory === 'armors'}
            onClick={() => setActiveCategory('armors')}
            count={items.armors?.length || 0}
          />
          <CategoryTab
            icon={Gem}
            label="العناصر الخاصة"
            active={activeCategory === 'special-items'}
            onClick={() => setActiveCategory('special-items')}
            count={items['special-items']?.length || 0}
          />
        </div>

        {/* Enhanced Items Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-purple-400 flex items-center gap-2">
            <Package className="w-4 h-4" />
            {activeCategory === 'weapons' ? 'الأسلحة المتاحة' : 
             activeCategory === 'armors' ? 'الدروع المتاحة' : 
             'العناصر الخاصة المتاحة'}
            <span className="text-white/60 text-xs">({currentItems.length})</span>
          </h2>
          
          {currentItems.length === 0 ? (
            <div className="card-3d p-6 text-center">
              <Package className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60 text-sm">لا توجد عناصر متاحة في هذه الفئة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {currentItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onBuy={buyItem}
                  type={activeCategory}
                  userMoney={userMoney}
                  userBlackcoins={userBlackcoins}
                />
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Shop Info */}
        <div className="card-3d p-4 bg-gradient-to-r from-purple-950/20 to-black/40 border-purple-500/20">
          <h3 className="font-bold text-purple-400 mb-3 flex items-center gap-2 text-sm">
            <Crown className="w-4 h-4" />
            معلومات المتجر
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Sword className="w-3 h-3 text-red-400" />
              <span>الأسلحة تزيد من قوتك في المعارك</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-blue-400" />
              <span>الدروع تحسن من دفاعك ضد الهجمات</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-3 h-3 text-blood-400" />
              <span>بعض العناصر تتطلب البلاك كوين النادر</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-yellow-400" />
              <span>تحقق من إحصائيات العنصر قبل الشراء</span>
            </div>
          </div>
        </div>

        {/* Shop Recommendations */}
        <div className="card-3d p-4 bg-gradient-to-r from-blood-950/20 to-black/40 border-blood-500/20">
          <h3 className="text-sm font-bold text-blood-400 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            توصيات المتجر
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Award className="w-3 h-3 text-yellow-400" />
              <span>ارفع مستواك لفتح أسلحة أقوى</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-blue-400" />
              <span>انضم لعصابة للحصول على مكافآت إضافية</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
