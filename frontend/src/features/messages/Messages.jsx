import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Search } from 'lucide-react';
import notificationSound from '/notification.mp3';
import { Edit2, Trash2, Plus, Volume2, VolumeX, Star, Shield } from 'lucide-react';
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';
import VipName from '../profile/VipName.jsx';
import '../profile/vipSparkle.css';
import { jwtDecode } from 'jwt-decode';

// Utility to get avatar URL (extracted from PlayerSearch)
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
const getAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return backendUrl + url;
  return backendUrl + '/' + url;
};

export default function Messages() {
  const { socket } = useSocket();
  const { token } = useAuth();
  const { refetch: refetchUnreadCount } = useUnreadMessages();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [unread, setUnread] = useState({}); // { userId: true }
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [friends, setFriends] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [soundMuted, setSoundMuted] = useState(false);
  const audioRef = useRef(null);
  
  // Get userId from JWT token instead of localStorage
  const userId = token ? (() => {
    try {
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch {
      return null;
    }
  })() : null;
  
  const [userInfo, setUserInfo] = useState({});
  // Infinite scroll
  const INITIAL_VISIBLE = 30;
  const LOAD_MORE_COUNT = 20;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesContainerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  // Emoji list (same as GlobalChat)
  const emojiList = [
    '😀','😃','😄','😁','😆','😅','😂','🤣','😜','😎','😍','🥳','😏','😇','😱','😡','😭','😢','😤','😈','👿','🤔','😴','🥺','😬','😲','😳','😅','😆','😋','😝','😤','😪','😵','🤯','🥶','🤤',
    '⚔️','🛡️','🏹','🗡️','🪓','🔫','🧨','🛡️','🦾','🦿','🧙‍♂️','🧙‍♀️','🧛‍♂️','🧟‍♂️','🧟‍♀️','🧞‍♂️','🧞‍♀️','🧚‍♂️','🧚‍♀️','🐉','👾','👑','💀','☠️','🦴','🦹‍♂️','🦸‍♂️','🦸‍♀️',
    '💰','💎','🪙','🧪','🧴','🍖','🍗','🍺','🍻','🥤','🍔','🍟','🍕','🍩','🍪','🍫','🍬','🍭','🎁','🎲','🃏','🀄','🎮','🕹️','🏆','🥇','🥈','🥉','🎯','🎵','🎶','🎤','🎸','🎻','🥁',
    '✨','🔥','💥','⚡','🌟','🌈','❄️','💧','🌪️','🌊','🌋','🌀','🌙','☀️','🌞','🌚','🌛','🌜','🌠','🪄','🧿',
    '👍','👎','👏','🙌','🙏','🤝','💪','🫡','🫶','🤙','🤘','🖖','✌️','🤞','🫲','🫱','👋','🤟','🫂','💔','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💯','🔔','🔊','🔇','🚩','🏳️','🏴','🏳️‍🌈','🏳️‍⚧️','🚀','🛸','🦄','🐺','🐱','🐶','🐲','🦅','🦉','🦇','🐾','🦷','🦸','🦹','🧙','🧚','🧛','🧟','🧞','🧜','🧝','🧙‍♂️','🧙‍♀️'
  ];
  // Insert emoji at cursor position
  const insertEmoji = (emoji) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const before = newMessage.slice(0, start);
    const after = newMessage.slice(end);
    const updated = before + emoji + after;
    setNewMessage(updated);
    setShowEmojiPicker(false);
    setTimeout(() => {
      input.focus();
      input.selectionStart = input.selectionEnd = start + emoji.length;
    }, 0);
  };

  // Fetch inbox
  useEffect(() => {
    if (!userId) return;
    
    setLoadingInbox(true);
    axios.get('/api/messages/inbox', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(res => {
        setConversations(res.data);
        // Update unread state based on new data structure
        const unreadState = {};
        res.data.forEach(conversation => {
          if (conversation.hasUnreadMessages) {
            unreadState[conversation.userId] = true;
          }
        });
        setUnread(unreadState);
        
        // Refetch unread count to update navigation counter
        refetchUnreadCount();
        
        // If coming from profile, auto-select user
        if (location.state && location.state.userId) {
          const user = res.data.find(u => u.userId === location.state.userId);
          if (user) setSelectedUser(user);
          else if (location.state.username) setSelectedUser({ userId: location.state.userId, username: location.state.username });
        }
      })
      .catch(() => setConversations([]))
      .finally(() => setLoadingInbox(false));
  }, [userId, token, location.state]);

  // Fetch messages for selected user
  useEffect(() => {
    if (selectedUser && userId) {
      setLoadingMessages(true);
      axios.get(`/api/messages/${selectedUser.userId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        .then(res => {
          setMessages(res.data);
          // Mark all unread messages from this user as read
          const unreadMessages = res.data.filter(msg => 
            msg.senderId === selectedUser.userId && 
            msg.receiverId === userId && 
            !msg.isRead
          );
          
          if (unreadMessages.length > 0) {
            // Mark each unread message as read
            Promise.all(unreadMessages.map(msg => 
              axios.patch(`/api/messages/read/${msg.id}`, {}, { 
                headers: token ? { Authorization: `Bearer ${token}` } : {} 
              })
            )).then(() => {
              // Update local state to mark messages as read
              setMessages(prev => prev.map(msg => 
                unreadMessages.some(unread => unread.id === msg.id) 
                  ? { ...msg, isRead: true }
                  : msg
              ));
              // Refetch unread count to update navigation counter
              refetchUnreadCount();
            }).catch(console.error);
          }
        })
        .catch(() => setMessages([]))
        .finally(() => setLoadingMessages(false));
      // Clear unread badge for this user
      setUnread(prev => ({ ...prev, [selectedUser.userId]: false }));
      setSidebarOpen(false); // auto-close sidebar on mobile
    }
  }, [selectedUser, userId, token]);

  // Fetch friends for 'Add Friend' button logic
  useEffect(() => {
    if (!userId) return;
    
    axios.get('/api/friendship/list', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(res => setFriends(res.data.map(f => f.id)))
      .catch(() => setFriends([]));
  }, [userId, token]);

  // Fetch user info for badges
  useEffect(() => {
    if (!userId) return;
    
    axios.get('/api/character').then(res => {
      setUserInfo({
        username: res.data?.User?.username || res.data?.username || '',
        avatarUrl: res.data?.User?.avatarUrl || res.data?.avatarUrl || '/avatars/default.png',
        isAdmin: res.data?.User?.isAdmin || res.data?.isAdmin || false,
        isVip: res.data?.User?.isVip || res.data?.isVip || false,
      });
    }).catch(() => {
      setUserInfo({ username: '', avatarUrl: '/avatars/default.png', isAdmin: false, isVip: false });
    });
  }, [userId, token]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Infinite scroll: reset visibleCount when messages change
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [messages.length]);
  // Infinite scroll: load more on scroll up
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      if (container.scrollTop === 0 && visibleCount < messages.length) {
        setLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, messages.length));
          setLoadingMore(false);
        }, 200);
      }
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length, visibleCount]);
  // Maintain scroll position when loading more
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (loadingMore) return;
    if (visibleCount > INITIAL_VISIBLE) {
      setTimeout(() => {
        if (container.scrollHeight > container.clientHeight) {
          container.scrollTop = container.scrollHeight / (visibleCount / LOAD_MORE_COUNT);
        }
      }, 0);
    }
  }, [visibleCount, loadingMore]);

  // Real-time: join own room and listen for messages and edits
  useEffect(() => {
    if (!socket) return;
    socket.emit('join', userId);
    const handleReceive = (msg) => {
      if (
        selectedUser &&
        ((msg.senderId === selectedUser.userId) || (msg.receiverId === selectedUser.userId))
      ) {
        setMessages(prev => [...prev, msg]);
        // Play sound for incoming messages from other user
        if (!soundMuted && msg.senderId === selectedUser.userId && audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      } else {
        setUnread(prev => ({ ...prev, [msg.senderId]: true }));
      }
    };
    const handleEdit = (msg) => {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, ...msg } : m));
    };
    const handleDelete = ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    };
    const handleReact = (msg) => {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, reactions: msg.reactions } : m));
    };
    socket.on('receive_message', handleReceive);
    socket.on('message_edited', handleEdit);
    socket.on('message_deleted', handleDelete);
    socket.on('message_reacted', handleReact);
    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('message_edited', handleEdit);
      socket.off('message_deleted', handleDelete);
      socket.off('message_reacted', handleReact);
    };
  }, [socket, selectedUser, soundMuted]);

  // Optimistic UI for sending
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);
    setError(null);
    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      senderId: userId,
      receiverId: selectedUser.userId,
      content: newMessage,
      createdAt: new Date().toISOString(),
      reactions: {},
      edited: false,
      deleted: false,
      optimistic: true
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');
    try {
      socket.emit('send_message', {
        senderId: userId,
        receiverId: selectedUser.userId,
        content: optimisticMsg.content
      });
    } catch {
      setError('فشل إرسال الرسالة');
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  // Add friend handler
  const handleAddFriend = async (userId) => {
    try {
      const token = localStorage.getItem('jwt');
      await axios.post('/api/friendship/add', { friendId: userId }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setFriends(prev => [...prev, userId]);
    } catch {
      // Optionally show error
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    const timeStr = date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
    if (isToday) {
      return `اليوم ${timeStr}`;
    } else {
      const dateStr = date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      return `${dateStr} ${timeStr}`;
    }
  };

  // Emoji reactions logic
  const [expandedReactions, setExpandedReactions] = useState({});
  const handleReaction = (msg, emoji) => {
    const reacted = (msg.reactions?.[emoji] || []).includes(Number(userId));
    if (reacted) {
      socket.emit('remove_message_reaction', { messageId: msg.id, emoji });
    } else {
      socket.emit('add_message_reaction', { messageId: msg.id, emoji });
    }
  };

  // Player search handler
  const handlePlayerSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await axios.get(`/api/messages/search/users?q=${encodeURIComponent(q)}`);
      setSearchResults(res.data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // UI
  return (
    <div className="flex flex-col md:flex-row h-[80vh] bg-black rounded-xl shadow-lg overflow-hidden border border-zinc-800 relative pt-36 sm:pt-44" style={{ minHeight: '100dvh' }}>
      {/* Player Search Bar */}
      <div className="absolute top-0 left-0 w-full z-30 bg-zinc-950 border-b border-zinc-800 flex items-center gap-2 px-4 py-3" style={{ minHeight: '56px' }}>
        <Search className="w-5 h-5 text-accent-red" />
        <input
          type="text"
          value={searchQuery}
          onChange={handlePlayerSearch}
          placeholder="ابحث عن لاعب..."
          className="bg-zinc-800 text-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-red border border-zinc-700 text-sm w-full max-w-xs"
        />
        {searching && <span className="text-xs text-zinc-400 ml-2">جاري البحث...</span>}
        {searchResults.length > 0 && (
          <div className="absolute left-4 top-14 z-40 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg w-64 max-h-60 overflow-y-auto text-xs">
            {searchResults.map(u => (
              <button
                key={u.id}
                className="w-full text-right px-4 py-2 hover:bg-accent-red/80 text-zinc-200 border-b border-zinc-800 last:border-b-0"
                onClick={() => {
                  setSelectedUser({ userId: u.id, username: u.username });
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                @{u.username}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Sidebar toggle for mobile */}
      <button
        className="md:hidden absolute top-2 right-2 z-20 bg-accent-red text-white rounded-full p-2 shadow-lg focus:outline-none"
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label="فتح قائمة المحادثات"
      >
        {sidebarOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        )}
      </button>
      {/* Inbox Sidebar */}
      <aside className={`fixed md:static top-0 right-0 h-full w-4/5 max-w-xs bg-zinc-900 border-l-4 border-accent-red flex flex-col z-10 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:w-1/3 md:min-w-[220px]`}
        style={{ boxShadow: sidebarOpen ? '0 0 0 9999px rgba(0,0,0,0.5)' : undefined }}
      >
        {/* Close button for mobile sidebar */}
        <button
          className="md:hidden absolute top-2 left-2 z-30 bg-zinc-800 text-accent-red rounded-full p-2 shadow focus:outline-none"
          onClick={() => setSidebarOpen(false)}
          aria-label="إغلاق القائمة"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-lg font-bold text-accent-red px-4 py-3 border-b border-zinc-800">الرسائل</h2>
        {loadingInbox ? (
          <LoadingOrErrorPlaceholder loading loadingText="جاري تحميل المحادثات..." />
        ) : conversations.length === 0 ? (
          <LoadingOrErrorPlaceholder error errorText="لا توجد محادثات" />
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-zinc-800">
            {conversations.map(user => (
              <li key={user.userId} className="relative">
                <button
                  className={`w-full text-right px-4 py-3 hover:bg-zinc-800 transition-colors duration-150 flex items-center gap-3 ${selectedUser?.userId === user.userId ? 'bg-accent-red text-white' : 'text-zinc-200'}`}
                  onClick={e => { e.stopPropagation(); setSelectedUser(user); }}
                >
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
                  <div className={`w-10 h-10 rounded-full border-2 border-accent-red shadow-md bg-hitman-800 flex items-center justify-center ${getAvatarUrl(user.avatarUrl) ? 'hidden' : 'flex'}`}>
                    <User className="w-5 h-5 text-accent-red" />
                  </div>
                  <span className="font-semibold truncate">
                    <Link to={`/dashboard/profile/${user.username}`} className="hover:underline text-inherit">{user.username}</Link>
                  </span>
                  {unread[user.userId] && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-red animate-pulse" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* Conversation View */}
      <main className="flex-1 flex flex-col bg-zinc-950 min-w-0">
        {selectedUser ? (
          <>
            <div className="px-4 md:px-6 py-4 border-b border-zinc-800 flex items-center gap-3 bg-zinc-900 min-h-[56px]">
              <button className="md:hidden text-accent-red mr-2" onClick={() => setSidebarOpen(true)} aria-label="رجوع للقائمة">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
              {getAvatarUrl(selectedUser.avatarUrl) ? (
                <img
                  src={getAvatarUrl(selectedUser.avatarUrl)}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-accent-red shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              {/* Fallback icon when no avatar or image fails to load */}
              <div className={`w-10 h-10 rounded-full border-2 border-accent-red shadow-md bg-hitman-800 flex items-center justify-center ${getAvatarUrl(selectedUser.avatarUrl) ? 'hidden' : 'flex'}`}>
                <User className="w-5 h-5 text-accent-red" />
              </div>
              <span className="font-bold text-lg text-accent-red truncate">
                <Link to={`/dashboard/profile/${selectedUser.username}`} className="hover:underline text-inherit">{selectedUser.username}</Link>
              </span>
              {/* Add Friend Button */}
              {selectedUser.userId && !friends.includes(selectedUser.userId) && (
                <button
                  className="ml-auto px-3 py-1 rounded bg-accent-red text-white text-xs font-bold shadow hover:bg-red-700 transition"
                  onClick={() => handleAddFriend(selectedUser.userId)}
                >
                  إضافة صديق
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-2 md:px-6 py-4 space-y-2 bg-zinc-950" ref={messagesContainerRef}>
              {loadingMore && (
                <LoadingOrErrorPlaceholder loading loadingText="جاري تحميل المزيد..." />
              )}
              {loadingMessages ? (
                <LoadingOrErrorPlaceholder loading loadingText="جاري تحميل المحادثة..." />
              ) : messages.length === 0 ? (
                <LoadingOrErrorPlaceholder error errorText="لا توجد رسائل بعد" />
              ) : (
                messages.slice(-visibleCount).map(msg => {
                  const isSelf = msg.senderId == userId;
                  const avatarUrl = isSelf ? userInfo.avatarUrl : selectedUser.avatarUrl;
                  const isAdmin = isSelf ? userInfo.isAdmin : selectedUser.isAdmin;
                  const isVip = isSelf ? userInfo.isVip : selectedUser.isVip;
                  return (
                    <div key={msg.id} className={`flex w-full items-end gap-2 ${isSelf ? 'justify-end' : 'justify-start'}`} style={{ direction: 'rtl' }}>
                      {!isSelf && (
                        <img src={getAvatarUrl(avatarUrl)} alt={selectedUser.username} className="w-8 h-8 rounded-full border-2 border-zinc-800 object-cover shadow order-2" title={selectedUser.username} />
                      )}
                      <div className={`relative ${isSelf ? 'ml-auto' : 'mr-auto'} my-2 px-3 py-2 rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-200 max-w-[80%] shadow text-xs sm:text-sm inline-block align-bottom`} style={{ wordBreak: 'break-word', maxWidth: '75vw' }}>
                        <div className="flex flex-row items-center flex-wrap gap-2">
                          {!isSelf && (
                            <span className="font-semibold text-accent-red flex items-center gap-1">
                              <VipName isVIP={isVip} className="compact">
                                {selectedUser.username}
                              </VipName>
                              {isAdmin && <Shield className="w-4 h-4 text-accent-red" title="مشرف" />}
                            </span>
                          )}
                          {editingMessageId === msg.id ? (
                            <>
                              <input
                                className="bg-zinc-700 text-zinc-200 rounded px-2 py-1 text-xs sm:text-sm w-32 sm:w-48"
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                maxLength={500}
                                autoFocus
                              />
                              <button className="ml-2 text-accent-red font-bold text-xs" onClick={() => {
                                if (!editContent.trim()) return;
                                socket.emit('edit_message', { messageId: msg.id, newContent: editContent.trim() }, (res) => {
                                  if (res?.error) setError(res.error);
                                  setEditingMessageId(null);
                                });
                              }}>حفظ</button>
                              <button className="ml-1 text-zinc-400 text-xs" onClick={() => setEditingMessageId(null)}>إلغاء</button>
                            </>
                          ) : (
                            <span className="text-sm">
                              {msg.content}
                              {msg.edited && (
                                <span className="ml-1 text-xs text-zinc-400">(معدل)</span>
                              )}
                            </span>
                          )}
                          {/* Emoji Reactions */}
                          <div className="flex gap-0.5 sm:gap-1 items-center flex-wrap">
                            {Object.entries(msg.reactions || {})
                              .filter(([, arr]) => arr.length > 0)
                              .map(([emoji, arr]) => {
                                const reacted = arr.includes(Number(userId));
                                return (
                                  <button
                                    key={emoji}
                                    className={`px-1 rounded text-base sm:text-lg ${reacted ? 'bg-accent-red text-white' : 'bg-zinc-700 text-zinc-200'} hover:bg-zinc-600`}
                                    onClick={() => handleReaction(msg, emoji)}
                                    aria-label={`تفاعل ${emoji}`}
                                  >
                                    {emoji} <span className="text-xs">{arr.length}</span>
                                  </button>
                                );
                              })}
                            {/* Expand/collapse button */}
                            <button
                              className="px-1 rounded text-base sm:text-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                              onClick={() => setExpandedReactions((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                              title={expandedReactions[msg.id] ? 'إخفاء الرموز' : 'إضافة رمز تعبيري'}
                              aria-label="إضافة رمز تعبيري"
                            >
                              {expandedReactions[msg.id] ? '×' : <Plus className="w-4 h-4" />}
                            </button>
                            {/* Expanded emoji picker */}
                            {expandedReactions[msg.id] && (
                              <div className="flex gap-1 ml-2 overflow-x-auto max-w-[60vw] sm:max-w-xs pb-1">
                                {emojiList.map((emoji) => {
                                  if ((msg.reactions?.[emoji]?.length || 0) > 0) return null;
                                  return (
                                    <button
                                      key={emoji}
                                      className="px-1 rounded text-base sm:text-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                                      onClick={() => handleReaction(msg, emoji)}
                                      aria-label={`تفاعل ${emoji}`}
                                    >
                                      {emoji}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          {/* Edit/delete for own messages */}
                          {isSelf && editingMessageId !== msg.id && !msg.deleted && (
                            <>
                              <button
                                className="ml-2 text-zinc-400 hover:text-accent-red"
                                title="تعديل الرسالة"
                                aria-label="تعديل الرسالة"
                                onClick={() => {
                                  setEditingMessageId(msg.id);
                                  setEditContent(msg.content);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                className="ml-2 text-zinc-400 hover:text-red-600"
                                title="حذف الرسالة"
                                aria-label="حذف الرسالة"
                                onClick={() => {
                                  if (!window.confirm('هل أنت متأكد من حذف الرسالة؟')) return;
                                  socket.emit('delete_message', { messageId: msg.id }, (res) => {
                                    if (res?.error) setError(res.error);
                                  });
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <span className="block text-xs text-zinc-500 whitespace-nowrap text-left" style={{ direction: 'ltr' }}>
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                      {isSelf && (
                        <img src={getAvatarUrl(avatarUrl)} alt={userInfo.username} className="w-8 h-8 rounded-full border-2 border-zinc-800 object-cover shadow order-2" title={userInfo.username} />
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Sound notification audio */}
            <audio ref={audioRef} src={notificationSound} preload="auto" />
            {/* Sound mute toggle */}
            <button
              onClick={() => setSoundMuted(!soundMuted)}
              className="absolute left-2 top-2 text-zinc-400 hover:text-accent-red transition-colors z-10"
              title={soundMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
              aria-label={soundMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <form
              className="flex items-center gap-2 px-2 md:px-6 py-4 border-t border-zinc-800 bg-zinc-900 relative"
              onSubmit={e => { e.preventDefault(); handleSend(); }}
            >
              {/* Emoji Picker Button */}
              <button
                type="button"
                className="text-2xl px-2 focus:outline-none text-zinc-400 hover:text-accent-red transition-colors"
                onClick={() => setShowEmojiPicker(v => !v)}
                aria-label="إدراج رمز تعبيري"
                tabIndex={-1}
                disabled={sending}
              >
                😊
              </button>
              {/* Emoji Picker Dropdown */}
              {showEmojiPicker && (
                <div className="absolute left-0 bottom-12 z-30 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-2 w-[90vw] max-w-xs sm:max-w-md max-h-56 overflow-y-auto">
                  <div className="grid grid-cols-8 grid-rows-4 gap-1">
                    {emojiList.map((emoji, idx) => (
                      <button
                        key={emoji + '-' + idx}
                        type="button"
                        className="text-xl sm:text-2xl hover:bg-zinc-700 rounded p-1 min-w-[2.2rem]"
                        onClick={() => insertEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <input
                ref={inputRef}
                className="input-field flex-1 text-base"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !sending && handleSend()}
                placeholder="اكتب رسالة…"
                disabled={sending}
                autoFocus
              />
              <button
                type="submit"
                className="btn-primary px-4 py-2 md:px-6"
                disabled={sending || !newMessage.trim()}
              >
                {sending ? '...' : 'إرسال'}
              </button>
            </form>
            {error && <div className="text-red-500 text-sm px-4 md:px-6 pb-2">{error}</div>}
          </>
        ) : (
          <LoadingOrErrorPlaceholder error errorText="اختر محادثة لعرض الرسائل" />
        )}
      </main>
    </div>
  );
}
