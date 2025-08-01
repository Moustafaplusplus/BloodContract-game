// src/features/dashboard/Home.jsx
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
import { 
  FaUser, 
  FaHeart, 
  FaBolt, 
  FaStar, 
  FaSearch, 
  FaBell, 
  FaCog,
  FaGift,
  FaTrophy,
  FaUsers,
  FaHome,
  FaCar,
  FaDog,
  FaShieldAlt,
  FaDumbbell,
  FaBriefcase,
  FaGraduationCap,
  FaStore,
  FaGem,
  FaComments,
  FaEnvelope,
  FaUserFriends,
  FaTasks,
  FaNewspaper,
  FaHandshake,
  FaSkull,
  FaHospital,
  FaLock,
  FaMoneyBillWave,
  FaCoins,
  FaBuilding,
  FaCrosshairs
} from 'react-icons/fa';
import { GiSwordman, GiCrossedSwords, GiPistolGun } from 'react-icons/gi';
import { MdLocalHospital, MdLocalPolice } from 'react-icons/md';
import { IoMdNotifications } from 'react-icons/io';
import { BsFillGearFill } from 'react-icons/bs';
import { RiVipCrownFill } from 'react-icons/ri';
import { TbReportMoney } from 'react-icons/tb';
import { BiSolidGift } from 'react-icons/bi';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { VscDebugConsole } from 'react-icons/vsc';
import { SiFirebase } from 'react-icons/si';
import { CgProfile } from 'react-icons/cg';
// Removed problematic react-icons/fi imports - using Lucide React icons instead
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
  LogOut
} from "lucide-react"

