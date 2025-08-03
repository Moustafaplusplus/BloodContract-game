/* -------- src/features/character/character.jsx - Enhanced Blood Contract Character ---------- */
import { useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { useSocket } from "@/hooks/useSocket"
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"

import { 
  Star, Trophy, Target, Shield, Crown, Calendar, Users, HomeIcon, Edit3, Activity, 
  Skull, Camera, User, Zap, Award, TrendingUp, Sword, Crosshair, MapPin,
  ImageIcon, Flame, Eye, Heart, Battery, Coins
} from "lucide-react"
import { toast } from "react-hot-toast"
import "../profile/vipSparkle.css"
import VipName from "../profile/VipName.jsx"
import LoadingOrErrorPlaceholder from "@/components/LoadingOrErrorPlaceholder"
import { TIME, UI } from "@/utils/constants"

export default function Character() {
  const { customToken } = useFirebaseAuth()
  const queryClient = useQueryClient()

  // Get userId from token for cache invalidation
  const userId = customToken
    ? (() => {
        try {
          // User ID is handled by the backend through Firebase authentication
          return id
        } catch {
          return null
        }
      })()
    : null

  const {
    data: character,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["character", userId],
    queryFn: () => axios.get("/api/character").then((res) => res.data),
    staleTime: 0,
    retry: false,
    enabled: !!userId,
  })

  // Map 'name' to 'username' if needed
  const normalizedCharacter =
    character && !character.username && character.name ? { ...character, username: character.name } : character

  // When constructing displayCharacter, inject fame
  const displayCharacter = {
    ...normalizedCharacter,
    fame: character?.fame ?? 0,
  }

  // Hospital status with real-time countdown
  const { data: hospitalStatus } = useQuery({
    queryKey: ["hospitalStatus", userId],
    queryFn: () => axios.get("/api/confinement/hospital").then((res) => res.data),
    staleTime: 0,
    retry: (failureCount, error) => {
      if (error.response?.status === 401) {
        return false
      }
      return failureCount < UI.MAX_RETRY_ATTEMPTS
    },
    retryDelay: TIME.RETRY_DELAY,
    enabled: !!userId,
  })

  // Real-time countdown for hospital time
  const [remainingTime, setRemainingTime] = useState(hospitalStatus?.remainingSeconds || 0)

  // Invalidate cache when user changes
  useEffect(() => {
    if (userId) {
      queryClient.invalidateQueries(["character"])
      queryClient.invalidateQueries(["hospitalStatus"])
    }
  }, [userId, queryClient])

  useEffect(() => {
    if (hospitalStatus?.inHospital && hospitalStatus?.remainingSeconds) {
      setRemainingTime(hospitalStatus.remainingSeconds)
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, TIME.SECOND)
      return () => clearInterval(interval)
    }
  }, [hospitalStatus?.inHospital, hospitalStatus?.remainingSeconds])

  const [editingQuote, setEditingQuote] = useState(false)
  const [quoteInput, setQuoteInput] = useState(displayCharacter.quote || "")
  const [savingQuote, setSavingQuote] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState("")
  const [avatarUrl, setAvatarUrl] = useState(null)
  const fileInputRef = useRef()
  const { socket } = useSocket()

  useEffect(() => {
    if (character?.avatarUrl) setAvatarUrl(character.avatarUrl)
  }, [character])

  // For now, assume Character is always for the current user
  const isOwnCharacter = true

  // Avatar upload handler
  async function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return

    setAvatarUploading(true)
    setAvatarError("")

    try {
      const formData = new FormData()
      formData.append("avatar", file)
      // Firebase token is automatically handled by axios interceptor
      
      const res = await axios.post("/api/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
      })

      setAvatarUrl(res.data.avatarUrl)
      toast.success("تم تحديث الصورة الشخصية بنجاح!")
      queryClient.invalidateQueries(["character", userId])
    } catch (error) {
      const errorMessage = error.response?.data?.message || "فشل رفع الصورة. تأكد من أن الصورة أقل من 1MB وبصيغة صحيحة."
      setAvatarError(errorMessage)
      toast.error("فشل رفع الصورة الشخصية")
    } finally {
      setAvatarUploading(false)
    }
  }

  // Real-time updates for character and hospital status
  useEffect(() => {
    if (!socket) return

    const refetchAll = () => {
      queryClient.invalidateQueries(["character", userId])
      queryClient.invalidateQueries(["hospitalStatus", userId])
    }

    socket.on("hud:update", refetchAll)
    socket.on("hospital:update", refetchAll)
    const pollInterval = setInterval(refetchAll, TIME.POLL_INTERVAL)

    return () => {
      socket.off("hud:update", refetchAll)
      socket.off("hospital:update", refetchAll)
      clearInterval(pollInterval)
    }
  }, [socket, queryClient, userId])

  const isVIP = displayCharacter.vipExpiresAt && new Date(displayCharacter.vipExpiresAt) > new Date()

  // Unified stat extraction from backend fields
  const fightsLost = displayCharacter.fightsLost ?? 0
  const fightsWon = displayCharacter.fightsWon ?? 0
  const fightsTotal = displayCharacter.fightsTotal ?? fightsWon + fightsLost
  const winRate = fightsTotal > 0 ? Math.round((fightsWon / fightsTotal) * 100) : 0

  // Enhanced stats for compact display with visual elements
  const mainStats = [
    {
      icon: Trophy,
      label: "الشهرة",
      value: displayCharacter.fame ?? 0,
      color: "yellow",
      bgGrad: "from-yellow-950/30 to-amber-950/20"
    },
    {
      icon: Crosshair,
      label: "الجرائم",
      value: displayCharacter.crimesCommitted ?? 0,
      color: "blood",
      bgGrad: "from-blood-950/30 to-red-950/20"
    },
    {
      icon: Skull,
      label: "القتل",
      value: displayCharacter.killCount ?? 0,
      color: "red",
      bgGrad: "from-red-950/40 to-black/20"
    },
    {
      icon: Sword,
      label: "المعارك",
      value: fightsTotal,
      color: "purple",
      bgGrad: "from-purple-950/30 to-indigo-950/20",
      subtitle: `نسبة الفوز: ${winRate}%`
    },
  ]

  const powerStats = [
    {
      icon: Zap,
      label: "القوة",
      value: displayCharacter.strength ?? 0,
      color: "orange",
      bgGrad: "from-orange-950/30 to-red-950/20"
    },
    {
      icon: Shield,
      label: "الدفاع",
      value: displayCharacter.defense ?? 0,
      color: "blue",
      bgGrad: "from-blue-950/30 to-cyan-950/20"
    },
  ]

  const secondaryStats = [
    {
      icon: Calendar,
      label: "الأيام",
      value: displayCharacter.daysInGame ?? 0,
      color: "green",
    },
    {
      icon: Activity,
      label: "الخسائر",
      value: fightsLost,
      color: "gray",
    },
    {
      icon: Heart,
      label: "الصحة",
      value: `${displayCharacter.hp || 0}/${displayCharacter.maxHp || 100}`,
      color: "red",
    },
    {
      icon: Battery,
      label: "الطاقة",
      value: `${displayCharacter.energy || 0}/${displayCharacter.maxEnergy || 100}`,
      color: "blue",
    },
  ]

  if (isLoading) {
    return <LoadingOrErrorPlaceholder loading loadingText="جاري تحميل الملف الشخصي..." />
  }

  if (error) {
    return <LoadingOrErrorPlaceholder error errorText="فشل في تحميل الملف الشخصي" />
  }

  if (!character) return null

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      <div className="container mx-auto max-w-6xl p-3 space-y-4">

        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder with 3 Circles Logo */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3Ccircle cx=\"20\" cy=\"30\" r=\"3\"/%3E%3Ccircle cx=\"40\" cy=\"30\" r=\"3\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">الملف الشخصي</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">{displayCharacter.name || displayCharacter.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg">Lv.{displayCharacter.level || 1}</div>
                <div className="text-xs text-white/80 drop-shadow">Level</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital Status Alert */}
        {hospitalStatus?.inHospital && (
          <div className="card-3d bg-red-950/30 border-red-500/50 p-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="font-bold text-red-400 text-sm">أنت في المستشفى</span>
              <span className="mx-2 text-white/50">|</span>
              <span className="text-white text-sm">
                الوقت المتبقي: <span className="font-mono text-orange-400">{formatTime(remainingTime)}</span>
              </span>
            </div>
          </div>
        )}

        {/* Enhanced Main Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Enhanced Profile Card */}
          <div className="card-3d p-4">
            {/* Avatar Section with Visual Enhancement */}
            <div className="text-center mb-4">
              <div className="relative inline-block mb-3">
                {/* Avatar Container with Background Image Placeholder */}
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-blood-500/50 shadow-lg">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none"
                        e.target.nextElementSibling.style.display = "flex"
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full bg-gradient-to-br from-blood-950/60 to-black/40 flex items-center justify-center text-blood-400 ${
                      avatarUrl ? "hidden" : "flex"
                    }`}
                  >
                    <User className="w-8 h-8" />
                  </div>
                </div>
                
                {/* Level Badge */}
                <div className="absolute -bottom-1 -right-1 card-3d bg-yellow-500/20 border-yellow-500/40 px-2 py-0.5">
                  <span className="text-xs font-bold text-yellow-400">Lv.{displayCharacter.level || 1}</span>
                </div>
                
                {/* Camera Icon for Upload */}
                {isOwnCharacter && (
                  <button
                    className="absolute -top-1 -left-1 card-3d bg-blue-500/20 border-blue-500/40 p-1 hover:scale-110 transition-transform"
                    onClick={() => fileInputRef.current.click()}
                    disabled={avatarUploading}
                  >
                    <Camera className="w-3 h-3 text-blue-400" />
                  </button>
                )}
              </div>

              {/* Avatar Upload */}
              {isOwnCharacter && (
                <div className="mb-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    disabled={avatarUploading}
                  />
                  {avatarUploading && (
                    <div className="text-blue-400 text-xs">جاري الرفع...</div>
                  )}
                  {avatarError && (
                    <div className="text-red-400 text-xs mt-1">{avatarError}</div>
                  )}
                </div>
              )}

              {/* Name and Rank */}
              <h2 className="text-base font-bold mb-1">
                <VipName user={displayCharacter} className="large" />
              </h2>
              <p className="text-blood-400 text-xs mb-3">
                الرتبة: {displayCharacter.rank || "مبتدئ"}
              </p>

              {/* Power & Defense - Enhanced Compact */}
              <div className="grid grid-cols-2 gap-2">
                {powerStats.map((stat, index) => (
                  <div key={index} className={`card-3d bg-gradient-to-br ${stat.bgGrad} border-${stat.color}-500/30 p-2 text-center group hover:border-${stat.color}-500/50 transition-colors duration-300`}>
                    <stat.icon className={`w-4 h-4 text-${stat.color}-400 mx-auto mb-1 group-hover:scale-110 transition-transform duration-300`} />
                    <div className={`text-sm font-bold text-${stat.color}-400`}>
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Quote Section */}
            <div className="card-3d bg-black/40 border-white/10 p-3">
              {editingQuote ? (
                <div className="space-y-2">
                  <textarea
                    className="input-3d text-center text-xs"
                    value={quoteInput}
                    onChange={(e) => setQuoteInput(e.target.value)}
                    maxLength={UI.MAX_QUOTE_LENGTH}
                    rows={2}
                    placeholder="اكتب اقتباسك الشخصي هنا..."
                    disabled={savingQuote}
                  />
                  <div className="flex gap-2">
                    <button
                      className="btn-3d flex-1 text-xs py-1"
                      onClick={async () => {
                        setSavingQuote(true)
                        try {
                          await axios.put("/api/profile", { quote: quoteInput })
                          toast.success("تم تحديث الاقتباس!")
                          setEditingQuote(false)
                          queryClient.invalidateQueries(["character", userId])
                        } catch (error) {
                          const errorMessage = error.response?.data?.error || error.response?.data?.message || "فشل في تحديث الاقتباس"
                          toast.error(errorMessage)
                        } finally {
                          setSavingQuote(false)
                        }
                      }}
                      disabled={savingQuote || quoteInput.length > UI.MAX_QUOTE_LENGTH}
                    >
                      حفظ
                    </button>
                    <button
                      className="btn-3d-secondary flex-1 text-xs py-1"
                      onClick={() => {
                        setEditingQuote(false)
                        setQuoteInput(displayCharacter.quote || "")
                      }}
                      disabled={savingQuote}
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-white/70 italic text-xs flex-1">
                    {displayCharacter.quote ? `"${displayCharacter.quote}"` : "لا يوجد اقتباس شخصي"}
                  </span>
                  {isOwnCharacter && (
                    <button
                      className="text-yellow-400 hover:text-white transition-colors ml-2"
                      onClick={() => setEditingQuote(true)}
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Main Stats Grid with Visual Enhancement */}
            <div className="card-3d p-4">
              <h3 className="text-sm font-bold mb-3 flex items-center text-blood-400">
                <Activity className="w-4 h-4 mr-2" />
                الإحصائيات الرئيسية
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {mainStats.map((stat, index) => (
                  <div key={index} className={`card-3d bg-gradient-to-br ${stat.bgGrad} border-${stat.color}-500/30 p-2 text-center group hover:border-${stat.color}-500/50 transition-colors duration-300`}>
                    <stat.icon className={`w-5 h-5 mx-auto mb-1 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-300`} />
                    <div className={`text-sm font-bold text-${stat.color}-400 mb-0.5`}>
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/60">{stat.label}</div>
                    {stat.subtitle && (
                      <div className="text-xs text-white/50 mt-0.5">{stat.subtitle}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Additional Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Secondary Stats */}
              <div className="card-3d p-3">
                <h4 className="font-bold mb-3 flex items-center text-blue-400 text-sm">
                  <Trophy className="w-4 h-4 mr-2" />
                  إحصائيات إضافية
                </h4>
                <div className="space-y-2">
                  {secondaryStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between card-3d bg-black/40 border-white/10 p-2 hover:border-white/20 transition-colors duration-300">
                      <div className="flex items-center gap-2">
                        <stat.icon className={`w-3 h-3 text-${stat.color}-400`} />
                        <span className="text-white/70 text-xs">{stat.label}</span>
                      </div>
                      <span className={`font-bold text-${stat.color}-400 text-xs`}>
                        {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social & Assets Info */}
              <div className="space-y-3">
                <div className="card-3d p-3 bg-gradient-to-br from-orange-950/20 to-yellow-950/10 border-orange-500/20">
                  <h4 className="font-bold mb-3 flex items-center text-orange-400 text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    المعلومات الاجتماعية
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-xs">العصابة:</span>
                    <span className="font-medium text-orange-400 text-xs">
                      {displayCharacter.gangId || "لا يوجد"}
                    </span>
                  </div>
                </div>

                <div className="card-3d p-3 bg-gradient-to-br from-yellow-950/20 to-amber-950/10 border-yellow-500/20">
                  <h4 className="font-bold mb-3 flex items-center text-yellow-400 text-sm">
                    <HomeIcon className="w-4 h-4 mr-2" />
                    الممتلكات
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-xs">المنزل:</span>
                      <span className="font-medium text-yellow-400 text-xs">
                        {displayCharacter.equippedHouseId || "لا يوجد"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-xs">الأموال:</span>
                      <span className="font-medium text-green-400 text-xs flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        ${(displayCharacter.money || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Active Buffs */}
        {displayCharacter?.buffs && (
          <div className="card-3d p-4">
            <h3 className="text-sm font-bold mb-3 flex items-center text-green-400">
              <Shield className="w-4 h-4 mr-2" />
              التأثيرات النشطة
            </h3>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(displayCharacter.buffs)
                ? displayCharacter.buffs
                : typeof displayCharacter.buffs === "object"
                  ? Object.keys(displayCharacter.buffs)
                  : []
              ).map((buff, index) => (
                <div
                  key={index}
                  className="card-3d bg-green-500/10 border-green-500/30 px-3 py-1 hover:border-green-500/50 transition-colors duration-300"
                >
                  <span className="text-green-400 font-medium text-xs">{buff}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Character Tips */}
        <div className="card-3d p-4 bg-gradient-to-r from-blood-950/20 to-black/40 border-blood-500/20">
          <h3 className="text-sm font-bold text-blood-400 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            نصائح تطوير الشخصية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Eye className="w-3 h-3 text-blue-400" />
              <span>ارفع مستواك لفتح المزيد من الميزات</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>دَرّب في النادي لزيادة قوتك ودفاعك</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0")
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")
  const s = String(seconds % 60).padStart(2, "0")
  return `${h}:${m}:${s}`
}
