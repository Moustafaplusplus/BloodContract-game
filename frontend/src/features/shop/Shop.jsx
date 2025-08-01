/* ========================================================================
 *  Shop.jsx – Enhanced shop with category tabs and better styling
 * =======================================================================*/
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useHud } from '@/hooks/useHud';
import { useSocket } from "@/hooks/useSocket";
import { Sword, Shield, Gem, ShoppingCart, Package } from 'lucide-react';
import MoneyIcon from '@/components/MoneyIcon';
import BlackcoinIcon from '@/components/BlackcoinIcon';

const API = import.meta.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app';

function ItemCard({ item, onBuy, type }) {
  const [buying, setBuying] = useState(false);
  const currency = item.currency === 'blackcoins' ? 'blackcoins' : 'money';
  const IconComponent = currency === 'blackcoins' ? BlackcoinIcon : MoneyIcon;

  const handleBuy = async () => {
    setBuying(true);
    try {
      await onBuy(item, type);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border border-hitman-700 rounded-lg p-4 hover:border-hitman-600 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-lg">{item.name}</h3>
        <div className="flex items-center gap-1">
          <IconComponent className="w-4 h-4" />
          <span className="text-white font-mono">{item.price.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-hitman-300 text-sm">{item.description}</p>
        {item.stats && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(item.stats).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-hitman-400">{key}:</span>
                <span className="text-white font-mono">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button
        onClick={handleBuy}
        disabled={buying}
        className="w-full bg-gradient-to-r from-accent-red to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {buying ? 'جاري الشراء...' : 'شراء'}
      </button>
    </div>
  );
}

export default function Shop() {
  const { customToken } = useFirebaseAuth();
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
          Authorization: `Bearer ${customToken}`,
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
          <p className="text-hitman-400">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">المتجر</h1>
          <p className="text-hitman-400">اشتر الأسلحة والدروع والعناصر الخاصة</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
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
    </div>
  );
}