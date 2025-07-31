import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useHud } from "@/hooks/useHud";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "react-toastify";
import { extractErrorMessage, handleConfinementError } from "@/utils/errorHandler";
import { useModalManager } from "@/hooks/useModalManager";
import { getImageUrl, handleImageError } from "@/utils/imageUtils";


import {
  Target,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  AlertTriangle,
  Activity,
  Zap,
  Eye,
  Shield,
  Crown,
  Award,
  ImageIcon,
} from "lucide-react";

function formatCooldown(sec) {
  const m = Math.floor((sec || 0) / 60);
  const s = (sec || 0) % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}



export default function Crimes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { stats } = useHud();
  const { socket } = useSocket();
  const { showModal } = useModalManager();
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [totalCooldown, setTotalCooldown] = useState(0);
  const [jailStatus, setJailStatus] = useState({ inJail: false });
  const [hospitalStatus, setHospitalStatus] = useState({ inHospital: false });
  const justAttemptedCrime = useRef(false);

  // Initialize cooldown from HUD data
  useEffect(() => {
    if (stats?.crimeCooldown && stats.crimeCooldown > 0) {
      setCooldownLeft(stats.crimeCooldown);
      // Estimate total cooldown based on typical crime cooldowns (60-300 seconds)
      // This is a fallback since we don't have the exact crime that was executed
      const estimatedTotal = Math.max(stats.crimeCooldown, 60);
      setTotalCooldown(estimatedTotal);
    }
  }, [stats?.crimeCooldown]);

  // Fetch jail/hospital status
  const fetchStatuses = useCallback(() => {
    if (!token) return;
    axios.get("/api/confinement/jail").then(r => setJailStatus(r.data)).catch(() => setJailStatus({ inJail: false }));
    axios.get("/api/confinement/hospital").then(r => setHospitalStatus(r.data)).catch(() => setHospitalStatus({ inHospital: false }));
  }, [token]);

  useEffect(() => {
    fetchStatuses();
    // Listen for jail/hospital socket events
    if (!socket) return;
    const update = () => fetchStatuses();
    socket.on("jail:enter", update);
    socket.on("jail:leave", update);
    socket.on("hospital:enter", update);
    socket.on("hospital:leave", update);
    return () => {
      socket.off("jail:enter", update);
      socket.off("jail:leave", update);
      socket.off("hospital:enter", update);
      socket.off("hospital:leave", update);
    };
  }, [socket, fetchStatuses]);

  // Polling for crimes list every 30s
  useEffect(() => {
    const poll = setInterval(() => {
      queryClient.invalidateQueries(["crimes"]);
    }, 30000);
    return () => clearInterval(poll);
  }, [queryClient]);


  // Block actions if in jail/hospital
  const isBlocked = jailStatus.inJail || hospitalStatus.inHospital;
  const blockReason = jailStatus.inJail
    ? `أنت في السجن. الوقت المتبقي: ${formatCooldown(Math.max(0, Math.floor((jailStatus.remainingSeconds || 0))))}`
    : hospitalStatus.inHospital
      ? `أنت في المستشفى. الوقت المتبقي: ${formatCooldown(Math.max(0, Math.floor((hospitalStatus.remainingSeconds || 0))))}`
      : null;

  /* ───────────────────────── عدّاد التبريد ──────────��──────────── */
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    
    const timer = setInterval(() => {
      setCooldownLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [cooldownLeft]);

  // Listen for HUD updates to sync cooldown
  useEffect(() => {
    if (!socket) return;
    
    const handleHudUpdate = () => {
      // The HUD data will be updated via the useHud hook
      // We just need to re-initialize the cooldown when stats change
      if (stats?.crimeCooldown && stats.crimeCooldown > 0) {
        setCooldownLeft(stats.crimeCooldown);
      }
    };
    
    socket.on('hud:update', handleHudUpdate);
    
    // Also poll for updates every 10 seconds as a fallback
    const pollInterval = setInterval(() => {
      if (stats?.crimeCooldown && stats.crimeCooldown > 0) {
        setCooldownLeft(stats.crimeCooldown);
      }
    }, 10000);
    
    return () => {
      socket.off('hud:update', handleHudUpdate);
      clearInterval(pollInterval);
    };
  }, [socket, stats?.crimeCooldown]);

  /* ───────────── جلب قائمة الجرائم ───────────── */
  const {
    data: crimes = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["crimes"],
    queryFn: () => axios.get("/api/crimes").then((r) => r.data),
    staleTime: 10 * 60 * 1_000,
    retry: false,
  });

  /* ───────────────────────── تنفيذ جريمة ─────────────────────���─── */
  const mutation = useMutation({
    mutationFn: (id) =>
      axios.post(`/api/crimes/execute/${id}`).then((r) => r.data),
    onSuccess: (data) => {
      fetchStatuses();
      justAttemptedCrime.current = true;
      
      // Check for level-up rewards first
      if (data.levelUpRewards && data.levelUpRewards.length > 0) {
        // Show level-up modal with high priority
        showModal('levelUp', 100);
        // The HUD will handle showing the level-up modal
      }
      
      // Navigate to crime results page with the result data
      navigate('/dashboard/crime-result', { 
        state: { crimeResult: data },
        replace: true 
      });
      
      if (data.cooldownLeft) {
        setCooldownLeft(data.cooldownLeft);
        setTotalCooldown(data.cooldownLeft);
      }
      queryClient.invalidateQueries(["crimes"]);
    },
    onError: (err) => {
      fetchStatuses();
      const confinementResult = handleConfinementError(err, toast);
      if (!confinementResult.isConfinementError) {
        const message = extractErrorMessage(err);
        if (err.response?.cooldownLeft) setCooldownLeft(err.response.cooldownLeft);
        toast.error(message || "فشل تنفيذ الجريمة");
      }
    },
  });



  const displayCrimes = crimes.length > 0
    ? crimes.map(c => ({ ...c, levelRequirement: c.req_level }))
    : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner"></div>
            <Target className="w-8 h-8 text-accent-red absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-lg font-medium animate-pulse">
            جاري تحميل عمليات الاغتيال...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black flex items-center justify-center p-4">
        <div className="text-center bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-accent-red/30 rounded-xl p-8">
          <AlertTriangle className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">خطأ في التحميل</h2>
          <p className="text-hitman-300">فشل في تحميل قائمة الجرائم</p>
          <p className="text-accent-red text-sm mt-2">{error?.message}</p>
        </div>
      </div>
    );
  }





  return (
    <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20 overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-particles"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bouya mb-4 text-transparent bg-clip-text bg-gradient-to-r from-accent-red via-red-400 to-accent-red animate-glow">
            عمليات الاغتيال
          </h1>
          <p className="text-hitman-300 text-lg mb-6">
            اختر مهمتك بحكمة - كل عملية لها مخاطرها ومكافآتها
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto"></div>
        </div>

        {/* Block Warning - Jail/Hospital */}
        {isBlocked && (
          <div className="mb-8 animate-slide-up">
            <div className="bg-gradient-to-r from-accent-red/20 to-red-900/20 border border-accent-red/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-accent-red mr-3 animate-pulse" />
                  <h3 className="text-xl font-bold text-accent-red">
                    {jailStatus.inJail ? "أنت في السجن" : "أنت في المستشفى"}
                  </h3>
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-4xl font-mono text-accent-red mb-2 font-bold">
                    {jailStatus.inJail 
                      ? formatCooldown(Math.max(0, Math.floor((jailStatus.remainingSeconds || 0))))
                      : formatCooldown(Math.max(0, Math.floor((hospitalStatus.remainingSeconds || 0))))
                    }
                  </div>
                  <p className="text-hitman-300 text-sm">
                    {jailStatus.inJail 
                      ? "الوقت المتبقي للخروج من السجن"
                      : "الوقت المتبقي للخروج من المستشفى"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cooldown Warning */}
        {cooldownLeft > 0 && !isBlocked && (
          <div className="mb-8 animate-slide-up">
            <div className="bg-gradient-to-r from-accent-red/20 to-accent-orange/20 border border-accent-red/30 rounded-xl p-6 backdrop-blur-sm">
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-accent-red mr-3 animate-pulse" />
                  <h3 className="text-xl font-bold text-accent-red">فترة هدوء مطلوبة</h3>
                </div>
                
                {/* Timer Display */}
                <div className="text-center mb-4">
                  <div className="text-4xl font-mono text-accent-red mb-2 font-bold">
                    {formatCooldown(cooldownLeft)}
                  </div>
                  <p className="text-hitman-300 text-sm">الوقت المتبقي قبل المهمة التالية</p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-hitman-300">تقدم فترة الهدوء</span>
                    <span className="text-accent-red font-bold">
                      {totalCooldown > 0 ? Math.round(((totalCooldown - cooldownLeft) / totalCooldown) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-hitman-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-accent-red to-red-600 h-3 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${totalCooldown > 0 ? Math.max(0, Math.min(100, ((totalCooldown - cooldownLeft) / totalCooldown) * 100)) : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
            <Target className="w-8 h-8 text-accent-red mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent-red">
              {displayCrimes.length}
            </div>
            <div className="text-sm text-hitman-300">مهام متاحة</div>
          </div>
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
            <TrendingUp className="w-8 h-8 text-accent-green mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent-green">
              {displayCrimes.length > 0
                ? Math.round(
                    displayCrimes.reduce(
                      (total, crime) => total + (crime.chance || 0),
                      0,
                    ) / displayCrimes.length,
                  )
                : 0}
              %
            </div>
            <div className="text-sm text-hitman-300">متوسط النجاح</div>
          </div>
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
            <Star className="w-8 h-8 text-accent-yellow mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent-yellow">
              {displayCrimes.reduce(
                (total, crime) => total + (crime.expGain || 0),
                0,
              )}
            </div>
            <div className="text-sm text-hitman-300">إجمالي الخبرة</div>
          </div>
          <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-4 text-center">
            <Clock className="w-8 h-8 text-accent-blue mx-auto mb-2" />
            <div
              className={`text-2xl font-bold ${cooldownLeft > 0 ? "text-accent-red" : "text-accent-green"}`}
            >
              {cooldownLeft > 0 ? formatCooldown(cooldownLeft) : "جاهز"}
            </div>
            <div className="text-sm text-hitman-300">حالة العميل</div>
          </div>
        </div>

        {/* Crimes Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayCrimes.map((crime, index) => {
            const isCooling = cooldownLeft > 0;
            const isBusy =
              mutation.isLoading && mutation.variables === crime.id;
            const riskColor = crime.chance >= 80 ? "text-accent-green" : 
                             crime.chance >= 60 ? "text-accent-yellow" : 
                             crime.chance >= 40 ? "text-accent-orange" : "text-accent-red";
            const riskLevel = crime.chance >= 80 ? "منخفض" : 
                             crime.chance >= 60 ? "متوسط" : 
                             crime.chance >= 40 ? "عالي" : "شديد الخطورة";

            return (
              <div
                key={crime.id}
                className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl overflow-hidden group hover:border-accent-red/50 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Crime Image Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-hitman-700 to-hitman-800 overflow-hidden">
                  {crime.imageUrl ? (
                    <img
                      src={getImageUrl(crime.imageUrl)}
                      alt={crime.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        console.error('Failed to load crime image:', {
                          originalUrl: crime.imageUrl,
                          processedUrl: getImageUrl(crime.imageUrl),
                          crimeId: crime.id,
                          crimeName: crime.name
                        });
                        handleImageError(e, crime.imageUrl);
                      }}
                      onLoad={() => {
                        // Successfully loaded crime image
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-red/20 to-transparent"></div>
                      <ImageIcon className="w-16 h-16 text-hitman-500 group-hover:text-accent-red transition-colors" />
                      <div className="absolute bottom-2 right-2 bg-hitman-800/80 rounded-lg p-2">
                        <Target className="w-4 h-4 text-accent-red" />
                      </div>
                    </div>
                  )}
                  {/* Risk Badge */}
                  <div className="absolute top-3 left-3">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-sm ${riskColor}`}
                    >
                      {riskLevel}
                    </div>
                  </div>
                  {/* Level Requirement */}
                  {crime.levelRequirement > 1 && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-black/60 backdrop-blur-sm rounded-full p-2">
                        <Crown className="w-4 h-4 text-accent-yellow" />
                        <span className="absolute -bottom-1 -right-1 bg-accent-yellow text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {crime.levelRequirement}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Crime Details */}
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2 text-white group-hover:text-accent-red transition-colors">
                    {crime.name}
                  </h3>
                  {/* Minimum Level Requirement */}
                  <div className="flex items-center mb-2">
                    <Crown className="w-4 h-4 text-accent-yellow mr-1" />
                    <span className="text-xs text-accent-yellow font-bold">المستوى الأدنى: {crime.levelRequirement || 1}</span>
                  </div>
                  <p className="text-hitman-300 mb-4 text-sm leading-relaxed">
                    {crime.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-hitman-800/30 rounded-lg p-3 text-center">
                      <Eye className={`w-5 h-5 mx-auto mb-1 ${riskColor}`} />
                      <div className={`font-bold ${riskColor}`}>
                        {crime.chance || 0}%
                      </div>
                      <div className="text-xs text-hitman-400">نسبة النجاح</div>
                    </div>
                    <div className="bg-hitman-800/30 rounded-lg p-3 text-center">
                      <DollarSign className="w-5 h-5 text-accent-green mx-auto mb-1" />
                      <div className="font-bold text-accent-green">
                        {crime.minReward === crime.maxReward
                          ? (crime.minReward || 0).toLocaleString()
                          : `${crime.minReward || 0}-${crime.maxReward || 0}`}
                      </div>
                      <div className="text-xs text-hitman-400">المكافأة</div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center justify-between mb-6 bg-hitman-800/30 rounded-lg p-3">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-accent-yellow mr-2" />
                      <span className="text-hitman-300">الخبرة المكتسبة</span>
                    </div>
                    <span className="font-bold text-accent-yellow">
                      {crime.expGain || 0} XP
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      if (isBlocked) {
                        toast.error(blockReason || "لا يمكنك تنفيذ جريمة أثناء وجودك في السجن أو المستشفى.");
                        return;
                      }
                      mutation.mutate(crime.id);
                    }}
                    disabled={isBlocked || mutation.isLoading}
                    className={`w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 flex items-center justify-center ${
                      isCooling || isBusy
                        ? "bg-hitman-700 text-hitman-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white transform hover:scale-105 hover:shadow-lg"
                    }`}
                  >
                    {isBusy ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        جاري التنفيذ...
                      </>
                    ) : isCooling ? (
                      <>
                        <Clock className="w-5 h-5 mr-2" />
                        انتظر {formatCooldown(cooldownLeft)}
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform" />
                        تنفيذ المهمة
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Professional Tips */}
        <div className="mt-12 bg-gradient-to-r from-accent-red/10 to-accent-orange/10 border border-accent-red/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-accent-red mr-3" />
            <h3 className="text-xl font-bold text-white">نصائح احترافية</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start">
              <Award className="w-5 h-5 text-accent-yellow mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">اختر بحكمة</p>
                <p className="text-hitman-300">
                  المهام عالية المخاطر تعطي مكافآت أكبر
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-accent-blue mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">إدارة الوقت</p>
                <p className="text-hitman-300">استخدم فترات التبريد للتخطيط</p>
              </div>
            </div>
            <div className="flex items-start">
              <TrendingUp className="w-5 h-5 text-accent-green mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">تطوير المهارات</p>
                <p className="text-hitman-300">المستوى الأعلى يفتح مهام أفضل</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
