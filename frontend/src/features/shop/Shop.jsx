/* ========================================================================
 *  Shop.jsx – now shows ⚡ energyBonus for weapons & ❤️ hpBonus for armors
 * =======================================================================*/
import { useEffect, useState } from 'react';
import { toast }               from 'react-hot-toast';
import { useAuth }             from '@/hooks/useAuth';
import { useHud }              from '@/hooks/useHud';

const API = import.meta.env.VITE_API_URL;

function ItemCard({ item, onBuy }) {
  return (
    <div className="bg-zinc-900 rounded border border-zinc-800 p-4 space-y-2 hover:bg-zinc-800 text-white">
      <h4 className="font-semibold text-red-500">{item.name}</h4>
      {item.damage      && <p className="text-xs">⚔️ dmg: {item.damage}</p>}
      {item.def         && <p className="text-xs">🛡️ def: {item.def}</p>}
      {item.energyBonus && <p className="text-xs">⚡ طاقة: +{item.energyBonus}</p>}
      {item.hpBonus     && <p className="text-xs">❤️ صحة: +{item.hpBonus}</p>}
      <p className="text-xs">💵 {item.price}$</p>
      <button
        onClick={() => onBuy(item)}
        className="w-full bg-red-600 hover:bg-red-700 rounded text-xs py-1 mt-2 text-white font-bold"
      >
        شراء
      </button>
    </div>
  );
}

export default function Shop() {
  const { token }         = useAuth();
  const { invalidateHud } = useHud();
  const [weapons, setWeapons] = useState(null);
  const [armors,  setArmors]  = useState(null);

  useEffect(() => {
    fetch(`${API}/api/shop/weapons`).then(r => r.json()).then(setWeapons);
    fetch(`${API}/api/shop/armors`).then(r => r.json()).then(setArmors);
  }, []);

  const buy = async (item) => {
    const slot = item.damage ? 'weapon' : 'armor';
    const path = slot === 'weapon' ? 'weapon' : 'armor';
    try {
      const res  = await fetch(`${API}/api/shop/buy/${path}/${item.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('تم الشراء!');
      invalidateHud?.();                    // refresh cash
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!weapons || !armors) {
    return <div className="p-6 text-gray-200 animate-pulse bg-black min-h-screen">جارٍ التحميل…</div>;
  }

  return (
    <section className="p-6 space-y-8 bg-black min-h-screen text-white">
      <h2 className="text-2xl font-bold text-red-600">🏪 المتجر</h2>
      <div>
        <h3 className="text-xl font-semibold mb-2 text-red-500">🗡️ الأسلحة</h3>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {weapons.map((w) => (
            <ItemCard key={w.id} item={w} onBuy={buy} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2 text-red-500">🛡️ الدروع</h3>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {armors.map((a) => (
            <ItemCard key={a.id} item={a} onBuy={buy} />
          ))}
        </div>
      </div>
    </section>
  );
}
