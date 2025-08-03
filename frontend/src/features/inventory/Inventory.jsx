import { useEffect, useState } from "react"
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"
import { useHud } from "@/hooks/useHud"
import { useQueryClient } from '@tanstack/react-query'
import Modal from "@/components/Modal"
import GangBombModal from "./GangBombModal"
import MoneyIcon from "@/components/MoneyIcon"
import { 
  Sword, 
  Shield, 
  Zap, 
  Heart, 
  XCircle, 
  Trash2, 
  Star, 
  Gem, 
  Package, 
  Play, 
  Bomb, 
  Clock, 
  Crown, 
  Target, 
  Award, 
  Users, 
  Eye, 
  TrendingUp,
  Backpack, 
  Sparkles, 
  Flame,
  ShoppingBag,
  Layers
} from "lucide-react"
import { getImageUrl } from '@/utils/imageUtils'

const API = import.meta.env.VITE_API_URL

const rarityColors = {
  common: "text-zinc-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legend: "text-yellow-400",
}

const weaponTypes = ["weapon"]

// Enhanced Stat Component
function Stat({ icon: Icon, color, value, label }) {
  return (
    <div className="flex items-center gap-1 text-xs font-bold">
      <Icon className={`w-3 h-3 ${color}`} />
      <span className={color}>{value}</span>
      <span className="text-white/50 font-normal text-xs">{label}</span>
    </div>
  )
}

