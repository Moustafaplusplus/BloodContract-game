import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
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
  Timer,
  Lock,
  CheckCircle,
  Skull,
  Crosshair,
  Flame,
  Knife,
  Gun,
  Bomb,
  Siren,
  MapPin,
  Users
} from "lucide-react";

function formatCooldown(sec) {
  const m = Math.floor((sec || 0) / 60);
  const s = (sec || 0) % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Enhanced Crime Card Component with visual elements
const CrimeCard = ({ crime, onExecute, isDisabled, reason, userLevel, currentEnergy }) => {
  const canAfford = currentEnergy >= crime.energy;
  const levelMet = userLevel >= crime.levelRequirement;
  const isUnlocked = levelMet && canAfford && !isDisabled;
  
  // Crime type icons and colors
  const getCrimeVisuals = (crimeType) => {
    const types = {
      assassination: { icon: Crosshair, color: 'blood', bg: 'from-blood-950/40 to-red-950/20' },
      theft: { icon: Eye, color: 'blue', bg: 'from-blue-950/40 to-cyan-950/20' },
      sabotage: { icon: Bomb, color: 'orange', bg: 'from-orange-950/40 to-yellow-950/20' },
      street: { icon: Knife, color: 'red', bg: 'from-red-950/40 to-blood-950/20' },
      heist: { icon: Gun, color: 'purple', bg: 'from-purple-950/40 to-indigo-950/20' },
      default: { icon: Target, color: 'blood', bg: 'from-blood-950/40 to-black/20' }
    };
    return types[crimeType] || types.default;
  };
  
  const visuals = getCrimeVisuals(crime.type);
  const IconComponent = visuals.icon;
  
  return (
    <div className={`card-3d p-3 transition-all duration-300 relative overflow-hidden ${
      isUnlocked ? 'hover:scale-[1.02] cursor-pointer hover:border-blood-500/50 hover:shadow-md hover:shadow-blood-500/20' : 'opacity-60'
    }`}
    onClick={() => isUnlocked && onExecute(crime.id)}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${visuals.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Crime Banner Image Placeholder */}
      <div className="relative mb-3 h-16 bg-gradient-to-r from-black/60 via-blood-950/40 to-black/60 rounded border border-blood-500/20 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-blood-400/30">
            <ImageIcon className="w-8 h-8" />
          </div>
        </div>
        {/* Crime type overlay */}
        <div className="absolute top-1 right-1 flex items-center gap-1">
          <div className={`p-1 rounded bg-${visuals.color}-500/30 border border-${visuals.color}-500/40`}>
            <IconComponent className={`w-3 h-3 text-${visuals.color}-400`} />
          </div>
        </div>
        {/* Difficulty indicator */}
        <div className="absolute bottom-1 left-1">
          <div className="flex items-center gap-0.5">
            {[...Array(Math.min(crime.levelRequirement || 1, 5))].map((_, i) => (
              <Skull key={i} className="w-2 h-2 text-blood-400" />
            ))}
          </div>
        </div>
      </div>

      {/* Crime Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm truncate">{crime.name}</h3>
            <p className="text-xs text-white/60 line-clamp-1">{crime.description}</p>
          </div>
          
          {!levelMet && (
            <div className="card-3d bg-yellow-500/20 border-yellow-500/40 p-1 px-2 ml-2">
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-yellow-400">{crime.levelRequirement}</span>
              </div>
            </div>
          )}
        </div>

        {/* Crime Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="text-center">
            <div className="text-xs text-white/60">طاقة</div>
            <div className={`text-sm font-bold ${canAfford ? 'text-blue-400' : 'text-red-400'}`}>
              {crime.energy}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/60">مكافأة</div>
            <div className="text-sm font-bold text-green-400">
              ${(crime.money || 0).toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/60">شهرة</div>
            <div className="text-sm font-bold text-yellow-400">
              +{crime.fame || 0}
            </div>
          </div>
        </div>

        {/* Success Rate Bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-white/60">نجاح</span>
            <span className="text-xs font-bold text-white">{crime.successRate}%</span>
          </div>
          <div className="progress-3d h-1">
            <div 
              className={`progress-3d-fill bg-gradient-to-r from-${visuals.color}-600 to-${visuals.color}-400`}
              style={{ width: `${crime.successRate}%` }}
            ></div>
          </div>
        </div>

        {/* Action Status */}
        {isDisabled && reason && (
          <div className="text-xs text-red-400 text-center py-1 bg-red-950/20 rounded border border-red-500/30">
            {reason}
          </div>
        )}
        
        {!isDisabled && !isUnlocked && (
          <div className="text-xs text-yellow-400 text-center py-1 bg-yellow-950/20 rounded border border-yellow-500/30">
            {!levelMet ? `مستوى ${crime.levelRequirement}` : 'طاقة غير كافية'}
          </div>
        )}

        {isUnlocked && (
          <div className="text-xs text-green-400 text-center py-1 bg-green-950/20 rounded border border-green-500/30 animate-pulse">
            اضغط لتنفيذ
          </div>
        )}
      </div>
    </div>
  );
};

export default function Crimes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { customToken } = useFirebaseAuth();
  const { 
    socket, 
    crimeData, 
    hudData,
    requestCrimeUpdate 
  } = useSocket();
  const { showModal } = useModalManager();
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [totalCooldown, setTotalCooldown] = useState(0);
  const [jailStatus, setJailStatus] = useState({ inJail: false });
  const [hospitalStatus, setHospitalStatus] = useState({ inHospital: false });
  const justAttemptedCrime = useRef(false);

  // Initialize cooldown from real-time crime data
  useEffect(() => {
    if (crimeData?.crimeCooldown !== undefined) {
      setCooldownLeft(crimeData.crimeCooldown);
      const estimatedTotal = Math.max(crimeData.crimeCooldown, 60);
      setTotalCooldown(estimatedTotal);
    }
  }, [crimeData?.crimeCooldown]);

  // Request initial crime data when component mounts
  useEffect(() => {
    if (socket && socket.connected) {
      requestCrimeUpdate();
    }
  }, [socket, requestCrimeUpdate]);

  // Fetch jail/hospital status
  const fetchStatuses = useCallback(() => {
    if (!customToken) return;
    axios.get("/api/confinement/jail").then(r => setJailStatus(r.data)).catch(() => setJailStatus({ inJail: false }));
    axios.get("/api/confinement/hospital").then(r => setHospitalStatus(r.data)).catch(() => setHospitalStatus({ inHospital: false }));
  }, [customToken]);

  useEffect(() => {
    fetchStatuses();
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

  // Block actions if in jail/hospital
  const isBlocked = jailStatus.inJail || hospitalStatus.inHospital;
  const blockReason = jailStatus.inJail
    ? `أنت في السجن. الوقت المتبقي: ${formatCooldown(Math.max(0, Math.floor((jailStatus.remainingSeconds || 0))))}`
    : hospitalStatus.inHospital
      ? `أنت في المستشفى. الوقت المتبقي: ${formatCooldown(Math.max(0, Math.floor((hospitalStatus.remainingSeconds || 0))))}`
      : "";

  // Use real-time energy data
  const currentEnergy = crimeData?.energy ?? hudData?.energy ?? 0;
  const maxEnergy = crimeData?.maxEnergy ?? hudData?.maxEnergy ?? 100;
  const userLevel = crimeData?.level ?? hudData?.level ?? 1;

  // Update cooldown timer in real-time
  useEffect(() => {
    if (cooldownLeft <= 0) return;
    
    const timer = setInterval(() => {
      setCooldownLeft(prev => {
        if (prev <= 1) {
          if (socket && socket.connected) {
            requestCrimeUpdate();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [cooldownLeft, socket, requestCrimeUpdate]);

  // Listen for HUD updates to sync cooldown
  useEffect(() => {
    if (!socket) return;
    
    const handleHudUpdate = () => {
      if (crimeData?.crimeCooldown !== undefined) {
        setCooldownLeft(crimeData.crimeCooldown);
      }
    };
    
    socket.on('hud:update', handleHudUpdate);
    
    return () => {
      socket.off('hud:update', handleHudUpdate);
    };
  }, [socket, crimeData?.crimeCooldown]);

  // Fetch crimes list
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

  // Execute crime mutation
  const mutation = useMutation({
    mutationFn: (id) =>
      axios.post(`/api/crimes/execute/${id}`).then((r) => r.data),
    onSuccess: (data) => {
      fetchStatuses();
      justAttemptedCrime.current = true;
      
      if (data.levelUpRewards && data.levelUpRewards.length > 0) {
        showModal('levelUp', 100);
      }
      
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
      <div className="min-h-screen blood-gradient flex items-center justify-center">
        <div className="text-center card-3d p-6">
          <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
          <p className="text-white text-sm animate-pulse">
            جاري تحميل عمليات الاغتيال...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen blood-gradient flex items-center justify-center">
        <div className="text-center card-3d p-6">
          <AlertTriangle className="w-12 h-12 text-blood-400 mx-auto mb-3" />
          <p className="text-blood-400 text-sm mb-3">فشل في تحميل الجرائم</p>
          <button 
            onClick={() => queryClient.invalidateQueries(["crimes"])}
            className="btn-3d text-xs px-4 py-2"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom">
      <div className="container mx-auto max-w-6xl p-3 space-y-4">
        
        {/* Enhanced Header with Banner */}
        <div className="relative">
          {/* Header Banner Image Placeholder */}
          <div className="relative h-20 bg-gradient-to-r from-blood-950/60 via-black/40 to-blood-950/60 rounded-lg border border-blood-500/30 overflow-hidden mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-blood-500/20 to-red-500/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Crosshair className="w-6 h-6 text-blood-400" />
                  <h1 className="text-lg font-bold text-blood-400 animate-glow-blood">
                    عمليات الاغتيال
                  </h1>
                  <Crosshair className="w-6 h-6 text-blood-400" />
                </div>
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-blood-500 to-transparent mx-auto"></div>
              </div>
            </div>
            {/* Danger indicators */}
            <div className="absolute top-2 left-2">
              <Siren className="w-4 h-4 text-red-400 animate-pulse" />
            </div>
            <div className="absolute top-2 right-2">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Enhanced Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Energy Status */}
          <div className="card-3d p-3 bg-gradient-to-br from-blue-950/30 to-cyan-950/20 border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-blue-500/20 border border-blue-500/40">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>
                <span className="font-bold text-blue-400 text-sm">الطاقة</span>
              </div>
              <span className="text-white font-bold text-sm">{currentEnergy}/{maxEnergy}</span>
            </div>
            <div className="progress-3d h-2">
              <div 
                className="progress-3d-fill bg-gradient-to-r from-blue-600 to-blue-400"
                style={{ width: `${(currentEnergy / maxEnergy) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Cooldown Status */}
          <div className="card-3d p-3 bg-gradient-to-br from-yellow-950/30 to-orange-950/20 border-yellow-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-yellow-500/20 border border-yellow-500/40">
                  <Timer className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="font-bold text-yellow-400 text-sm">التبريد</span>
              </div>
              <span className={`text-white font-bold font-mono text-sm ${
                cooldownLeft > 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {cooldownLeft > 0 ? formatCooldown(cooldownLeft) : 'جاهز'}
              </span>
            </div>
            {cooldownLeft > 0 && (
              <div className="progress-3d h-2">
                <div 
                  className="progress-3d-fill bg-gradient-to-r from-red-600 to-orange-400"
                  style={{ width: `${((totalCooldown - cooldownLeft) / totalCooldown) * 100}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Level Status */}
          <div className="card-3d p-3 bg-gradient-to-br from-yellow-950/30 to-amber-950/20 border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-yellow-500/20 border border-yellow-500/40">
                  <Crown className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="font-bold text-yellow-400 text-sm">المستوى</span>
              </div>
              <span className="text-white font-bold text-sm">{userLevel}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Blocked Status Alert */}
        {isBlocked && (
          <div className="card-3d bg-gradient-to-r from-red-950/40 to-blood-950/30 border-red-500/50 p-4">
            <div className="flex items-center justify-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <span className="font-bold text-sm">{blockReason}</span>
            </div>
          </div>
        )}

        {/* Enhanced Crimes Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-blood-400 flex items-center gap-2">
            <Target className="w-4 h-4" />
            عمليات متاحة
            <span className="text-white/60 text-xs">({displayCrimes.length})</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {displayCrimes.map((crime) => (
              <CrimeCard
                key={crime.id}
                crime={crime}
                onExecute={(id) => {
                  if (cooldownLeft > 0) {
                    toast.warning(`انتظر ${formatCooldown(cooldownLeft)} قبل ارتكاب جريمة أخرى`);
                    return;
                  }
                  if (currentEnergy < crime.energy) {
                    toast.warning("طاقة غير كافية لارتكاب هذه الجريمة");
                    return;
                  }
                  mutation.mutate(id);
                }}
                isDisabled={isBlocked || cooldownLeft > 0 || mutation.isPending}
                reason={blockReason || (cooldownLeft > 0 ? `انتظر ${formatCooldown(cooldownLeft)}` : "")}
                userLevel={userLevel}
                currentEnergy={currentEnergy}
              />
            ))}
          </div>
          
          {/* Empty State */}
          {displayCrimes.length === 0 && (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60 text-sm">لا توجد جرائم متاحة حالياً</p>
            </div>
          )}
        </div>

        {/* Game Tips */}
        <div className="card-3d p-4 bg-gradient-to-r from-blood-950/20 to-black/40 border-blood-500/20">
          <h3 className="text-sm font-bold text-blood-400 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            نصائح الاغتيال
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Skull className="w-3 h-3 text-blood-400" />
              <span>الجرائم عالية المستوى تعطي مكافآت أكبر</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-blue-400" />
              <span>انضم لعصابة لزيادة قوتك</span>
            </div>
          </div>
        </div>

        {/* Enhanced Loading State */}
        {mutation.isPending && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="card-3d p-6 text-center border-blood-500/50">
              <div className="loading-shimmer w-12 h-12 rounded-full mx-auto mb-3"></div>
              <p className="text-white font-bold text-sm">جاري تنفيذ الجريمة...</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[...Array(3)].map((_, i) => (
                  <Skull key={i} className="w-3 h-3 text-blood-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
