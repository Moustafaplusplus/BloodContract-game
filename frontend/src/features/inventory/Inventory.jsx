import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useHud } from "@/hooks/useHud"
import { useQueryClient } from '@tanstack/react-query'
import Modal from "@/components/Modal"
import GangBombModal from "./GangBombModal"
import MoneyIcon from "@/components/MoneyIcon"
import { Sword, Shield, Zap, Heart, ImageIcon, XCircle, Trash2, Star, Gem, Package, Play, Bomb, Clock } from "lucide-react"
import { getImageUrl } from '@/utils/imageUtils'

const API = import.meta.env.VITE_API_URL

const rarityColors = {
  common: "text-zinc-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legend: "text-yellow-400",
}

const rarityIcons = {
  common: "⭐",
  uncommon: "⭐⭐",
  rare: "⭐⭐⭐",
  epic: "⭐⭐⭐⭐",
  legend: "⭐⭐⭐⭐⭐",
}

const weaponTypes = ["weapon"]

function Stat({ icon: Icon, color, value, label }) {
  return (
    <div className="flex items-center gap-1 text-sm font-bold">
      <Icon className={`w-5 h-5 ${color}`} />
      <span className={color}>{value}</span>
      <span className="text-zinc-400 font-normal text-xs">{label}</span>
    </div>
  )
}

