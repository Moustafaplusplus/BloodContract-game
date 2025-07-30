// src/features/dashboard/Home.jsx
import React from "react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useSocket } from "@/hooks/useSocket"
import { useAuth } from "@/hooks/useAuth"
import { jwtDecode } from "jwt-decode"
import { useQueryClient } from "@tanstack/react-query"
import {
  Target,
  Zap,
  DollarSign,
  Shield,
  Activity,
  Star,
  Award,
  Calendar,
  MapPin,
  HomeIcon,
  Car,
  Briefcase,
  Building2,
  Lock,
  Dumbbell,
  TrendingUp,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"
import { FeatureProgressCard, FeatureUnlockList } from "@/components/FeatureUnlockNotification";

// Helper function to format time
const formatTime = (seconds) => {
  if (seconds <= 0) return "جاهز"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export default function Home() {
  const { token } = useAuth()
  const { socket } = useSocket()
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

  // Reset all state when user changes
  const [key, setKey] = React.useState(0)
  React.useEffect(() => {
    if (userId) {
      setKey((prev) => prev + 1)
      // Clear all character-related queries
      queryClient.removeQueries(["character"])
      queryClient.removeQueries(["hospitalStatus"])
      queryClient.removeQueries(["profile"])
    }
  }, [userId, queryClient])

  const {
    data: character,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["character", userId, key], // Include key to force refetch
    queryFn: () => axios.get("/api/character").then((res) => res.data),
    staleTime: 0, // No stale time - always fetch fresh data
    retry: false,
    enabled: !!userId, // Only run query when we have a userId
  })

  // Fetch game news
  const { data: gameNews } = useQuery({
    queryKey: ["game-news"],
    queryFn: () => axios.get("/api/game-news/news").then((res) => res.data),
    staleTime: 60000, // Cache for 1 minute
  })

  // Real-time countdown states
  const [hospitalRemaining, setHospitalRemaining] = React.useState(0)
  const [jailRemaining, setJailRemaining] = React.useState(0)
  const [crimeCooldownRemaining, setCrimeCooldownRemaining] = React.useState(0)
  const [gymCooldownRemaining, setGymCooldownRemaining] = React.useState(0)
  const [attackImmunityRemaining, setAttackImmunityRemaining] = React.useState(0)

  // Daily login gift logic removed

  // Hospital countdown timer
  React.useEffect(() => {
    if (character?.hospitalStatus?.inHospital && character?.hospitalStatus?.remainingSeconds > 0) {
      const updateTimer = () => {
        setHospitalRemaining((prev) => {
          if (prev <= 0) return 0
          return prev - 1
        })
      }

      // Set initial value
      setHospitalRemaining(character.hospitalStatus.remainingSeconds)
      
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    } else {
      setHospitalRemaining(0)
    }
  }, [character?.hospitalStatus?.inHospital, character?.hospitalStatus?.remainingSeconds])

  // Jail countdown timer
  React.useEffect(() => {
    if (character?.jailStatus?.inJail && character?.jailStatus?.remainingSeconds > 0) {
      const updateTimer = () => {
        setJailRemaining((prev) => {
          if (prev <= 0) return 0
          return prev - 1
        })
      }

      // Set initial value
      setJailRemaining(character.jailStatus.remainingSeconds)
      
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    } else {
      setJailRemaining(0)
    }
  }, [character?.jailStatus?.inJail, character?.jailStatus?.remainingSeconds])

  // Crime cooldown timer
  React.useEffect(() => {
    if (character?.crimeCooldown > 0) {
      const updateTimer = () => {
        setCrimeCooldownRemaining((prev) => {
          if (prev <= 0) return 0
          return prev - 1
        })
      }

      // Set initial value
      setCrimeCooldownRemaining(character.crimeCooldown)
      
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    } else {
      setCrimeCooldownRemaining(0)
    }
  }, [character?.crimeCooldown])

  // Gym cooldown timer
  React.useEffect(() => {
    if (character?.gymCooldown > 0) {
      const updateTimer = () => {
        setGymCooldownRemaining((prev) => {
          if (prev <= 0) return 0
          return prev - 1
        })
      }

      // Set initial value
      setGymCooldownRemaining(character.gymCooldown)
      
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    } else {
      setGymCooldownRemaining(0)
    }
  }, [character?.gymCooldown])

  // Attack immunity countdown timer
  React.useEffect(() => {
    if (character?.attackImmunityExpiresAt) {
      const updateTimer = () => {
        const now = new Date()
        const expiresAt = new Date(character.attackImmunityExpiresAt)
        const remainingMs = expiresAt.getTime() - now.getTime()
        
        if (remainingMs > 0) {
          setAttackImmunityRemaining(remainingMs)
        } else {
          setAttackImmunityRemaining(0)
        }
      }

      updateTimer() // Initial update
      const interval = setInterval(updateTimer, 1000) // Update every second

      return () => clearInterval(interval)
    } else {
      setAttackImmunityRemaining(0)
    }
  }, [character?.attackImmunityExpiresAt])

  // Real-time updates for dashboard stats
  React.useEffect(() => {
    if (!socket) return

    const refetchCharacter = () => {
      queryClient.invalidateQueries(["character", userId])
    }

    socket.on("hud:update", refetchCharacter)
    const pollInterval = setInterval(refetchCharacter, 10000)

    return () => {
      socket.off("hud:update", refetchCharacter)
      clearInterval(pollInterval)
    }
  }, [socket, queryClient, userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-6"></div>
          <p className="text-white text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96 bg-black">
        <div className="text-center">
          <div className="bg-red-950/50 border border-red-700/50 rounded-lg p-6 mb-6">
            <p className="text-red-400 text-lg mb-2">⚠️ تعذر الاتصال بالخادم أو تحميل بيانات HUD</p>
            <p className="text-zinc-400 text-sm">يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  if (!character) return null

  // Fame compatibility: support both top-level and nested fame
  let fame = character?.fame
  if (!fame && character?.character?.fame) fame = character.character.fame

  // When constructing displayCharacter, inject fame
  const displayCharacter = {
    ...character,
    fame: fame ?? 0,
  }

  // Extract status data with real-time values
  const hospitalStatus = {
    inHospital: displayCharacter.hospitalStatus?.inHospital || false,
    remainingSeconds: hospitalRemaining
  }
  const jailStatus = {
    inJail: displayCharacter.jailStatus?.inJail || false,
    remainingSeconds: jailRemaining
  }
  const crimeCooldown = crimeCooldownRemaining
  const gymCooldown = gymCooldownRemaining

  const quickActions = [
    {
      icon: Target,
      label: "ارتكاب جريمة",
      href: "/crimes",
      color: "bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700",
      disabled: crimeCooldown > 0,
      cooldown: crimeCooldown,
    },
    {
      icon: Zap,
      label: "صالة الألعاب",
      href: "/gym",
      color: "bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-600 hover:to-blue-700",
      disabled: gymCooldown > 0,
      cooldown: gymCooldown,
    },
    {
      icon: DollarSign,
      label: "البنك",
      href: "/bank",
      color: "bg-gradient-to-r from-green-700 to-green-800 hover:from-green-600 hover:to-green-700",
    },
    {
      icon: Shield,
      label: "المتجر",
      href: "/shop",
      color: "bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700",
    },
    {
      icon: Car,
      label: "السيارات",
      href: "/cars",
      color: "bg-gradient-to-r from-orange-700 to-orange-800 hover:from-orange-600 hover:to-orange-700",
    },
    {
      icon: HomeIcon,
      label: "المنازل",
      href: "/houses",
      color: "bg-gradient-to-r from-yellow-700 to-yellow-800 hover:from-yellow-600 hover:to-yellow-700",
    },
    {
      icon: Star,
      label: "شاهد القصة",
      href: "/intro",
      color: "bg-gradient-to-r from-pink-700 to-pink-800 hover:from-pink-600 hover:to-pink-700",
    },
  ]

  // Unified stat extraction from backend fields
  const fightsLost = displayCharacter.fightsLost ?? 0
  const fightsWon = displayCharacter.fightsWon ?? 0
  const fightsTotal = displayCharacter.fightsTotal ?? fightsWon + fightsLost

  // Add fame to the stats array for display
  const fameStat = {
    icon: Star,
    label: "الشهرة",
    value: displayCharacter.fame ?? 0,
    color: "text-yellow-400",
  }

  // Insert fame as the first stat
  const stats = [
    fameStat,
    {
      icon: Target,
      label: "الجرائم المرتكبة",
      value: displayCharacter.crimesCommitted ?? 0,
      color: "text-red-400",
    },
    {
      icon: Shield,
      label: "الدفاع",
      value: displayCharacter.defense ?? 0,
      color: "text-blue-400",
    },
    {
      icon: Zap,
      label: "القوة",
      value: displayCharacter.strength ?? 0,
      color: "text-orange-400",
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

  return (
    <>
      {/* Daily login gift modal removed */}

      <div className="min-h-screen bg-black text-white p-4 pt-20" dir="rtl">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
              مرحباً، {displayCharacter.name}
            </h1>
            <p className="text-zinc-400 text-lg">جاهز لبدء يوم جديد في عالم الجريمة؟</p>
          </div>

          {/* Status Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Hospital Status */}
            <div
              className={`bg-gradient-to-br from-zinc-950 to-black backdrop-blur-sm border rounded-xl p-6 ${
                hospitalStatus.inHospital ? "border-red-600/50" : "border-zinc-800/50"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Building2 className={`w-8 h-8 ${hospitalStatus.inHospital ? "text-red-400" : "text-zinc-500"}`} />
                <span className={`text-2xl font-bold ${hospitalStatus.inHospital ? "text-red-400" : "text-green-400"}`}>
                  {hospitalStatus.inHospital ? "في" : "خارج"}
                </span>
              </div>
              <h3 className="text-zinc-300 mb-2">المستشفى</h3>
              <p className={`text-sm font-mono ${hospitalStatus.inHospital ? "text-red-400" : "text-green-400"}`}>
                {hospitalStatus.inHospital ? formatTime(hospitalStatus.remainingSeconds) : "جاهز"}
              </p>
            </div>

            {/* Jail Status */}
            <div
              className={`bg-gradient-to-br from-zinc-950 to-black backdrop-blur-sm border rounded-xl p-6 ${
                jailStatus.inJail ? "border-red-600/50" : "border-zinc-800/50"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Lock className={`w-8 h-8 ${jailStatus.inJail ? "text-red-400" : "text-zinc-500"}`} />
                <span className={`text-2xl font-bold ${jailStatus.inJail ? "text-red-400" : "text-green-400"}`}>
                  {jailStatus.inJail ? "في" : "خارج"}
                </span>
              </div>
              <h3 className="text-zinc-300 mb-2">السجن</h3>
              <p className={`text-sm font-mono ${jailStatus.inJail ? "text-red-400" : "text-green-400"}`}>
                {jailStatus.inJail ? formatTime(jailStatus.remainingSeconds) : "جاهز"}
              </p>
            </div>

            {/* Crime Cooldown */}
            <div
              className={`bg-gradient-to-br from-zinc-950 to-black backdrop-blur-sm border rounded-xl p-6 ${
                crimeCooldown > 0 ? "border-red-600/50" : "border-zinc-800/50"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Target className={`w-8 h-8 ${crimeCooldown > 0 ? "text-red-400" : "text-zinc-500"}`} />
                <span className={`text-2xl font-bold ${crimeCooldown > 0 ? "text-red-400" : "text-green-400"}`}>
                  {crimeCooldown > 0 ? "CD" : "جاهز"}
                </span>
              </div>
              <h3 className="text-zinc-300 mb-2">الجرائم</h3>
              <p className={`text-sm font-mono ${crimeCooldown > 0 ? "text-red-400" : "text-green-400"}`}>
                {formatTime(crimeCooldown)}
              </p>
            </div>

            {/* Gym Cooldown */}
            <div
              className={`bg-gradient-to-br from-zinc-950 to-black backdrop-blur-sm border rounded-xl p-6 ${
                gymCooldown > 0 ? "border-red-600/50" : "border-zinc-800/50"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Dumbbell className={`w-8 h-8 ${gymCooldown > 0 ? "text-red-400" : "text-zinc-500"}`} />
                <span className={`text-2xl font-bold ${gymCooldown > 0 ? "text-red-400" : "text-green-400"}`}>
                  {gymCooldown > 0 ? "CD" : "جاهز"}
                </span>
              </div>
              <h3 className="text-zinc-300 mb-2">النادي</h3>
              <p className={`text-sm font-mono ${gymCooldown > 0 ? "text-red-400" : "text-green-400"}`}>
                {formatTime(gymCooldown)}
              </p>
            </div>

            {/* Attack Immunity Status */}
            {displayCharacter.attackImmunityExpiresAt && new Date(displayCharacter.attackImmunityExpiresAt) > new Date() && (
              <div className="bg-gradient-to-br from-zinc-950 to-black backdrop-blur-sm border border-blue-600/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <Shield className="w-8 h-8 text-blue-400" />
                  <span className="text-2xl font-bold text-blue-400">
                    محمي
                  </span>
                </div>
                <h3 className="text-zinc-300 mb-2">الحماية</h3>
                <p className="text-sm font-mono text-blue-400">
                  {attackImmunityRemaining > 0 ? (() => {
                    const remainingMinutes = Math.floor(attackImmunityRemaining / (1000 * 60));
                    const remainingSeconds = Math.floor((attackImmunityRemaining % (1000 * 60)) / 1000);
                    return `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
                  })() : "منتهي"}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Briefcase className="w-6 h-6 ml-3 text-red-500" />
              إجراءات سريعة
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className={`${action.color} rounded-xl p-6 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg group relative border border-zinc-800/50 ${
                    action.disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={(e) => {
                    if (action.disabled) {
                      e.preventDefault()
                    }
                  }}
                >
                  <action.icon className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{action.label}</span>
                  {action.disabled && action.cooldown > 0 && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                      <span className="text-xs font-mono text-white">{formatTime(action.cooldown)}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Feature Progress Section */}
          <div className="mb-8">
            <FeatureProgressCard />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Game News */}
            <div className="bg-gradient-to-br from-zinc-950 to-black backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <MapPin className="w-5 h-5 ml-2 text-orange-400" />
                أخبار اللعبة
              </h3>
              <div className="space-y-3">
                {gameNews && gameNews.length > 0 ? (
                  gameNews.slice(0, 3).map((news, index) => (
                    <div key={news.id} className="p-3 bg-black/40 border border-zinc-800/30 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-medium text-${news.color || 'yellow'}-400`}>{news.title}</h4>
                        <span className="text-xs text-zinc-500">
                          {(() => {
                            const newsDate = new Date(news.createdAt);
                            const today = new Date();
                            const yesterday = new Date(today);
                            yesterday.setDate(yesterday.getDate() - 1);
                            
                            // Reset time to compare only dates
                            const newsDateOnly = new Date(newsDate.getFullYear(), newsDate.getMonth(), newsDate.getDate());
                            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                            const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
                            
                            if (newsDateOnly.getTime() === todayOnly.getTime()) {
                              return 'اليوم';
                            } else if (newsDateOnly.getTime() === yesterdayOnly.getTime()) {
                              return 'أمس';
                            } else {
                              return newsDate.toLocaleDateString('en-US', {
                                weekday: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              });
                            }
                          })()}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 line-clamp-2">{news.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-black/40 border border-zinc-800/30 rounded-lg">
                    <p className="text-sm text-zinc-500 text-center">لا توجد أخبار حالياً</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-zinc-950 to-black backdrop-blur-sm border border-zinc-800/50 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Award className="w-5 h-5 ml-2 text-purple-400" />
                إحصائيات سريعة
              </h3>
              <div className="space-y-3">
                {stats.map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-zinc-300">{stat.label}</span>
                    </div>
                    <span className={`font-bold ${stat.color}`}>{stat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Link
                to={`/dashboard/profile/${displayCharacter.username}`}
                className="block mt-4 text-center py-2 bg-purple-700 hover:bg-purple-600 rounded-lg transition-colors"
              >
                عرض الملف الشخصي
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
