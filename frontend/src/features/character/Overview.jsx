/* -------- src/features/character/Overview.jsx ---------- */
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  Award,
  Activity,
  Zap,
  Heart,
} from "lucide-react";
import { toast } from "react-hot-toast";
import '../profile/vipSparkle.css';
import VipName from '../profile/VipName.jsx';

export default function Overview() {
  const {
    data: character,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["character"],
    queryFn: () => axios.get("/api/character").then((res) => res.data),
    staleTime: 1 * 60 * 1000,
    retry: false,
  });

  // Mock data for design purposes when backend is not available
  const mockCharacter = {
    username: "Agent_47",
    email: "agent@hitman.com",
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

  // Map 'name' to 'username' if needed
  const normalizedCharacter = character && !character.username && character.name
    ? { ...character, username: character.name }
    : character;
  const displayCharacter = normalizedCharacter || mockCharacter;

  // Hospital status with real-time countdown
  const { data: hospitalStatus } = useQuery({
    queryKey: ['hospitalStatus'],
    queryFn: async () => {
      const res = await fetch('/api/confinement/hospital', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
      });
      if (!res.ok) return {};
      return res.json();
    },
    staleTime: 10000,
  });

  // Real-time countdown for hospital time
  const [remainingTime, setRemainingTime] = useState(hospitalStatus?.remainingSeconds || 0);

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
  const queryClient = useQueryClient();

  useEffect(() => {
    if (character?.avatarUrl) setAvatarUrl(character.avatarUrl);
  }, [character]);

  // Determine if this is the user's own character (no username param, or from context)
  // For now, assume Overview is always for the current user
  const isOwnCharacter = true;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner"></div>
            <Target className="w-8 h-8 text-accent-red absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-lg font-medium animate-pulse">
            جاري تحميل الملف الشخصي...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-accent-red/30 rounded-xl p-8">
          <Target className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">خطأ في التحميل</h2>
          <p className="text-hitman-300">فشل في تحميل الملف الشخصي</p>
        </div>
      </div>
    );
  }

  const healthPercent = displayCharacter.maxHp
    ? (displayCharacter.hp / displayCharacter.maxHp) * 100
    : 0;
  const energyPercent = displayCharacter.maxEnergy
    ? (displayCharacter.energy / displayCharacter.maxEnergy) * 100
    : 0;
  const expPercent = displayCharacter.nextLevelExp
    ? (displayCharacter.exp / displayCharacter.nextLevelExp) * 100
    : 0;

  const achievements = [
    { icon: Target, name: "قناص محترف", description: "100 هدف تم إنجازه" },
    { icon: Shield, name: "لا يُقهر", description: "50 معركة بدون هزيمة" },
    { icon: Crown, name: "ملك الجريمة", description: "وصل للمستوى 15" },
    { icon: DollarSign, name: "مليونير", description: "جمع مليون دولار" },
  ];

  // Unified stat extraction from backend fields
  const fightsLost = displayCharacter.fightsLost ?? 0;
  const fightsWon = displayCharacter.fightsWon ?? 0;
  const fightsTotal = displayCharacter.fightsTotal ?? (fightsWon + fightsLost);

  const stats = [
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
      queryClient.invalidateQueries(["character"]);
      queryClient.invalidateQueries({ queryKey: ["character"] });
      queryClient.invalidateQueries({ queryKey: ["character"], exact: false });
    } catch (err) {
      setAvatarError("فشل رفع الصورة. تأكد من أن الصورة أقل من 2MB وبصيغة صحيحة.");
      toast.error("فشل رفع الصورة الشخصية");
    } finally {
      setAvatarUploading(false);
    }
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const isVIP = displayCharacter.vipExpiresAt && new Date(displayCharacter.vipExpiresAt) > new Date();
  const vipExpiry = displayCharacter.vipExpiresAt;

  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20 overflow-x-hidden">
      {/* Hospital status message */}
      {hospitalStatus?.inHospital && (
        <div className="bg-black border-2 border-red-600 text-white rounded-lg p-4 mb-4 text-center shadow-md">
          <span className="font-bold text-red-400">أنت في المستشفى</span>
          <span className="mx-2">|</span>
          <span>الوقت المتبقي: <span className="font-mono text-orange-400">{formatTime(remainingTime)}</span></span>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bouya mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">
            الملف الشخصي
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto"></div>
        </div>

        {/* Main Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-8 text-center animate-slide-up">
              {/* Avatar */}
              <div className="relative mb-6">
                {avatarUrl ? (
                  <img
                    src={avatarUrl?.startsWith('http') ? avatarUrl : backendUrl + avatarUrl}
                    alt="avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-accent-red bg-hitman-800 mx-auto shadow-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-32 h-32 rounded-full bg-gradient-to-br from-hitman-700 to-hitman-800 flex items-center justify-center text-5xl text-accent-red border-4 border-accent-red mx-auto shadow-lg ${avatarUrl ? "hidden" : "flex"}`}
                >
                  {(displayCharacter?.username || "?")[0]}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-accent-red rounded-full p-2">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              </div>
              {/* Avatar Upload UI */}
              {isOwnCharacter && (
                <div className="mb-4 flex flex-col items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    disabled={avatarUploading}
                  />
                  <button
                    className="bg-accent-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-all duration-200 disabled:opacity-50"
                    onClick={() => fileInputRef.current.click()}
                    disabled={avatarUploading}
                  >
                    {avatarUploading ? "جاري الرفع..." : "تغيير الصورة الشخصية"}
                  </button>
                  {avatarError && <div className="text-red-400 text-xs mt-1">{avatarError}</div>}
                </div>
              )}

              {/* Basic Info */}
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <VipName isVIP={isVIP}>{displayCharacter.name || displayCharacter.username}</VipName>
              </h2>
              <p className="text-accent-red font-medium mb-1">
                المستوى {displayCharacter.level}
              </p>
              {/* Email hidden for privacy */}

              {/* Quote */}
              <div className="mb-6">
                {editingQuote ? (
                  <div className="flex flex-col items-center gap-2">
                    <textarea
                      className="bg-hitman-900 border border-accent-red/40 text-white rounded-lg px-3 py-2 w-full text-center focus:outline-none focus:ring-2 focus:ring-accent-red transition placeholder:text-hitman-400"
                      value={quoteInput}
                      onChange={e => setQuoteInput(e.target.value)}
                      maxLength={120}
                      rows={2}
                      placeholder="اكتب اقتباسك الشخصي هنا..."
                      disabled={savingQuote}
                    />
                    <div className="flex gap-2 justify-center">
                      <button
                        className="bg-accent-red text-white px-4 py-1 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
                        onClick={async () => {
                          setSavingQuote(true);
                          try {
                            await axios.put("/api/profile", { quote: quoteInput });
                            toast.success("تم تحديث الاقتباس الشخصي بنجاح!");
                            setEditingQuote(false);
                            // Optionally refetch character data
                            window.location.reload();
                          } catch (err) {
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
                        className="bg-gray-700 text-white px-4 py-1 rounded-lg font-bold hover:bg-gray-600 transition"
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
                  <div className="bg-hitman-800/50 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-hitman-200 italic text-sm">
                      {displayCharacter.quote ? `"${displayCharacter.quote}"` : "لا يوجد اقتباس شخصي بعد"}
                    </span>
                    {isOwnCharacter && (
                      <button
                        className="ml-2 text-accent-yellow hover:text-white transition"
                        onClick={() => setEditingQuote(true)}
                        title="تعديل الاقتباس الشخصي"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Status Bars */}
              <div className="space-y-4 mb-4">
                {/* Health */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 text-accent-red mr-2" />
                      <span className="text-sm text-hitman-300">الصحة</span>
                    </div>
                    <span className="text-sm font-bold">
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
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 text-accent-blue mr-2" />
                      <span className="text-sm text-hitman-300">الطاقة</span>
                    </div>
                    <span className="text-sm font-bold">
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
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-accent-yellow mr-2" />
                      <span className="text-sm text-hitman-300">الخبرة</span>
                    </div>
                    <span className="text-sm font-bold">
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
              <div className="flex justify-around items-center mt-4 mb-2 gap-4">
                <div className="flex flex-col items-center">
                  <Zap className="w-6 h-6 text-accent-yellow mb-1" />
                  <span className="font-bold text-lg text-accent-yellow">{displayCharacter.strength ?? 0}</span>
                  <span className="text-xs text-hitman-400">القوة</span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className="w-6 h-6 text-accent-blue mb-1" />
                  <span className="font-bold text-lg text-accent-blue">{displayCharacter.defense ?? 0}</span>
                  <span className="text-xs text-hitman-400">الدفاع</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Money and Rank */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-8 h-8 text-accent-green" />
                  <span className="text-3xl font-bold text-accent-green">
                    ${displayCharacter.money?.toLocaleString()}
                  </span>
                </div>
                <h3 className="text-hitman-300 text-lg">الثروة</h3>
                <p className="text-sm text-hitman-400">
                  الرتبة: {displayCharacter.rank || "مبتدئ"}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Activity className="w-6 h-6 mr-3 text-accent-blue" />
                الإحصائيات
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-hitman-800/50 rounded-lg p-4 mb-2">
                      <stat.icon className={`w-8 h-8 mx-auto ${stat.color}`} />
                    </div>
                    <div className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-sm text-hitman-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-accent-orange" />
                  المعلومات الاجتماعية
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-hitman-300">العصابة:</span>
                    <span className="font-medium text-accent-orange">
                      {displayCharacter.gangId || "لا يوجد"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <HomeIcon className="w-5 h-5 mr-2 text-accent-yellow" />
                  الممتلكات
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-hitman-300">المنزل:</span>
                    <span className="font-medium text-accent-yellow">
                      {displayCharacter.equippedHouseId || "لا يوجد"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <Award className="w-6 h-6 mr-3 text-accent-yellow" />
            الإنجازات المحققة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-hitman-800/50 rounded-lg p-4 text-center group hover:bg-hitman-700/50 transition-colors"
              >
                <achievement.icon className="w-8 h-8 text-accent-yellow mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium text-white mb-1">
                  {achievement.name}
                </h4>
                <p className="text-xs text-hitman-400">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Active Buffs */}
        {displayCharacter?.buffs && (
          <div className="mt-8 bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-accent-green" />
              التأثيرات النشطة
            </h3>
            <div className="flex flex-wrap gap-3">
              {(Array.isArray(displayCharacter.buffs)
                ? displayCharacter.buffs
                : typeof displayCharacter.buffs === "object"
                  ? Object.keys(displayCharacter.buffs)
                  : []
              ).map((buff, index) => (
                <div
                  key={index}
                  className="bg-accent-green/20 border border-accent-green/30 rounded-lg px-4 py-2"
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