// Helper function to format time
const formatTime = (seconds) => {
  if (seconds <= 0) return "جاهز"
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

// Compact status card
const StatusCard = ({ icon: Icon, label, value, isActive, color = "red" }) => (
  <div className={`bg-black/80 border border-white/20 rounded-lg p-3 text-center ${isActive ? `border-${color}-500/50` : ''}`}>
    <Icon className={`w-5 h-5 mx-auto mb-1 ${isActive ? `text-${color}-500` : 'text-white/50'}`} />
    <div className="text-xs text-white/70">{label}</div>
    <div className={`text-sm font-bold ${isActive ? `text-${color}-500` : 'text-white'}`}>{value}</div>
  </div>
)

// Smart cooldown group component
const CooldownGroup = ({ hospitalStatus, jailStatus, crimeCooldown, gymCooldown }) => {
  const hasActiveCooldowns = hospitalStatus.inHospital || jailStatus.inJail || crimeCooldown > 0 || gymCooldown > 0
  
  if (!hasActiveCooldowns) {
    return (
      <div className="bg-green-950/30 border border-green-500/50 rounded-lg p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-bold text-green-400">جميع الأنشطة جاهزة</span>
        </div>
        <p className="text-xs text-green-300">يمكنك الآن ممارسة جميع الأنشطة</p>
      </div>
    )
  }

  const activeCooldowns = []
  if (hospitalStatus.inHospital) activeCooldowns.push({ label: "المستشفى", time: hospitalStatus.remainingSeconds, icon: FaBuilding, color: "red" })
  if (jailStatus.inJail) activeCooldowns.push({ label: "السجن", time: jailStatus.remainingSeconds, icon: FaLock, color: "red" })
  if (crimeCooldown > 0) activeCooldowns.push({ label: "الجرائم", time: crimeCooldown, icon: FaCrosshairs, color: "orange" })
  if (gymCooldown > 0) activeCooldowns.push({ label: "النادي", time: gymCooldown, icon: FaDumbbell, color: "blue" })

  return (
    <div className="bg-red-950/30 border border-red-500/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-sm font-bold text-red-400">أنشطة قيد الانتظار</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {activeCooldowns.map((cooldown, index) => (
          <div key={index} className="flex items-center gap-2 bg-black/40 border border-white/10 rounded p-2">
            <cooldown.icon className={`w-4 h-4 text-${cooldown.color}-500`} />
            <div className="flex-1">
              <div className="text-xs text-white/70">{cooldown.label}</div>
              <div className={`text-sm font-bold text-${cooldown.color}-500`}>{formatTime(cooldown.time)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Quick action button
const QuickAction = ({ icon: Icon, label, href, disabled, cooldown }) => (
  <Link
    to={href}
    className={`bg-black/80 border border-white/20 rounded-lg p-3 text-center transition-all hover:border-red-500/50 hover:bg-red-950/20 ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}
    onClick={(e) => disabled && e.preventDefault()}
  >
    <Icon className="w-5 h-5 mx-auto mb-1 text-red-500" />
    <div className="text-xs text-white">{label}</div>
    {disabled && cooldown > 0 && (
      <div className="text-xs text-red-500 font-mono mt-1">{formatTime(cooldown)}</div>
    )}
  </Link>
)

// Stat display
const StatDisplay = ({ icon: Icon, label, value, color = "text-white" }) => (
  <div className="flex items-center justify-between bg-black/60 border border-white/20 rounded-lg p-2">
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-xs text-white/80">{label}</span>
    </div>
    <span className={`text-sm font-bold ${color}`}>{value.toLocaleString()}</span>
  </div>
)

// Character stats section
const CharacterStats = ({ character }) => {
  // Calculate fight statistics
  const fightsWon = character.fightsWon ?? 0
  const fightsLost = character.fightsLost ?? 0
  const fightsTotal = character.fightsTotal ?? (fightsWon + fightsLost)
  const winRate = fightsTotal > 0 ? Math.round((fightsWon / fightsTotal) * 100) : 0
  
  // Calculate days statistics
  const daysInGame = character.daysInGame ?? 0
  const daysOnline = character.daysOnline ?? 0
  
  return (
    <div className="bg-black/80 border border-white/20 rounded-lg p-4">
      <h3 className="text-sm font-bold text-purple-500 mb-3 flex items-center gap-2">
        <Award className="w-4 h-4" />
        إحصائيات الشخصية
      </h3>
      
      {/* Main Stats - Fame, Power, Defense */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center bg-yellow-950/30 border border-yellow-500/30 rounded p-2">
          <Star className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
          <div className="text-xs text-white/70">الشهرة</div>
          <div className="text-lg font-bold text-yellow-500">{character.fame?.toLocaleString() ?? 0}</div>
        </div>
        <div className="text-center bg-orange-950/30 border border-orange-500/30 rounded p-2">
          <Zap className="w-6 h-6 mx-auto mb-1 text-orange-500" />
          <div className="text-xs text-white/70">القوة</div>
          <div className="text-lg font-bold text-orange-500">{character.strength?.toLocaleString() ?? 0}</div>
        </div>
        <div className="text-center bg-blue-950/30 border border-blue-500/30 rounded p-2">
          <Shield className="w-6 h-6 mx-auto mb-1 text-blue-500" />
          <div className="text-xs text-white/70">الدفاع</div>
          <div className="text-lg font-bold text-blue-500">{character.defense?.toLocaleString() ?? 0}</div>
        </div>
      </div>

      {/* Combat Stats */}
      <div className="mb-4">
        <h4 className="text-xs font-bold text-red-400 mb-2">إحصائيات القتال</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-red-950/20 border border-red-500/20 rounded p-2 text-center">
            <div className="text-xs text-white/70">إجمالي المعارك</div>
            <div className="text-sm font-bold text-red-400">{fightsTotal}</div>
          </div>
          <div className="bg-green-950/20 border border-green-500/20 rounded p-2 text-center">
            <div className="text-xs text-white/70">نسبة الفوز</div>
            <div className="text-sm font-bold text-green-400">{winRate}%</div>
          </div>
          <div className="bg-blue-950/20 border border-blue-500/20 rounded p-2 text-center">
            <div className="text-xs text-white/70">الانتصارات</div>
            <div className="text-sm font-bold text-blue-400">{fightsWon}</div>
          </div>
          <div className="bg-orange-950/20 border border-orange-500/20 rounded p-2 text-center">
            <div className="text-xs text-white/70">الخسائر</div>
            <div className="text-sm font-bold text-orange-400">{fightsLost}</div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="space-y-2">
        <StatDisplay icon={FaCrosshairs} label="الجرائم المرتكبة" value={character.crimesCommitted ?? 0} color="text-red-400" />
        <StatDisplay icon={Trophy} label="عدد القتل" value={character.killCount ?? 0} color="text-red-500" />
        <StatDisplay icon={Calendar} label="الأيام في اللعبة" value={daysInGame} color="text-green-400" />
        <StatDisplay icon={Activity} label="الأيام المتصلة" value={daysOnline} color="text-blue-400" />
        {character.assassinations > 0 && (
          <StatDisplay icon={Sword} label="الاغتيالات" value={character.assassinations ?? 0} color="text-purple-400" />
        )}
      </div>

      {/* Profile Link */}
      <Link
        to={`/dashboard/profile/${character.username}`}
        className="block mt-3 text-center py-2 bg-purple-700 hover:bg-purple-600 rounded text-xs transition-colors"
      >
        عرض الملف الشخصي الكامل
      </Link>
    </div>
  )
}

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

  // Show intro notification if user hasn't seen intro and not loading
  const [showIntroNotification, setShowIntroNotification] = useState(false)
  useEffect(() => {
    if (!hudData?.loadingIntro && !hasCompletedIntro) {
      setShowIntroNotification(true)
    }
  }, [hudData?.loadingIntro, hasCompletedIntro])

  // Reset all state when user changes
  const [key, setKey] = useState(0)
  useEffect(() => {
    if (user?.id) {
      setKey((prev) => prev + 1)
      // queryClient.removeQueries(["character"]) // Removed as per new_code
      // queryClient.removeQueries(["hospitalStatus"]) // Removed as per new_code
      // queryClient.removeQueries(["profile"]) // Removed as per new_code
    }
  }, [user?.id])

  const character = hudData

  // Real-time countdown states
  const [hospitalRemaining, setHospitalRemaining] = useState(0)
  const [jailRemaining, setJailRemaining] = useState(0)
  const [crimeCooldownRemaining, setCrimeCooldownRemaining] = useState(0)
  const [gymCooldownRemaining, setGymCooldownRemaining] = useState(0)

  // Hospital countdown timer
  useEffect(() => {
    if (character?.hospitalStatus?.inHospital && character?.hospitalStatus?.remainingSeconds > 0) {
      const updateTimer = () => {
        setHospitalRemaining((prev) => {
          if (prev <= 0) return 0
          return prev - 1
        })
      }
      setHospitalRemaining(character.hospitalStatus.remainingSeconds)
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    } else {
      setHospitalRemaining(0)
    }
  }, [character?.hospitalStatus?.inHospital, character?.hospitalStatus?.remainingSeconds])

  // Jail countdown timer
  useEffect(() => {
    if (character?.jailStatus?.inJail && character?.jailStatus?.remainingSeconds > 0) {
      const updateTimer = () => {
        setJailRemaining((prev) => {
          if (prev <= 0) return 0
          return prev - 1
        })
      }
      setJailRemaining(character.jailStatus.remainingSeconds)
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    } else {
      setJailRemaining(0)
    }
  }, [character?.jailStatus?.inJail, character?.jailStatus?.remainingSeconds])

  // Crime cooldown timer
  useEffect(() => {
    if (character?.crimeCooldown > 0) {
      const updateTimer = () => {
        setCrimeCooldownRemaining((prev) => {
          if (prev <= 0) return 0
          return prev - 1
        })
      }
      setCrimeCooldownRemaining(character.crimeCooldown)
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    } else {
      setCrimeCooldownRemaining(0)
    }
  }, [character?.crimeCooldown])

  // Gym cooldown timer
  useEffect(() => {
    if (character?.gymCooldown > 0) {
      const updateTimer = () => {
        setGymCooldownRemaining((prev) => {
          if (prev <= 0) return 0
          return prev - 1
        })
      }
      setGymCooldownRemaining(character.gymCooldown)
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    } else {
      setGymCooldownRemaining(0)
    }
  }, [character?.gymCooldown])

  // Real-time updates for dashboard stats
  useEffect(() => {
    if (!isConnected) return
    const refetchCharacter = () => {
      // queryClient.invalidateQueries(["character", userId]) // Removed as per new_code
    }
    // socket.on("hud:update", refetchCharacter) // Removed as per new_code
    // const pollInterval = setInterval(refetchCharacter, 10000) // Removed as per new_code
    // return () => { // Removed as per new_code
    //   socket.off("hud:update", refetchCharacter) // Removed as per new_code
    //   clearInterval(pollInterval) // Removed as per new_code
    // } // Removed as per new_code
  }, [isConnected]) // Removed queryClient, userId from dependencies as per new_code

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white text-sm">جاري الاتصال بالخادم...</p>
        </div>
      </div>
    )
  }

  if (!character) return null

  // Fame compatibility
  let fame = character?.fame
  if (!fame && character?.character?.fame) fame = character.character.fame

  const displayCharacter = {
    ...character,
    fame: fame ?? 0,
  }

  // Extract status data with real-time values
  const currentHospitalStatus = {
    inHospital: displayCharacter.hospitalStatus?.inHospital || false,
    remainingSeconds: hospitalRemaining
  }
  const currentJailStatus = {
    inJail: displayCharacter.jailStatus?.inJail || false,
    remainingSeconds: jailRemaining
  }
  const currentCrimeCooldown = crimeCooldownRemaining
  const currentGymCooldown = gymCooldownRemaining

  const quickActions = [
    {
      icon: FaCrosshairs,
      label: "الجرائم",
      href: "/crimes",
      disabled: currentCrimeCooldown > 0,
      cooldown: currentCrimeCooldown,
    },
    {
      icon: FaDumbbell,
      label: "النادي",
      href: "/gym",
      disabled: currentGymCooldown > 0,
      cooldown: currentGymCooldown,
    },
    {
      icon: DollarSign,
      label: "البنك",
      href: "/bank",
    },
    {
      icon: Shield,
      label: "المتجر",
      href: "/shop",
    },
    {
      icon: Car,
      label: "السيارات",
      href: "/cars",
    },
    {
      icon: HomeIcon,
      label: "المنازل",
      href: "/houses",
    },
    {
      icon: Users,
      label: "اللاعبون",
      href: "/active-users",
    },
    {
      icon: MessageSquare,
      label: "الرسائل",
      href: "/messages",
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-3 pt-16">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Welcome Header */}
        <div className="bg-black/80 border border-white/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-red-500 mb-1">
                مرحباً، {displayCharacter.name}
              </h1>
              <p className="text-xs text-white/70">جاهز لبدء يوم جديد في عالم الجريمة؟</p>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-bold text-white">Lv.{displayCharacter.level}</span>
            </div>
          </div>
        </div>

        {/* Intro Notification */}
        {showIntroNotification && (
          <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 border border-pink-500/50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="bg-pink-600/20 rounded-full p-2">
                  <Play className="w-4 h-4 text-pink-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-pink-300 mb-1">شاهد قصة اللعبة</h3>
                  <p className="text-xs text-pink-200 mb-3">
                    اكتشف عالم Blood Contract من خلال قصة تفاعلية مثيرة.
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to="/intro"
                      className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      شاهد القصة
                    </Link>
                    <button
                      onClick={() => setShowIntroNotification(false)}
                      className="bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-3 py-1 rounded text-xs font-medium transition-colors"
                    >
                      لاحقاً
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowIntroNotification(false)}
                className="text-zinc-400 hover:text-zinc-300 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Smart Cooldown Group */}
                <CooldownGroup
          hospitalStatus={currentHospitalStatus}
          jailStatus={currentJailStatus}
          crimeCooldown={currentCrimeCooldown}
          gymCooldown={currentGymCooldown}
        />

        {/* Quick Actions */}
        <div className="bg-black/80 border border-white/20 rounded-lg p-4">
          <h2 className="text-sm font-bold text-red-500 mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map((action, index) => (
              <QuickAction
                key={index}
                icon={action.icon}
                label={action.label}
                href={action.href}
                disabled={action.disabled}
                cooldown={action.cooldown}
              />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Game News */}
          <div className="bg-black/80 border border-white/20 rounded-lg p-4">
            <h3 className="text-sm font-bold text-orange-500 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              أخبار اللعبة
            </h3>
            <div className="space-y-2">
              {gameNews && gameNews.length > 0 ? (
                gameNews.slice(0, 2).map((news, index) => (
                  <div key={news.id} className="p-2 bg-black/40 border border-white/10 rounded text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`font-medium text-${news.color || 'yellow'}-400`}>{news.title}</h4>
                      <span className="text-xs text-zinc-500">
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
                            return newsDate.toLocaleDateString('en-US', {
                              weekday: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            });
                          }
                        })()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2">{news.content}</p>
                  </div>
                ))
              ) : (
                <div className="p-2 bg-black/40 border border-white/10 rounded text-xs">
                  <p className="text-zinc-500 text-center">لا توجد أخبار حالياً</p>
                </div>
              )}
            </div>
          </div>

          {/* Character Stats */}
          <CharacterStats character={displayCharacter} />
        </div>

        {/* Feature Progress */}
        <div className="bg-black/80 border border-white/20 rounded-lg p-4">
          <FeatureProgressCard />
        </div>

        {/* Guest Sync Notification */}
        <GuestSyncNotification />
      </div>
    </div>
  )
}