function ItemCard({ item, onEquip, onUnequip, onSell, onUse, isEquipped, slotOptions }) {
  const [imgError, setImgError] = useState(false)
  


  return (
    <div
      className={`bg-gradient-to-br from-black via-zinc-950 to-red-950/20 border-2 rounded-2xl shadow-lg p-6 relative transition-all duration-300 backdrop-blur-sm ${
        item.type === 'special'
          ? "border-purple-500/50 hover:border-purple-400/70 shadow-purple-900/30"
          : isEquipped
            ? "border-red-500 ring-2 ring-red-500/40 shadow-red-900/50 shadow-2xl"
            : "border-zinc-800/50 hover:border-red-600/50"
      } hover:scale-105 hover:shadow-2xl group`}
    >
      {/* Badges */}
      {isEquipped && (
        <span className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg z-10 animate-pulse">
          مجهز
        </span>
      )}
      {item.type === 'special' && (
        <span className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg z-10">
          قابل للاستهلاك
        </span>
      )}

      {/* Glow effects */}
      {item.type === 'special' ? (
        <div className="absolute inset-0 rounded-2xl opacity-20 bg-gradient-to-br from-purple-400/20 to-pink-500/20 pointer-events-none" />
      ) : (
        <div
          className={`absolute inset-0 rounded-2xl opacity-20 pointer-events-none ${
            item.rarity === "legend"
              ? "bg-gradient-to-br from-yellow-400/20 to-orange-500/20"
              : item.rarity === "epic"
                ? "bg-gradient-to-br from-purple-400/20 to-pink-500/20"
                : item.rarity === "rare"
                  ? "bg-gradient-to-br from-blue-400/20 to-cyan-500/20"
                  : "bg-gradient-to-br from-zinc-800/20 to-zinc-900/20"
          }`}
        />
      )}

      {/* Item Image */}
      <div className="relative w-full h-24 bg-black/60 border border-red-900/30 rounded-xl flex items-center justify-center mb-4 overflow-hidden group-hover:border-red-600/50 transition-colors">
        {!imgError && item.imageUrl ? (
          <img
            src={getImageUrl(item.imageUrl) || "/placeholder.svg"}
            alt={item.name}
            className="w-full h-full object-contain rounded-xl"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <ImageIcon className="w-10 h-10 text-red-600/60" />
          </div>
        )}
      </div>

      {/* Name */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-lg text-white truncate group-hover:text-red-100 transition-colors">
          {item.name}
        </span>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 mb-3">
        {item.damage !== undefined && item.damage !== null && (
          <Stat icon={Sword} color="text-red-400" value={item.damage} label="ضرر" />
        )}
        {item.def !== undefined && item.def !== null && (
          <Stat icon={Shield} color="text-blue-400" value={item.def} label="دفاع" />
        )}
        {item.energyBonus !== undefined && item.energyBonus !== null && item.energyBonus !== 0 && (
          <Stat icon={Zap} color="text-yellow-400" value={`+${item.energyBonus}`} label="طاقة" />
        )}
        {item.hpBonus !== undefined && item.hpBonus !== null && item.hpBonus !== 0 && (
          <Stat icon={Heart} color="text-green-400" value={`+${item.hpBonus}`} label="صحة" />
        )}
        {/* Special Item Effects */}
        {item.type === 'special' && item.effect && (
          <>
            {item.effect.health && (
              <Stat icon={Heart} color="text-green-400" value={item.effect.health === 'max' ? '100%' : `+${item.effect.health}`} label="صحة" />
            )}
            {item.effect.energy && (
              <Stat icon={Zap} color="text-yellow-400" value={item.effect.energy === 'max' ? '100%' : `+${item.effect.energy}`} label="طاقة" />
            )}
            {item.effect.experience && (
              <Stat icon={Sword} color="text-blue-400" value={`+${item.effect.experience}`} label="خبرة" />
            )}
            {item.type === 'EXPERIENCE_POTION' && item.levelRequired && (
              <Stat icon={Shield} color="text-purple-400" value={item.levelRequired} label="المستوى المطلوب" />
            )}
            {item.effect.cdReset && (
              <Stat icon={Clock} color="text-green-400" value="إعادة تعيين" label="أوقات الانتظار" />
            )}
            {item.effect.duration > 0 && (
              <Stat icon={Package} color="text-purple-400" value={`${item.effect.duration}s`} label="المدة" />
            )}
          </>
        )}
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-2 text-sm mb-4 bg-black/40 border border-zinc-800/50 rounded-lg px-3 py-2">
        <span className="text-zinc-400">الكمية:</span>
        <span className="font-mono text-red-300 text-base font-bold">{item.quantity}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2 relative z-20">
        {isEquipped ? (
          <button
            onClick={() => onUnequip(item)}
            className="bg-gradient-to-r from-zinc-800 to-black hover:from-red-700 hover:to-red-800 text-white font-bold py-3 rounded-lg flex-1 flex items-center justify-center gap-2 transition-all duration-200 border border-zinc-700/50 hover:border-red-600/50 shadow-lg"
          >
            <XCircle className="w-5 h-5" /> فك التجهيز
          </button>
        ) : (
          <>
            {item.type === 'special' && onUse ? (
              // Special items: Use button + Sell button
              <>
        
                <button
                  onClick={() => {
                    onUse(item);
                  }}
                  className="bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-lg flex-1 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-green-900/30 border border-green-600/30 cursor-pointer z-10 relative"
                  style={{ pointerEvents: 'auto' }}
                >
                  <Play className="w-5 h-5" /> استخدام
                </button>
                <button
                  onClick={() => {
                    onSell(item);
                  }}
                  className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-lg flex-1 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-red-900/30 border border-red-600/30 cursor-pointer z-10 relative"
                  style={{ pointerEvents: 'auto' }}
                >
                  <Trash2 className="w-5 h-5" /> بيع
                </button>
              </>
            ) : (
              // Regular items: Equip dropdown + Sell button
              <>
                {slotOptions && slotOptions.length > 0 && (
                  <select
                    className="flex-1 bg-black/60 border border-red-900/30 text-white rounded-lg px-3 py-2 text-base focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
                    defaultValue=""
                    onChange={(e) => onEquip(item, e.target.value)}
                  >
                    <option value="" disabled>
                      اختر مكان التجهيز
                    </option>
                    {slotOptions.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => {
                    onSell(item);
                  }}
                  className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-lg flex-1 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-red-900/30 border border-red-600/30 cursor-pointer z-10 relative"
                  style={{ pointerEvents: 'auto' }}
                >
                  <Trash2 className="w-5 h-5" /> بيع
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="bg-gradient-to-br from-black to-red-950/20 border border-red-900/30 rounded-xl p-8 flex flex-col items-center justify-center text-zinc-400 shadow-lg">
      <Icon className="w-12 h-12 mb-3 text-red-500/60" />
      <span className="text-lg font-bold">{message}</span>
    </div>
  )
}

function SectionHeader({ icon: Icon, title, color = "text-red-500", accentColor = "via-red-500" }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-gradient-to-r from-red-900/50 to-black/50 border border-red-600/30 rounded-xl p-3">
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
        <h2 className="text-3xl font-bold text-white">{title}</h2>
      </div>
      <div className={`w-32 h-1 bg-gradient-to-r from-transparent ${accentColor} to-transparent`} />
    </div>
  )
}

export default function Inventory() {
  const { token } = useAuth()
  const { invalidateHud } = useHud()
  const queryClient = useQueryClient()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState({ open: false })
  const [inputValue, setInputValue] = useState('')
  const [gangBombModal, setGangBombModal] = useState({ open: false, itemId: null })

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/api/inventory/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("فشل في تحميل الجرد")
        const data = await res.json()
        setItems(data.items || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchInventory()
  }, [token])

  const groupItems = () => {
    const weapons = items.filter((i) => weaponTypes.includes(i.type))
    const armors = items.filter((i) => i.type === "armor")
    const specials = items.filter((i) => i.type === "special")
    return { weapons, armors, specials }
  }

  const splitEquipped = (arr) => ({
    equipped: arr.filter((i) => i.equipped),
    unequipped: arr.filter((i) => !i.equipped),
  })

  const getSlotOptions = (item) => {
    if (weaponTypes.includes(item.type)) {
      return [
        { value: "weapon1", label: "سلاح 1" },
        { value: "weapon2", label: "سلاح 2" },
      ]
    }
    if (item.type === "armor") {
      return [{ value: "armor", label: "درع" }]
    }
    return []
  }

  const handleEquip = async (item, slot) => {
    if (!slot) return
    setModal({ open: true, type: "loading", title: "جاري التجهيز...", message: "" })
    try {
      const res = await fetch(`${API}/api/inventory/equip`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: item.type, itemId: item.itemId, slot }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "فشل في التجهيز")
      setModal({ open: true, type: "success", title: "تم التجهيز", message: "تم تجهيز العنصر بنجاح!" })
      setTimeout(() => setModal({ open: false }), 1200)
      invalidateHud?.()
      setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      setModal({ open: true, type: "error", title: "خطأ", message: err.message })
    }
  }

  const handleUnequip = async (item) => {
    setModal({ open: true, type: "loading", title: "جاري الفك...", message: "" })
    try {
      const res = await fetch(`${API}/api/inventory/unequip`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: item.type, slot: item.slot }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "فشل في الفك")
      setModal({ open: true, type: "success", title: "تم الفك", message: "تم فك تجهيز العنصر!" })
      setTimeout(() => setModal({ open: false }), 1200)
      invalidateHud?.()
      setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      setModal({ open: true, type: "error", title: "خطأ", message: err.message })
    }
  }

  const handleSell = async (item) => {
    setModal({
      open: true,
      type: "warning",
      title: "خيارات البيع",
      message: `اختر طريقة بيع (${item.name}):\n\nبيع سريع: 100 مال فوراً\n🏪 السوق السوداء: الانتقال إلى صفحة السوق السوداء لإنشاء إعلان`,
      showCancel: true,
      confirmText: "بيع سريع (100 مال)",
      cancelText: "إلغاء",
      extraButton: {
        text: "الانتقال للسوق السوداء",
        action: async () => {
          // Redirect to Black Market page instead of creating listing
          window.location.href = '/dashboard/black-market';
        }
      },
      onConfirm: async () => {
        setModal({ open: true, type: "loading", title: "جاري البيع...", message: "" })
        try {
          const res = await fetch(`${API}/api/inventory/sell`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ type: item.type, itemId: item.itemId, sellOption: 'quick' }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || "فشل في البيع")
          setModal({ open: true, type: "success", title: "تم البيع", message: `تم بيع (${item.name}) بنجاح! حصلت على 100 مال.` })
          setTimeout(() => setModal({ open: false }), 1200)
          invalidateHud?.()
          setTimeout(() => window.location.reload(), 800)
        } catch (err) {
          setModal({ open: true, type: "error", title: "خطأ", message: err.message })
        }
      },
    })
  }

  const handleUse = async (item) => {

    // Check if it's a gang bomb item
    if (item.effect && item.effect.gangBomb) {
      setGangBombModal({ open: true, itemId: item.itemId });
      return;
    }
    
    // Check if it's a name change item
    if (item.effect && item.effect.nameChange) {
      setModal({
        open: true,
        type: "input",
        title: "تغيير الاسم",
        message: "أدخل الاسم الجديد:",
        inputPlaceholder: "الاسم الجديد",
        inputType: "text",
        showCancel: true,
        confirmText: "تغيير الاسم",
        cancelText: "إلغاء",
        onConfirm: async (newName) => {
          if (!newName || newName.trim().length < 3) {
            setModal({ open: true, type: "error", title: "خطأ", message: "الاسم يجب أن يكون 3 أحرف على الأقل" });
            return;
          }
          if (newName.trim().length > 20) {
            setModal({ open: true, type: "error", title: "خطأ", message: "الاسم يجب أن يكون 20 حرف أو أقل" });
            return;
          }
          
          // Validate username format
          const nameRegex = /^[a-zA-Z0-9._-]+$/;
          if (!nameRegex.test(newName.trim())) {
            setModal({ open: true, type: "error", title: "خطأ", message: "الاسم يجب أن يحتوي على أحرف وأرقام فقط مع إمكانية استخدام النقاط والشرطات والشرطات السفلية" });
            return;
          }
          
          // Check for consecutive special characters
          if (/[._-]{2,}/.test(newName.trim())) {
            setModal({ open: true, type: "error", title: "خطأ", message: "الاسم لا يمكن أن يحتوي على أحرف خاصة متتالية" });
            return;
          }
          
          // Check if starts or ends with special characters
          if (/^[._-]|[._-]$/.test(newName.trim())) {
            setModal({ open: true, type: "error", title: "خطأ", message: "الاسم لا يمكن أن يبدأ أو ينتهي بحرف خاص" });
            return;
          }
          
          setModal({ open: true, type: "loading", title: "جاري تغيير الاسم...", message: "" });
          try {
            // First use the special item
            const useRes = await fetch(`${API}/api/inventory/use-special`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ itemId: item.itemId }),
            });
            const useData = await useRes.json();
            if (!useRes.ok) throw new Error(useData.message || "فشل في استخدام العنصر");
            
            // Then change the name
            const nameRes = await fetch(`${API}/api/character/change-name`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({ newName: newName.trim() }),
            });
            const nameData = await nameRes.json();
            if (!nameRes.ok) throw new Error(nameData.error || "فشل في تغيير الاسم");
            
            setModal({ open: true, type: "success", title: "تم تغيير الاسم", message: `تم تغيير الاسم إلى "${newName.trim()}" بنجاح!` });
            setTimeout(() => setModal({ open: false }), 2000);
            invalidateHud?.();
            // Invalidate character query cache to refresh dashboard and other components
            queryClient.invalidateQueries(['character']);
            setTimeout(() => window.location.reload(), 1500);
          } catch (err) {
            setModal({ open: true, type: "error", title: "خطأ", message: err.message });
          }
        },
      });
      return;
    }
    
    // Build effect description for other items
    let effectDescription = '';
    if (item.effect) {
      const effects = [];
      if (item.effect.health) {
        effects.push(`صحة: ${item.effect.health === 'max' ? '100%' : `+${item.effect.health}`}`);
      }
      if (item.effect.energy) {
        effects.push(`طاقة: ${item.effect.energy === 'max' ? '100%' : `+${item.effect.energy}`}`);
      }
      if (item.effect.experience) {
        effects.push(`خبرة: +${item.effect.experience}`);
      }
      if (item.effect.duration > 0) {
        effects.push(`مدة: ${item.effect.duration} ثانية`);
      }
      if (effects.length > 0) {
        effectDescription = `\nالتأثيرات: ${effects.join(', ')}`;
      }
    }

    setModal({
      open: true,
      type: "warning",
      title: "تأكيد الاستخدام",
      message: `هل أنت متأكد أنك تريد استخدام (${item.name})؟${effectDescription}\n\nسيتم استهلاك عنصر واحد فقط.`,
      showCancel: true,
      confirmText: "تأكيد الاستخدام",
      cancelText: "إلغاء",
      onConfirm: async () => {
        setModal({ open: true, type: "loading", title: "جاري الاستخدام...", message: "" })
        try {
          const res = await fetch(`${API}/api/inventory/use-special`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ itemId: item.itemId }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || "فشل في الاستخدام")
          setModal({ open: true, type: "success", title: "تم الاستخدام", message: `تم استخدام (${item.name}) بنجاح!` })
          setTimeout(() => setModal({ open: false }), 1200)
          invalidateHud?.()
          // Invalidate character query cache to refresh dashboard and other components
          queryClient.invalidateQueries(['character']);
          setTimeout(() => window.location.reload(), 800)
        } catch (err) {
          setModal({ open: true, type: "error", title: "خطأ", message: err.message })
        }
      },
    })
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-96 bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-6"></div>
          <p className="text-white text-lg">جاري تحميل الجرد...</p>
        </div>
      </div>
    )

  if (error) return <div className="text-center text-red-500 py-12">{error}</div>

  const { weapons, armors, specials } = groupItems()
  const weaponsSplit = splitEquipped(weapons)
  const armorsSplit = splitEquipped(armors)
  const specialsSplit = splitEquipped(specials)

  return (
    <div className="min-h-screen bg-black text-white p-4 pt-20" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative">
            <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-600">
              جرد اللاعب
            </h1>
            <div className="absolute inset-0 text-5xl font-bold mb-4 text-red-500/20 blur-sm">جرد اللاعب</div>
          </div>
          <div className="w-40 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto"></div>
          <p className="text-zinc-400 mt-4 text-lg">إدارة أسلحتك ودروعك وعناصرك الخاصة</p>
        </div>

        {/* Weapons Section */}
        <section className="mb-16">
          <SectionHeader icon={Sword} title="الأسلحة" />

          {/* Equipped Weapons */}
          <div className="mb-8">
            <h3 className="text-xl text-red-400 font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              العناصر المجهزة
            </h3>
            {weaponsSplit.equipped.length === 0 ? (
              <EmptyState icon={Sword} message="لا يوجد أسلحة مجهزة." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {weaponsSplit.equipped.map((item) => (
                  <ItemCard key={item.id + "-eq"} item={item} isEquipped slotOptions={[]} onUnequip={handleUnequip} />
                ))}
              </div>
            )}
          </div>

          {/* Unequipped Weapons */}
          <div>
            <h3 className="text-xl text-zinc-300 font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              العناصر غير المجهزة
            </h3>
            {weaponsSplit.unequipped.length === 0 ? (
              <EmptyState icon={Sword} message="لا يوجد أسلحة غير مجهزة." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {weaponsSplit.unequipped.map((item) => (
                  <ItemCard
                    key={item.id + "-uneq"}
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

        {/* Armors Section */}
        <section className="mb-16">
          <SectionHeader icon={Shield} title="الدروع" color="text-blue-400" accentColor="via-blue-400" />

          {/* Equipped Armors */}
          <div className="mb-8">
            <h3 className="text-xl text-red-400 font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              العناصر المجهزة
            </h3>
            {armorsSplit.equipped.length === 0 ? (
              <EmptyState icon={Shield} message="لا يوجد دروع مجهزة." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {armorsSplit.equipped.map((item) => (
                  <ItemCard key={item.id + "-eq"} item={item} isEquipped slotOptions={[]} onUnequip={handleUnequip} />
                ))}
              </div>
            )}
          </div>

          {/* Unequipped Armors */}
          <div>
            <h3 className="text-xl text-zinc-300 font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              العناصر غير المجهزة
            </h3>
            {armorsSplit.unequipped.length === 0 ? (
              <EmptyState icon={Shield} message="لا يوجد دروع غير مجهزة." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {armorsSplit.unequipped.map((item) => (
                  <ItemCard
                    key={item.id + "-uneq"}
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

        {/* Special Items Section */}
        <section className="mb-16">
          <SectionHeader icon={Gem} title="العناصر الخاصة" color="text-purple-400" accentColor="via-purple-400" />

          {/* Special Items - Consumable Only */}
          <div>
            <h3 className="text-xl text-purple-400 font-bold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              العناصر القابلة للاستهلاك
            </h3>
            {specials.length === 0 ? (
              <EmptyState icon={Gem} message="لا توجد عناصر خاصة قابلة للاستهلاك." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {specials.map((item) => (
                  <ItemCard
                    key={item.id + "-special"}
                    item={item}
                    isEquipped={false}
                    slotOptions={[]}
                    onSell={handleSell}
                    onUse={handleUse}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Modal for actions */}
        <Modal 
          {...modal} 
          isOpen={modal.open} 
          onClose={() => {
            setModal({ open: false });
            setInputValue('');
          }}
          inputValue={inputValue}
          onInputChange={setInputValue}
        />

        {/* Gang Bomb Modal */}
        <GangBombModal
          isOpen={gangBombModal.open}
          onClose={() => setGangBombModal({ open: false, itemId: null })}
          onUse={(result) => {
            // Handle successful gang bomb use
            setModal({ open: true, type: "success", title: "تم استخدام قنبلة العصابة", message: "تم استخدام قنبلة العصابة بنجاح!" });
            setTimeout(() => setModal({ open: false }), 2000);
            invalidateHud?.();
            // Refresh inventory
            setTimeout(() => window.location.reload(), 1500);
          }}
          itemId={gangBombModal.itemId}
        />
      </div>
    </div>
  )
}