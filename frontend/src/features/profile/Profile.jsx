import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  Sword,
  X,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useHud } from "@/hooks/useHud";
import { toast } from "react-hot-toast";
import { Dialog } from '@headlessui/react';
import './vipSparkle.css';
import VipName from './VipName.jsx';
import Modal from "@/components/Modal";
import { useSocket } from "@/hooks/useSocket";

function FightResultModal({ showModal, setShowModal, fightResult, hudStats }) {
  if (!fightResult) return null;
  const { winner, rounds, log, xpGain, attackerFinalHp, defenderFinalHp, attackerId, defenderId } = fightResult;
  const userId = hudStats?.userId;
  const isAttacker = userId === attackerId;
  const isDefender = userId === defenderId;
  
  // Determine who went to hospital based on final HP
  const attackerWentToHospital = attackerFinalHp <= 0;
  const defenderWentToHospital = defenderFinalHp <= 0;
  
  // Determine if current user went to hospital
  const currentUserWentToHospital = (isAttacker && attackerWentToHospital) || (isDefender && defenderWentToHospital);
  const opponentWentToHospital = (isAttacker && defenderWentToHospital) || (isDefender && attackerWentToHospital);
  
  return (
    <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      <div className="relative bg-gradient-to-br from-hitman-900 to-black border-2 border-accent-red rounded-2xl shadow-2xl max-w-lg w-full mx-auto p-8 text-white animate-fade-in">
        <button onClick={() => setShowModal(false)} className="absolute top-4 left-4 text-accent-red hover:text-white transition"><X className="w-6 h-6" /></button>
        <div className="text-center mb-6">
          <Sword className="w-12 h-12 mx-auto text-accent-red animate-bounce mb-2" />
          <h2 className="text-3xl font-bouya mb-2 text-accent-red">نتيجة القتال</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent-red to-transparent mx-auto mb-2" />
        </div>
        {(currentUserWentToHospital || opponentWentToHospital) && (
          <div className="mb-4">
            {currentUserWentToHospital && (
              <div className="bg-red-900/40 border border-red-500/50 rounded-xl p-3 mb-2 text-center text-red-300 font-bold">
                تم نقلك إلى المستشفى بعد القتال!
              </div>
            )}
            {opponentWentToHospital && (
              <div className="bg-green-900/40 border border-green-500/50 rounded-xl p-3 text-center text-green-300 font-bold">
                خصمك تم نقله إلى المستشفى بعد القتال!
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex-1 text-center">
            <div className="text-lg font-bold text-accent-red">الفائز</div>
            <div className="text-xl font-bouya">{winner?.name || "؟"}</div>
            <div className="text-hitman-300 text-sm">@{winner?.username}</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-lg font-bold text-accent-yellow">الجولات</div>
            <div className="text-2xl font-bouya">{rounds}</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-lg font-bold text-accent-green">الخبرة</div>
            <div className="text-2xl font-bouya">+{xpGain}</div>
          </div>
        </div>
        <div className="bg-hitman-800/60 border border-accent-red/30 rounded-xl p-4 max-h-48 overflow-y-auto mb-4 text-right rtl">
          <div className="font-bold text-accent-red mb-2">سجل القتال:</div>
          {log && log.length > 0 ? (
            log.map((line, i) => (
              <div key={i} className="text-sm text-hitman-200 mb-1">{line}</div>
            ))
          ) : (
            <div className="text-hitman-400">لا يوجد تفاصيل</div>
          )}
        </div>
        <button onClick={() => setShowModal(false)} className="w-full py-3 mt-2 bg-gradient-to-r from-accent-red to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-lg transition-all duration-300">إغلاق</button>
      </div>
    </Dialog>
  );
}

function SparkleText({ children }) {
  return (
    <span className="vip-sparkle-text relative inline-block">
      {children}
      <span className="vip-sparkle-anim" aria-hidden="true"></span>
    </span>
  );
}

export default function Profile() {
  // All hooks at the top level
  const { username } = useParams();
  const { token } = useAuth();
  const { stats: hudStats, invalidateHud } = useHud();
  const [attacking, setAttacking] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [totalTime, setTotalTime] = useState(null);
  const navigate = useNavigate();
  const [isFriend, setIsFriend] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null); // 'sent', 'received', or null
  const [friendLoading, setFriendLoading] = useState(false);
  const { socket } = useSocket();

  const {
    data: character,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["character", username],
    queryFn: () =>
      axios
        .get(username ? `/api/profile/username/${username}` : "/api/profile")
        .then((res) => res.data),
    staleTime: 1 * 60 * 1000,
    retry: false,
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

    quote: "الصمت هو أقوى الأسلحة",
    daysInGame: 42,
    killCount: 89,
    lastActive: new Date().toISOString(),
    crimesCommitted: 156,
    fightsWon: 73,
    gangId: "Shadow Syndicate",
    equippedHouseId: "Luxury Penthouse",
    // ...removed rank...
    buffs: ["Stealth Master", "Combat Expert", "Money Magnet"],
    strength: 120,
    defense: 85,
  };

  // Fame compatibility: support both top-level and nested fame
  let fame = character?.fame;
  if (!fame && character?.character?.fame) fame = character.character.fame;
  // When constructing displayCharacter, inject fame
  const displayCharacter = {
    ...(character || mockCharacter),
    fame: fame ?? 0,
  };

  const isOwnProfile = !username;
  const userId = character?.userId;
  
  // Check if this is the current user (for self-attack prevention)
  const isCurrentUser = hudStats?.userId === userId;

  const { data: hospitalStatus } = useQuery({
    queryKey: ['hospitalStatus', userId, isOwnProfile],
    queryFn: async () => {
      let url = '/api/confinement/hospital';
      if (!isOwnProfile && userId) {
        url = `/api/confinement/hospital/${userId}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
      });
      if (!res.ok) return {};
      return res.json();
    },
    enabled: isOwnProfile || !!userId,
    staleTime: 10000,
  });

  useEffect(() => {
    if (hospitalStatus?.inHospital && hospitalStatus?.releaseAt && hospitalStatus?.startedAt) {
      const releaseAt = new Date(hospitalStatus.releaseAt).getTime();
      const startedAt = new Date(hospitalStatus.startedAt).getTime();
      const now = Date.now();
      const total = Math.max(1, Math.round((releaseAt - startedAt) / 1000));
      setTotalTime(total);
      setRemainingTime(Math.max(0, Math.round((releaseAt - now) / 1000)));

      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.round((releaseAt - now) / 1000));
        setRemainingTime(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else if (hospitalStatus?.inHospital && hospitalStatus?.remainingSeconds) {
      setTotalTime(hospitalStatus.remainingSeconds);
      setRemainingTime(hospitalStatus.remainingSeconds);
    }
  }, [hospitalStatus?.inHospital, hospitalStatus?.releaseAt, hospitalStatus?.startedAt, hospitalStatus?.remainingSeconds]);

  // Real-time updates for friendship and profile
  useEffect(() => {
    let pollInterval;
    if (!isOwnProfile && character?.userId) {
      // Socket listeners
      const handleFriendshipUpdate = () => {
        // Refetch friendship status and pending requests
        axios.get(`/api/friendship/is-friend?friendId=${character.userId}`)
          .then(res => setIsFriend(res.data.isFriend))
          .catch(() => setIsFriend(false));
        axios.get('/api/friendship/pending')
          .then(res => {
            const pending = res.data.find(r => r.Requester?.id === hudStats?.userId && r.addresseeId === character.userId);
            if (pending) setPendingStatus('sent');
            else {
              const received = res.data.find(r => r.Requester?.id === character.userId && r.addresseeId === hudStats?.userId);
              if (received) setPendingStatus('received');
              else setPendingStatus(null);
            }
          })
          .catch(() => setPendingStatus(null));
      };
      socket?.on('friendship:update', handleFriendshipUpdate);
      // Polling fallback
      pollInterval = setInterval(handleFriendshipUpdate, 10000);
      return () => {
        socket?.off('friendship:update', handleFriendshipUpdate);
        clearInterval(pollInterval);
      };
    }
  }, [character?.userId, isOwnProfile, hudStats?.userId, socket]);

  // Refetch profile data on hud:update (for own profile) or profile:update (for others)
  useEffect(() => {
    if (!socket) return;
    const refetchProfile = () => {
      // Use react-query's refetch if available
      // (react-query's useQuery returns a refetch function if destructured)
      // But here, we can just invalidate the query
      window?.__REACT_QUERY_CLIENT__?.invalidateQueries?.(["character", username]);
    };
    if (isOwnProfile) {
      socket.on('hud:update', refetchProfile);
    } else {
      socket.on('profile:update', refetchProfile);
    }
    return () => {
      if (isOwnProfile) {
        socket.off('hud:update', refetchProfile);
      } else {
        socket.off('profile:update', refetchProfile);
      }
    };
  }, [socket, isOwnProfile, username]);

  useEffect(() => {
    if (character?.gaveDailyLogin && character?.dailyLoginReward) {
      // setWelcomeExp(character.dailyLoginReward); // Removed
      // setShowWelcomeModal(true); // Removed
    }
  }, [character]);

  const handleAddFriend = async () => {
    setFriendLoading(true);
    await axios.post('/api/friendship/add', { friendId: character.userId });
    setPendingStatus('sent');
    setFriendLoading(false);
  };

  const handleUnfriend = async () => {
    setFriendLoading(true);
    await axios.post('/api/friendship/remove', { friendId: character.userId });
    setIsFriend(false);
    setFriendLoading(false);
  };

  const handleAcceptFriend = async () => {
    setFriendLoading(true);
    // Find the pending request from this user
    const res = await axios.get('/api/friendship/pending');
    const request = res.data.find(r => r.Requester?.id === character.userId && r.addresseeId === hudStats?.userId);
    if (request) {
      await axios.post('/api/friendship/accept', { friendshipId: request.id });
      setIsFriend(true);
      setPendingStatus(null);
    }
    setFriendLoading(false);
  };

  // Calculate progress
  const progress = totalTime && totalTime > 0 ? Math.max(0, Math.min(1, (totalTime - remainingTime) / totalTime)) : 0;

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

  const achievements = [
    // ...removed achievements...
  ];

  // Unified stat extraction from backend fields
  const fightsLost = displayCharacter.fightsLost ?? 0;
  const fightsWon = displayCharacter.fightsWon ?? 0;
  const fightsTotal = displayCharacter.fightsTotal ?? (fightsWon + fightsLost);

  // Add fame to the stats array for display
  const fameStat = {
    icon: Trophy,
    label: "الشهرة",
    value: displayCharacter.fame ?? 0,
    color: "text-accent-yellow",
  };
  // Insert fame as the first stat
  const stats = [fameStat,
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

  // Direct attack logic (copied from Fights.jsx)
  const attackPlayer = async () => {
    if (!character?.userId) {
      toast.error("لا يمكن تحديد هوية اللاعب للهجوم.");
      return;
    }
    setAttacking(true);
    
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const API = import.meta.env.VITE_API_URL;
        const url = `${API}/api/fight/${character.userId}`;
        
        const res = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!res.ok) {
          let errorMsg = "فشل في الهجوم";
          try {
            const data = await res.json();
            errorMsg = data.error || errorMsg;
          } catch {
            let text = await res.text();
            try {
              const data = JSON.parse(text);
              errorMsg = data.error || errorMsg;
            } catch {
              errorMsg = text;
            }
          }
          throw new Error(errorMsg);
        }
        
        const result = await res.json();
        invalidateHud?.();
        navigate('/dashboard/fight-result', { state: { fightResult: result } });
        
        // Success - break out of retry loop
        break;
      } catch (error) {
        // If it's a business logic error (not a connection error), don't retry
        if (error.message?.includes("لا يمكنك") || 
            error.message?.includes("الشخصية غير موجودة") ||
            error.message?.includes("لا يمكنك مهاجمة نفسك")) {
          break;
        }
        
        // If it's the last attempt, show the error
        if (attempt === maxRetries) {
          if (error.message?.includes("لا يمكنك الهجوم وأنت في المستشفى")) {
            toast.error("لا يمكنك الهجوم وأنت في المستشفى. يجب عليك الانتظار حتى خروجك.");
          } else if (error.message?.includes("لا يمكنك مهاجمة لاعب في المستشفى")) {
            toast.error("لا يمكنك مهاجمة هذا اللاعب لأنه في المستشفى حالياً.");
          } else if (error.message?.includes("Failed to fetch") || error.message?.includes("ERR_CONNECTION_REFUSED")) {
            toast.error("فشل في الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
          } else {
            toast.error(error.message || "فشل في الهجوم");
          }
          break;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    setAttacking(false);
  };

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // After fetching character/user data and before rendering the name:
  const isVIP = character?.vipExpiresAt && new Date(character.vipExpiresAt) > new Date();

  // Add this function for sending a message
  const handleSendMessage = () => {
    if (userId && displayCharacter?.username) {
      navigate('/dashboard/messages', {
        state: { userId, username: displayCharacter.username }
      });
    } else {
      navigate('/dashboard/messages');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-hitman-950 via-hitman-900 to-black text-white p-4 pt-20">
        {/* Hospital status message */}
        {hospitalStatus?.inHospital && (
          <div className="bg-black border-2 border-red-600 text-white rounded-lg p-4 mb-4 text-center shadow-md">
            <span className="font-bold text-red-400">
              {isOwnProfile ? "أنت في المستشفى" : `${displayCharacter?.username || "هذا اللاعب"} في المستشفى`}
            </span>
            <span className="mx-2">|</span>
            <span>الوقت المتبقي: <span className="font-mono text-orange-400">{formatTime(remainingTime)}</span></span>
            <div className="w-full bg-hitman-700 rounded-full h-3 mt-2">
              <div className="bg-accent-red h-3 rounded-full transition-all duration-500" style={{ width: `${Math.round(progress * 100)}%` }}></div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left column: Profile card, action buttons, last seen */}
            <div className="flex flex-col gap-6">
              {/* Profile Card */}
              <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-8 text-center animate-slide-up">
                {/* Avatar */}
                <div className="relative mb-6">
                  {displayCharacter?.avatarUrl ? (
                    <img
                      src={displayCharacter.avatarUrl?.startsWith('http') ? displayCharacter.avatarUrl : backendUrl + displayCharacter.avatarUrl}
                      alt="avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-accent-red bg-hitman-800 mx-auto shadow-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-32 h-32 rounded-full bg-gradient-to-br from-hitman-700 to-hitman-800 flex items-center justify-center text-5xl text-accent-red border-4 border-accent-red mx-auto shadow-lg ${displayCharacter?.avatarUrl ? "hidden" : "flex"}`}
                  >
                    {
                      (displayCharacter?.username ||
                        "?")[0]
                    }
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-accent-red rounded-full p-2">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Basic Info */}
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <VipName isVIP={isVIP}>{displayCharacter.name || displayCharacter.username}</VipName>
                  {character?.userId && (
                    <span className="text-xs text-accent-red bg-hitman-900 px-2 py-1 rounded ml-2">ID: {character.userId}</span>
                  )}
                </h2>
                <p className="text-accent-red font-medium mb-1">
                  لاعب جديد
                </p>
                {/* Email hidden for privacy */}

                {/* Quote */}
                {displayCharacter?.quote && (
                  <div className="bg-hitman-800/50 rounded-lg p-4 mb-6">
                    <span className="text-hitman-200 italic">{displayCharacter.quote}</span>
                  </div>
                )}

                {/* Strength & Defense */}
                <div className="flex justify-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-accent-yellow font-bold">
                    <Shield className="w-5 h-5" />
                    <span>الدفاع:</span>
                    <span>{displayCharacter.defense || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-accent-orange font-bold">
                    <Zap className="w-5 h-5" />
                    <span>القوة:</span>
                    <span>{displayCharacter.strength || 0}</span>
                  </div>
                </div>
              </div>
              {/* Action Buttons (hide if viewing own profile) */}
              {!isCurrentUser && (
                <div className="flex flex-row justify-center gap-3">
                  <button onClick={handleSendMessage} className="min-w-[120px] h-12 bg-accent-blue/20 text-accent-blue rounded-lg font-bold text-base" disabled={!character?.userId}>
                    إرسال رسالة
                  </button>
                  <button
                    className="min-w-[120px] h-12 bg-accent-red/20 text-accent-red rounded-lg font-bold text-base transition-all duration-200 hover:bg-accent-red/30 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={attackPlayer}
                    disabled={attacking || !hudStats || hudStats.energy < 10}
                    title={!hudStats || hudStats.energy < 10 ? "لا تملك طاقة كافية للهجوم" : undefined}
                  >
                    {attacking ? "..." : "هجوم"}
                  </button>
                  {/* Friendship Button Logic */}
                  {isFriend ? (
                    <button
                      className="min-w-[120px] h-12 bg-accent-green/20 text-accent-green rounded-lg font-bold text-base flex items-center justify-center gap-2 border border-accent-green hover:bg-accent-green/30 hover:text-white transition-all duration-200"
                      onClick={handleUnfriend}
                      disabled={friendLoading}
                    >
                      <UserCheck className="w-5 h-5" /> صديقك
                      <X className="w-4 h-4 ml-2 text-accent-red" />
                    </button>
                  ) : pendingStatus === 'sent' ? (
                    <button
                      className="min-w-[120px] h-12 bg-accent-yellow/20 text-accent-yellow rounded-lg font-bold text-base flex items-center justify-center gap-2 border border-accent-yellow cursor-not-allowed"
                      disabled
                    >
                      <UserPlus className="w-5 h-5" /> بانتظار القبول
                    </button>
                  ) : pendingStatus === 'received' ? (
                    <button
                      className="min-w-[120px] h-12 bg-accent-blue/20 text-accent-blue rounded-lg font-bold text-base flex items-center justify-center gap-2 border border-accent-blue hover:bg-accent-blue/30 hover:text-white transition-all duration-200"
                      onClick={handleAcceptFriend}
                      disabled={friendLoading}
                    >
                      <UserPlus className="w-5 h-5" /> قبول الطلب
                    </button>
                  ) : (
                    <button
                      className="min-w-[120px] h-12 bg-accent-yellow/20 text-accent-yellow rounded-lg font-bold text-base flex items-center justify-center gap-2 border border-accent-yellow hover:bg-accent-yellow/30 hover:text-white transition-all duration-200"
                      onClick={handleAddFriend}
                      disabled={friendLoading}
                    >
                      <UserPlus className="w-5 h-5" /> إضافة صديق
                    </button>
                  )}
                </div>
              )}
              {/* Last Active Card */}
              <div className="bg-gradient-to-br from-hitman-800/50 to-hitman-900/50 backdrop-blur-sm border border-hitman-700 rounded-xl p-6 flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-lg font-bold text-white">
                    {displayCharacter.lastActive
                      ? new Date(displayCharacter.lastActive).toLocaleDateString("ar")
                      : "---"}
                  </span>
                  <Clock className="w-6 h-6 text-accent-purple" />
                </div>
                <h3 className="text-hitman-300 text-lg">آخر نشاط</h3>
                <p className="text-sm text-hitman-400">
                  {(() => {
                    if (!displayCharacter.lastActive) return "---";
                    const last = new Date(displayCharacter.lastActive).getTime();
                    const now = Date.now();
                    const diff = now - last;
                    if (diff < 5 * 60 * 1000) return "متصل حالياً";
                    // Compute human readable
                    const mins = Math.floor(diff / 60000);
                    const hours = Math.floor(diff / 3600000);
                    const days = Math.floor(diff / 86400000);
                    if (mins < 60) return `آخر ظهور قبل ${mins} دقيقة`;
                    if (hours < 24) return `آخر ظهور قبل ${hours} ساعة`;
                    return `آخر ظهور قبل ${days} يوم`;
                  })()}
                </p>
              </div>
            </div>
            {/* Right column: HP bar, stats, achievements */}
            <div className="flex flex-col gap-6">
              {/* HP Bar */}
              <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6 flex flex-col items-center">
                <span className="text-hitman-200 mb-1">الصحة</span>
                <div className="w-full bg-hitman-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-accent-green h-4 rounded-full transition-all duration-500"
                    style={{ width: `${healthPercent}%` }}
                  ></div>
                </div>
                <span className="text-xs mt-1">
                  {displayCharacter.hp} / {displayCharacter.maxHp}
                </span>
              </div>
              {/* Stats */}
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
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</div>
                      <div className="text-sm text-hitman-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Achievements */}
              <div className="bg-hitman-800/40 rounded-xl p-6">
                <h3 className="text-lg font-bold text-accent-red mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" /> الإنجازات
                </h3>
                <div className="flex flex-wrap gap-4">
                  {achievements.map((ach, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-hitman-900/60 border border-accent-red/30 rounded-lg px-4 py-2"
                    >
                      <ach.icon className="w-5 h-5 text-accent-red" />
                      <span className="font-bold text-white">{ach.name}</span>
                      <span className="text-xs text-hitman-300">{ach.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {attacking && (
        <Modal isOpen={attacking}>
          <div className="flex flex-col items-center justify-center p-8">
            <Sword className="w-16 h-16 text-accent-red animate-bounce mb-4" />
            <div className="text-2xl font-bold text-white mb-2">جاري تنفيذ القتال...</div>
            <div className="text-hitman-300">يرجى الانتظار حتى انتهاء المعركة</div>
            <div className="mt-6">
              <div className="loading-spinner"></div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

function formatTime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
