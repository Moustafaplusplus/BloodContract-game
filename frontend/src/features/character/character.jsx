/* -------- src/features/character/character.jsx ---------- */
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useSocket } from "@/hooks/useSocket"
import { useAuth } from "@/hooks/useAuth"
import { jwtDecode } from "jwt-decode"
import { Star, Trophy, Target, Shield, Crown, Calendar, Users, HomeIcon, Edit3, Activity, Skull } from "lucide-react"
import { toast } from "react-hot-toast"
import "../profile/vipSparkle.css"
import VipName from "../profile/VipName.jsx"
import LoadingOrErrorPlaceholder from "@/components/LoadingOrErrorPlaceholder"

export default function Character() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  // Get userId from token for cache invalidation
  const userId = token
    ? (() => {
        try {
          const { id } = jwtDecode(token)
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
    queryKey: ["character", userId], // Include userId in query key
    queryFn: () => axios.get("/api/character").then((res) => res.data),
    staleTime: 0, // No stale time - always fetch fresh data
    retry: false,
    enabled: !!userId, // Only run query when we have a userId
  })

  // Fame compatibility: support both top-level and nested fame
  let fame = character?.fame
  if (!fame && character?.character?.fame) fame = character.character.fame

  // Map 'name' to 'username' if needed
  const normalizedCharacter =
    character && !character.username && character.name ? { ...character, username: character.name } : character

  // When constructing displayCharacter, inject fame
  const displayCharacter = {
    ...normalizedCharacter,
    fame: fame ?? 0,
  }

  // Hospital status with real-time countdown
  const { data: hospitalStatus, error: hospitalError } = useQuery({
    queryKey: ["hospitalStatus", userId], // Include userId in query key
    queryFn: () => axios.get("/api/confinement/hospital").then((res) => res.data),
    staleTime: 0, // No stale time
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.response?.status === 401) {
        return false
      }
      // Retry up to 3 times for other errors
      return failureCount < 3
    },
    retryDelay: 1000,
    enabled: !!userId, // Only run query when we have a userId
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
      }, 1000)
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

    console.log('📁 Frontend: Starting avatar upload', {
      filename: file.name,
      size: file.size,
      type: file.type
    });

    setAvatarUploading(true)
    setAvatarError("")

    try {
      const formData = new FormData()
      formData.append("avatar", file)
      const token = localStorage.getItem("jwt")
      
      console.log('📤 Frontend: Sending to /api/avatar');
      const res = await axios.post("/api/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('✅ Frontend: Upload successful', res.data);
      console.log('🔍 Frontend: URL analysis');
      console.log('- Response avatarUrl:', res.data.avatarUrl);
      console.log('- Is Firebase URL?', res.data.avatarUrl?.startsWith('https://storage.googleapis.com/'));
      console.log('- URL length:', res.data.avatarUrl?.length);
      setAvatarUrl(res.data.avatarUrl)
      toast.success("تم تحديث الصورة الشخصية بنجاح!")
      // Refetch character data to update avatar
      queryClient.invalidateQueries(["character", userId])
    } catch (error) {
      console.error('Avatar upload error:', error);
      const errorMessage = error.response?.data?.message || "فشل رفع الصورة. تأكد من أن الصورة أقل من 1MB وبصيغة صحيحة.";
      setAvatarError(errorMessage);
      toast.error("فشل رفع الصورة الشخصية");
    } finally {
      setAvatarUploading(false)
    }
  }

  // Real-time updates for character and hospital status
  useEffect(() => {
    if (!socket) return

    const refetchAll = () => {
      queryClient.invalidateQueries(["character", userId])
      // Only invalidate hospital status if there's no error
      if (!hospitalError) {
        queryClient.invalidateQueries(["hospitalStatus", userId])
      }
    }

    socket.on("hud:update", refetchAll)
    socket.on("hospital:update", refetchAll)
    // Increase polling interval to reduce server load
    const pollInterval = setInterval(refetchAll, 30000) // 30 seconds instead of 10

    return () => {
      socket.off("hud:update", refetchAll)
      socket.off("hospital:update", refetchAll)
      clearInterval(pollInterval)
    }
  }, [socket, queryClient, hospitalError, userId])

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"
  const isVIP = displayCharacter.vipExpiresAt && new Date(displayCharacter.vipExpiresAt) > new Date()

  // Unified stat extraction from backend fields
  const fightsLost = displayCharacter.fightsLost ?? 0
  const fightsWon = displayCharacter.fightsWon ?? 0
  const fightsTotal = displayCharacter.fightsTotal ?? fightsWon + fightsLost

  // Add fame and assassinations to the stats array for display
  const fameStat = {
    icon: Trophy,
    label: "الشهرة",
    value: displayCharacter.fame ?? 0,
    color: "text-yellow-400",
  }

  const assassinationsStat = {
    icon: Skull,
    label: "مرات الاغتيال",
    value: character?.assassinations ?? 0,
    color: "text-red-400",
  }

  // Insert fame and assassinations as the first stats
  const stats = [
    fameStat,
    assassinationsStat,
    {
      icon: Target,
      label: "الجرائم المرتكبة",
      value: displayCharacter.crimesCommitted ?? 0,
      color: "text-red-400",
    },
    {
      icon: Shield,
      label: "عدد الخسائر",
      value: fightsLost,
      color: "text-zinc-400",
    },
    {
      icon: Activity,
      label: "إجمالي المعارك",
      value: fightsTotal,
      color: "text-purple-400",
    },
    {
      icon: Calendar,
      label: "الأيام في اللعبة",
      value: displayCharacter.daysInGame ?? 0,
      color: "text-green-400",
    },
    {
      icon: Activity,
      label: "عدد القتل",
      value: displayCharacter.killCount ?? 0,
      color: "text-orange-400",
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
    <div className="min-h-screen bg-black text-white p-2 sm:p-4 pt-20 overflow-x-hidden" dir="rtl">
      {/* Hospital status message */}
      {hospitalError && (
        <div className="bg-black border-2 border-yellow-600/50 text-white rounded-lg p-3 sm:p-4 mb-4 text-center shadow-md text-sm sm:text-base">
          <p>⚠️ فشل في تحميل حالة المستشفى</p>
        </div>
      )}

      {hospitalStatus?.inHospital && (
        <div className="bg-black border-2 border-red-600/50 text-white rounded-lg p-3 sm:p-4 mb-4 text-center shadow-md text-sm sm:text-base">
          <span className="font-bold text-red-400">أنت في المستشفى</span>
          <span className="mx-2">|</span>
          <span>
            الوقت المتبقي: <span className="font-mono text-orange-400">{formatTime(remainingTime)}</span>
          </span>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-500">
            الملف الشخصي
          </h1>
          <div className="w-20 sm:w-32 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto"></div>
        </div>

        {/* Main Profile Section */}
        <div className="flex flex-col gap-6 sm:gap-8 mb-8 lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 order-1">
            <div className="bg-gradient-to-br from-zinc-950 to-black backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 sm:p-8 text-center">
              {/* Avatar */}
              <div className="relative mb-4 sm:mb-6 flex flex-col items-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-red-500 bg-zinc-800 mx-auto shadow-lg"
                    onError={(e) => {
                      console.error('Avatar image failed to load:', avatarUrl);
                      e.target.style.display = "none"
                      e.target.nextElementSibling.style.display = "flex"
                    }}
                  />
                ) : null}
                <div
                  className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center text-4xl sm:text-5xl text-red-400 border-4 border-red-500 mx-auto shadow-lg ${
                    avatarUrl ? "hidden" : "flex"
                  }`}
                >
                  {(displayCharacter?.username || "?")[0]}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-red-600 rounded-full p-1 sm:p-2">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>

              {/* Avatar Upload UI */}
              {isOwnCharacter && (
                <div className="mb-2 sm:mb-4 flex flex-col items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    disabled={avatarUploading}
                  />
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded-lg shadow transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
                    onClick={() => fileInputRef.current.click()}
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? "جاري الرفع..." : "تغيير الصورة الشخصية"}
                  </button>
                  {avatarError && <div className="text-red-400 text-xs mt-1">{avatarError}</div>}
                </div>
              )}

              {/* Basic Info */}
              <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2 justify-center">
                <VipName user={displayCharacter} className="large" />
              </h2>
              <p className="text-red-400 font-medium mb-1 text-sm sm:text-base">
                الرتبة: {displayCharacter.rank || "مبتدئ"}
              </p>

              {/* Quote */}
              <div className="mb-4 sm:mb-6">
                {editingQuote ? (
                  <div className="flex flex-col items-center gap-2">
                    <textarea
                      className="bg-black border border-red-500/40 text-white rounded-lg px-3 py-2 w-full text-center focus:outline-none focus:ring-2 focus:ring-red-500 transition placeholder:text-zinc-500 text-xs sm:text-sm"
                      value={quoteInput}
                      onChange={(e) => setQuoteInput(e.target.value)}
                      maxLength={120}
                      rows={2}
                      placeholder="اكتب اقتباسك الشخصي هنا..."
                      disabled={savingQuote}
                    />
                    <div className="flex gap-2 justify-center">
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 text-xs sm:text-sm"
                        onClick={async () => {
                          setSavingQuote(true)
                          try {
                            await axios.put("/api/profile", { quote: quoteInput })
                            toast.success("تم تحديث الاقتباس الشخصي بنجاح!")
                            setEditingQuote(false)
                            queryClient.invalidateQueries(["character", userId])
                          } catch (error) {
                            console.error('Quote update error:', error);
                            const errorMessage = error.response?.data?.error || error.response?.data?.message || "فشل في تحديث الاقتباس";
                            toast.error(errorMessage);
                          } finally {
                            setSavingQuote(false)
                          }
                        }}
                        disabled={savingQuote || quoteInput.length > 120}
                      >
                        حفظ
                      </button>
                      <button
                        className="bg-zinc-700 text-white px-3 py-1 rounded-lg font-bold hover:bg-zinc-600 transition text-xs sm:text-sm"
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
                  <div className="bg-black/60 border border-zinc-800/50 rounded-lg p-2 sm:p-4 flex items-center justify-between">
                    <span className="text-zinc-300 italic text-xs sm:text-sm">
                      {displayCharacter.quote ? `"${displayCharacter.quote}"` : "لا يوجد اقتباس شخصي بعد"}
                    </span>
                    {isOwnCharacter && (
                      <button
                        className="ml-2 text-yellow-400 hover:text-white transition"
                        onClick={() => setEditingQuote(true)}
                        title="تعديل الاقتباس الشخصي"
                      >
                        <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Power & Defense */}
              <div className="flex justify-around items-center mt-2 sm:mt-4 mb-2 gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-black/60 border border-zinc-800/50 rounded-lg p-3 mb-2">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  </div>
                  <span className="font-bold text-base sm:text-lg text-yellow-400">
                    {displayCharacter.strength ?? 0}
                  </span>
                  <span className="text-xs text-zinc-400">القوة</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-black/60 border border-zinc-800/50 rounded-lg p-3 mb-2">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                  <span className="font-bold text-base sm:text-lg text-blue-400">{displayCharacter.defense ?? 0}</span>
                  <span className="text-xs text-zinc-400">الدفاع</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Details */}
          <div className="lg:col-span-2 order-2 flex flex-col gap-6 sm:gap-8">
            {/* Stats Grid */}
            <div className="bg-gradient-to-br from-zinc-950 to-black backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 text-blue-400" />
                الإحصائيات
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-black/60 border border-zinc-800/50 rounded-lg p-2 sm:p-4 mb-1 sm:mb-2">
                      <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto ${stat.color}`} />
                    </div>
                    <div className={`text-lg sm:text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-zinc-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-zinc-950 to-black backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 flex items-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 text-orange-400" />
                  المعلومات الاجتماعية
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-300 text-xs sm:text-base">العصابة:</span>
                    <span className="font-medium text-orange-400 text-xs sm:text-base">
                      {displayCharacter.gangId || "لا يوجد"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-zinc-950 to-black backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 flex items-center">
                  <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 text-yellow-400" />
                  الممتلكات
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-300 text-xs sm:text-base">المنزل:</span>
                    <span className="font-medium text-yellow-400 text-xs sm:text-base">
                      {displayCharacter.equippedHouseId || "لا يوجد"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Buffs */}
        {displayCharacter?.buffs && (
          <div className="mt-4 sm:mt-8 bg-gradient-to-br from-zinc-950 to-black backdrop-blur-sm border border-zinc-800/50 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 text-green-400" />
              التأثيرات النشطة
            </h3>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {(Array.isArray(displayCharacter.buffs)
                ? displayCharacter.buffs
                : typeof displayCharacter.buffs === "object"
                  ? Object.keys(displayCharacter.buffs)
                  : []
              ).map((buff, index) => (
                <div
                  key={index}
                  className="bg-green-900/20 border border-green-600/30 rounded-lg px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-base"
                >
                  <span className="text-green-400 font-medium">{buff}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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

function SparkleText({ children }) {
  return (
    <span className="vip-sparkle-text relative inline-block">
      {children}
      <span className="vip-sparkle-anim" aria-hidden="true"></span>
    </span>
  )
}