// Enhanced ItemCard Component with blood theme
function ItemCard({ item, onEquip, onUnequip, onSell, onUse, isEquipped, slotOptions }) {
  const [imgError, setImgError] = useState(false)
  
  // Enhanced item type visuals
  const getItemVisuals = (itemType) => {
    const types = {
      weapon: { 
        icon: item.subtype === 'gun' ? Zap : item.subtype === 'knife' ? Sword : Sword, 
        color: 'red', 
        bgGrad: 'from-red-950/40 to-blood-950/20',
        borderColor: 'border-red-500/30'
      },
      armor: { 
        icon: Shield, 
        color: 'blue', 
        bgGrad: 'from-blue-950/40 to-cyan-950/20',
        borderColor: 'border-blue-500/30'
      },
      special: { 
        icon: Gem, 
        color: 'purple', 
        bgGrad: 'from-purple-950/40 to-pink-950/20',
        borderColor: 'border-purple-500/30'
      }
    };
    return types[itemType] || types.weapon;
  };

  const visuals = getItemVisuals(item.type);
  const IconComponent = visuals.icon;

  return (
    <div
      className={`card-3d p-3 transition-all duration-300 relative overflow-hidden group ${
        item.type === 'special'
          ? `${visuals.borderColor} hover:border-purple-400/70 hover:shadow-md hover:shadow-purple-500/20`
          : isEquipped
            ? "border-blood-500/60 ring-1 ring-blood-500/40 shadow-lg shadow-blood-500/30 blood-glow"
            : `${visuals.borderColor} hover:border-red-600/50 hover:shadow-md hover:shadow-red-500/20`
      } hover:scale-[1.02]`}
    >
      {/* Enhanced Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${visuals.bgGrad} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

      {/* Enhanced Item Banner Image Placeholder */}
      <div className="relative mb-3 h-16 bg-gradient-to-r from-black/60 via-blood-950/40 to-black/60 rounded border border-blood-500/20 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {!imgError && item.imageUrl ? (
            <img
              src={getImageUrl(item.imageUrl) || "/placeholder.svg"}
              alt={item.name}
              className="w-full h-full object-contain rounded group-hover:scale-110 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="text-blood-400/30">
              <IconComponent className="w-8 h-8" />
            </div>
          )}
        </div>
        
        {/* Enhanced Item type overlay */}
        <div className="absolute top-1 right-1">
          <div className={`p-1 rounded bg-${visuals.color}-500/30 border border-${visuals.color}-500/40`}>
            <IconComponent className={`w-3 h-3 text-${visuals.color}-400`} />
          </div>
        </div>
        
        {/* Enhanced Rarity indicator */}
        {item.rarity && (
          <div className="absolute bottom-1 left-1">
            <div className={`px-2 py-0.5 rounded-full text-xs font-bold bg-black/60 backdrop-blur-sm ${rarityColors[item.rarity]} border border-current/30`}>
              {item.rarity}
            </div>
          </div>
        )}
        
        {/* Enhanced Equipped badge */}
        {isEquipped && (
          <div className="absolute bottom-1 right-1">
            <div className="p-1 rounded-full bg-blood-500/30 border border-blood-500/40">
              <Star className="w-3 h-3 text-blood-400 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Content */}
      <div className="relative z-10">
        {/* Enhanced Status Badges */}
        <div className="mb-2">
          {isEquipped && (
            <span className="bg-gradient-to-r from-blood-600 to-blood-700 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg animate-pulse">
              مجهز
            </span>
          )}
          {item.type === 'special' && (
            <span className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-lg">
              استهلاكي
            </span>
          )}
        </div>

        {/* Enhanced Name */}
        <div className="mb-2">
          <span className="font-bold text-sm text-white truncate group-hover:text-red-100 transition-colors block">
            {item.name}
          </span>
        </div>

        {/* Enhanced Stats */}
        <div className="flex flex-wrap gap-1 mb-3">
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
          
          {/* Enhanced Special Item Effects */}
          {item.type === 'special' && item.effect && (
            <div className="w-full card-3d bg-purple-950/20 border-purple-500/30 p-2 space-y-1 mt-2">
              {item.effect.health && (
                <Stat icon={Heart} color="text-green-400" value={item.effect.health === 'max' ? '100%' : `+${item.effect.health}`} label="صحة" />
              )}
              {item.effect.energy && (
                <Stat icon={Zap} color="text-yellow-400" value={item.effect.energy === 'max' ? '100%' : `+${item.effect.energy}`} label="طاقة" />
              )}
              {item.effect.experience && (
                <Stat icon={Target} color="text-blue-400" value={`+${item.effect.experience}`} label="خبرة" />
              )}
              {item.effect.cdReset && (
                <Stat icon={Clock} color="text-green-400" value="إعادة" label="تعيين" />
              )}
              {item.effect.nameChange && (
                <div className="flex items-center gap-1 text-xs font-bold text-purple-400">
                  <Sparkles className="w-3 h-3" />
                  <span>تغيير الاسم</span>
                </div>
              )}
              {item.effect.gangBomb && (
                <div className="flex items-center gap-1 text-xs font-bold text-red-400">
                  <Bomb className="w-3 h-3" />
                  <span>قنبلة عصابة</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Quantity */}
        <div className="card-3d bg-black/40 border-white/10 rounded px-2 py-1 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/50">الكمية:</span>
            <span className="font-mono text-blood-300 font-bold">{item.quantity}</span>
          </div>
        </div>

        {/* Enhanced Actions */}
        <div className="flex gap-1 relative z-20">
          {isEquipped ? (
            <button
              onClick={() => onUnequip(item)}
              className="btn-3d-secondary flex-1 text-xs py-2 flex items-center justify-center gap-1 hover:border-red-600/50"
            >
              <XCircle className="w-3 h-3" /> فك
            </button>
          ) : (
            <>
              {item.type === 'special' && onUse ? (
                <>
                  <button
                    onClick={() => onUse(item)}
                    className="btn-3d flex-1 text-xs py-2 flex items-center justify-center gap-1 hover:border-green-600/50"
                  >
                    <Play className="w-3 h-3" /> استخدام
                  </button>
                  <button
                    onClick={() => onSell(item)}
                    className="btn-3d-secondary flex-1 text-xs py-2 flex items-center justify-center gap-1 hover:border-red-600/50"
                  >
                    <Trash2 className="w-3 h-3" /> بيع
                  </button>
                </>
              ) : (
                <>
                  {slotOptions && slotOptions.length > 0 && (
                    <select
                      className="flex-1 bg-black/60 border border-blood-500/30 text-white rounded text-xs px-2 py-2 focus:border-blood-500 focus:ring-1 focus:ring-blood-500/30"
                      defaultValue=""
                      onChange={(e) => onEquip(item, e.target.value)}
                    >
                      <option value="" disabled>تجهيز</option>
                      {slotOptions.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => onSell(item)}
                    className="btn-3d-secondary flex-1 text-xs py-2 flex items-center justify-center gap-1 hover:border-red-600/50"
                  >
                    <Trash2 className="w-3 h-3" /> بيع
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Enhanced Empty State Component
function EmptyState({ icon: Icon, message }) {
  return (
    <div className="card-3d p-8 flex flex-col items-center justify-center text-white/40">
      <Icon className="w-16 h-16 mb-4 text-blood-500/60" />
      <span className="text-sm font-bold">{message}</span>
      <p className="text-xs text-white/30 mt-2">لا توجد عناصر في هذا القسم</p>
    </div>
  )
}

// Enhanced Section Header Component
function SectionHeader({ icon: Icon, title, color = "text-blood-500", accentColor = "via-blood-500" }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="card-3d bg-gradient-to-r from-blood-950/50 to-black/50 border-blood-600/30 p-2">
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <div className="flex-1 flex items-center">
          <div className={`h-0.5 bg-gradient-to-r from-transparent ${accentColor} to-transparent flex-1 ml-4`} />
        </div>
      </div>
    </div>
  )
}

export default function Inventory() {
  const { customToken } = useFirebaseAuth()
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
          headers: { Authorization: `Bearer ${customToken}` },
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
  }, [customToken])

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
        headers: { Authorization: `Bearer ${customToken}`, "Content-Type": "application/json" },
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
        headers: { Authorization: `Bearer ${customToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: item.type, slot: item.slot }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "فشل في الفك")
      setModal({ open: true, type: "success", title: "تم الفك", message: "تم فك تجهيز ��لعنصر!" })
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
          window.location.href = '/dashboard/black-market';
        }
      },
      onConfirm: async () => {
        setModal({ open: true, type: "loading", title: "جاري البيع...", message: "" })
        try {
          const res = await fetch(`${API}/api/inventory/sell`, {
            method: "POST",
            headers: { Authorization: `Bearer ${customToken}`, "Content-Type": "application/json" },
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
          
          const nameRegex = /^[a-zA-Z0-9._-]+$/;
          if (!nameRegex.test(newName.trim())) {
            setModal({ open: true, type: "error", title: "خطأ", message: "الاسم يجب أن يحتوي على أحرف وأرقام فقط مع إمكانية استخدام النقاط والشرطات والشرطات السفلية" });
            return;
          }
          
          if (/[._-]{2,}/.test(newName.trim())) {
            setModal({ open: true, type: "error", title: "خطأ", message: "الاسم لا يمكن أن يحتوي على أحرف خاصة متتالية" });
            return;
          }
          
          if (/^[._-]|[._-]$/.test(newName.trim())) {
            setModal({ open: true, type: "error", title: "خطأ", message: "الاسم لا يمكن أن يبدأ أو ينتهي بحرف خاص" });
            return;
          }
          
          setModal({ open: true, type: "loading", title: "جاري تغيير الاسم...", message: "" });
          try {
            const useRes = await fetch(`${API}/api/inventory/use-special`, {
              method: "POST",
              headers: { Authorization: `Bearer ${customToken}`, "Content-Type": "application/json" },
              body: JSON.stringify({ itemId: item.itemId }),
            });
            const useData = await useRes.json();
            if (!useRes.ok) throw new Error(useData.message || "فشل في استخدام العنصر");
            
            const nameRes = await fetch(`${API}/api/character/change-name`, {
              method: "POST",
              headers: { Authorization: `Bearer ${customToken}`, "Content-Type": "application/json" },
              body: JSON.stringify({ newName: newName.trim() }),
            });
            const nameData = await nameRes.json();
            if (!nameRes.ok) throw new Error(nameData.error || "فشل في تغيير الاسم");
            
            setModal({ open: true, type: "success", title: "تم تغيير الاسم", message: `تم تغيير الاسم إلى "${newName.trim()}" بنجاح!` });
            setTimeout(() => setModal({ open: false }), 2000);
            invalidateHud?.();
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
      if (item.effect.health) effects.push(`صحة: ${item.effect.health === 'max' ? '100%' : `+${item.effect.health}`}`);
      if (item.effect.energy) effects.push(`طاقة: ${item.effect.energy === 'max' ? '100%' : `+${item.effect.energy}`}`);
      if (item.effect.experience) effects.push(`خبرة: +${item.effect.experience}`);
      if (item.effect.duration > 0) effects.push(`مدة: ${item.effect.duration} ثانية`);
      if (effects.length > 0) effectDescription = `\nالتأثيرات: ${effects.join(', ')}`;
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
            headers: { Authorization: `Bearer ${customToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ itemId: item.itemId }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.message || "فشل في الاستخدام")
          setModal({ open: true, type: "success", title: "تم الاستخدام", message: `تم استخدام (${item.name}) بنجاح!` })
          setTimeout(() => setModal({ open: false }), 1200)
          invalidateHud?.()
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
      <div className="min-h-screen blood-gradient flex items-center justify-center">
        <div className="text-center card-3d p-6">
          <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
          <p className="text-white text-sm">جاري تحميل الجرد...</p>
        </div>
      </div>
    )

  if (error) return (
    <div className="min-h-screen blood-gradient flex items-center justify-center">
      <div className="text-center card-3d p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-red-400 mb-2">خطأ في التحميل</h3>
        <p className="text-white/60">{error}</p>
      </div>
    </div>
  )

  const { weapons, armors, specials } = groupItems()
  const weaponsSplit = splitEquipped(weapons)
  const armorsSplit = splitEquipped(armors)
  const specialsSplit = splitEquipped(specials)

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      <div className="container mx-auto max-w-7xl p-3 space-y-6">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-blood-900 via-purple-800 to-blue-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Crect x=\"10\" y=\"10\" width=\"40\" height=\"40\" rx=\"5\"/%3E%3Crect x=\"20\" y=\"20\" width=\"20\" height=\"20\" rx=\"3\"/%3E%3Ccircle cx=\"15\" cy=\"15\" r=\"3\"/%3E%3Ccircle cx=\"45\" cy=\"45\" r=\"3\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blood-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Backpack className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">جرد اللاعب</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">إدارة العتاد والعناصر</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <Layers className="w-4 h-4 text-white/60" />
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg">{items.length}</div>
                <div className="text-xs text-white/80 drop-shadow">عنصر</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Weapons Section */}
        <section className="space-y-6">
          <SectionHeader icon={Sword} title="الأسلحة" />

          {/* Equipped Weapons */}
          <div>
            <h3 className="text-sm text-blood-400 font-bold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" />
              العناصر المجهزة ({weaponsSplit.equipped.length})
            </h3>
            {weaponsSplit.equipped.length === 0 ? (
              <EmptyState icon={Sword} message="لا يوجد أسلحة مجهزة." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {weaponsSplit.equipped.map((item) => (
                  <ItemCard key={item.id + "-eq"} item={item} isEquipped slotOptions={[]} onUnequip={handleUnequip} />
                ))}
              </div>
            )}
          </div>

          {/* Unequipped Weapons */}
          <div>
            <h3 className="text-sm text-white/70 font-bold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              العناصر غير المجهزة ({weaponsSplit.unequipped.length})
            </h3>
            {weaponsSplit.unequipped.length === 0 ? (
              <EmptyState icon={Sword} message="لا يوجد أسلحة غير مجهزة." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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

        {/* Enhanced Armors Section */}
        <section className="space-y-6">
          <SectionHeader icon={Shield} title="الدروع" color="text-blue-400" accentColor="via-blue-400" />

          {/* Equipped Armors */}
          <div>
            <h3 className="text-sm text-blood-400 font-bold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" />
              العناصر المجهزة ({armorsSplit.equipped.length})
            </h3>
            {armorsSplit.equipped.length === 0 ? (
              <EmptyState icon={Shield} message="لا يوجد دروع مجهزة." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {armorsSplit.equipped.map((item) => (
                  <ItemCard key={item.id + "-eq"} item={item} isEquipped slotOptions={[]} onUnequip={handleUnequip} />
                ))}
              </div>
            )}
          </div>

          {/* Unequipped Armors */}
          <div>
            <h3 className="text-sm text-white/70 font-bold mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              العناصر غير المجهزة ({armorsSplit.unequipped.length})
            </h3>
            {armorsSplit.unequipped.length === 0 ? (
              <EmptyState icon={Shield} message="لا يوجد دروع غير مجهزة." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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

        {/* Enhanced Special Items Section */}
        <section className="space-y-6">
          <SectionHeader icon={Gem} title="العناصر الخاصة" color="text-purple-400" accentColor="via-purple-400" />

          <div>
            <h3 className="text-sm text-purple-400 font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              العناصر القابلة للاستهلاك ({specials.length})
            </h3>
            {specials.length === 0 ? (
              <EmptyState icon={Gem} message="لا توجد عناصر خاصة قابلة للاستهلاك." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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

        {/* Enhanced Inventory Tips */}
        <div className="card-3d p-4 bg-gradient-to-r from-blood-950/20 to-black/40 border-blood-500/20">
          <h3 className="text-sm font-bold text-blood-400 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            نصائح الجرد
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Award className="w-3 h-3 text-yellow-400" />
              <span>جهز أفضل الأسلحة والدروع لزيادة قوتك</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-blue-400" />
              <span>استخدم العناصر الخاصة في الوقت المناسب</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-green-400" />
              <span>بع العناصر الزائدة لكسب المال</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>تحقق من ندرة العناصر قبل البيع</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-3 h-3 text-purple-400" />
              <span>استخدم السوق السوداء لبيع العناصر بسعر أفضل</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-cyan-400" />
              <span>راقب التأثيرات والمكافآت قبل الاستخدام</span>
            </div>
          </div>
        </div>

        {/* Enhanced Modal for actions */}
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
            setModal({ open: true, type: "success", title: "تم استخدام قنبلة العصابة", message: "تم استخدام قنبلة العصابة بنجاح!" });
            setTimeout(() => setModal({ open: false }), 2000);
            invalidateHud?.();
            setTimeout(() => window.location.reload(), 1500);
          }}
          itemId={gangBombModal.itemId}
        />
      </div>
    </div>
  )
}
