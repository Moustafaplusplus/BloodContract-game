// src/features/dashboard/Home.jsx - Enhanced Blood Contract Dashboard
import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFeatureUnlock } from '@/hooks/useFeatureUnlock';
import { useConfinement } from '@/hooks/useConfinement';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useUnclaimedTasks } from '@/hooks/useUnclaimedTasks';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useNotifications } from '@/hooks/useNotifications';
import { useIntroStatus } from '@/hooks/useIntroStatus';
import { useBackgroundMusic } from '@/hooks/useBackgroundMusic';
import { useModalManager } from '@/hooks/useModalManager';
import { useFamePopup } from '@/contexts/FamePopupContext';
import { toast } from 'react-hot-toast';
import { Link } from "react-router-dom"
import { FeatureProgressCard } from "@/components/FeatureUnlockNotification"
import GuestSyncNotification from "@/components/GuestSyncNotification"
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
  X, 
  Play, 
  Heart, 
  Battery, 
  Crown, 
  Sword,
  MessageSquare, 
  UserPlus, 
  Gift, 
  Trophy, 
  Settings, 
  LogOut,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Timer,
  Flame,
  Coins,
  ShoppingBag,
  Group,
  Search,
  Bell,
  Backpack,
  Skull,
  Crosshair,
  Gauge,
  User
} from "lucide-react"

