import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
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
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
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
  const navigate = useNavigate();
  const [isFriend, setIsFriend] = useState(null); // null = loading, true/false = loaded
  const [pendingStatus, setPendingStatus] = useState(null); // 'sent', 'received', or null
  const [friendLoading, setFriendLoading] = useState(false);
  const [friendshipStatusLoading, setFriendshipStatusLoading] = useState(true);
  const { socket } = useSocket();
  const { requestProfileUpdate } = useRealTimeUpdates();
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
  const [jailStatus, setJailStatus] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [jailRemainingTime, setJailRemainingTime] = useState(0);
  const [initialTotalTime, setInitialTotalTime] = useState(null);
  const [jailInitialTotalTime, setJailInitialTotalTime] = useState(null);

  // Fetch hospital status function
  const fetchHospitalStatus = useCallback(async () => {
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
        let total = 1200; // Default 20 minutes if no backend data (matches fight loss time)
        if (data.releaseAt && data.startedAt) {
          const releaseAt = new Date(data.releaseAt).getTime();
          const startedAt = new Date(data.startedAt).getTime();
          total = Math.max(1, Math.round((releaseAt - startedAt) / 1000));
        }
        
        setInitialTotalTime(total);
        setRemainingTime(remaining);
      } else {
        // Not in hospital, reset everything
        setInitialTotalTime(null);
        setRemainingTime(0);
      }
    } catch (error) {
      // Silently handle hospital fetch errors
    }
  }, [customToken, isOwnProfile, userId]);

  // Fetch jail status function
  const fetchJailStatus = useCallback(async () => {
    if (!customToken) return;
    
    try {
      let url = '/api/confinement/jail';
      if (!isOwnProfile && userId) {
        url = `/api/confinement/jail/${userId}`;
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${customToken}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setJailStatus(data);
      
      if (data.inJail && data.remainingSeconds) {
        // Use the remainingSeconds directly from backend (most accurate)
        const remaining = data.remainingSeconds;
        
        // Calculate total time from startedAt and releasedAt for progress bar
        let total = 1200; // Default 20 minutes if no backend data (matches fight loss time)
        if (data.releaseAt && data.startedAt) {
          const releaseAt = new Date(data.releaseAt).getTime();
          const startedAt = new Date(data.startedAt).getTime();
          total = Math.max(1, Math.round((releaseAt - startedAt) / 1000));
        }
        
        setJailInitialTotalTime(total);
        setJailRemainingTime(remaining);
      } else {
        // Not in jail, reset everything
        setJailInitialTotalTime(null);
        setJailRemainingTime(0);
      }
    } catch (error) {
      // Silently handle jail fetch errors
    }
  }, [customToken, isOwnProfile, userId]);

  // Initial fetch on mount
  useEffect(() => {
    if (isOwnProfile || userId) {
      fetchHospitalStatus();
      fetchJailStatus();
    }
  }, [fetchHospitalStatus, fetchJailStatus]);

  // Update hospital timer
  useEffect(() => {
    if (hospitalStatus?.inHospital && initialTotalTime && remainingTime > 0) {
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
  }, [hospitalStatus?.inHospital, initialTotalTime, remainingTime, fetchHospitalStatus]);

  // Update jail timer
  useEffect(() => {
    if (jailStatus?.inJail && jailInitialTotalTime && jailRemainingTime > 0) {
      const timer = setInterval(() => {
        setJailRemainingTime(prev => {
          const newRemaining = prev - 1;
          if (newRemaining <= 0) {
            clearInterval(timer);
            fetchJailStatus();
            return 0;
          }
          return newRemaining;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [jailStatus?.inJail, jailInitialTotalTime, jailRemainingTime, fetchJailStatus]);



  // Initial friendship status fetch and real-time updates
  useEffect(() => {
    if (!isOwnProfile && character?.userId && hudStats?.userId) {
      setFriendshipStatusLoading(true);
      
      // Initial fetch function
      const fetchFriendshipStatus = async () => {
        const token = localStorage.getItem('jwt');
        try {
          console.log('Fetching friendship status for:', character.userId, 'from user:', hudStats.userId);
          
          // Check if they are friends
          const friendRes = await axios.get(`/api/friendship/is-friend?friendId=${character.userId}`, { 
            headers: token ? { Authorization: `Bearer ${token}` } : {} 
          });
          console.log('Friend response:', friendRes.data);
          setIsFriend(friendRes.data.isFriend);
          
          // Check pending requests
          const pendingRes = await axios.get('/api/friendship/pending', { 
            headers: token ? { Authorization: `Bearer ${token}` } : {} 
          });
          console.log('Pending requests:', pendingRes.data);
          
          // Check if current user sent a request to this character
          const sentRequest = pendingRes.data.find(r => r.Requester?.id === hudStats?.userId && r.addresseeId === character.userId);
          if (sentRequest) {
            console.log('Found pending request sent by current user');
            setPendingStatus('sent');
          } else {
            // Check if current user received a request from this character
            const receivedRequest = pendingRes.data.find(r => r.Requester?.id === character.userId && r.addresseeId === hudStats?.userId);
            if (receivedRequest) {
              console.log('Found pending request received from target user');
              setPendingStatus('received');
            } else {
              console.log('No pending requests found');
              setPendingStatus(null);
            }
          }
        } catch (error) {
          console.error('Error fetching friendship status:', error);
          setIsFriend(false);
          setPendingStatus(null);
        } finally {
          setFriendshipStatusLoading(false);
        }
      };
      
      // Initial fetch
      fetchFriendshipStatus();
      
      // Request profile update via socket
      requestProfileUpdate(character.userId);
    } else if (isOwnProfile) {
      // Reset friendship status for own profile
      setIsFriend(null);
      setPendingStatus(null);
      setFriendshipStatusLoading(false);
    }
  }, [character?.userId, isOwnProfile, hudStats?.userId, requestProfileUpdate]);

  // Debug: Log when dependencies change
  useEffect(() => {
    console.log('Profile component dependencies changed:', {
      isOwnProfile,
      characterUserId: character?.userId,
      hudStatsUserId: hudStats?.userId,
      isFriend,
      pendingStatus,
      friendshipStatusLoading
    });
  }, [isOwnProfile, character?.userId, hudStats?.userId, isFriend, pendingStatus, friendshipStatusLoading]);

  // Refetch friendship status when component mounts or when data changes
  useEffect(() => {
    if (!isOwnProfile && character?.userId && hudStats?.userId) {
      console.log('Triggering friendship status refetch');
      // Add a small delay to ensure all data is loaded
      const timer = setTimeout(() => {
        const fetchFriendshipStatus = async () => {
          const token = localStorage.getItem('jwt');
          try {
            console.log('Refetching friendship status...');
            // Check if they are friends
            const friendRes = await axios.get(`/api/friendship/is-friend?friendId=${character.userId}`, { 
              headers: token ? { Authorization: `Bearer ${token}` } : {} 
            });
            console.log('Refetch friend response:', friendRes.data);
            setIsFriend(friendRes.data.isFriend);
            
            // Check pending requests
            const pendingRes = await axios.get('/api/friendship/pending', { 
              headers: token ? { Authorization: `Bearer ${token}` } : {} 
            });
            console.log('Refetch pending requests:', pendingRes.data);
            
            // Check if current user sent a request to this character
            const sentRequest = pendingRes.data.find(r => r.Requester?.id === hudStats?.userId && r.addresseeId === character.userId);
            if (sentRequest) {
              console.log('Refetch: Found pending request sent by current user');
              setPendingStatus('sent');
            } else {
              // Check if current user received a request from this character
              const receivedRequest = pendingRes.data.find(r => r.Requester?.id === character.userId && r.addresseeId === hudStats?.userId);
              if (receivedRequest) {
                console.log('Refetch: Found pending request received from target user');
                setPendingStatus('received');
              } else {
                console.log('Refetch: No pending requests found');
                setPendingStatus(null);
              }
            }
          } catch (error) {
            console.error('Error refetching friendship status:', error);
            setIsFriend(false);
            setPendingStatus(null);
          }
        };
        
        fetchFriendshipStatus();
      }, 100); // Small delay to ensure data is loaded
      
      return () => clearTimeout(timer);
    }
  }, [character?.userId, isOwnProfile, hudStats?.userId]);

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

  // Real-time updates for hospital and jail status
  useEffect(() => {
    if (!socket) return;
    socket.on('hospital:enter', fetchHospitalStatus);
    socket.on('hospital:leave', fetchHospitalStatus);
    socket.on('jail:enter', fetchJailStatus);
    socket.on('jail:leave', fetchJailStatus);
    
    // Real-time friendship status updates
    const handleFriendshipUpdate = async () => {
      if (!isOwnProfile && character?.userId) {
        console.log('Socket: Refetching friendship status due to update');
        const token = localStorage.getItem('jwt');
        try {
          const friendRes = await axios.get(`/api/friendship/is-friend?friendId=${character.userId}`, { 
            headers: token ? { Authorization: `Bearer ${token}` } : {} 
          });
          setIsFriend(friendRes.data.isFriend);
          
          const pendingRes = await axios.get('/api/friendship/pending', { 
            headers: token ? { Authorization: `Bearer ${token}` } : {} 
          });
          
          // Check if current user sent a request to this character
          const sentRequest = pendingRes.data.find(r => r.Requester?.id === hudStats?.userId && r.addresseeId === character.userId);
          if (sentRequest) {
            setPendingStatus('sent');
          } else {
            // Check if current user received a request from this character
            const receivedRequest = pendingRes.data.find(r => r.Requester?.id === character.userId && r.addresseeId === hudStats?.userId);
            if (receivedRequest) {
              setPendingStatus('received');
            } else {
              setPendingStatus(null);
            }
          }
        } catch (error) {
          console.error('Error fetching friendship status:', error);
        }
      }
    };

    // Listen for all friendship-related socket events
    socket.on('friendship:updated', handleFriendshipUpdate);
    socket.on('friendship:request-sent', handleFriendshipUpdate);
    socket.on('friendship:request-received', handleFriendshipUpdate);
    socket.on('friendship:request-accepted', handleFriendshipUpdate);
    socket.on('friendship:request-rejected', handleFriendshipUpdate);
    socket.on('friendship:removed', handleFriendshipUpdate);
    
          return () => {
        socket.off('hospital:enter', fetchHospitalStatus);
        socket.off('hospital:leave', fetchHospitalStatus);
        socket.off('jail:enter', fetchJailStatus);
        socket.off('jail:leave', fetchJailStatus);
        socket.off('friendship:updated', handleFriendshipUpdate);
        socket.off('friendship:request-sent', handleFriendshipUpdate);
        socket.off('friendship:request-received', handleFriendshipUpdate);
        socket.off('friendship:request-accepted', handleFriendshipUpdate);
        socket.off('friendship:request-rejected', handleFriendshipUpdate);
        socket.off('friendship:removed', handleFriendshipUpdate);
      };
  }, [socket, fetchHospitalStatus, fetchJailStatus, character?.userId, isOwnProfile, hudStats?.userId]);

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
    try {
      await axios.post('/api/friendship/add', { friendId: character.userId });
      setPendingStatus('sent');
      setIsFriend(false); // Ensure we're not friends yet
      toast.success('تم إرسال طلب الصداقة بنجاح');
    } catch (error) {
      console.error('Add friend error:', error);
      toast.error('فشل في إرسال طلب الصداقة');
    } finally {
      setFriendLoading(false);
    }
  };

  const handleUnfriend = async () => {
    setFriendLoading(true);
    try {
      await axios.post('/api/friendship/remove', { friendId: character.userId });
      setIsFriend(false);
      setPendingStatus(null);
      toast.success('تم إزالة الصديق بنجاح');
    } catch (error) {
      console.error('Unfriend error:', error);
      toast.error('فشل في إزالة الصديق');
    } finally {
      setFriendLoading(false);
    }
  };

  const handleAcceptFriend = async () => {
    setFriendLoading(true);
    try {
      // Find the pending request from this user
      const res = await axios.get('/api/friendship/pending');
      const request = res.data.find(r => r.Requester?.id === character.userId && r.addresseeId === hudStats?.userId);
      if (request) {
        await axios.post('/api/friendship/accept', { friendshipId: request.id });
        setIsFriend(true);
        setPendingStatus(null);
        toast.success('تم قبول طلب الصداقة بنجاح');
      } else {
        toast.error('لم يتم العثور على طلب الصداقة');
      }
    } catch (error) {
      console.error('Accept friend error:', error);
      toast.error('فشل في قبول طلب الصداقة');
    } finally {
      setFriendLoading(false);
    }
  };

  // Calculate progress for hospital
  const hospitalProgress = initialTotalTime && initialTotalTime > 0 ? Math.max(0, Math.min(1, (initialTotalTime - remainingTime) / initialTotalTime)) : 0;
  
  // Calculate progress for jail
  const jailProgress = jailInitialTotalTime && jailInitialTotalTime > 0 ? Math.max(0, Math.min(1, (jailInitialTotalTime - jailRemainingTime) / jailInitialTotalTime)) : 0;
  


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

    // Check if target is in hospital or jail before attempting attack
    if (hospitalStatus?.inHospital) {
      toast.error("لا يمكنك مهاجمة هذا اللاعب لأنه في المستشفى حالياً.");
      return;
    }

    if (jailStatus?.inJail) {
      toast.error("لا يمكنك مهاجمة هذا اللاعب لأنه في السجن حالياً.");
      return;
    }

    // Check if current user is in hospital
    if (hudStats?.inHospital) {
      toast.error("لا يمكنك الهجوم وأنت في المستشفى. يجب عليك الانتظار حتى خروجك.");
      return;
    }

    // Check if current user is in jail
    if (hudStats?.inJail) {
      toast.error("لا يمكنك الهجوم وأنت في السجن. يجب عليك الانتظار حتى خروجك.");
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
          let responseData = null;
          
          try {
            // Clone the response to avoid "body stream already read" error
            const responseClone = res.clone();
            responseData = await responseClone.json();
            errorMsg = responseData.error || errorMsg;
          } catch (parseError) {
            try {
              // If JSON parsing fails, try to get text
              const responseClone = res.clone();
              const text = await responseClone.text();
              try {
                responseData = JSON.parse(text);
                errorMsg = responseData.error || errorMsg;
              } catch {
                errorMsg = text || errorMsg;
              }
            } catch (textError) {
              console.error('Error parsing response:', textError);
            }
          }
          
          // Create error object with response data for confinement handling
          const error = new Error(errorMsg);
          error.response = { status: res.status, data: responseData };
          throw error;
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
              <div className="bg-accent-red h-3 rounded-full transition-all duration-500" style={{ width: `${Math.round(hospitalProgress * 100)}%` }}></div>
            </div>
          </div>
        )}

        {/* Jail status message */}
        {jailStatus?.inJail && (
          <div className="bg-black border-2 border-orange-600 text-white rounded-lg p-4 mb-4 text-center shadow-md">
            <span className="font-bold text-orange-400">
              {isOwnProfile ? "أنت في السجن" : `${displayCharacter?.displayName || displayCharacter?.name || displayCharacter?.username || "هذا اللاعب"} في السجن`}
            </span>
            <span className="mx-2">|</span>
            <span>الوقت المتبقي: <span className="font-mono text-orange-400">{formatTime(jailRemainingTime)}</span></span>
            <div className="w-full bg-hitman-700 rounded-full h-3 mt-2">
              <div 
                className="bg-orange-500 h-3 rounded-full transition-all duration-500" 
                style={{ 
                  width: `${Math.round(jailProgress * 100)}%` 
                }}
              ></div>
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
                <div className="flex flex-col gap-3">
                  {/* Warning message when user is in hospital/jail */}
                  {(hudStats?.inHospital || hudStats?.inJail) && (
                    <div className="w-full p-3 bg-red-950/50 border border-red-500/50 rounded-lg text-center">
                      <span className="text-red-400 font-bold">
                        {hudStats?.inHospital ? "لا يمكنك الهجوم وأنت في المستشفى" : "لا يمكنك الهجوم وأنت في السجن"}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-row justify-center gap-3">
                  <button onClick={handleSendMessage} className="min-w-[120px] h-12 bg-accent-blue/20 text-accent-blue rounded-lg font-bold text-base" disabled={!character?.userId}>
                    إرسال رسالة
                  </button>
                  <button
                    className={`min-w-[120px] h-12 rounded-lg font-bold text-base transition-all duration-200 ${
                      attacking || !hudStats || hudStats.energy < 10 || hospitalStatus?.inHospital || jailStatus?.inJail || hudStats?.inHospital || hudStats?.inJail
                        ? 'bg-hitman-700/50 text-hitman-400 cursor-not-allowed'
                        : 'bg-accent-red/20 text-accent-red hover:bg-accent-red/30 hover:text-white'
                    }`}
                    onClick={attackPlayer}
                    disabled={attacking || !hudStats || hudStats.energy < 10 || hospitalStatus?.inHospital || jailStatus?.inJail || hudStats?.inHospital || hudStats?.inJail}
                    title={
                      attacking ? "جاري الهجوم..." :
                      !hudStats ? "جاري تحميل البيانات..." :
                      hudStats.energy < 10 ? "لا تملك طاقة كافية للهجوم (مطلوب 10 طاقة)" :
                      hospitalStatus?.inHospital ? "لا يمكنك مهاجمة هذا اللاعب لأنه في المستشفى حالياً" :
                      jailStatus?.inJail ? "لا يمكنك مهاجمة هذا اللاعب لأنه في السجن حالياً" :
                      hudStats?.inHospital ? "لا يمكنك الهجوم وأنت في المستشفى" :
                      hudStats?.inJail ? "لا يمكنك الهجوم وأنت في السجن" :
                      "هجوم"
                    }
                  >
                    {attacking ? "جاري الهجوم..." : "هجوم"}
                  </button>
                  {/* Friendship Button Logic */}
                  {friendshipStatusLoading ? (
                    <button
                      className="min-w-[120px] h-12 bg-hitman-700/50 text-hitman-400 rounded-lg font-bold text-base flex items-center justify-center gap-2 cursor-not-allowed"
                      disabled
                    >
                      <div className="w-4 h-4 border-2 border-hitman-400 border-t-transparent rounded-full animate-spin"></div>
                      جاري التحميل...
                    </button>
                  ) : isFriend ? (
                    <button
                      className={`min-w-[120px] h-12 rounded-lg font-bold text-base flex items-center justify-center gap-2 border transition-all duration-200 ${
                        friendLoading 
                          ? 'bg-hitman-700/50 text-hitman-400 cursor-not-allowed' 
                          : 'bg-accent-green/20 text-accent-green border-accent-green hover:bg-accent-green/30 hover:text-white'
                      }`}
                      onClick={handleUnfriend}
                      disabled={friendLoading}
                    >
                      {friendLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-hitman-400 border-t-transparent rounded-full animate-spin"></div>
                          جاري...
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-5 h-5" /> صديقك
                          <X className="w-4 h-4 ml-2 text-accent-red" />
                        </>
                      )}
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
                      className={`min-w-[120px] h-12 rounded-lg font-bold text-base flex items-center justify-center gap-2 border transition-all duration-200 ${
                        friendLoading 
                          ? 'bg-hitman-700/50 text-hitman-400 cursor-not-allowed' 
                          : 'bg-accent-blue/20 text-accent-blue border-accent-blue hover:bg-accent-blue/30 hover:text-white'
                      }`}
                      onClick={handleAcceptFriend}
                      disabled={friendLoading}
                    >
                      {friendLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-hitman-400 border-t-transparent rounded-full animate-spin"></div>
                          جاري...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" /> قبول الطلب
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className={`min-w-[120px] h-12 rounded-lg font-bold text-base flex items-center justify-center gap-2 border transition-all duration-200 ${
                        friendLoading 
                          ? 'bg-hitman-700/50 text-hitman-400 cursor-not-allowed' 
                          : 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow hover:bg-accent-yellow/30 hover:text-white'
                      }`}
                      onClick={handleAddFriend}
                      disabled={friendLoading}
                    >
                      {friendLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-hitman-400 border-t-transparent rounded-full animate-spin"></div>
                          جاري...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" /> إضافة صديق
                        </>
                      )}
                    </button>
                  )}
                  </div>
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
