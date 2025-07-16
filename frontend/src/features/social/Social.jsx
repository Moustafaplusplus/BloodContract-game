import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Messaging from '../messaging/Messaging.jsx';
import { useAuth } from '@/hooks/useAuth';
import { User, UserPlus, Mail, X, Check, Loader2 } from 'lucide-react';

function useQueryParams() {
  const { search } = useLocation();
  return Object.fromEntries(new URLSearchParams(search));
}

export default function Social() {
  const { user } = useAuth();
  const query = useQueryParams();
  const [tab, setTab] = useState(query.tab === 'messages' ? 'messages' : 'friends');
  const [preselectedUser, setPreselectedUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    if (query.tab === 'messages') setTab('messages');
    if (query.userId && query.username) {
      setPreselectedUser({ userId: Number(query.userId), username: query.username });
    }
  }, [query.tab, query.userId, query.username]);

  useEffect(() => {
    // Fetch accepted friends
    axios.get('/api/social/friends').then(res => setFriends(res.data));
    // Fetch all friendships to get pending requests
    axios.get('/api/social/friendships').then(res => {
      // Only show incoming requests (where the logged-in user is the addressee)
      const pending = res.data.filter(f => f.status === 'PENDING' && f.addresseeId === user?.id);
      setPendingRequests(pending);
    });
  }, [user?.id]);

  const handleUnfriend = async (friendId) => {
    await axios.post('/api/social/friends/block', { targetId: friendId });
    setFriends(friends.filter(f => f.id !== friendId));
  };

  const handleAcceptRequest = async (friendshipId) => {
    await axios.post(`/api/social/friends/${friendshipId}/accept`);
    setPendingRequests(pendingRequests.filter(f => f.id !== friendshipId));
    // Optionally, refresh friends list
    axios.get('/api/social/friends').then(res => setFriends(res.data));
  };

  const handleRejectRequest = async (friendshipId) => {
    await axios.post(`/api/social/friends/${friendshipId}/reject`);
    setPendingRequests(pendingRequests.filter(f => f.id !== friendshipId));
  };

  return (
    <section className="bg-black min-h-screen text-white p-4 flex flex-col items-center">
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-accent-red mb-8 text-center tracking-wide">💬 التواصل الاجتماعي</h1>
        <div className="flex justify-center gap-6 mb-8">
          <button
            className={`px-6 py-2 rounded-full font-bold shadow transition-all duration-200 border-2 ${tab === 'friends' ? 'bg-accent-red text-white border-accent-red scale-105' : 'bg-hitman-900 text-accent-red border-accent-red hover:bg-accent-red/20'}`}
            onClick={() => setTab('friends')}
          >
            الأصدقاء
          </button>
          <button
            className={`px-6 py-2 rounded-full font-bold shadow transition-all duration-200 border-2 ${tab === 'messages' ? 'bg-accent-red text-white border-accent-red scale-105' : 'bg-hitman-900 text-accent-red border-accent-red hover:bg-accent-red/20'}`}
            onClick={() => setTab('messages')}
          >
            الرسائل
          </button>
        </div>
        {tab === 'friends' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pending Requests */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-accent-red flex items-center gap-2"><UserPlus className="w-5 h-5" /> طلبات الصداقة</h2>
              <ul className="space-y-4">
                {pendingRequests.length === 0 && <li className="text-gray-400">لا توجد طلبات صداقة معلقة</li>}
                {pendingRequests.map((req) => (
                  <li key={req.id} className="flex items-center gap-4 bg-hitman-800 rounded-lg p-3">
                    <User className="w-8 h-8 text-accent-red bg-zinc-950 rounded-full p-1" />
                    <span className="font-semibold text-lg">{req.Requester?.name || 'مستخدم'}</span>
                    <div className="flex gap-2 ml-auto">
                      <button className="bg-accent-red text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-red-700 transition" onClick={() => handleAcceptRequest(req.id)}><Check className="w-4 h-4" /> قبول</button>
                      <button className="bg-gray-700 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-gray-800 transition" onClick={() => handleRejectRequest(req.id)}><X className="w-4 h-4" /> رفض</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Friends List */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-accent-red flex items-center gap-2"><User className="w-5 h-5" /> قائمة الأصدقاء</h2>
              <ul className="space-y-4">
                {friends.length === 0 && <li className="text-gray-400">لا يوجد أصدقاء بعد</li>}
                {friends.map((friend) => (
                  <li key={friend.id} className="flex items-center gap-4 bg-hitman-800 rounded-lg p-3">
                    <User className="w-8 h-8 text-accent-red bg-zinc-950 rounded-full p-1" />
                    <span className="font-semibold text-lg">{friend.name}</span>
                    <div className="flex gap-2 ml-auto">
                      <button className="bg-accent-red text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-red-700 transition" onClick={() => setPreselectedUser({ userId: friend.id, username: friend.name })}><Mail className="w-4 h-4" /> مراسلة</button>
                      <button className="bg-gray-700 text-white px-3 py-1 rounded-full flex items-center gap-1 hover:bg-gray-800 transition" onClick={() => handleUnfriend(friend.id)}><X className="w-4 h-4" /> حذف صديق</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {tab === 'messages' && (
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg">
            <Messaging preselectedUser={preselectedUser} />
          </div>
        )}
      </div>
    </section>
  );
} 