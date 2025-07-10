/* ========================================================================
 *  Inventory.jsx – now shows energyBonus (⚡) or hpBonus (❤️)
 * =======================================================================*/
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { toast }               from 'react-hot-toast';
import { useAuth }             from '@/hooks/useAuth';
import { useHud }              from '@/hooks/useHud';

const API = import.meta.env.VITE_API_URL;

/* fetch helper ------------------------------------------------------------ */
async function api(path, token, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
    cache: 'no-store',
  });
  if (res.ok) return res.status === 204 ? null : res.json();
  throw new Error(await res.text() || 'خطأ غير معروف');
}

/* rarity → colour --------------------------------------------------------- */
const rarityColor = (r) =>
  r === 'rare'   ? 'text-purple-400'
: r === 'epic'   ? 'text-pink-400'
: r === 'legend' ? 'text-amber-400'
: 'text-slate-300';

/* single item card -------------------------------------------------------- */
function ItemCard({ item, onEquip, onUnequip, onSell }) {
  const {
    id, type, name, rarity,
    damage, def, energyBonus, hpBonus,
    price, equipped,
  } = item;

  return (
    <div className={`rounded border p-3 space-y-1 hover:bg-slate-800 transition
        ${equipped ? 'border-emerald-400' : 'border-slate-700'}`}>
      <h4 className="font-semibold flex justify-between items-center">
        {name}
        <span className={`text-xs ${rarityColor(rarity)}`}>{rarity}</span>
      </h4>

      {damage      && <p className="text-xs">⚔️ dmg: {damage}</p>}
      {def         && <p className="text-xs">🛡️ def: {def}</p>}
      {energyBonus && <p className="text-xs">⚡ طاقة: +{energyBonus}</p>}
      {hpBonus     && <p className="text-xs">❤️ صحة: +{hpBonus}</p>}

      <p className="text-xs">💵 {price}$</p>

      <div className="flex gap-1 pt-2">
        {equipped ? (
          <button onClick={() => onUnequip(type)}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 rounded text-xs py-1">
            فك
          </button>
        ) : (
          <button onClick={() => onEquip(type, id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded text-xs py-1">
            تجهيز
          </button>
        )}
        <button onClick={() => onSell(type, id)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 rounded text-xs py-1">
          بيع
        </button>
      </div>
    </div>
  );
}

/* main component ---------------------------------------------------------- */
export default function Inventory() {
  const { token }         = useAuth();
  const { invalidateHud } = useHud();
  const navigate          = useNavigate();
  const [items, setItems] = useState(null); // null = loading

  /* initial load */
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    api('/api/inventory', token)
      .then(({ items }) => setItems(items))
      .catch((err) => {
        toast.error(err.message);
        if (err.message.includes('401')) navigate('/login');
      });
  }, [token, navigate]);

  /* actions (equip / unequip / sell) -------------------------------------- */
  const equip = async (type, itemId) => {
    try {
      await api('/api/inventory/equip', token, {
        method: 'POST', body: JSON.stringify({ type, itemId }),
      });
      setItems((prev) =>
        prev.map((it) => ({ ...it, equipped: it.type === type && it.id === itemId }))
      );
      invalidateHud?.();
      toast.success('تم التجهيز');
    } catch (e) { toast.error(e.message); }
  };

  const unequip = async (type) => {
    try {
      await api('/api/inventory/unequip', token, {
        method: 'POST', body: JSON.stringify({ type }),
      });
      setItems((prev) => prev.map((it) => it.type === type ? { ...it, equipped: false } : it));
      invalidateHud?.();
      toast.success('تم الفك');
    } catch (e) { toast.error(e.message); }
  };

  const sell = async (type, itemId) => {
    try {
      const { sellPrice } = await api('/api/inventory/sell', token, {
        method: 'POST', body: JSON.stringify({ type, itemId }),
      });
      setItems((prev) => prev.filter((it) => !(it.type === type && it.id === itemId)));
      invalidateHud?.();
      toast.success(`بعت بمبلغ ${sellPrice}$`);
    } catch (e) { toast.error(e.message); }
  };

  /* UI -------------------------------------------------------------------- */
  if (items === null) {
    return (
      <div className="p-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-800 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <section className="bg-black min-h-screen text-white p-4 space-y-8">
      <h1 className="text-2xl font-bold text-red-600 mb-4">🎒 المخزون</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-white">
            <h3 className="font-bold text-lg text-red-500 mb-2">{item.name}</h3>
            <p className="text-gray-300 mb-2">{item.description}</p>
            <div className="flex justify-between text-sm mb-2">
              <span>الكمية:</span>
              <span className="text-red-400 font-mono">{item.quantity}</span>
            </div>
            <button
              onClick={() => useItem(item.id)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg mt-2"
              disabled={usingId === item.id}
            >
              {usingId === item.id ? 'جاري الاستخدام...' : 'استخدم'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
