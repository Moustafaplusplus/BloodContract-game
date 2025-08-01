import { useQuery, useQueryClient } from "@/hooks/useFirebaseAuth";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Star,
  Trophy,
  Target,
  Shield,
  Crown,
  Calendar,
  Clock,
  Users,
  Home as HomeIcon,
  Award,
  Activity,
  Zap,
  Sword,
  X,
  UserPlus,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Skull,
} from "lucide-react";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useHud } from "@/hooks/useHud";
import { toast } from "react-hot-toast";
import { Dialog } from '@headlessui/react';
import './vipSparkle.css';
import VipName from './VipName.jsx';
import Modal from "@/components/Modal";
import MoneyIcon from "@/components/MoneyIcon";
import { useSocket } from "@/hooks/useSocket";
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';
import { getImageUrl } from '@/utils/imageUtils.js';
import { handleConfinementError } from '@/utils/errorHandler';

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
            <div className="text-xl font-bouya">
              <VipName user={winner} />
            </div>
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



export default function Profile() {
  // All hooks at the top level
  const { username } = useParams();
  const { customToken } = useFirebaseAuth();
  const { stats: hudStats, invalidateHud } = useHud();
  const queryClient = useQueryClient();
  const [attacking, setAttacking] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [totalTime, setTotalTime] = useState(null);
  const navigate = useNavigate();
  const [isFriend, setIsFriend] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null); // 'sent', 'received', or null
  const [friendLoading, setFriendLoading] = useState(false);
  const { socket } = useSocket();
  const [profileFriends, setProfileFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [profileRatings, setProfileRatings] = useState({ likes: 0, dislikes: 0, userRating: null });
  const [ratingLoading, setRatingLoading] = useState(false);
  const [showFightResult, setShowFightResult] = useState(false);
  const [fightResult, setFightResult] = useState(null);
  const [attackImmunityRemaining, setAttackImmunityRemaining] = useState(0);

  const {
    data: character,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["character", username],
    queryFn: () => {
      const token = localStorage.getItem('jwt');
      return axios
        .get(username ? `/api/profile/username/${username}` : "/api/profile", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        .then((res) => res.data);
    },
    staleTime: 1 * 60 * 1000,
    retry: false,
  });



  const isOwnProfile = !username;
  const userId = character?.userId;
  
  // When constructing displayCharacter, inject fame
  // For own profile, use HUD data which is more up-to-date
  const displayCharacter = isOwnProfile && hudStats ? {
    ...hudStats,
    fame: character?.fame ?? 0,
  } : {
    ...(character || {}),
    fame: character?.fame ?? 0,
  };
  
  // Check if this is the current user (for self-attack prevention)
  const isCurrentUser = hudStats?.userId === userId;

  const [hospitalStatus, setHospitalStatus] = useState(null);

  // Fetch hospital status function
  const fetchHospitalStatus = async () => {
    if (!customToken) return;
    
    try {
      let url = '/api/confinement/hospital';
      if (!isOwnProfile && userId) {
        url = `/api/confinement/hospital/${userId}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${customToken}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setHospitalStatus(data);
      
      if (data.inHospital && data.remainingSeconds) {
        // Use the remainingSeconds directly from backend (most accurate)
        const remaining = data.remainingSeconds;
        
        // Calculate total time from startedAt and releasedAt for progress bar
        let total = remaining;
        if (data.releaseAt && data.startedAt) {
          const releaseAt = new Date(data.releaseAt).getTime();
          const startedAt = new Date(data.startedAt).getTime();
          total = Math.max(1, Math.round((releaseAt - startedAt) / 1000));
        }
        
        setTotalTime(total);
        setRemainingTime(remaining);
      } else {
        // Not in hospital, reset everything
        setTotalTime(null);
        setRemainingTime(0);
      }
    } catch (error) {
      // Silently handle hospital fetch errors
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (isOwnProfile || userId) {
      fetchHospitalStatus();
    }
  }, [isOwnProfile, userId, customToken]);

  // Update timer
  useEffect(() => {
    if (hospitalStatus?.inHospital && totalTime && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime(prev => {
          const newRemaining = prev - 1;
          if (newRemaining <= 0) {
            clearInterval(timer);
            fetchHospitalStatus();
            return 0;
          }
          return newRemaining;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [hospitalStatus?.inHospital, totalTime, remainingTime]);



  // Real-time updates for friendship and profile
  useEffect(() => {
    let pollInterval;
    if (!isOwnProfile && character?.userId) {
      // Socket listeners
      const handleFriendshipUpdate = () => {
        // Refetch friendship status and pending requests
        const token = localStorage.getItem('jwt');
        axios.get(`/api/friendship/is-friend?friendId=${character.userId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
          .then(res => setIsFriend(res.data.isFriend))
          .catch(() => setIsFriend(false));
        axios.get('/api/friendship/pending', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
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
      queryClient.invalidateQueries(["character", username]);
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
  }, [socket, isOwnProfile, username, queryClient]);

  // Real-time updates for hospital status
  useEffect(() => {
    if (!socket) return;
    socket.on('hospital:update', fetchHospitalStatus);
    const pollInterval = setInterval(fetchHospitalStatus, 10000);
    return () => {
      socket.off('hospital:update', fetchHospitalStatus);
      clearInterval(pollInterval);
    };
  }, [socket]);

  useEffect(() => {
    if (character?.userId) {
      setFriendsLoading(true);
      const token = localStorage.getItem('jwt');
      axios.get(`/api/friendship/list/${character.userId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        .then(res => setProfileFriends(res.data))
        .catch(() => setProfileFriends([]))
        .finally(() => setFriendsLoading(false));
    }
  }, [character?.userId]);

  // Fetch profile ratings
  useEffect(() => {
    if (character?.userId) {
      const token = localStorage.getItem('jwt');
      axios.get(`/api/profile/${character.userId}/ratings`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        .then(res => setProfileRatings(res.data))
        .catch(() => setProfileRatings({ likes: 0, dislikes: 0, userRating: null }));
    }
  }, [character?.userId]);

  // Handle like/dislike
  const handleRate = async (rating) => {
    if (!character?.userId) return;
    setRatingLoading(true);
    try {
      const token = localStorage.getItem('jwt');
      await axios.post(`/api/profile/${character.userId}/rate`, { rating }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setProfileRatings(prev => ({ ...prev, userRating: rating, likes: rating === 'LIKE' ? prev.likes + (prev.userRating === 'DISLIKE' ? 1 : prev.userRating === 'LIKE' ? 0 : 1) : prev.likes - (prev.userRating === 'LIKE' ? 1 : 0), dislikes: rating === 'DISLIKE' ? prev.dislikes + (prev.userRating === 'LIKE' ? 1 : prev.userRating === 'DISLIKE' ? 0 : 1) : prev.dislikes - (prev.userRating === 'DISLIKE' ? 1 : 0) }));
    } catch (e) {
      toast.error('حدث خطأ أثناء التقييم');
    } finally {
      setRatingLoading(false);
    }
  };

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

  // Attack immunity countdown timer
  useEffect(() => {
    if (displayCharacter?.attackImmunityExpiresAt) {
      const updateTimer = () => {
        const now = new Date();
        const expiresAt = new Date(displayCharacter.attackImmunityExpiresAt);
        const remainingMs = expiresAt.getTime() - now.getTime();
        
        if (remainingMs > 0) {
          setAttackImmunityRemaining(remainingMs);
        } else {
          setAttackImmunityRemaining(0);
        }
      };

      updateTimer(); // Initial update
      const interval = setInterval(updateTimer, 1000); // Update every second

      return () => clearInterval(interval);
    } else {
      setAttackImmunityRemaining(0);
    }
  }, [displayCharacter?.attackImmunityExpiresAt]);

  if (isLoading) {
    return <LoadingOrErrorPlaceholder loading loadingText="جاري تحميل الملف الشخصي..." />;
  }

  if (error) {
    return <LoadingOrErrorPlaceholder error errorText="فشل في تحميل الملف الشخصي" />;
  }

  const healthPercent = displayCharacter.maxHp
    ? (displayCharacter.hp / displayCharacter.maxHp) * 100
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
    value: displayCharacter.assassinations ?? 0,
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
          headers: { Authorization: `Bearer ${customToken}` },
        });
        
        if (!res.ok) {
          let errorMsg = "فشل في الهجوم";
          try {
            const data = await res.json();
            errorMsg = data.error || errorMsg;
            // Create error object with response data for confinement handling
            const error = new Error(errorMsg);
            error.response = { status: res.status, data: data };
            throw error;
          } catch (parseError) {
            let text = await res.text();
            try {
              const data = JSON.parse(text);
              errorMsg = data.error || errorMsg;
              const error = new Error(errorMsg);
              error.response = { status: res.status, data: data };
              throw error;
            } catch {
              const error = new Error(errorMsg);
              error.response = { status: res.status, data: { message: text } };
              throw error;
            }
          }
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
          const confinementResult = handleConfinementError(error, toast);
          if (!confinementResult.isConfinementError) {
            if (error.message?.includes("لا يمكنك الهجوم وأنت في المستشفى")) {
              toast.error("لا يمكنك الهجوم وأنت في المستشفى. يجب عليك الانتظار حتى خروجك.");
            } else if (error.message?.includes("لا يمكنك مهاجمة لاعب في المستشفى")) {
              toast.error("لا يمكنك مهاجمة هذا اللاعب لأنه في المستشفى حالياً.");
            } else if (error.message?.includes("لا يمكنك مهاجمة هذا اللاعب لأنه محمي من الهجمات حالياً")) {
              toast.error("🛡️ لا يمكنك مهاجمة هذا اللاعب لأنه محمي من الهجمات حالياً.");
            } else if (error.message?.includes("Failed to fetch") || error.message?.includes("ERR_CONNECTION_REFUSED")) {
              toast.error("فشل في الاتصال بالخادم. يرجى المحاولة مرة أخرى.");
            } else {
              toast.error(error.message || "فشل في الهجوم");
            }
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
              {isOwnProfile ? "أنت في المستشفى" : `${displayCharacter?.displayName || displayCharacter?.name || displayCharacter?.username || "هذا اللاعب"} في المستشفى`}
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
                      src={getImageUrl(displayCharacter.avatarUrl)}
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
                  <VipName user={displayCharacter} className="large" />
                  {character?.userId && (
                    <span className="text-xs text-accent-red bg-hitman-900 px-2 py-1 rounded font-bold">ID: {character.userId}</span>
                  )}
                </h2>
                {/* Money on hand */}
                <div className="flex items-center justify-center gap-2 mt-2 mb-1">
                  <MoneyIcon className="w-8 h-8" />
                  <span className="text-accent-green font-bold">النقود:</span>
                  <span className="text-lg font-mono text-accent-green">{displayCharacter.money?.toLocaleString() ?? 0}</span>
                </div>
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

                {/* Attack Immunity Status */}
                {displayCharacter.attackImmunityExpiresAt && new Date(displayCharacter.attackImmunityExpiresAt) > new Date() && (
                  <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 border border-blue-500/50 rounded-xl p-4 mb-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-400 font-bold">حماية من الهجمات</span>
                    </div>
                    <div className="text-blue-300 text-sm">
                      متبقى: {attackImmunityRemaining > 0 ? (() => {
                        const remainingMinutes = Math.floor(attackImmunityRemaining / (1000 * 60));
                        const remainingSeconds = Math.floor((attackImmunityRemaining % (1000 * 60)) / 1000);
                        return `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
                      })() : "منتهي"}
                    </div>
                  </div>
                )}
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
              {/* Friends List Section */}
              <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-hitman-700 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-accent-green">
                  <Users className="w-6 h-6" /> أصدقاء اللاعب
                </h3>
                {friendsLoading ? (
                  <div className="text-center text-accent-green">جاري التحميل...</div>
                ) : profileFriends.length === 0 ? (
                  <div className="text-center text-hitman-400">لا يوجد أصدقاء بعد.</div>
                ) : (
                  <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {profileFriends.map(friend => (
                      <li key={friend.id} className="bg-hitman-900/60 border border-accent-green/30 rounded-lg px-3 py-2 text-center text-white font-bold">
                        {friend.username}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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

              {/* Likes/Dislikes Section */}
              <div className="bg-gradient-to-br from-hitman-800/30 to-hitman-900/30 backdrop-blur-sm border border-accent-yellow rounded-xl p-6 mb-6 flex flex-col items-center">
                <h3 className="text-lg font-bold mb-2 text-accent-yellow flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5" /> تقييمات اللاعبين
                </h3>
                <div className="flex gap-6 items-center mb-2">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-accent-green">{profileRatings.likes}</span>
                    <span className="text-hitman-300 text-sm flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> إعجاب</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-accent-red">{profileRatings.dislikes}</span>
                    <span className="text-hitman-300 text-sm flex items-center gap-1"><ThumbsDown className="w-4 h-4" /> عدم إعجاب</span>
                  </div>
                </div>
                {!isCurrentUser && (
                  <div className="flex gap-4 mt-2">
                    <button
                      className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 border transition-all duration-200 ${profileRatings.userRating === 'LIKE' ? 'bg-accent-green/30 border-accent-green text-accent-green' : 'bg-hitman-900/40 border-accent-green text-white hover:bg-accent-green/20'}`}
                      onClick={() => handleRate('LIKE')}
                      disabled={ratingLoading}
                    >
                      <ThumbsUp className="w-5 h-5" /> أعجبني
                    </button>
                    <button
                      className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 border transition-all duration-200 ${profileRatings.userRating === 'DISLIKE' ? 'bg-accent-red/30 border-accent-red text-accent-red' : 'bg-hitman-900/40 border-accent-red text-white hover:bg-accent-red/20'}`}
                      onClick={() => handleRate('DISLIKE')}
                      disabled={ratingLoading}
                    >
                      <ThumbsDown className="w-5 h-5" /> لم يعجبني
                    </button>
                  </div>
                )}
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
