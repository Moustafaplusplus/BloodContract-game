import { useState, useEffect } from 'react';
import axios from 'axios';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { useSocket } from '@/hooks/useSocket';
import { Link } from 'react-router-dom';
import { 
  User, 
  UserPlus, 
  UserMinus, 
  Search, 
  Users, 
  Heart, 
  UserCheck, 
  UserX,
  Crown,
  Shield,
  MessageCircle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ImageIcon
} from 'lucide-react';
import VipName from '../profile/VipName.jsx';
import '../profile/vipSparkle.css';
import { getImageUrl } from '@/utils/imageUtils.js';

export default function Friendship() {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const { refetch: refetchPendingCount } = useFriendRequests();
  const { socket } = useSocket();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch friends and pending requests
  const fetchData = async () => {
    setLoading(true);
    try {
      const [friendsRes, pendingRes] = await Promise.all([
        axios.get('/api/friendship/list'),
        axios.get('/api/friendship/pending')
      ]);
      setFriends(friendsRes.data);
      setPendingRequests(pendingRes.data);
    } catch (err) {
      setError("حدث خطأ أثناء تحميل بيانات الأصدقاء.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time socket updates for friendship changes
  useEffect(() => {
    if (!socket) return;

    const handleFriendshipUpdate = () => {
      
      fetchData();
      refetchPendingCount();
    };

    // Listen for all friendship-related socket events
    socket.on('friendship:updated', handleFriendshipUpdate);
    socket.on('friendship:request-sent', handleFriendshipUpdate);
    socket.on('friendship:request-received', handleFriendshipUpdate);
    socket.on('friendship:request-accepted', handleFriendshipUpdate);
    socket.on('friendship:request-rejected', handleFriendshipUpdate);
    socket.on('friendship:removed', handleFriendshipUpdate);

    return () => {
      socket.off('friendship:updated', handleFriendshipUpdate);
      socket.off('friendship:request-sent', handleFriendshipUpdate);
      socket.off('friendship:request-received', handleFriendshipUpdate);
      socket.off('friendship:request-accepted', handleFriendshipUpdate);
      socket.off('friendship:request-rejected', handleFriendshipUpdate);
      socket.off('friendship:removed', handleFriendshipUpdate);
    };
  }, [socket, refetchPendingCount]);

  // Search users
  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (!q.trim() || q.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.get(`/api/messages/search/users?q=${encodeURIComponent(q)}`);
      setSearchResults(res.data);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Add friend
  const handleAddFriend = async (userId) => {
    setError("");
    setSuccess("");
    try {
      await axios.post('/api/friendship/add', { friendId: userId });
      setSuccess("تم إرسال طلب الصداقة.");
    } catch (err) {
      setError("تعذر إرسال طلب الصداقة.");
    }
  };

  // Accept friend request
  const handleAccept = async (id) => {
    setError("");
    setSuccess("");
    try {
      await axios.post(`/api/friendship/accept`, { friendshipId: id });
      setPendingRequests(pendingRequests.filter(r => r.id !== id));
      fetchData();
      refetchPendingCount();
    } catch (err) {
      setError("تعذر قبول الطلب.");
    }
  };

  // Reject friend request
  const handleReject = async (id) => {
    setError("");
    setSuccess("");
    try {
      await axios.post(`/api/friendship/reject`, { friendshipId: id });
      setPendingRequests(pendingRequests.filter(r => r.id !== id));
      refetchPendingCount();
    } catch (err) {
      setError("تعذر رفض الطلب.");
    }
  };

  // Remove friend
  const handleRemove = async (id) => {
    setError("");
    setSuccess("");
    try {
      await axios.post(`/api/friendship/remove`, { friendId: id });
      setFriends(friends.filter(f => f.id !== id));
    } catch (err) {
      setError("تعذر إزالة الصديق.");
    }
  };

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      <div className="container mx-auto max-w-6xl p-3 space-y-4">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-900 via-gray-800 to-red-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ec4899\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"6\"/%3E%3Ccircle cx=\"15\" cy=\"15\" r=\"3\"/%3E%3Ccircle cx=\"45\" cy=\"45\" r=\"3\"/%3E%3Ccircle cx=\"45\" cy=\"15\" r=\"3\"/%3E%3Ccircle cx=\"15\" cy=\"45\" r=\"3\"/%3E%3Cpath d=\"M30 20l5 10h-10z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">الأصدقاء</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">Friendship Network</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Heart className="w-4 h-4 text-pink-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-pink-400" />
                  {friends.length}
                </div>
                <div className="text-xs text-white/80 drop-shadow">صديق</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="card-3d p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded bg-pink-500/20 border border-pink-500/40">
              <Search className="w-4 h-4 text-pink-400" />
            </div>
            <h3 className="font-bold text-pink-400 text-sm">البحث عن أصدقاء جدد</h3>
          </div>
          
          <div className="flex gap-2 relative">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="ابحث عن اسم المستخدم أو اسم الشخصية..."
              className="input-3d flex-1 text-sm"
            />
            {searchLoading && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border border-pink-500/50 border-t-pink-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              <h4 className="text-xs font-bold text-white/70 mb-2">نتائج البحث:</h4>
              {searchResults.map(user => (
                <div key={user.id} className="card-3d bg-black/40 border-white/10 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {getImageUrl(user.avatarUrl) ? (
                        <img
                          src={getImageUrl(user.avatarUrl)}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover border-2 border-pink-500/40 shadow-md"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 rounded-full border-2 border-pink-500/40 bg-gradient-to-br from-pink-800/60 to-red-800/60 flex items-center justify-center shadow-md ${getImageUrl(user.avatarUrl) ? 'hidden' : 'flex'}`}>
                        <User className="w-5 h-5 text-pink-400" />
                      </div>
                    </div>
                    <div>
                      <VipName user={user} showUsername={true} />
                      <div className="text-xs text-white/50">لاعب</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddFriend(user.id)}
                    className="btn-3d text-xs px-3 py-1 flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    إضافة
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Friends List */}
          <div className="card-3d p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-green-950/40 to-emerald-950/30 border-b border-green-500/30 p-3">
              <h3 className="font-bold text-green-400 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                قائمة الأصدقاء ({friends.length})
              </h3>
            </div>
            
            <div className="bg-gradient-to-b from-black/40 to-hitman-950/40 min-h-[300px]">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="w-8 h-8 border border-green-500/50 border-t-green-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-green-300 text-sm">جاري التحميل...</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="p-4 text-center">
                  <Users className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">لا يوجد أصدقاء بعد</p>
                  <p className="text-white/30 text-xs mt-1">ابحث عن لاعبين لإضافتهم كأصدقاء</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {friends.map(friend => (
                    <div key={friend.id} className="p-3 hover:bg-green-500/10 transition-colors duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {getImageUrl(friend.avatarUrl) ? (
                              <img
                                src={getImageUrl(friend.avatarUrl)}
                                alt="avatar"
                                className="w-10 h-10 rounded-full object-cover border-2 border-green-500/40 shadow-md"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-10 h-10 rounded-full border-2 border-green-500/40 bg-gradient-to-br from-green-800/60 to-emerald-800/60 flex items-center justify-center shadow-md ${getImageUrl(friend.avatarUrl) ? 'hidden' : 'flex'}`}>
                              <User className="w-5 h-5 text-green-400" />
                            </div>
                            
                            {/* Online status indicator */}
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-black"></div>
                          </div>
                          
                          <div>
                            <div className="font-semibold text-sm">
                              <VipName user={friend} showUsername={true} />
                            </div>
                            <div className="text-xs text-white/50 flex items-center gap-1">
                              {friend.isVip && <Crown className="w-3 h-3 text-yellow-400" />}
                              {friend.isAdmin && <Shield className="w-3 h-3 text-blood-400" />}
                              صديق
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/dashboard/profile/${friend.username}`}
                            className="p-1.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-400 hover:bg-blue-500/30 transition-colors"
                            title="عرض الملف الشخصي"
                          >
                            <Eye className="w-3 h-3" />
                          </Link>
                          <Link
                            to="/dashboard/messages"
                            state={{ userId: friend.id, username: friend.username }}
                            className="p-1.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-400 hover:bg-purple-500/30 transition-colors"
                            title="إرسال رسالة"
                          >
                            <MessageCircle className="w-3 h-3" />
                          </Link>
                          <button
                            onClick={() => handleRemove(friend.id)}
                            className="p-1.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors"
                            title="إزالة صديق"
                          >
                            <UserMinus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pending Requests */}
          <div className="card-3d p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-950/40 to-yellow-950/30 border-b border-orange-500/30 p-3">
              <h3 className="font-bold text-orange-400 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                طلبات الصداقة المعلقة ({pendingRequests.length})
              </h3>
            </div>
            
            <div className="bg-gradient-to-b from-black/40 to-hitman-950/40 min-h-[300px]">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="w-8 h-8 border border-orange-500/50 border-t-orange-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-orange-300 text-sm">جاري التحميل...</p>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="p-4 text-center">
                  <Clock className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">لا توجد طلبات معلقة</p>
                  <p className="text-white/30 text-xs mt-1">ستظهر طلبات الصداقة الجديدة هنا</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="p-3 hover:bg-orange-500/10 transition-colors duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {getImageUrl(req.Requester?.avatarUrl) ? (
                              <img
                                src={getImageUrl(req.Requester?.avatarUrl)}
                                alt="avatar"
                                className="w-10 h-10 rounded-full object-cover border-2 border-orange-500/40 shadow-md"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextElementSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`w-10 h-10 rounded-full border-2 border-orange-500/40 bg-gradient-to-br from-orange-800/60 to-red-800/60 flex items-center justify-center shadow-md ${getImageUrl(req.Requester?.avatarUrl) ? 'hidden' : 'flex'}`}>
                              <User className="w-5 h-5 text-orange-400" />
                            </div>
                            
                            {/* Request indicator */}
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-black animate-pulse"></div>
                          </div>
                          
                          <div>
                            <div className="font-semibold text-sm">
                              <VipName user={req.Requester} showUsername={true} />
                            </div>
                            <div className="text-xs text-white/50 flex items-center gap-1">
                              {req.Requester?.isVip && <Crown className="w-3 h-3 text-yellow-400" />}
                              {req.Requester?.isAdmin && <Shield className="w-3 h-3 text-blood-400" />}
                              طلب صداقة
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAccept(req.id)}
                            className="btn-3d text-xs px-3 py-1 flex items-center gap-1"
                            title="قبول الطلب"
                          >
                            <CheckCircle className="w-3 h-3" />
                            قبول
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="btn-3d-secondary text-xs px-3 py-1 flex items-center gap-1"
                            title="رفض الطلب"
                          >
                            <XCircle className="w-3 h-3" />
                            رفض
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="card-3d bg-red-950/40 border-red-500/50 p-3 text-center">
            <XCircle className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 text-sm font-bold">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="card-3d bg-green-950/40 border-green-500/50 p-3 text-center">
            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 text-sm font-bold">{success}</p>
          </div>
        )}

        {/* Friendship Tips */}
        <div className="card-3d p-4 bg-gradient-to-r from-blood-950/20 to-black/40 border-blood-500/20">
          <h3 className="text-sm font-bold text-blood-400 mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            نصائح الصداقة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <UserPlus className="w-3 h-3 text-pink-400" />
              <span>أضف أصدقاء للحصول على مزايا إضافية</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-3 h-3 text-blue-400" />
              <span>تواصل مع أصدقائك عبر الرسائل الخاصة</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
