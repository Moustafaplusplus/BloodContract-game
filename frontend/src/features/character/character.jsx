/* -------- src/features/character/character.jsx ---------- */
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import { jwtDecode } from "jwt-decode";
import {
  User,
  Star,
  DollarSign,
  Trophy,
  Target,
  Shield,
  Crown,
  Calendar,
  Clock,
  Users,
  Home as HomeIcon,
  Edit3,
  Activity,
  Zap,
  Heart,
  Skull,
} from "lucide-react";
import { toast } from "react-hot-toast";
import '../profile/vipSparkle.css';
import VipName from '../profile/VipName.jsx';
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';

export default function Character() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  // Get userId from token for cache invalidation
  const userId = token ? (() => {
    try {
      const { id } = jwtDecode(token);
      return id;
    } catch {
      return null;
    }
  })() : null;

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
  });

  // Mock data for design purposes when backend is not available
  const mockCharacter = {
    username: "Agent_47",
            email: "agent@bloodcontract.com",
    level: 15,
    exp: 2750,
    nextLevelExp: 3000,
    hp: 95,
    maxHp: 100,
    energy: 80,
    maxEnergy: 100,
    money: 125000,
    lastActive: new Date().toISOString(),
    crimesCommitted: 156,
    fightsWon: 73,
    gangId: "Shadow Syndicate",
    equippedHouseId: "Luxury Penthouse",
    rank: "Legendary Assassin",
    buffs: ["Stealth Master", "Combat Expert", "Money Magnet"],
    strength: 120,
    defense: 85,
  };

  // Fame compatibility: support both top-level and nested fame
  let fame = character?.fame;
  if (!fame && character?.character?.fame) fame = character.character.fame;
  // Map 'name' to 'username' if needed
  const normalizedCharacter = character && !character.username && character.name
    ? { ...character, username: character.name }
    : character;
  // When constructing displayCharacter, inject fame
  const displayCharacter = {
    ...(normalizedCharacter || mockCharacter),
    fame: fame ?? 0,
  };

  // Hospital status with real-time countdown
  const { data: hospitalStatus, error: hospitalError } = useQuery({
    queryKey: ['hospitalStatus', userId], // Include userId in query key
    queryFn: async () => {
      const token = localStorage.getItem('jwt');
      console.log('[HOSPITAL_QUERY] Token:', token ? 'Present' : 'Missing');
      
      const res = await fetch('/api/confinement/hospital', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('[HOSPITAL_QUERY] Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.log('[HOSPITAL_QUERY] Error response:', errorText);
        
        if (res.status === 401) {
          // Token expired or invalid, don't retry
          throw new Error('Authentication failed');
        }
        return {};
      }
      
      const data = await res.json();
      console.log('[HOSPITAL_QUERY] Success response:', data);
      return data;
    },
    staleTime: 0, // No stale time
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message === 'Authentication failed') {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: 1000,
    enabled: !!userId, // Only run query when we have a userId
  });

  // Real-time countdown for hospital time
  const [remainingTime, setRemainingTime] = useState(hospitalStatus?.remainingSeconds || 0);

  // Invalidate cache when user changes
  useEffect(() => {
    if (userId) {
      console.log('[Character] User changed, invalidating cache for user:', userId);
      queryClient.invalidateQueries(["character"]);
      queryClient.invalidateQueries(["hospitalStatus"]);
    }
  }, [userId, queryClient]);

  useEffect(() => {
    if (hospitalStatus?.inHospital && hospitalStatus?.remainingSeconds) {
      setRemainingTime(hospitalStatus.remainingSeconds);
      
      const interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [hospitalStatus?.inHospital, hospitalStatus?.remainingSeconds]);

  const [editingQuote, setEditingQuote] = useState(false);
  const [quoteInput, setQuoteInput] = useState(displayCharacter.quote || "");
  const [savingQuote, setSavingQuote] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef();
  const { socket } = useSocket();

  useEffect(() => {
    if (character?.avatarUrl) setAvatarUrl(character.avatarUrl);
  }, [character]);

  // For now, assume Character is always for the current user
  const isOwnCharacter = true;

  // Avatar upload handler
  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const token = localStorage.getItem("jwt");
      const res = await axios.post("/api/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setAvatarUrl(res.data.avatarUrl);
      toast.success("تم تحديث الصورة الشخصية بنجاح!");
      // Refetch character data to update avatar
      queryClient.invalidateQueries(["character", userId]);
    } catch {
      setAvatarError("فشل رفع الصورة. تأكد من أن الصورة أقل من 2MB وبصيغة صحيحة.");
      toast.error("فشل رفع الصورة الشخصية");
    } finally {
      setAvatarUploading(false);
    }
  }

  // Real-time updates for character and hospital status
  useEffect(() => {
    if (!socket) return;
    const refetchAll = () => {
      queryClient.invalidateQueries(["character", userId]);
      // Only invalidate hospital status if there's no error
      if (!hospitalError) {
        queryClient.invalidateQueries(["hospitalStatus", userId]);
      }
    };
    socket.on('hud:update', refetchAll);
    socket.on('hospital:update', refetchAll);
    // Increase polling interval to reduce server load
    const pollInterval = setInterval(refetchAll, 30000); // 30 seconds instead of 10
    return () => {
      socket.off('hud:update', refetchAll);
      socket.off('hospital:update', refetchAll);
      clearInterval(pollInterval);
    };
  }, [socket, queryClient, hospitalError, userId]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
  const isVIP = displayCharacter.vipExpiresAt && new Date(displayCharacter.vipExpiresAt) > new Date();
  const healthPercent = displayCharacter.maxHp
    ? (displayCharacter.hp / displayCharacter.maxHp) * 100
    : 0;
  const energyPercent = displayCharacter.maxEnergy
    ? (displayCharacter.energy / displayCharacter.maxEnergy) * 100
    : 0;
  const expPercent = displayCharacter.nextLevelExp
    ? (displayCharacter.exp / displayCharacter.nextLevelExp) * 100
    : 0;

  // Unified stat extraction from backend fields
  const fightsLost = displayCharacter.fightsLost ?? 0;
  const fightsWon = displayCharacter.fightsWon ?? 0;
  const fightsTotal = displayCharacter.fightsTotal ?? (fightsWon + fightsLost);
  // Add fame and assassinations to the stats array for display
  const fameStat = {
    icon: Trophy,
    label: "الشهرة",
    value: displayCharacter.fame ?? 0,
    color: "text-accent-yellow",
  };
  const assassinationsStat = {
    icon: Skull,
    label: "مرات الاغتيال",
    value: character?.assassinations ?? 0,
    color: "text-accent-red",
  };
  // Insert fame and assassinations as the first stats
  const stats = [fameStat, assassinationsStat,
    {
      icon: Target,
      label: "الجرائم المرتكبة",
      value: displayCharacter.crimesCommitted ?? 0,
      color: "text-accent-red",
    },
    {
      icon: Shield,
      label: "عدد الخسائر",
      value: fightsLost,
      color: "text-accent-gray",
    },
    {
      icon: Activity,
      label: "إجمالي المعارك",
      value: fightsTotal,
      color: "text-accent-purple",
    },
    {
      icon: Calendar,
      label: "الأيام في اللعبة",
      value: displayCharacter.daysInGame ?? 0,
      color: "text-accent-green",
    },
    {
      icon: Activity,
      label: "عدد القتل",
      value: displayCharacter.killCount ?? 0,
      color: "text-accent-orange",
    },
  ];

  if (isLoading) {
    return <LoadingOrErrorPlaceholder loading loadingText="جاري تحميل الملف الشخصي..." />;
  }
  if (error) {
    return <LoadingOrErrorPlaceholder error errorText="فشل في تحميل الملف الشخصي" />;
  }

  // --- MOBILE-FIRST LAYOUT STARTS HERE ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-2 sm:p-4 pt-20 overflow-x-hidden">
      {/* Hospital status message */}
      {hospitalError && (
        <div className="bg-black border-2 border-yellow-600 text-white rounded-lg p-3 sm:p-4 mb-4 text-center shadow-md text-sm sm:text-base">
          <p>⚠️ فشل في تحميل حالة المستشفى</p>
        </div>
      )}
      {hospitalStatus?.inHospital && (
        <div className="bg-black border-2 border-red-600 text-white rounded-lg p-3 sm:p-4 mb-4 text-center shadow-md text-sm sm:text-base">
          <span className="font-bold text-red-400">أنت في المستشفى</span>
          <span className="mx-2">|</span>
          <span>الوقت المتبقي: <span className="font-mono text-orange-400">{formatTime(remainingTime)}</span></span>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12 animate-fade-in">
          <h1 className="text-2xl sm:text-4xl font-bouya mb-2 sm:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">
            الملف الشخصي
          </h1>
          <div className="w-20 sm:w-32 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto"></div>
        </div>

        {/* Main Profile Section - MOBILE FIRST: STACKED */}
        <div className="flex flex-col gap-6 sm:gap-8 mb-8 lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 order-1">
            <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 sm:p-8 text-center animate-slide-up">
              {/* Avatar */}
              <div className="relative mb-4 sm:mb-6 flex flex-col items-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl?.startsWith('http') ? avatarUrl : backendUrl + avatarUrl}
                    alt="avatar"
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-accent-red bg-hitman-800 mx-auto shadow-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-hitman-700 to-hitman-800 flex items-center justify-center text-4xl sm:text-5xl text-accent-red border-4 border-accent-red mx-auto shadow-lg ${avatarUrl ? "hidden" : "flex"}`}
                >
                  {(displayCharacter?.username || "?")[0]}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-accent-red rounded-full p-1 sm:p-2">
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
                    className="bg-accent-red hover:bg-red-700 text-white font-bold py-1.5 px-4 rounded-lg shadow transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
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
                <VipName isVIP={isVIP} className="large">
                  {displayCharacter.name || displayCharacter.username}
                </VipName>
              </h2>
              <p className="text-accent-red font-medium mb-1 text-sm sm:text-base">
                المستوى {displayCharacter.level}
              </p>

              {/* Quote */}
              <div className="mb-4 sm:mb-6">
                {editingQuote ? (
                  <div className="flex flex-col items-center gap-2">
                    <textarea
                      className="bg-hitman-900 border border-accent-red/40 text-white rounded-lg px-3 py-2 w-full text-center focus:outline-none focus:ring-2 focus:ring-accent-red transition placeholder:text-hitman-400 text-xs sm:text-sm"
                      value={quoteInput}
                      onChange={e => setQuoteInput(e.target.value)}
                      maxLength={120}
                      rows={2}
                      placeholder="اكتب اقتباسك الشخصي هنا..."
                      disabled={savingQuote}
                    />
                    <div className="flex gap-2 justify-center">
                      <button
                        className="bg-accent-red text-white px-3 py-1 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 text-xs sm:text-sm"
                        onClick={async () => {
                          setSavingQuote(true);
                          try {
                            await axios.put("/api/profile", { quote: quoteInput });
                            toast.success("تم تحديث الاقتباس الشخصي بنجاح!");
                            setEditingQuote(false);
                            queryClient.invalidateQueries(["character"]);
                          } catch {
                            toast.error("فشل في تحديث الاقتباس");
                          } finally {
                            setSavingQuote(false);
                          }
                        }}
                        disabled={savingQuote || quoteInput.length > 120}
                      >
                        حفظ
                      </button>
                      <button
                        className="bg-gray-700 text-white px-3 py-1 rounded-lg font-bold hover:bg-gray-600 transition text-xs sm:text-sm"
                        onClick={() => {
                          setEditingQuote(false);
                          setQuoteInput(displayCharacter.quote || "");
                        }}
                        disabled={savingQuote}
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-hitman-800/50 rounded-lg p-2 sm:p-4 flex items-center justify-between">
                    <span className="text-hitman-200 italic text-xs sm:text-sm">
                      {displayCharacter.quote ? `"${displayCharacter.quote}"` : "لا يوجد اقتباس شخصي بعد"}
                    </span>
                    {isOwnCharacter && (
                      <button
                        className="ml-2 text-accent-yellow hover:text-white transition"
                        onClick={() => setEditingQuote(true)}
                        title="تعديل الاقتباس الشخصي"
                      >
                        <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Status Bars */}
              <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
                {/* Health */}
                <div>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 text-accent-red mr-2" />
                      <span className="text-xs sm:text-sm text-hitman-300">الصحة</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold">
                      {displayCharacter.hp}/{displayCharacter.maxHp}
                    </span>
                  </div>
                  <div className="w-full bg-hitman-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${healthPercent}%` }}
                    ></div>
                  </div>
                </div>
                {/* Energy */}
                <div>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 text-accent-blue mr-2" />
                      <span className="text-xs sm:text-sm text-hitman-300">الطاقة</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold">
                      {displayCharacter.energy}/{displayCharacter.maxEnergy}
                    </span>
                  </div>
                  <div className="w-full bg-hitman-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${energyPercent}%` }}
                    ></div>
                  </div>
                </div>
                {/* Experience */}
                <div>
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-accent-yellow mr-2" />
                      <span className="text-xs sm:text-sm text-hitman-300">الخبرة</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold">
                      المستوى {displayCharacter.level}
                    </span>
                  </div>
                  <div className="w-full bg-hitman-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${expPercent}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-hitman-400 mt-1">
                    {displayCharacter.exp}/{displayCharacter.nextLevelExp} XP
                  </div>
                </div>
              </div>

              {/* Power & Defense */}
              <div className="flex justify-around items-center mt-2 sm:mt-4 mb-2 gap-4">
                <div className="flex flex-col items-center">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent-yellow mb-1" />
                  <span className="font-bold text-base sm:text-lg text-accent-yellow">{displayCharacter.strength ?? 0}</span>
                  <span className="text-xs text-hitman-400">القوة</span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-accent-blue mb-1" />
                  <span className="font-bold text-base sm:text-lg text-accent-blue">{displayCharacter.defense ?? 0}</span>
                  <span className="text-xs text-hitman-400">الدفاع</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Details */}
          <div className="lg:col-span-2 order-2 flex flex-col gap-6 sm:gap-8">
            {/* Money and Rank */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 sm:p-6 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-2 sm:mb-4">
                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-accent-green" />
                  <span className="text-2xl sm:text-3xl font-bold text-accent-green">
                    ${displayCharacter.money?.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-hitman-300 text-base sm:text-lg">الثروة</h3>
                <p className="text-xs sm:text-sm text-hitman-400">
                  الرتبة: {displayCharacter.rank || "مبتدئ"}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-accent-blue" />
                الإحصائيات
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-hitman-800/50 rounded-lg p-2 sm:p-4 mb-1 sm:mb-2">
                      <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto ${stat.color}`} />
                    </div>
                    <div className={`text-lg sm:text-2xl font-bold ${stat.color}`}>
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-hitman-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 flex items-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-accent-orange" />
                  المعلومات الاجتماعية
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-hitman-300 text-xs sm:text-base">العصابة:</span>
                    <span className="font-medium text-accent-orange text-xs sm:text-base">
                      {displayCharacter.gangId || "لا يوجد"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 flex items-center">
                  <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-accent-yellow" />
                  الممتلكات
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-hitman-300 text-xs sm:text-base">المنزل:</span>
                    <span className="font-medium text-accent-yellow text-xs sm:text-base">
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
          <div className="mt-4 sm:mt-8 bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-accent-green" />
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
                  className="bg-accent-green/20 border border-accent-green/30 rounded-lg px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-base"
                >
                  <span className="text-accent-green font-medium">{buff}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function SparkleText({ children }) {
  return (
    <span className="vip-sparkle-text relative inline-block">
      {children}
      <span className="vip-sparkle-anim" aria-hidden="true"></span>
    </span>
  );
}
