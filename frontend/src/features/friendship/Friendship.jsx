import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Friendship() {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
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
    e.preventDefault();
    if (!search.trim() || search.length < 2) return;
    setSearchLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.get(`/api/v1/search/users?query=${encodeURIComponent(search)}`);
      setSearchResults(res.data);
    } catch (err) {
      setError("تعذر البحث عن المستخدمين.");
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
                <span className="font-medium">{friend.username}</span>
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
                <span className="font-medium">{req.Requester?.username}</span>
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
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن اسم المستخدم أو اسم الشخصية..."
            className="flex-1 px-3 py-2 rounded bg-black text-white border border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded bg-red-700 hover:bg-red-900 text-white font-bold shadow"
            disabled={searchLoading}
          >بحث</button>
        </form>
        {searchLoading && <div className="text-center text-red-300">جاري البحث...</div>}
        {searchResults.length > 0 && (
          <ul className="space-y-2">
            {searchResults.map(user => (
              <li key={user.id} className="flex items-center justify-between bg-black/60 rounded-lg px-4 py-2 border border-red-800">
                <div>
                  <span className="font-medium">{user.username}</span>
                  {user.Character && (
                    <span className="ml-2 text-xs text-red-300">({user.Character.name})</span>
                  )}
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
