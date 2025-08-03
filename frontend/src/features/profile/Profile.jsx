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
  ImageIcon,
  User,
  MessageSquare,
  Crosshair,
  Loader
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

// Utility function for formatting time
function formatTime(seconds) {
  if (!seconds || seconds <= 0) return "00:00:00";
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

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
      <div className="relative card-3d p-8 max-w-lg w-full mx-auto text-white animate-fade-in">
        <button onClick={() => setShowModal(false)} className="absolute top-4 left-4 text-blood-400 hover:text-white transition"><X className="w-6 h-6" /></button>
        <div className="text-center mb-6">
          <Sword className="w-12 h-12 mx-auto text-blood-400 animate-bounce mb-2" />
          <h2 className="text-3xl font-bouya mb-2 text-blood-400">نتيجة القتال</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blood-500 to-transparent mx-auto mb-2" />
        </div>
        {(currentUserWentToHospital || opponentWentToHospital) && (
          <div className="mb-4">
            {currentUserWentToHospital && (
              <div className="card-3d bg-red-950/30 border-red-500/50 p-3 mb-2 text-center text-red-300 font-bold">
                تم نقلك إلى المستشفى بعد القتال!
              </div>
            )}
            {opponentWentToHospital && (
              <div className="card-3d bg-green-950/30 border-green-500/50 p-3 text-center text-green-300 font-bold">
                خصمك تم نقله إلى المستشفى بعد القتال!
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex-1 text-center">
            <div className="text-lg font-bold text-blood-400">الفائز</div>
            <div className="text-xl font-bouya">
              <VipName user={winner} />
            </div>
            <div className="text-white/60 text-sm">@{winner?.username}</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-lg font-bold text-yellow-400">الجولات</div>
            <div className="text-2xl font-bouya">{rounds}</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-lg font-bold text-green-400">الخبرة</div>
            <div className="text-2xl font-bouya">+{xpGain}</div>
          </div>
        </div>
        <div className="card-3d bg-black/40 border-white/20 p-4 max-h-48 overflow-y-auto mb-4 text-right" dir="rtl">
          <div className="font-bold text-blood-400 mb-2">سجل القتال:</div>
          {log && log.length > 0 ? (
            log.map((line, i) => (
              <div key={i} className="text-sm text-white/80 mb-1">{line}</div>
            ))
          ) : (
            <div className="text-white/40">لا يوجد تفاصيل</div>
          )}
        </div>
        <button onClick={() => setShowModal(false)} className="btn-3d w-full py-3 mt-2">إغلاق</button>
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
      return axios
        .get(username ? `/api/profile/username/${username}` : "/api/profile", {
          headers: customToken ? { Authorization: `Bearer ${customToken}` } : {},
        })
        .then((res) => res.data)
        .catch((error) => {
          console.error('[Profile] Error loading character data:', error);
          throw error;
        });
    },
    staleTime: 1 * 60 * 1000,
    retry: 3,
    retryDelay: 1000,
    enabled: !!customToken,
  });

  const isOwnProfile = !username;
  const userId = character?.userId;
  
  // Helper function to extract character data whether it's nested or flattened
  const extractCharacterData = (data) => {
    if (!data) return {};
    
    // If data has a nested Character object, extract it
    if (data.Character) {
      return {
        ...data,
        ...data.Character,
        // Ensure userId is available
        userId: data.userId || data.Character.userId || data.id
      };
    }
    
    // If data is already flattened, return as is
    return data;
  };
  
  // Extract character data from the API response
  const extractedCharacter = extractCharacterData(character);
  
  // When constructing displayCharacter, properly merge character data with HUD data
  // For own profile, use HUD data which is more up-to-date, but merge with character data for missing fields
  const displayCharacter = isOwnProfile && hudStats ? {
    // Start with character data as base
    ...extractedCharacter,
    // Override with HUD data for real-time values
    hp: hudStats.hp ?? extractedCharacter?.hp ?? 0,
    maxHp: hudStats.maxHp ?? extractedCharacter?.maxHp ?? 1000,
    money: hudStats.money ?? extractedCharacter?.money ?? 0,
    energy: hudStats.energy ?? extractedCharacter?.energy ?? 0,
    maxEnergy: hudStats.maxEnergy ?? extractedCharacter?.maxEnergy ?? 100,
    strength: hudStats.strength ?? extractedCharacter?.strength ?? 0,
    defense: hudStats.defense ?? extractedCharacter?.defense ?? 0,
    level: hudStats.level ?? extractedCharacter?.level ?? 1,
    exp: hudStats.exp ?? extractedCharacter?.exp ?? 0,
    // Keep character data for stats that aren't in HUD
    fame: extractedCharacter?.fame ?? 0,
    crimesCommitted: extractedCharacter?.crimesCommitted ?? 0,
    assassinations: extractedCharacter?.assassinations ?? 0,
    killCount: extractedCharacter?.killCount ?? 0,
    fightsWon: extractedCharacter?.fightsWon ?? 0,
    fightsLost: extractedCharacter?.fightsLost ?? 0,
    fightsTotal: extractedCharacter?.fightsTotal ?? 0,
    daysInGame: extractedCharacter?.daysInGame ?? 0,
    // User info
    username: hudStats.username ?? extractedCharacter?.username ?? 'Unknown',
    name: extractedCharacter?.name ?? hudStats.username ?? extractedCharacter?.username ?? 'Unknown',
    userId: hudStats.userId ?? extractedCharacter?.userId,
    // Other fields
    avatarUrl: extractedCharacter?.avatarUrl,
    quote: extractedCharacter?.quote,
    attackImmunityExpiresAt: extractedCharacter?.attackImmunityExpiresAt,
    lastActive: extractedCharacter?.lastActive,
  } : {
    // For other users' profiles, use character data with defaults
    ...extractedCharacter,
    // Ensure all required fields have defaults
    hp: extractedCharacter?.hp ?? 0,
    maxHp: extractedCharacter?.maxHp ?? 1000,
    money: extractedCharacter?.money ?? 0,
    energy: extractedCharacter?.energy ?? 0,
    maxEnergy: extractedCharacter?.maxEnergy ?? 100,
    strength: extractedCharacter?.strength ?? 0,
    defense: extractedCharacter?.defense ?? 0,
    level: extractedCharacter?.level ?? 1,
    exp: extractedCharacter?.exp ?? 0,
    fame: extractedCharacter?.fame ?? 0,
    crimesCommitted: extractedCharacter?.crimesCommitted ?? 0,
    assassinations: extractedCharacter?.assassinations ?? 0,
    killCount: extractedCharacter?.killCount ?? 0,
    fightsWon: extractedCharacter?.fightsWon ?? 0,
    fightsLost: extractedCharacter?.fightsLost ?? 0,
    fightsTotal: extractedCharacter?.fightsTotal ?? 0,
    daysInGame: extractedCharacter?.daysInGame ?? 0,
    username: extractedCharacter?.username ?? 'Unknown',
    name: extractedCharacter?.name ?? extractedCharacter?.username ?? 'Unknown',
    userId: extractedCharacter?.userId,
    avatarUrl: extractedCharacter?.avatarUrl,
    quote: extractedCharacter?.quote,
    attackImmunityExpiresAt: extractedCharacter?.attackImmunityExpiresAt,
    lastActive: extractedCharacter?.lastActive,
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
    if (!isOwnProfile && displayCharacter?.userId && hudStats?.userId) {
      setFriendshipStatusLoading(true);
      
      // Initial fetch function
      const fetchFriendshipStatus = async () => {
        if (!customToken) return;
        try {
          // Check if they are friends
          const friendRes = await axios.get(`/api/friendship/is-friend?friendId=${displayCharacter.userId}`, { 
            headers: { Authorization: `Bearer ${customToken}` } 
          });
          setIsFriend(friendRes.data.isFriend);
          
          // Check pending requests
          const pendingRes = await axios.get('/api/friendship/pending', { 
            headers: { Authorization: `Bearer ${customToken}` } 
          });
          
          // Check if current user sent a request to this character
          const sentRequest = pendingRes.data.find(r => r.Requester?.id === hudStats?.userId && r.addresseeId === displayCharacter.userId);
          if (sentRequest) {
            setPendingStatus('sent');
          } else {
            // Check if current user received a request from this character
            const receivedRequest = pendingRes.data.find(r => r.Requester?.id === displayCharacter.userId && r.addresseeId === hudStats?.userId);
            if (receivedRequest) {
              setPendingStatus('received');
            } else {
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
      requestProfileUpdate(displayCharacter.userId);
    } else if (isOwnProfile) {
      // Reset friendship status for own profile
      setIsFriend(null);
      setPendingStatus(null);
      setFriendshipStatusLoading(false);
    }
  }, [displayCharacter?.userId, isOwnProfile, hudStats?.userId, requestProfileUpdate]);



  // Refetch friendship status when component mounts or when data changes
  useEffect(() => {
    if (!isOwnProfile && displayCharacter?.userId && hudStats?.userId) {
      // Add a small delay to ensure all data is loaded
      const timer = setTimeout(() => {
        const fetchFriendshipStatus = async () => {
          if (!customToken) return;
          try {
            // Check if they are friends
            const friendRes = await axios.get(`/api/friendship/is-friend?friendId=${displayCharacter.userId}`, { 
              headers: { Authorization: `Bearer ${customToken}` } 
            });
            setIsFriend(friendRes.data.isFriend);
            
            // Check pending requests
            const pendingRes = await axios.get('/api/friendship/pending', { 
              headers: { Authorization: `Bearer ${customToken}` } 
            });
            
            // Check if current user sent a request to this character
            const sentRequest = pendingRes.data.find(r => r.Requester?.id === hudStats?.userId && r.addresseeId === displayCharacter.userId);
            if (sentRequest) {
              setPendingStatus('sent');
            } else {
              // Check if current user received a request from this character
              const receivedRequest = pendingRes.data.find(r => r.Requester?.id === displayCharacter.userId && r.addresseeId === hudStats?.userId);
              if (receivedRequest) {
                setPendingStatus('received');
              } else {
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
  }, [displayCharacter?.userId, isOwnProfile, hudStats?.userId]);

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
    
    const handleHospitalEnter = () => {
      fetchHospitalStatus();
    };
    
    const handleHospitalLeave = () => {
      fetchHospitalStatus();
    };
    
    const handleJailEnter = () => {
      fetchJailStatus();
    };
    
    const handleJailLeave = () => {
      fetchJailStatus();
    };
    
    // Real-time friendship status updates
    const handleFriendshipUpdate = async () => {
      if (!isOwnProfile && displayCharacter?.userId && customToken) {
        try {
          const friendRes = await axios.get(`/api/friendship/is-friend?friendId=${displayCharacter.userId}`, { 
            headers: { Authorization: `Bearer ${customToken}` } 
          });
          setIsFriend(friendRes.data.isFriend);
          
          const pendingRes = await axios.get('/api/friendship/pending', { 
            headers: { Authorization: `Bearer ${customToken}` } 
          });
          
          // Check if current user sent a request to this character
          const sentRequest = pendingRes.data.find(r => r.Requester?.id === hudStats?.userId && r.addresseeId === displayCharacter.userId);
          if (sentRequest) {
            setPendingStatus('sent');
          } else {
            // Check if current user received a request from this character
            const receivedRequest = pendingRes.data.find(r => r.Requester?.id === displayCharacter.userId && r.addresseeId === hudStats?.userId);
            if (receivedRequest) {
              setPendingStatus('received');
            } else {
              setPendingStatus(null);
            }
          }
        } catch (error) {
          console.error('[Profile] Error fetching friendship status:', error);
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
    
    // Listen for confinement events
    socket.on('hospital:enter', handleHospitalEnter);
    socket.on('hospital:leave', handleHospitalLeave);
    socket.on('jail:enter', handleJailEnter);
    socket.on('jail:leave', handleJailLeave);
    
    return () => {
      socket.off('hospital:enter', handleHospitalEnter);
      socket.off('hospital:leave', handleHospitalLeave);
      socket.off('jail:enter', handleJailEnter);
      socket.off('jail:leave', handleJailLeave);
      socket.off('friendship:updated', handleFriendshipUpdate);
      socket.off('friendship:request-sent', handleFriendshipUpdate);
      socket.off('friendship:request-received', handleFriendshipUpdate);
      socket.off('friendship:request-accepted', handleFriendshipUpdate);
      socket.off('friendship:request-rejected', handleFriendshipUpdate);
      socket.off('friendship:removed', handleFriendshipUpdate);
    };
  }, [socket, fetchHospitalStatus, fetchJailStatus, displayCharacter?.userId, isOwnProfile, hudStats?.userId, customToken]);

  useEffect(() => {
    if (displayCharacter?.userId && customToken) {
      setFriendsLoading(true);
      axios.get(`/api/friendship/list/${displayCharacter.userId}`, { headers: { Authorization: `Bearer ${customToken}` } })
        .then(res => setProfileFriends(res.data))
        .catch(() => setProfileFriends([]))
        .finally(() => setFriendsLoading(false));
    }
  }, [displayCharacter?.userId, customToken]);

  // Fetch profile ratings
  useEffect(() => {
    if (displayCharacter?.userId && customToken) {
      axios.get(`/api/profile/${displayCharacter.userId}/ratings`, { headers: { Authorization: `Bearer ${customToken}` } })
        .then(res => setProfileRatings(res.data))
        .catch(() => setProfileRatings({ likes: 0, dislikes: 0, userRating: null }));
    }
  }, [displayCharacter?.userId, customToken]);

  // Handle like/dislike
  const handleRate = async (rating) => {
    if (!displayCharacter?.userId || !customToken) return;
    setRatingLoading(true);
    try {
      await axios.post(`/api/profile/${displayCharacter.userId}/rate`, { rating }, { headers: { Authorization: `Bearer ${customToken}` } });
      setProfileRatings(prev => ({ ...prev, userRating: rating, likes: rating === 'LIKE' ? prev.likes + (prev.userRating === 'DISLIKE' ? 1 : prev.userRating === 'LIKE' ? 0 : 1) : prev.likes - (prev.userRating === 'LIKE' ? 1 : 0), dislikes: rating === 'DISLIKE' ? prev.dislikes + (prev.userRating === 'LIKE' ? 1 : prev.userRating === 'DISLIKE' ? 0 : 1) : prev.dislikes - (prev.userRating === 'DISLIKE' ? 1 : 0) }));
    } catch (e) {
      toast.error('حدث خطأ أثناء التقييم');
    } finally {
      setRatingLoading(false);
    }
  };

  const handleAddFriend = async () => {
    if (!customToken) return;
    setFriendLoading(true);
    try {
      await axios.post('/api/friendship/add', { friendId: displayCharacter.userId }, { 
        headers: { Authorization: `Bearer ${customToken}` } 
      });
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
    if (!customToken) return;
    setFriendLoading(true);
    try {
      await axios.post('/api/friendship/remove', { friendId: displayCharacter.userId }, { 
        headers: { Authorization: `Bearer ${customToken}` } 
      });
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
    if (!customToken) return;
    setFriendLoading(true);
    try {
      // Find the pending request from this user
      const res = await axios.get('/api/friendship/pending', { 
        headers: { Authorization: `Bearer ${customToken}` } 
      });
      const request = res.data.find(r => r.Requester?.id === displayCharacter.userId && r.addresseeId === hudStats?.userId);
      if (request) {
        await axios.post('/api/friendship/accept', { friendshipId: request.id }, { 
          headers: { Authorization: `Bearer ${customToken}` } 
        });
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
    console.error('[Profile] Error loading profile:', error);
    return <LoadingOrErrorPlaceholder error errorText="فشل في تحميل الملف الشخصي" />;
  }

  if (!displayCharacter) {
    return <LoadingOrErrorPlaceholder error errorText="لم يتم العثور على بيانات اللاعب" />;
  }

  const healthPercent = displayCharacter.maxHp
    ? (displayCharacter.hp / displayCharacter.maxHp) * 100
    : 0;

  // Unified stat extraction from backend fields with better fallbacks
  const fightsLost = displayCharacter.fightsLost ?? 0;
  const fightsWon = displayCharacter.fightsWon ?? 0;
  const fightsTotal = displayCharacter.fightsTotal ?? (fightsWon + fightsLost);

  // Enhanced stats for compact display with visual elements
  const mainStats = [
    {
      icon: Trophy,
      label: "الشهرة",
      value: displayCharacter.fame ?? 0,
      color: "yellow",
      bgGrad: "from-yellow-950/30 to-amber-950/20"
    },
    {
      icon: Skull,
      label: "الاغتيالات",
      value: displayCharacter.assassinations ?? 0,
      color: "blood",
      bgGrad: "from-blood-950/30 to-red-950/20"
    },
    {
      icon: Crosshair,
      label: "الجرائم",
      value: displayCharacter.crimesCommitted ?? 0,
      color: "red",
      bgGrad: "from-red-950/30 to-blood-950/20"
    },
    {
      icon: Target,
      label: "القتل",
      value: displayCharacter.killCount ?? 0,
      color: "purple",
      bgGrad: "from-purple-950/30 to-indigo-950/20"
    },
    {
      icon: Sword,
      label: "المعارك",
      value: fightsTotal,
      color: "orange",
      bgGrad: "from-orange-950/30 to-red-950/20",
      subtitle: `فوز: ${fightsWon} خسارة: ${fightsLost}`
    },
    {
      icon: Calendar,
      label: "الأيام",
      value: displayCharacter.daysInGame ?? 0,
      color: "green",
      bgGrad: "from-green-950/30 to-emerald-950/20"
    }
  ];

  // Direct attack logic (copied from Fights.jsx)
  const attackPlayer = async () => {
    if (!displayCharacter?.userId) {
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
        const url = `${API}/api/fight/${displayCharacter.userId}`;
        
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
    if (displayCharacter?.userId && displayCharacter?.username) {
      navigate('/dashboard/messages', {
        state: { userId: displayCharacter.userId, username: displayCharacter.username }
      });
    } else {
      navigate('/dashboard/messages');
    }
  };

  return (
    <>
      <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
        <div className="container mx-auto max-w-6xl p-4 space-y-6">
          
          {/* Enhanced Header with Background Image */}
          <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
            {/* Background Image Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
              <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
            </div>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">الملف الشخصي</h1>
                  <p className="text-xs sm:text-sm text-white/80 drop-shadow">{displayCharacter.name || displayCharacter.username}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-white">
                <div className="hidden sm:flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-white/60" />
                  <Crown className="w-4 h-4 text-yellow-400 animate-pulse" />
                </div>
                <div className="text-right">
                  <div className="text-lg sm:text-xl font-bold drop-shadow-lg">Lv.{displayCharacter.level || 1}</div>
                  <div className="text-xs text-white/80 drop-shadow">Level</div>
                </div>
              </div>
            </div>
          </div>

          {/* Hospital status message */}
          {hospitalStatus?.inHospital && (
            <div className="card-3d bg-red-950/30 border-red-500/50 p-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="font-bold text-red-400">
                  {isOwnProfile ? "أنت في المستشفى" : `${displayCharacter?.displayName || displayCharacter?.name || displayCharacter?.username || "هذا اللاعب"} في المستشفى`}
                </span>
                <span className="mx-2 text-white/50">|</span>
                <span className="text-white">
                  الوقت المتبقي: <span className="font-mono text-orange-400">{formatTime(remainingTime)}</span>
                </span>
              </div>
              <div className="progress-3d mt-2 h-2">
                <div className="progress-3d-fill bg-gradient-to-r from-red-600 to-red-400" style={{ width: `${Math.round(hospitalProgress * 100)}%` }}></div>
              </div>
            </div>
          )}

          {/* Jail status message */}
          {jailStatus?.inJail && (
            <div className="card-3d bg-orange-950/30 border-orange-500/50 p-3 text-center">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="font-bold text-orange-400">
                  {isOwnProfile ? "أنت في السجن" : `${displayCharacter?.displayName || displayCharacter?.name || displayCharacter?.username || "هذا اللاعب"} في السجن`}
                </span>
                <span className="mx-2 text-white/50">|</span>
                <span className="text-white">
                  الوقت المتبقي: <span className="font-mono text-orange-400">{formatTime(jailRemainingTime)}</span>
                </span>
              </div>
              <div className="progress-3d mt-2 h-2">
                <div className="progress-3d-fill bg-gradient-to-r from-orange-600 to-orange-400" style={{ width: `${Math.round(jailProgress * 100)}%` }}></div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left column: Profile card, action buttons, last seen */}
            <div className="space-y-6">
              
              {/* Enhanced Profile Card */}
              <div className="card-3d p-6 text-center animate-slide-up">
                {/* Avatar */}
                <div className="relative mb-6">
                  {displayCharacter?.avatarUrl ? (
                    <img
                      src={getImageUrl(displayCharacter.avatarUrl)}
                      alt="avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blood-500/50 bg-black/40 mx-auto shadow-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-32 h-32 rounded-full bg-gradient-to-br from-blood-950/60 to-black/40 flex items-center justify-center text-5xl text-blood-400 border-4 border-blood-500/50 mx-auto shadow-lg ${displayCharacter?.avatarUrl ? "hidden" : "flex"}`}
                  >
                    {(displayCharacter?.username || "?")[0]}
                  </div>
                  <div className="absolute -bottom-2 -right-2 card-3d bg-yellow-500/20 border-yellow-500/40 p-2">
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>

                {/* Basic Info */}
                <h2 className="text-2xl font-bold flex items-center justify-center gap-2 mb-3">
                  <VipName user={displayCharacter} className="large" />
                  {character?.userId && (
                    <span className="text-xs text-blood-400 card-3d bg-black/40 border-blood-500/20 px-2 py-1 font-bold">ID: {character.userId}</span>
                  )}
                </h2>
                
                {/* Money on hand */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <MoneyIcon className="w-6 h-6" />
                  <span className="text-green-400 font-bold">النقود:</span>
                  <span className="text-lg font-mono text-green-400">{displayCharacter.money?.toLocaleString() ?? 0}</span>
                </div>
                
                <p className="text-blood-400 font-medium mb-3">
                  لاعب جديد
                </p>

                {/* Quote */}
                {displayCharacter?.quote && (
                  <div className="card-3d bg-black/40 border-white/10 p-3 mb-4">
                    <span className="text-white/70 italic text-sm">{displayCharacter.quote}</span>
                  </div>
                )}

                {/* Strength & Defense */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="card-3d bg-gradient-to-br from-orange-950/30 to-red-950/20 border-orange-500/30 p-3 text-center">
                    <Zap className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                    <div className="text-sm text-white/60">القوة</div>
                    <div className="text-lg font-bold text-orange-400">{displayCharacter.strength || 0}</div>
                  </div>
                  <div className="card-3d bg-gradient-to-br from-blue-950/30 to-cyan-950/20 border-blue-500/30 p-3 text-center">
                    <Shield className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-sm text-white/60">الدفاع</div>
                    <div className="text-lg font-bold text-blue-400">{displayCharacter.defense || 0}</div>
                  </div>
                </div>

                {/* Attack Immunity Status */}
                {displayCharacter.attackImmunityExpiresAt && new Date(displayCharacter.attackImmunityExpiresAt) > new Date() && (
                  <div className="card-3d bg-gradient-to-br from-blue-950/30 to-blue-800/30 border-blue-500/50 p-4 text-center">
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
                <div className="card-3d p-4">
                  <h3 className="text-lg font-bold text-blood-400 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    إجراءات اللاعب
                  </h3>
                  
                  {/* Warning message when user is in hospital/jail */}
                  {(hudStats?.inHospital || hudStats?.inJail) && (
                    <div className="card-3d bg-red-950/30 border-red-500/50 p-3 text-center mb-3">
                      <span className="text-red-400 font-bold text-sm">
                        {hudStats?.inHospital ? "لا يمكنك الهجوم وأنت في المستشفى" : "لا يمكنك الهجوم وأنت في السجن"}
                      </span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                      onClick={handleSendMessage} 
                      className="btn-3d-secondary text-sm py-2 flex items-center justify-center gap-2" 
                      disabled={!character?.userId}
                    >
                      <MessageSquare className="w-4 h-4" />
                      إرسال رسالة
                    </button>
                    
                    <button
                      className={`btn-3d text-sm py-2 flex items-center justify-center gap-2 ${
                        attacking || !hudStats || hudStats.energy < 10 || hospitalStatus?.inHospital || jailStatus?.inJail || hudStats?.inHospital || hudStats?.inJail
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
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
                      {attacking ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          جاري الهجوم...
                        </>
                      ) : (
                        <>
                          <Sword className="w-4 h-4" />
                          هجوم
                        </>
                      )}
                    </button>
                    
                    {/* Friendship Button Logic */}
                    {friendshipStatusLoading ? (
                      <button
                        className="btn-3d-secondary text-sm py-2 flex items-center justify-center gap-2 cursor-not-allowed sm:col-span-2"
                        disabled
                      >
                        <Loader className="w-4 h-4 animate-spin" />
                        جاري التحميل...
                      </button>
                    ) : isFriend ? (
                      <button
                        className={`btn-3d-secondary text-sm py-2 flex items-center justify-center gap-2 sm:col-span-2 ${
                          friendLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleUnfriend}
                        disabled={friendLoading}
                      >
                        {friendLoading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            جاري...
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" /> 
                            صديقك
                            <X className="w-4 h-4 ml-2 text-red-400" />
                          </>
                        )}
                      </button>
                    ) : pendingStatus === 'sent' ? (
                      <button
                        className="btn-3d-secondary text-sm py-2 flex items-center justify-center gap-2 cursor-not-allowed sm:col-span-2"
                        disabled
                      >
                        <UserPlus className="w-4 h-4" /> بانتظار القبول
                      </button>
                    ) : pendingStatus === 'received' ? (
                      <button
                        className={`btn-3d-secondary text-sm py-2 flex items-center justify-center gap-2 sm:col-span-2 ${
                          friendLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleAcceptFriend}
                        disabled={friendLoading}
                      >
                        {friendLoading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            جاري...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" /> قبول الطلب
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        className={`btn-3d-secondary text-sm py-2 flex items-center justify-center gap-2 sm:col-span-2 ${
                          friendLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={handleAddFriend}
                        disabled={friendLoading}
                      >
                        {friendLoading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            جاري...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" /> إضافة صديق
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Last Active Card */}
              <div className="card-3d p-4">
                <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  آخر نشاط
                </h3>
                <div className="text-center">
                  <div className="text-lg font-bold text-white mb-1">
                    {displayCharacter.lastActive
                      ? new Date(displayCharacter.lastActive).toLocaleDateString("ar")
                      : "---"}
                  </div>
                  <p className="text-sm text-white/60">
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
            </div>
            
            {/* Right column: HP bar, stats, friends, ratings */}
            <div className="space-y-6">
              
              {/* HP Bar */}
              <div className="card-3d p-4">
                <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  الصحة
                </h3>
                <div className="progress-3d h-4">
                  <div
                    className="progress-3d-fill bg-gradient-to-r from-green-600 to-green-400"
                    style={{ width: `${healthPercent}%` }}
                  ></div>
                </div>
                <div className="text-center mt-2 text-sm">
                  {displayCharacter.hp} / {displayCharacter.maxHp}
                </div>
              </div>
              
              {/* Enhanced Stats */}
              <div className="card-3d p-4">
                <h3 className="text-lg font-bold text-blood-400 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  الإحصائيات
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {mainStats.map((stat, index) => (
                    <div key={index} className={`card-3d bg-gradient-to-br ${stat.bgGrad} border-${stat.color}-500/30 p-3 text-center group hover:border-${stat.color}-500/50 transition-colors duration-300`}>
                      <stat.icon className={`w-5 h-5 mx-auto mb-1 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-300`} />
                      <div className={`text-lg font-bold text-${stat.color}-400 mb-0.5`}>
                        {stat.value.toLocaleString()}
                      </div>
                      <div className="text-xs text-white/60">{stat.label}</div>
                      {stat.subtitle && (
                        <div className="text-xs text-white/50 mt-0.5">{stat.subtitle}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Friends List Section */}
              <div className="card-3d p-4">
                <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" /> 
                  أصدقاء اللاعب
                </h3>
                {friendsLoading ? (
                  <div className="text-center text-green-400 flex items-center justify-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    جاري التحميل...
                  </div>
                ) : profileFriends.length === 0 ? (
                  <div className="text-center text-white/60">لا يوجد أصدقاء بعد.</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {profileFriends.map(friend => (
                      <div key={friend.id} className="card-3d bg-black/40 border-green-500/30 p-2 text-center text-white font-bold text-xs">
                        {friend.username}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Likes/Dislikes Section */}
              <div className="card-3d p-4">
                <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5" /> 
                  تقييمات اللاعبين
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{profileRatings.likes}</div>
                    <div className="text-white/60 text-sm flex items-center justify-center gap-1">
                      <ThumbsUp className="w-4 h-4" /> إعجاب
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{profileRatings.dislikes}</div>
                    <div className="text-white/60 text-sm flex items-center justify-center gap-1">
                      <ThumbsDown className="w-4 h-4" /> عدم إعجاب
                    </div>
                  </div>
                </div>
                {!isCurrentUser && (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className={`btn-3d-secondary text-sm py-2 flex items-center justify-center gap-2 ${
                        profileRatings.userRating === 'LIKE' ? 'bg-green-500/20 border-green-500/50 text-green-400' : ''
                      }`}
                      onClick={() => handleRate('LIKE')}
                      disabled={ratingLoading}
                    >
                      <ThumbsUp className="w-4 h-4" /> أعجبني
                    </button>
                    <button
                      className={`btn-3d-secondary text-sm py-2 flex items-center justify-center gap-2 ${
                        profileRatings.userRating === 'DISLIKE' ? 'bg-red-500/20 border-red-500/50 text-red-400' : ''
                      }`}
                      onClick={() => handleRate('DISLIKE')}
                      disabled={ratingLoading}
                    >
                      <ThumbsDown className="w-4 h-4" /> لم يعجبني
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
            <Sword className="w-16 h-16 text-blood-400 animate-bounce mb-4" />
            <div className="text-2xl font-bold text-white mb-2">جاري تنفيذ القتال...</div>
            <div className="text-white/60">يرجى الانتظار حتى انتهاء المعركة</div>
            <div className="mt-6">
              <div className="loading-spinner"></div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
