import { useState, useEffect } from 'react';
import axios from 'axios';
import { useFriendRequests } from '@/hooks/useFriendRequests';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import VipName from '../profile/VipName.jsx';
import '../profile/vipSparkle.css';

// Utility to get avatar URL
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
const getAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return backendUrl + url;
  return backendUrl + '/' + url;
};

export default function Friendship() {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const { refetch: refetchPendingCount } = useFriendRequests();
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
      // Refetch pending count to update navigation counter
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
      // Refetch pending count to update navigation counter
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
    <div className="min-h-screen bg-black text-white p-6 flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-red-500 mb-4">الأصدقاء</h1>
      {/* Friends List */}
      <section className="bg-zinc-900 rounded-xl p-4 shadow-lg border border-red-900">
        <h2 className="text-xl text-red-400 mb-2">قائمة الأصدقاء</h2>
        {loading ? (
          <div className="text-center text-red-300">جاري التحميل...</div>
        ) : (
          <ul className="space-y-2">
            {friends.length === 0 && <li className="text-red-300">لا يوجد أصدقاء بعد.</li>}
            {friends.map(friend => (
              <li key={friend.id} className="flex items-center justify-between bg-black/60 rounded-lg px-4 py-2 border border-red-800">
                <div className="flex items-center gap-3">
                  {getAvatarUrl(friend.avatarUrl) ? (
                    <img
                      src={getAvatarUrl(friend.avatarUrl)}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-accent-red shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Fallback icon when no avatar or image fails to load */}
                  <div className={`w-10 h-10 rounded-full border-2 border-accent-red shadow-md bg-gradient-to-br from-hitman-700 to-hitman-800 flex items-center justify-center ${getAvatarUrl(friend.avatarUrl) ? 'hidden' : 'flex'}`}>
                    <span className="text-sm font-bold text-accent-red">
                      {(friend.displayName || friend.name || friend.username || "?")[0]}
                    </span>
                  </div>
                  <div>
                    <VipName user={friend} showUsername={true} />
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(friend.id)}
                  className="px-3 py-1 rounded bg-red-700 hover:bg-red-900 text-white text-xs font-bold shadow"
                >إزالة</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pending Requests */}
      <section className="bg-zinc-900 rounded-xl p-4 shadow-lg border border-red-900">
        <h2 className="text-xl text-red-400 mb-2">طلبات الصداقة المعلقة</h2>
        {loading ? (
          <div className="text-center text-red-300">جاري التحميل...</div>
        ) : (
          <ul className="space-y-2">
            {pendingRequests.length === 0 && <li className="text-red-300">لا توجد طلبات معلقة.</li>}
            {pendingRequests.map(req => (
              <li key={req.id} className="flex items-center justify-between bg-black/60 rounded-lg px-4 py-2 border border-red-800">
                <div className="flex items-center gap-3">
                  {getAvatarUrl(req.Requester?.avatarUrl) ? (
                    <img
                      src={getAvatarUrl(req.Requester?.avatarUrl)}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-accent-red shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Fallback icon when no avatar or image fails to load */}
                  <div className={`w-10 h-10 rounded-full border-2 border-accent-red shadow-md bg-gradient-to-br from-hitman-700 to-hitman-800 flex items-center justify-center ${getAvatarUrl(req.Requester?.avatarUrl) ? 'hidden' : 'flex'}`}>
                    <span className="text-sm font-bold text-accent-red">
                      {(req.Requester?.displayName || req.Requester?.name || req.Requester?.username || "?")[0]}
                    </span>
                  </div>
                  <div>
                    <VipName user={req.Requester} showUsername={true} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(req.id)}
                    className="px-3 py-1 rounded bg-red-700 hover:bg-red-900 text-white text-xs font-bold shadow"
                  >قبول</button>
                  <button
                    onClick={() => handleReject(req.id)}
                    className="px-3 py-1 rounded bg-zinc-800 hover:bg-red-900 text-red-400 border border-red-700 text-xs font-bold shadow"
                  >رفض</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Add Friend/Search */}
      <section className="bg-zinc-900 rounded-xl p-4 shadow-lg border border-red-900">
        <h2 className="text-xl text-red-400 mb-2">إضافة صديق</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="ابحث عن اسم المستخدم أو اسم الشخصية..."
            className="flex-1 px-3 py-2 rounded bg-black text-white border border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {searchLoading && <span className="text-xs text-red-300 px-2 py-2">جاري البحث...</span>}
        </div>
        {searchLoading && <div className="text-center text-red-300">جاري البحث...</div>}
        {searchResults.length > 0 && (
          <ul className="space-y-2">
            {searchResults.map(user => (
              <li key={user.id} className="flex items-center justify-between bg-black/60 rounded-lg px-4 py-2 border border-red-800">
                <div className="flex items-center gap-3">
                  {getAvatarUrl(user.avatarUrl) ? (
                    <img
                      src={getAvatarUrl(user.avatarUrl)}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-accent-red shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  {/* Fallback icon when no avatar or image fails to load */}
                  <div className={`w-10 h-10 rounded-full border-2 border-accent-red shadow-md bg-gradient-to-br from-hitman-700 to-hitman-800 flex items-center justify-center ${getAvatarUrl(user.avatarUrl) ? 'hidden' : 'flex'}`}>
                    <span className="text-sm font-bold text-accent-red">
                      {(user.displayName || user.name || user.username || "?")[0]}
                    </span>
                  </div>
                  <VipName user={user} showUsername={true} />
                </div>
                <button
                  onClick={() => handleAddFriend(user.id)}
                  className="px-3 py-1 rounded bg-red-700 hover:bg-red-900 text-white text-xs font-bold shadow"
                >إضافة</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Error/Success Messages */}
      {error && <div className="mt-4 text-center text-red-400 font-bold">{error}</div>}
      {success && <div className="mt-4 text-center text-red-500 font-bold">{success}</div>}
    </div>
  );
}
