import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Picker from 'emoji-picker-react';
import { useAuth } from '@/hooks/useAuth';

export default function Messaging({ preselectedUser }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  const [fetchError, setFetchError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      setLoading(true);
      axios.get(`/api/social/messages/${selectedUser.userId}`)
        .then(res => {
          setMessages(res.data);
          setFetchError(null);
        })
        .catch(err => {
          setMessages([]);
          setFetchError('فشل في تحميل الرسائل.');
        })
        .finally(() => setLoading(false));
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (preselectedUser && (!selectedUser || selectedUser.userId !== (preselectedUser.userId || preselectedUser.id))) {
      setSelectedUser({ ...preselectedUser, userId: preselectedUser.userId || preselectedUser.id });
    }
  }, [preselectedUser]);

  const handleSearch = async (e) => {
    setSearch(e.target.value);
    if (e.target.value.length > 1) {
      try {
        const res = await axios.get(`/api/social/search/users?query=${encodeURIComponent(e.target.value)}`);
        setSearchResults(res.data);
      } catch {
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (!selectedUser || !selectedUser.userId) {
      setFetchError('يرجى اختيار مستخدم لإرسال الرسالة إليه.');
      return;
    }
    setFetchError(null);
    setSending(true);
    try {
      const res = await axios.post('/api/social/messages', {
        receiverId: selectedUser.userId,
        content: newMessage,
      });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
      setShowEmoji(false);
    } catch (e) {
      setFetchError('فشل في إرسال الرسالة.');
    } finally {
      setSending(false);
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((msg) => msg + emojiData.emoji);
  };

  // Defensive: ensure messages is always an array
  const safeMessages = Array.isArray(messages) ? messages.filter(Boolean) : [];

  return (
    <div className="messaging-page bg-black text-white min-h-screen flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <input
          className="w-full p-2 rounded bg-hitman-900 text-white border border-accent-red mb-2"
          placeholder="ابحث عن لاعب بالاسم أو ID..."
          value={search}
          onChange={handleSearch}
        />
        {searchResults.length > 0 && (
          <div className="bg-hitman-800 rounded shadow mb-2">
            {searchResults.filter(Boolean).map((u) => (
              <div
                key={u?.id || u?.userId || Math.random()}
                className="p-2 hover:bg-accent-red/20 cursor-pointer"
                onClick={() => {
                  if (!u) return;
                  setSelectedUser({ ...u, userId: u.userId || u.id });
                  setSearch('');
                  setSearchResults([]);
                }}
              >
                {u?.username || 'مستخدم'} <span className="text-xs text-accent-red">(ID: {u?.id || u?.userId || '?'})</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedUser && selectedUser.userId && (
        <div className="chat-window w-full max-w-md bg-hitman-900 rounded-lg border border-accent-red flex flex-col mt-4">
          <div className="p-3 border-b border-accent-red flex items-center justify-between">
            <span className="font-bold text-accent-red">{selectedUser.username} (ID: {selectedUser.userId})</span>
            <button onClick={() => setSelectedUser(null)} className="text-accent-red">×</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3" style={{ minHeight: 300, maxHeight: 400 }}>
            {loading && <div className="text-gray-400 text-center mb-2">جاري التحميل...</div>}
            {fetchError && (
              <div className="text-red-500 text-center mb-2">{fetchError}</div>
            )}
            {safeMessages.map((msg, i) => (
              msg && (
                <div key={msg.id || i} className={`mb-2 flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`} >
                  <div className={`rounded-lg px-3 py-2 max-w-xs ${msg.senderId === user.id ? 'bg-accent-red text-white' : 'bg-hitman-800 text-accent-red'}`}>
                    <span>{msg.content}</span>
                    <div className="text-xs text-gray-400 mt-1 text-right">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}</div>
                  </div>
                </div>
              )
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-3 border-t border-accent-red flex items-center gap-2">
            <button onClick={() => setShowEmoji((v) => !v)} className="text-accent-red text-xl">😊</button>
            {showEmoji && (
              <div className="absolute z-50 bottom-20 right-8">
                <Picker onEmojiClick={onEmojiClick} theme="dark" />
              </div>
            )}
            <input
              className="flex-1 p-2 rounded bg-hitman-800 text-white border border-accent-red"
              placeholder="اكتب رسالة..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !sending && handleSend()}
              disabled={sending}
            />
            <button onClick={handleSend} className="bg-accent-red text-white px-4 py-2 rounded" disabled={sending}>إرسال</button>
          </div>
        </div>
      )}
    </div>
  );
} 