// Enhanced time formatter with blood theme
const formatTime = (seconds) => {
  if (seconds <= 0) return { text: "جاهز", color: "text-green-400", glow: true }
  
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  let timeText = ""
  if (hours > 0) {
    timeText = `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  } else {
    timeText = `${mins}:${secs.toString().padStart(2, "0")}`
  }
  
  const isUrgent = seconds < 300 // Less than 5 minutes
  const isCritical = seconds < 60 // Less than 1 minute
  
  return {
    text: timeText,
    color: isCritical ? "text-blood-400" : isUrgent ? "text-red-400" : "text-yellow-400",
    glow: isUrgent
  }
}

// Enhanced 3D Status Card with blood theme
const StatusCard = ({ icon: Icon, label, value, subtitle, color = "blood", isActive, progress, onClick, notification }) => (
  <div 
    className={`card-3d p-3 cursor-pointer group relative overflow-hidden transition-all duration-300 ${
      isActive ? `border-${color}-500/60 shadow-lg shadow-${color}-500/30 blood-glow` : 'hover:border-blood-500/40'
    } ${onClick ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}`}
    onClick={onClick}
  >
    {/* Enhanced Background Gradient */}
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    
    {/* Content */}
    <div className="relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className={`p-1.5 rounded-md bg-${color}-500/20 border border-${color}-500/40`}>
          <Icon className={`w-4 h-4 text-${color}-400 group-hover:scale-110 transition-transform duration-300`} />
        </div>
        
        {notification > 0 && (
          <div className="badge-3d">
            <span className="text-white text-xs font-bold">{notification > 99 ? '99+' : notification}</span>
          </div>
        )}
        
        {onClick && (
          <ChevronRight className={`w-3 h-3 text-white/40 group-hover:text-${color}-400 group-hover:translate-x-0.5 transition-all duration-300`} />
        )}
      </div>
      
      {/* Label */}
      <h3 className="text-xs font-bold text-white/90 mb-1">{label}</h3>
      
      {/* Value */}
      <div className={`text-sm font-bold ${isActive ? `text-${color}-400` : 'text-white'} mb-1`}>
        {value}
      </div>
      
      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-white/50">{subtitle}</p>
      )}
      
      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="progress-3d mt-2 h-1">
          <div 
            className={`progress-3d-fill bg-gradient-to-r from-${color}-600 to-${color}-400`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
      )}
    </div>
    
    {/* Glow Effect */}
    {isActive && (
      <div className={`absolute inset-0 bg-${color}-500/5 rounded-lg animate-pulse pointer-events-none`}></div>
    )}
  </div>
)

// Enhanced Cooldown Status with aggressive design
const CooldownStatus = ({ hospitalStatus, jailStatus, crimeCooldown, gymCooldown }) => {
  const activeCooldowns = []
  
  if (hospitalStatus.inHospital) {
    const timeInfo = formatTime(hospitalStatus.remainingSeconds)
    activeCooldowns.push({ 
      label: "المستشفى", 
      time: timeInfo.text, 
      color: timeInfo.color,
      glow: timeInfo.glow,
      icon: Building2, 
      type: "hospital",
      urgent: hospitalStatus.remainingSeconds < 300,
      bgColor: "bg-red-950/40"
    })
  }
  
  if (jailStatus.inJail) {
    const timeInfo = formatTime(jailStatus.remainingSeconds)
    activeCooldowns.push({ 
      label: "السجن", 
      time: timeInfo.text, 
      color: timeInfo.color,
      glow: timeInfo.glow,
      icon: Lock, 
      type: "jail",
      urgent: jailStatus.remainingSeconds < 300,
      bgColor: "bg-orange-950/40"
    })
  }
  
  if (crimeCooldown > 0) {
    const timeInfo = formatTime(crimeCooldown)
    activeCooldowns.push({ 
      label: "الجرائم", 
      time: timeInfo.text, 
      color: timeInfo.color,
      glow: timeInfo.glow,
      icon: Target, 
      type: "crime",
      urgent: crimeCooldown < 300,
      bgColor: "bg-blood-950/40"
    })
  }
  
  if (gymCooldown > 0) {
    const timeInfo = formatTime(gymCooldown)
    activeCooldowns.push({ 
      label: "النادي", 
      time: timeInfo.text, 
      color: timeInfo.color,
      glow: timeInfo.glow,
      icon: Dumbbell, 
      type: "gym",
      urgent: gymCooldown < 300,
      bgColor: "bg-blue-950/40"
    })
  }

  if (activeCooldowns.length === 0) {
    return (
      <div className="card-3d bg-gradient-to-r from-green-950/30 to-emerald-950/30 border-green-500/50 p-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10"></div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-sm font-bold text-green-400">جاهز للعمل</span>
          </div>
          <p className="text-xs text-green-300 mb-3">جميع الأنشطة متاحة الآن</p>
          <div className="flex justify-center gap-2">
            <Link to="/dashboard/crimes" className="btn-3d-secondary text-xs px-3 py-1 flex items-center gap-1">
              <Target className="w-3 h-3" />
              الجرائم
            </Link>
            <Link to="/dashboard/gym" className="btn-3d-secondary text-xs px-3 py-1 flex items-center gap-1">
              <Dumbbell className="w-3 h-3" />
              النادي
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card-3d bg-gradient-to-r from-blood-950/40 to-red-950/30 border-blood-500/50 p-3 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blood-500/5 to-red-500/5"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Timer className="w-4 h-4 text-blood-400" />
          <span className="text-sm font-bold text-blood-400">قيد الانتظار</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activeCooldowns.map((cooldown, index) => (
            <div 
              key={index} 
              className={`card-3d ${cooldown.bgColor} border-white/10 p-2 ${
                cooldown.urgent ? 'animate-pulse border-blood-500/40' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${
                  cooldown.urgent ? 'bg-blood-500/20 border border-blood-500/40' : 'bg-white/10'
                }`}>
                  <cooldown.icon className={`w-3 h-3 ${
                    cooldown.urgent ? 'text-blood-400' : 'text-white/70'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/90 font-medium">{cooldown.label}</div>
                  <div className={`text-sm font-bold font-mono ${cooldown.color} ${
                    cooldown.glow ? 'animate-glow-blood' : ''
                  } truncate`}>
                    {cooldown.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Enhanced Quick Action with blood theme
const QuickAction = ({ icon: Icon, label, href, disabled, cooldown, color = "blood", notification }) => {
  const timeInfo = disabled && cooldown > 0 ? formatTime(cooldown) : null
  
  return (
    <Link
      to={href}
      className={`card-3d p-3 text-center group relative overflow-hidden transition-all duration-300 ${
        disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-[1.02] hover:border-blood-500/50 active:scale-[0.98] hover:shadow-md hover:shadow-blood-500/20'
      }`}
      onClick={(e) => disabled && e.preventDefault()}
    >
      {/* Enhanced Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="relative mb-2">
          <div className={`p-2 rounded-lg bg-${color}-500/20 border border-${color}-500/40 inline-block`}>
            <Icon className={`w-5 h-5 text-${color}-400 group-hover:scale-110 transition-transform duration-300`} />
          </div>
          
          {notification > 0 && (
            <div className="badge-3d absolute -top-1 -right-1">
              <span className="text-white text-xs font-bold">{notification > 99 ? '99+' : notification}</span>
            </div>
          )}
        </div>
        
        <div className="text-xs font-medium text-white group-hover:text-blood-400 transition-colors duration-300">
          {label}
        </div>
        
        {disabled && timeInfo && (
          <div className={`text-xs font-mono mt-1 ${timeInfo.color} ${
            timeInfo.glow ? 'animate-glow-blood' : ''
          }`}>
            {timeInfo.text}
          </div>
        )}
      </div>
    </Link>
  )
}

// Enhanced Character Stats with blood theme
const CharacterStats = ({ character }) => {
  const fightsWon = character.fightsWon ?? 0
  const fightsLost = character.fightsLost ?? 0
  const fightsTotal = character.fightsTotal ?? (fightsWon + fightsLost)
  const winRate = fightsTotal > 0 ? Math.round((fightsWon / fightsTotal) * 100) : 0
  
  const statCards = [
    { 
      label: "الشهرة", 
      value: character.fame?.toLocaleString() ?? 0, 
      icon: Star, 
      color: "yellow",
      bgGrad: "from-yellow-950/30 to-amber-950/20"
    },
    { 
      label: "القوة", 
      value: character.strength?.toLocaleString() ?? 0, 
      icon: Zap, 
      color: "orange",
      bgGrad: "from-orange-950/30 to-red-950/20"
    },
    { 
      label: "الدفاع", 
      value: character.defense?.toLocaleString() ?? 0, 
      icon: Shield, 
      color: "blue",
      bgGrad: "from-blue-950/30 to-cyan-950/20"
    },
    { 
      label: "المعارك", 
      value: fightsTotal, 
      icon: Sword, 
      color: "red",
      subtitle: `الفوز: ${winRate}%`,
      bgGrad: "from-red-950/30 to-blood-950/20"
    },
    { 
      label: "الجرائم", 
      value: character.crimesCommitted ?? 0, 
      icon: Crosshair, 
      color: "red",
      bgGrad: "from-blood-950/30 to-red-950/20"
    },
    { 
      label: "القتل", 
      value: character.killCount ?? 0, 
      icon: Skull, 
      color: "red",
      bgGrad: "from-blood-950/40 to-black/20"
    }
  ]

  return (
    <div className="card-3d p-4">
      <h3 className="text-base font-bold text-blood-400 mb-3 flex items-center gap-2">
        <Award className="w-4 h-4" />
        إحصائيات الشخصية
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {statCards.map((stat, index) => (
          <div key={index} className={`card-3d bg-gradient-to-br ${stat.bgGrad} border-${stat.color}-500/30 p-2 text-center group hover:border-${stat.color}-500/50 transition-colors duration-300`}>
            <div className={`p-1.5 rounded bg-${stat.color}-500/20 border border-${stat.color}-500/40 inline-block mb-1.5 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
            </div>
            <div className="text-xs text-white/60 mb-0.5">{stat.label}</div>
            <div className={`text-sm font-bold text-${stat.color}-400`}>{stat.value}</div>
            {stat.subtitle && (
              <div className="text-xs text-white/50 mt-0.5">{stat.subtitle}</div>
            )}
          </div>
        ))}
      </div>
      
      <Link
        to={`/dashboard/profile/${character.username}`}
        className="btn-3d w-full mt-3 text-center text-xs py-2 flex items-center justify-center gap-2 hover:border-blood-500/50"
      >
        <User className="w-3 h-3" />
        الملف الشخصي
      </Link>
    </div>
  )
}

// Enhanced News Component with blood theme
const GameNews = ({ gameNews }) => (
  <div className="card-3d p-4">
    <h3 className="text-base font-bold text-orange-400 mb-3 flex items-center gap-2">
      <MapPin className="w-4 h-4" />
      أخبار اللعبة
    </h3>
    
    <div className="space-y-2">
      {gameNews && gameNews.length > 0 ? (
        gameNews.slice(0, 3).map((news, index) => (
          <div key={news.id} className="card-3d bg-black/40 border-white/10 p-3 hover:border-orange-500/30 transition-colors duration-300">
            <div className="flex justify-between items-start mb-1">
              <h4 className={`font-bold text-${news.color || 'orange'}-400 text-xs`}>
                {news.title}
              </h4>
              <span className="text-xs text-zinc-500 flex-shrink-0 ml-2">
                {(() => {
                  const newsDate = new Date(news.createdAt);
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);
                  
                  const newsDateOnly = new Date(newsDate.getFullYear(), newsDate.getMonth(), newsDate.getDate());
                  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
                  
                  if (newsDateOnly.getTime() === todayOnly.getTime()) {
                    return 'اليوم';
                  } else if (newsDateOnly.getTime() === yesterdayOnly.getTime()) {
                    return 'أمس';
                  } else {
                    return newsDate.toLocaleDateString('ar-SA', {
                      day: 'numeric',
                      month: 'short'
                    });
                  }
                })()}
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{news.content}</p>
          </div>
        ))
      ) : (
        <div className="card-3d bg-black/40 border-white/10 p-4 text-center">
          <div className="text-white/50 text-xs">لا توجد أخبار حالياً</div>
          <div className="text-xs text-white/30 mt-1">ستظهر التحديثات هنا</div>
        </div>
      )}
    </div>
  </div>
)

export default function Home() {
  const { user, logout } = useFirebaseAuth();
  const { 
    hudData, 
    gameNews, 
    confinementStatus,
    isConnected,
    requestHud,
    requestGameNews,
    requestConfinement
  } = useSocket();
  const { isFeatureUnlocked } = useFeatureUnlock();
  const { isInHospital, isInJail } = useConfinement();
  const { unreadCount: unreadMessagesCount } = useUnreadMessages();
  const { unclaimedCount: unclaimedTasksCount } = useUnclaimedTasks();
  const { pendingCount: friendRequestsCount } = useFriendRequests();
  const { unreadCount: notificationsCount } = useNotifications();
  const { hasCompletedIntro } = useIntroStatus();
  const { isPlaying, toggleMusic } = useBackgroundMusic();
  const { showModal } = useModalManager();
  const { showFamePopup } = useFamePopup();

  // Request initial data via Socket.IO
  useEffect(() => {
    if (isConnected) {
      requestHud();
      requestGameNews();
      requestConfinement();
    }
  }, [isConnected, requestHud, requestGameNews, requestConfinement]);

  // Show intro notification if user hasn't seen intro
  const [showIntroNotification, setShowIntroNotification] = useState(false)
  useEffect(() => {
    if (!hudData?.loadingIntro && !hasCompletedIntro) {
      setShowIntroNotification(true)
    }
  }, [hudData?.loadingIntro, hasCompletedIntro])

  const character = hudData

  // Real-time countdown states
  const [hospitalRemaining, setHospitalRemaining] = useState(0)
  const [jailRemaining, setJailRemaining] = useState(0)
  const [crimeCooldownRemaining, setCrimeCooldownRemaining] = useState(0)
  const [gymCooldownRemaining, setGymCooldownRemaining] = useState(0)

  // Countdown timers
  useEffect(() => {
    if (character?.hospitalStatus?.inHospital && character?.hospitalStatus?.remainingSeconds > 0) {
      const updateTimer = () => {
        setHospitalRemaining((prev) => Math.max(prev - 1, 0))
      }
      setHospitalRemaining(character.hospitalStatus.remainingSeconds)
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    } else {
      setHospitalRemaining(0)
    }
  }, [character?.hospitalStatus?.inHospital, character?.hospitalStatus?.remainingSeconds])

  useEffect(() => {
    if (character?.jailStatus?.inJail && character?.jailStatus?.remainingSeconds > 0) {
      const updateTimer = () => {
        setJailRemaining((prev) => Math.max(prev - 1, 0))
      }
      setJailRemaining(character.jailStatus.remainingSeconds)
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    } else {
      setJailRemaining(0)
    }
  }, [character?.jailStatus?.inJail, character?.jailStatus?.remainingSeconds])

  useEffect(() => {
    if (character?.crimeCooldown > 0) {
      const updateTimer = () => {
        setCrimeCooldownRemaining((prev) => Math.max(prev - 1, 0))
      }
      setCrimeCooldownRemaining(character.crimeCooldown)
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    } else {
      setCrimeCooldownRemaining(0)
    }
  }, [character?.crimeCooldown])

  useEffect(() => {
    if (character?.gymCooldown > 0) {
      const updateTimer = () => {
        setGymCooldownRemaining((prev) => Math.max(prev - 1, 0))
      }
      setGymCooldownRemaining(character.gymCooldown)
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    } else {
      setGymCooldownRemaining(0)
    }
  }, [character?.gymCooldown])

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen blood-gradient">
        <div className="text-center card-3d p-6">
          <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
          <p className="text-white text-sm animate-pulse">جاري الاتصال...</p>
        </div>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="flex items-center justify-center min-h-screen blood-gradient">
        <div className="text-center card-3d p-6">
          <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
          <p className="text-white text-sm">تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  const displayCharacter = {
    ...character,
    fame: character?.fame ?? 0,
  }

  // Status data with real-time values
  const currentHospitalStatus = {
    inHospital: displayCharacter.hospitalStatus?.inHospital || false,
    remainingSeconds: hospitalRemaining
  }
  const currentJailStatus = {
    inJail: displayCharacter.jailStatus?.inJail || false,
    remainingSeconds: jailRemaining
  }

  // Quick actions with enhanced blood theme
  const quickActions = [
    {
      icon: Target,
      label: "الجرائم",
      href: "/dashboard/crimes",
      disabled: crimeCooldownRemaining > 0,
      cooldown: crimeCooldownRemaining,
      color: "blood"
    },
    {
      icon: Dumbbell,
      label: "النادي",
      href: "/dashboard/gym",
      disabled: gymCooldownRemaining > 0,
      cooldown: gymCooldownRemaining,
      color: "blue"
    },
    {
      icon: DollarSign,
      label: "البنك",
      href: "/dashboard/bank",
      color: "green"
    },
    {
      icon: Shield,
      label: "المتجر",
      href: "/dashboard/shop",
      color: "purple"
    },
    {
      icon: Users,
      label: "اللاعبون",
      href: "/dashboard/active-users",
      color: "orange"
    },
    {
      icon: MessageSquare,
      label: "الرسائل",
      href: "/dashboard/messages",
      notification: unreadMessagesCount,
      color: "blue"
    }
  ]

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom">
      <div className="container mx-auto max-w-6xl p-3 space-y-4">
        
        {/* Enhanced Welcome Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white mb-1 drop-shadow-lg">
                مرحباً، {displayCharacter.name}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 drop-shadow">استعد لليوم الجديد في عالم الجريمة</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-black/60 border border-yellow-500/40 rounded-lg p-2 text-center backdrop-blur-sm">
                <Crown className="w-4 h-4 text-yellow-400 mx-auto mb-0.5" />
                <div className="text-sm font-bold text-yellow-400">Lv.{displayCharacter.level}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Intro Notification */}
        {showIntroNotification && (
          <div className="card-3d bg-gradient-to-r from-blood-950/40 to-red-950/30 border-blood-500/50 p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blood-500/10 to-red-500/10"></div>
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="card-3d bg-blood-600/20 border-blood-500/40 p-2">
                  <Play className="w-4 h-4 text-blood-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-blood-300 mb-1">شاهد القصة</h3>
                  <p className="text-xs text-blood-200 mb-3">
                    اكتشف عالم عقد الدم من خلال قصة تفاعلية مثيرة.
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to="/intro"
                      className="btn-3d text-xs px-3 py-1 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      شاهد
                    </Link>
                    <button
                      onClick={() => setShowIntroNotification(false)}
                      className="btn-3d-secondary text-xs px-3 py-1"
                    >
                      لاحقاً
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowIntroNotification(false)}
                className="text-white/40 hover:text-white/70 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Cooldown Status */}
        <CooldownStatus
          hospitalStatus={currentHospitalStatus}
          jailStatus={currentJailStatus}
          crimeCooldown={crimeCooldownRemaining}
          gymCooldown={gymCooldownRemaining}
        />

        {/* Enhanced Quick Actions */}
        <div className="card-3d p-4">
          <h2 className="text-sm font-bold text-blood-400 mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {quickActions.map((action, index) => (
              <QuickAction
                key={index}
                icon={action.icon}
                label={action.label}
                href={action.href}
                disabled={action.disabled}
                cooldown={action.cooldown}
                color={action.color}
                notification={action.notification || 0}
              />
            ))}
          </div>
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Game News */}
          <GameNews gameNews={gameNews} />
          
          {/* Character Stats */}
          <CharacterStats character={displayCharacter} />
        </div>

        {/* Enhanced Feature Progress */}
        <div className="card-3d p-4">
          <FeatureProgressCard />
        </div>

        {/* Guest Sync Notification */}
        <GuestSyncNotification />
      </div>
    </div>
  )
}
