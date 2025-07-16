import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/hooks/useAuth';
import { useHud } from '@/hooks/useHud';
import { Star, ImageIcon } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

function BlackcoinIcon() {
  return (
    <span className="inline-block w-5 h-5 rounded-full bg-gradient-to-br from-black via-zinc-900 to-zinc-800 border-2 border-accent-red flex items-center justify-center mr-1">
      <span className="text-xs text-accent-red font-bold">ع</span>
    </span>
  );
}

export default function SpecialShop() {
  const { token } = useAuth();
  const { stats, invalidateHud } = useHud();
  const [specialItems, setSpecialItems] = useState([]);
  const [blackcoinPackages, setBlackcoinPackages] = useState([]);
  const [vipPackages, setVipPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const [specialRes, packagesRes, vipRes] = await Promise.all([
          fetch(`${API}/api/special-shop/special`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/special-shop/blackcoin-packages`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/special-shop/vip-packages`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (specialRes.status === 401 || packagesRes.status === 401 || vipRes.status === 401) {
          toast.error('يجب تسجيل الدخول للوصول إلى سوق العملة السوداء');
          setSpecialItems([]);
          setBlackcoinPackages([]);
          setVipPackages([]);
          setLoading(false);
          return;
        }
        const specialData = await specialRes.json();
        // Merge weapons and armors into one array for display
        const mergedSpecial = [
          ...(Array.isArray(specialData.weapons) ? specialData.weapons : []),
          ...(Array.isArray(specialData.armors) ? specialData.armors : [])
        ];
        setSpecialItems(mergedSpecial);
        const packagesData = await packagesRes.json();
        const vipData = await vipRes.json();
        setBlackcoinPackages(Array.isArray(packagesData) ? packagesData : []);
        setVipPackages(Array.isArray(vipData) ? vipData : []);
      } catch (error) {
        console.error('Failed to fetch special shop items:', error);
        toast.error('فشل في تحميل عناصر سوق العملة السوداء');
        setSpecialItems([]);
        setBlackcoinPackages([]);
        setVipPackages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [token]);

  const buyVIP = async (packageId) => {
    try {
      const res = await fetch(`${API}/api/special-shop/buy/vip`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('تم شراء VIP بنجاح!');
      invalidateHud?.();
    } catch (err) {
      toast.error(err.message || 'فشل شراء VIP');
    }
  };

  const buyBlackcoin = async (packageId) => {
    try {
      const res = await fetch(`${API}/api/special-shop/buy/blackcoin`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('تم شراء الباقة بنجاح!');
      invalidateHud?.();
    } catch (err) {
      toast.error(err.message || 'فشل شراء العملة السوداء');
    }
  };

  const buySpecial = async (item) => {
    try {
      let quantity = 1;
      const input = window.prompt('كمية الشراء؟', '1');
      if (input !== null) {
        const parsed = parseInt(input);
        if (!isNaN(parsed) && parsed > 0) quantity = parsed;
      }
      const res = await fetch(`${API}/api/special-shop/buy/special/${item.id}`, {
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
      {/* Red glowy shop name */}
      <h1 className="text-4xl font-bouya text-center mb-10 animate-glow-red" style={{textShadow: '0 0 16px #ff1744, 0 0 32px #ff1744, 0 0 48px #ff1744'}}>
        سوق العملة السوداء
      </h1>
      {/* Blackcoin balance */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 text-lg font-bold">
          <BlackcoinIcon />
          <span>رصيد العملة السوداء:</span>
          <span className="text-accent-red font-mono text-xl">{stats?.blackcoins ?? 0}</span>
        </div>
        <div className="flex items-center gap-2 text-lg font-bold">
          <Star className="w-5 h-5 text-yellow-400 mr-1" />
          <span>VIP:</span>
          {stats?.vipExpiresAt && new Date(stats.vipExpiresAt) > new Date() ? (
            <span className="text-accent-yellow font-mono text-base">
              فعال حتى {new Date(stats.vipExpiresAt).toLocaleDateString('ar-EG')}
            </span>
          ) : (
            <span className="text-hitman-400">غير مفعل</span>
          )}
        </div>
      </div>
      {/* VIP Purchase Section */}
      <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-br from-hitman-800/60 to-hitman-900/60 border border-accent-red rounded-2xl p-6 shadow-lg animate-fade-in">
        <h2 className="text-2xl font-bouya text-accent-yellow mb-4 flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" />
          اشترِ عضوية VIP
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {vipPackages.map(pkg => (
            <div key={`vip-${pkg.id}`} className="bg-black/60 border border-yellow-700 rounded-xl p-4 flex flex-col items-center gap-2">
              <div className="text-lg font-bold text-yellow-300 flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400" /> {pkg.name}
              </div>
              <div className="flex items-center gap-1 text-accent-red font-bold text-xl">
                <BlackcoinIcon />
                <span>{pkg.price}</span>
              </div>
              <button
                onClick={() => buyVIP(pkg.id)}
                className="mt-2 bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 hover:scale-105"
                disabled={stats?.blackcoins < pkg.price}
              >
                شراء VIP
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Blackcoin Packages Section */}
      <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-br from-hitman-800/60 to-hitman-900/60 border border-accent-red rounded-2xl p-6 shadow-lg animate-fade-in">
        <h2 className="text-2xl font-bouya text-accent-red mb-4 flex items-center gap-2">
          <BlackcoinIcon />
          اشترِ باقات العملة السوداء
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {blackcoinPackages.map(pkg => (
            <div key={`blackcoin-${pkg.id}`} className="bg-black/60 border border-accent-red rounded-xl p-4 flex flex-col items-center gap-2">
              <div className="text-lg font-bold text-accent-red flex items-center gap-1">
                <BlackcoinIcon /> {pkg.name}
              </div>
              <div className="flex items-center gap-1 text-accent-yellow font-bold text-xl">
                <BlackcoinIcon />
                <span>{pkg.blackcoinAmount + (pkg.bonus || 0)}</span>
              </div>
              <button
                onClick={() => buyBlackcoin(pkg.id)}
                className="mt-2 bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 hover:scale-105"
              >
                شراء الباقة
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Special Items Section */}
      <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-br from-hitman-800/60 to-hitman-900/60 border border-accent-red rounded-2xl p-6 shadow-lg animate-fade-in">
        <h2 className="text-2xl font-bouya text-accent-red mb-4 flex items-center gap-2">
          <BlackcoinIcon />
          عناصر خاصة (عملة سوداء)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {specialItems.length === 0 && (
            <div className="text-center text-hitman-400 col-span-full">لا توجد عناصر خاصة حالياً.</div>
          )}
          {specialItems.map(item => (
            <div key={`special-${item.type || (item.damage ? 'weapon' : 'armor')}-${item.id}`} className="bg-black/60 border border-accent-red rounded-xl p-4 flex flex-col items-center gap-2">
              <div className="relative w-full h-24 bg-gradient-to-br from-hitman-700 to-hitman-800 rounded-lg flex items-center justify-center border border-hitman-600 mb-2">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 flex items-center justify-center ${item.imageUrl ? 'hidden' : 'flex'}`}>
                  <ImageIcon className="w-8 h-8 text-hitman-400" />
                </div>
              </div>
              <div className="font-semibold text-white text-sm truncate mb-1">{item.name}</div>
              <div className="flex items-center gap-1 text-accent-red font-bold text-base mb-2">
                <BlackcoinIcon />
                <span>{item.price}</span>
                <span className="text-xs">عملة سوداء</span>
              </div>
              <button
                onClick={() => buySpecial(item)}
                className="bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center gap-2 hover:scale-105"
                disabled={stats?.blackcoins < item.price}
              >
                شراء
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Add this to your CSS (e.g., index.css or tailwind config):
// .animate-glow-red { animation: glow-red 2s infinite alternate; }
// @keyframes glow-red { 0% { text-shadow: 0 0 8px #ff1744; } 100% { text-shadow: 0 0 32px #ff1744, 0 0 48px #ff1744; } } 