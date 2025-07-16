import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useHud } from '@/hooks/useHud';
import Modal from '@/components/Modal';
import { Sword, Shield, Zap, Heart, ImageIcon, XCircle, Trash2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const rarityColors = {
  common: 'text-gray-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legend: 'text-yellow-400',
};

const rarityIcons = {
  common: '⭐',
  uncommon: '⭐⭐',
  rare: '⭐⭐⭐',
  epic: '⭐⭐⭐⭐',
  legend: '⭐⭐⭐⭐⭐',
};

const weaponTypes = ['melee', 'rifle', 'sniper', 'pistol', 'weapon'];

function Stat({ icon: Icon, color, value, label }) {
  return (
    <div className="flex items-center gap-1 text-sm font-bold">
      <Icon className={`w-5 h-5 ${color}`} />
      <span className={color}>{value}</span>
      <span className="text-hitman-300 font-normal text-xs">{label}</span>
    </div>
  );
}

function ItemCard({ item, onEquip, onUnequip, onSell, isEquipped, slotOptions }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div
      className={`bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 border-2 rounded-2xl shadow-lg p-6 relative transition-all duration-300 backdrop-blur-sm ${
        isEquipped ? 'border-accent-red ring-2 ring-accent-red/40 animate-glow' : 'border-hitman-700'
      } hover:scale-105 hover:shadow-2xl`}
    >
      {/* Equipped badge */}
      {isEquipped && (
        <span className="absolute top-3 left-3 bg-accent-red text-white text-xs px-3 py-1 rounded-full font-bold shadow animate-glow z-10">
          مجهز
        </span>
      )}
      {/* Item Image */}
      <div className="relative w-full h-24 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800 mb-4 overflow-hidden">
        {!imgError && item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-contain rounded-xl"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <ImageIcon className="w-10 h-10 text-zinc-600" />
          </div>
        )}
      </div>
      {/* Name & Rarity */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-lg text-white truncate">{item.name}</span>
        <span className={`text-base ${rarityColors[item.rarity]}`}>{rarityIcons[item.rarity]}</span>
      </div>
      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-2">
        {item.damage !== undefined && item.damage !== null && (
          <Stat icon={Sword} color="text-accent-red" value={item.damage} label="ضرر" />
        )}
        {item.def !== undefined && item.def !== null && (
          <Stat icon={Shield} color="text-accent-blue" value={item.def} label="دفاع" />
        )}
        {item.energyBonus !== undefined && item.energyBonus !== null && item.energyBonus !== 0 && (
          <Stat icon={Zap} color="text-accent-yellow" value={`+${item.energyBonus}`} label="طاقة" />
        )}
        {item.hpBonus !== undefined && item.hpBonus !== null && item.hpBonus !== 0 && (
          <Stat icon={Heart} color="text-accent-green" value={`+${item.hpBonus}`} label="صحة" />
        )}
      </div>
      {/* Quantity */}
      <div className="flex items-center gap-2 text-sm mb-4">
        <span className="text-hitman-400">الكمية:</span>
        <span className="font-mono text-white text-base">{item.quantity}</span>
      </div>
      {/* Actions */}
      <div className="flex gap-2 mt-2">
        {isEquipped ? (
          <button
            onClick={() => onUnequip(item)}
            className="bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-accent-red hover:to-red-700 text-white font-bold py-2 rounded-lg flex-1 flex items-center justify-center gap-2 transition-all duration-200 border border-zinc-700 shadow"
          >
            <XCircle className="w-5 h-5" /> فك التجهيز
          </button>
        ) : (
          <>
            {slotOptions && slotOptions.length > 0 && (
              <select
                className="input-field flex-1 text-base"
                defaultValue=""
                onChange={e => onEquip(item, e.target.value)}
              >
                <option value="" disabled>
                  اختر مكان التجهيز
                </option>
                {slotOptions.map(slot => (
                  <option key={slot.value} value={slot.value}>
                    {slot.label}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() => onSell(item)}
              className="bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-2 rounded-lg flex-1 flex items-center justify-center gap-2 transition-all duration-200 shadow"
            >
              <Trash2 className="w-5 h-5" /> بيع
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="bg-gradient-to-br from-hitman-900/60 to-black/60 border border-hitman-800 rounded-xl p-8 flex flex-col items-center justify-center text-hitman-400 shadow animate-fade-in">
      <Icon className="w-10 h-10 mb-2 text-accent-red" />
      <span className="text-lg font-bold">{message}</span>
    </div>
  );
}

export default function Inventory() {
  const { token } = useAuth();
  const { invalidateHud } = useHud();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false });

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/api/inventory/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('فشل في تحميل الجرد');
        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, [token]);

  const groupItems = () => {
    const weapons = items.filter(i => weaponTypes.includes(i.type));
    const armors = items.filter(i => i.type === 'armor');
    return { weapons, armors };
  };

  const splitEquipped = arr => ({
    equipped: arr.filter(i => i.equipped),
    unequipped: arr.filter(i => !i.equipped),
  });

  const getSlotOptions = item => {
    if (weaponTypes.includes(item.type)) {
      return [
        { value: 'weapon1', label: 'سلاح 1' },
        { value: 'weapon2', label: 'سلاح 2' },
      ];
    }
    if (item.type === 'armor') {
      return [{ value: 'armor', label: 'درع' }];
    }
    return [];
  };

  const handleEquip = async (item, slot) => {
    if (!slot) return;
    setModal({ open: true, type: 'loading', title: 'جاري التجهيز...', message: '' });
    try {
      const res = await fetch(`${API}/api/inventory/equip`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: item.type, itemId: item.itemId, slot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل في التجهيز');
      setModal({ open: true, type: 'success', title: 'تم التجهيز', message: 'تم تجهيز العنصر بنجاح!' });
      setTimeout(() => setModal({ open: false }), 1200);
      invalidateHud?.();
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setModal({ open: true, type: 'error', title: 'خطأ', message: err.message });
    }
  };

  const handleUnequip = async item => {
    setModal({ open: true, type: 'loading', title: 'جاري الفك...', message: '' });
    try {
      const res = await fetch(`${API}/api/inventory/unequip`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: item.type, slot: item.slot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'فشل في الفك');
      setModal({ open: true, type: 'success', title: 'تم الفك', message: 'تم فك تجهيز العنصر!' });
      setTimeout(() => setModal({ open: false }), 1200);
      invalidateHud?.();
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setModal({ open: true, type: 'error', title: 'خطأ', message: err.message });
    }
  };

  const handleSell = async item => {
    setModal({
      open: true,
      type: 'warning',
      title: 'تأكيد البيع',
      message: `هل أنت متأكد أنك تريد بيع (${item.name})؟ سيتم بيع عنصر واحد فقط.`,
      showCancel: true,
      confirmText: 'تأكيد البيع',
      cancelText: 'إلغاء',
      onConfirm: async () => {
        setModal({ open: true, type: 'loading', title: 'جاري البيع...', message: '' });
        try {
          const res = await fetch(`${API}/api/inventory/sell`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: item.type, itemId: item.itemId }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'فشل في البيع');
          setModal({ open: true, type: 'success', title: 'تم البيع', message: `تم بيع (${item.name}) بنجاح!` });
          setTimeout(() => setModal({ open: false }), 1200);
          invalidateHud?.();
          setTimeout(() => window.location.reload(), 800);
        } catch (err) {
          setModal({ open: true, type: 'error', title: 'خطأ', message: err.message });
        }
      },
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent-red mx-auto mb-6"></div>
        <p className="text-white text-lg">جاري تحميل الجرد...</p>
      </div>
    );
  if (error)
    return <div className="text-center text-red-500 py-12">{error}</div>;

  const { weapons, armors } = groupItems();
  const weaponsSplit = splitEquipped(weapons);
  const armorsSplit = splitEquipped(armors);

  return (
    <div className="space-y-14 animate-fade-in">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-4xl font-bouya mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">
          جرد اللاعب
        </h1>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto"></div>
      </div>
      {/* Weapons */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Sword className="w-7 h-7 text-accent-red" />
          <h2 className="text-2xl font-bold text-white">الأسلحة</h2>
        </div>
        <div className="w-28 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mb-6" />
        {/* Equipped Weapons */}
        <div className="mb-6">
          <h3 className="text-lg text-accent-red font-bold mb-3">العناصر المجهزة</h3>
          {weaponsSplit.equipped.length === 0 ? (
            <EmptyState icon={Sword} message="لا يوجد عناصر مجهزة." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {weaponsSplit.equipped.map(item => (
                <ItemCard key={item.id + '-eq'} item={item} isEquipped slotOptions={[]} onUnequip={handleUnequip} />
              ))}
            </div>
          )}
        </div>
        {/* Unequipped Weapons */}
        <div>
          <h3 className="text-lg text-zinc-300 font-bold mb-3">العناصر غير المجهزة</h3>
          {weaponsSplit.unequipped.length === 0 ? (
            <EmptyState icon={Sword} message="لا يوجد عناصر غير مجهزة." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {weaponsSplit.unequipped.map(item => (
                <ItemCard
                  key={item.id + '-uneq'}
                  item={item}
                  isEquipped={false}
                  slotOptions={getSlotOptions(item)}
                  onEquip={handleEquip}
                  onSell={handleSell}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Armors */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-7 h-7 text-accent-blue" />
          <h2 className="text-2xl font-bold text-white">الدروع</h2>
        </div>
        <div className="w-28 h-1 bg-gradient-to-r from-transparent via-accent-blue to-transparent mb-6" />
        {/* Equipped Armors */}
        <div className="mb-6">
          <h3 className="text-lg text-accent-red font-bold mb-3">العناصر المجهزة</h3>
          {armorsSplit.equipped.length === 0 ? (
            <EmptyState icon={Shield} message="لا يوجد عناصر مجهزة." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {armorsSplit.equipped.map(item => (
                <ItemCard key={item.id + '-eq'} item={item} isEquipped slotOptions={[]} onUnequip={handleUnequip} />
              ))}
            </div>
          )}
        </div>
        {/* Unequipped Armors */}
        <div>
          <h3 className="text-lg text-zinc-300 font-bold mb-3">العناصر غير المجهزة</h3>
          {armorsSplit.unequipped.length === 0 ? (
            <EmptyState icon={Shield} message="لا يوجد عناصر غير مجهزة." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {armorsSplit.unequipped.map(item => (
                <ItemCard
                  key={item.id + '-uneq'}
                  item={item}
                  isEquipped={false}
                  slotOptions={getSlotOptions(item)}
                  onEquip={handleEquip}
                  onSell={handleSell}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      {/* Modal for actions */}
      <Modal {...modal} isOpen={modal.open} onClose={() => setModal({ open: false })} />
    </div>
  );
} 