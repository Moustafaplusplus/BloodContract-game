import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '@/hooks/useSocket';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  User, 
  Search, 
  Edit2, 
  Trash2, 
  Plus, 
  Volume2, 
  VolumeX, 
  Star, 
  Shield,
  MessageCircle,
  Send,
  Mail,
  MailOpen,
  Users,
  Crown,
  UserPlus,
  Eye,
  X,
  ImageIcon,
  Smile
} from 'lucide-react';
import notificationSound from '/notification.mp3';
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';
import VipName from '../profile/VipName.jsx';
import '../profile/vipSparkle.css';
import { jwtDecode } from 'jwt-decode';
import { getImageUrl } from '@/utils/imageUtils.js';

export default function Messages() {
  const { socket } = useSocket();
  const { customToken } = useFirebaseAuth();
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
  const [unread, setUnread] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [friends, setFriends] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [soundMuted, setSoundMuted] = useState(false);
  const audioRef = useRef(null);
  
  // Get userId from JWT token
  const userId = customToken ? (() => {
    try {
      const decoded = jwtDecode(customToken);
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
  
  // Game-oriented emoji list
  const emojiList = [
    '😀','😃','😄','😁','😆','😅','😂','🤣','😜','😎','😍','🥳','😏','😇','😱','😡','😭','😢','😤','😈','👿','🤔','😴','🥺','😬','😲','😳','😋','😝','😪','😵','🤯','🥶','🤤',
    '⚔️','🛡️','🏹','🗡️','🪓','🔫','🧨','🦾','🧙‍♂️','🧛‍♂️','🧟‍♂️','🐉','👾','👑','💀','☠️','🦴','🦹‍♂️','🦸‍♂️',
    '💰','💎','🪙','🧪','🧴','🍖','🍗','🍺','🍻','🥤','🍔','🍟','🍕','🍩','🍪','🍫','🍬','🍭','🎁','🎲','🃏','🎮','🕹️','🏆','🥇','🥈','🥉','🎯',
    '✨','🔥','💥','⚡','🌟','🌈','❄️','💧','🌪️','🌊','🌋','🌀','🌙','☀️','🌞','🌚','🌛','🌜','🌠','🪄','🧿',
    '👍','👎','👏','🙌','���','🤝','💪','🫡','🫶','🤙','🤘','🖖','✌️','🤞','👋','🤟','🫂','💔','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💯','🔔','🔊','🔇','🚩','🚀','🛸','🦄','🐺','🐱','🐶','🐲','🦅','🦉','🦇','🐾'
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
    axios.get('/api/messages/inbox', { headers: customToken ? { Authorization: `Bearer ${customToken}` } : {} })
      .then(res => {
        setConversations(res.data);
        const unreadState = {};
        res.data.forEach(conversation => {
          if (conversation.hasUnreadMessages) {
            unreadState[conversation.userId] = true;
          }
        });
        setUnread(unreadState);
        refetchUnreadCount();
        
        // Auto-select user from navigation state
        if (location.state && location.state.userId) {
          const user = res.data.find(u => u.userId === location.state.userId);
          if (user) setSelectedUser(user);
          else if (location.state.username) setSelectedUser({ userId: location.state.userId, username: location.state.username });
        }
      })
      .catch(() => setConversations([]))
      .finally(() => setLoadingInbox(false));
  }, [userId, customToken, location.state]);

  // Real-time socket updates for friendship changes
  useEffect(() => {
    if (!socket || !userId) return;

    const handleFriendshipUpdate = () => {
      axios.get('/api/messages/inbox', { headers: customToken ? { Authorization: `Bearer ${customToken}` } : {} })
        .then(res => {
          setConversations(res.data);
          const unreadState = {};
          res.data.forEach(conversation => {
            if (conversation.hasUnreadMessages) {
              unreadState[conversation.userId] = true;
            }
          });
          setUnread(unreadState);
        })
                  .catch(() => {});
      
      axios.get('/api/friendship/list', { headers: customToken ? { Authorization: `Bearer ${customToken}` } : {} })
        .then(res => setFriends(res.data.map(f => f.id)))
        .catch(() => setFriends([]));
    };

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
  }, [socket, userId, customToken]);

  // Fetch messages for selected user
  useEffect(() => {
    if (selectedUser && userId) {
      setLoadingMessages(true);
      axios.get(`/api/messages/${selectedUser.userId}`, { headers: customToken ? { Authorization: `Bearer ${customToken}` } : {} })
        .then(res => {
          setMessages(res.data);
          const unreadMessages = res.data.filter(msg => 
            msg.senderId === selectedUser.userId && 
            msg.receiverId === userId && 
            !msg.isRead
          );
          
          if (unreadMessages.length > 0) {
            Promise.all(unreadMessages.map(msg => 
              axios.patch(`/api/messages/read/${msg.id}`, {}, { 
                headers: customToken ? { Authorization: `Bearer ${customToken}` } : {} 
              })
            )).then(() => {
              setMessages(prev => prev.map(msg => 
                unreadMessages.some(unread => unread.id === msg.id) 
                  ? { ...msg, isRead: true }
                  : msg
              ));
              refetchUnreadCount();
            }).catch(() => {});
          }
        })
        .catch(() => setMessages([]))
        .finally(() => setLoadingMessages(false));
      setUnread(prev => ({ ...prev, [selectedUser.userId]: false }));
      setSidebarOpen(false);
    }
  }, [selectedUser, userId, customToken]);

  // Fetch friends for 'Add Friend' button logic
  useEffect(() => {
    if (!userId) return;
    
    axios.get('/api/friendship/list', { headers: customToken ? { Authorization: `Bearer ${customToken}` } : {} })
      .then(res => setFriends(res.data.map(f => f.id)))
      .catch(() => setFriends([]));
  }, [userId, customToken]);

  // Fetch user info for badges
  useEffect(() => {
    if (!userId) return;
    
    axios.get('/api/profile').then(res => {
      setUserInfo({
        username: res.data?.username || '',
        avatarUrl: res.data?.avatarUrl || '',
        isAdmin: res.data?.isAdmin || false,
        isVip: res.data?.isVip || false,
      });
    }).catch(() => {
      setUserInfo({ username: '', avatarUrl: '', isAdmin: false, isVip: false });
    });
  }, [userId, customToken]);

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
      await axios.post('/api/friendship/add', { friendId: userId }, { headers: customToken ? { Authorization: `Bearer ${customToken}` } : {} });
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

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      <div className="container mx-auto max-w-6xl p-3 space-y-4">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-gray-800 to-purple-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%233b82f6\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3Ccircle cx=\"20\" cy=\"20\" r=\"2\"/%3E%3Ccircle cx=\"40\" cy=\"40\" r=\"2\"/%3E%3Ccircle cx=\"40\" cy=\"20\" r=\"2\"/%3E%3Ccircle cx=\"20\" cy=\"40\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">الرسائل الخاصة</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">Private Messages</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Mail className="w-4 h-4 text-blue-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-400" />
                  {conversations.length}
                </div>
                <div className="text-xs text-white/80 drop-shadow">محادثة</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="card-3d p-3">
          <div className="flex items-center gap-2 relative">
            <div className="p-1.5 rounded bg-blue-500/20 border border-blue-500/40">
              <Search className="w-4 h-4 text-blue-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handlePlayerSearch}
              placeholder="ابحث عن لاعب..."
              className="input-3d flex-1 text-sm"
            />
            {searching && (
              <div className="text-xs text-white/50">جاري البحث...</div>
            )}
            
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-40 card-3d bg-black/90 border-blood-500/50 mt-1 max-h-64 overflow-y-auto">
                {searchResults.map(u => (
                  <button
                    key={u.id}
                    className="w-full text-right px-4 py-2 hover:bg-blood-500/20 text-white/90 border-b border-white/10 last:border-b-0 text-sm transition-colors"
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
        </div>

        {/* Messages Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
          
          {/* Conversations Sidebar */}
          <div className="card-3d p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-950/40 to-purple-950/40 border-b border-blue-500/30 p-3">
              <h3 className="font-bold text-blue-400 text-sm flex items-center gap-2">
                <MailOpen className="w-4 h-4" />
                المحادثات ({conversations.length})
              </h3>
            </div>
            
            <div className="h-full overflow-y-auto bg-gradient-to-b from-black/40 to-hitman-950/40 custom-scrollbar">
              {loadingInbox ? (
                <div className="p-4">
                  <LoadingOrErrorPlaceholder loading loadingText="جاري تحميل المحادثات..." />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">لا توجد محادثات</p>
                  <p className="text-white/30 text-xs mt-1">ابحث عن لاعب لبدء محادثة</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {conversations.map(user => (
                    <button
                      key={user.userId}
                      className={`w-full text-right px-3 py-3 hover:bg-blue-500/20 transition-all duration-300 flex items-center gap-3 relative ${
                        selectedUser?.userId === user.userId 
                          ? 'bg-blue-500/30 border-r-2 border-blue-400' 
                          : ''
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="relative">
                        {getImageUrl(user.avatarUrl) ? (
                          <img
                            src={getImageUrl(user.avatarUrl)}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/40 shadow-md"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 rounded-full border-2 border-blue-500/40 bg-gradient-to-br from-blue-800/60 to-purple-800/60 flex items-center justify-center shadow-md ${getImageUrl(user.avatarUrl) ? 'hidden' : 'flex'}`}>
                          <User className="w-5 h-5 text-blue-400" />
                        </div>
                        
                        {/* Unread indicator */}
                        {unread[user.userId] && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blood-500 rounded-full border border-black animate-pulse"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">
                          <VipName user={user} />
                        </div>
                        <div className="text-xs text-white/50">
                          {user.isVip && <Crown className="w-3 h-3 inline mr-1" />}
                          {user.isAdmin && <Shield className="w-3 h-3 inline mr-1" />}
                          لاعب
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2 card-3d p-0 overflow-hidden">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-purple-950/40 to-blue-950/40 border-b border-purple-500/30 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      {getImageUrl(selectedUser.avatarUrl) ? (
                        <img
                          src={getImageUrl(selectedUser.avatarUrl)}
                          alt="avatar"
                          className="w-8 h-8 rounded-full object-cover border-2 border-purple-500/40"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-8 h-8 rounded-full border-2 border-purple-500/40 bg-gradient-to-br from-purple-800/60 to-blue-800/60 flex items-center justify-center ${getImageUrl(selectedUser.avatarUrl) ? 'hidden' : 'flex'}`}>
                        <User className="w-4 h-4 text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-purple-400 text-sm">
                        <VipName user={selectedUser} />
                      </div>
                      <div className="text-xs text-white/50">محادثة خاصة</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSoundMuted(!soundMuted)}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        soundMuted 
                          ? 'bg-red-500/20 border border-red-500/40 text-red-400' 
                          : 'bg-green-500/20 border border-green-500/40 text-green-400'
                      }`}
                      title={soundMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
                    >
                      {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    
                    {selectedUser.userId && !friends.includes(selectedUser.userId) && (
                      <button
                        className="btn-3d-secondary text-xs px-3 py-1 flex items-center gap-1"
                        onClick={() => handleAddFriend(selectedUser.userId)}
                      >
                        <UserPlus className="w-3 h-3" />
                        إضافة صديق
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages Area */}
                <div
                  ref={messagesContainerRef}
                  className="h-96 overflow-y-auto px-4 py-3 bg-gradient-to-b from-black/40 to-hitman-950/40 space-y-2 custom-scrollbar"
                >
                  {loadingMore && (
                    <div className="text-center text-xs text-white/50 mb-2">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-3 h-3 border border-purple-500/50 border-t-purple-500 rounded-full animate-spin"></div>
                        جاري تحميل المزيد...
                      </div>
                    </div>
                  )}
                  
                  {loadingMessages ? (
                    <div className="h-full flex items-center justify-center">
                      <LoadingOrErrorPlaceholder loading loadingText="جاري تحميل المحادثة..." />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-3" />
                        <p className="text-white/50 text-sm">لا توجد رسائل بعد</p>
                        <p className="text-white/30 text-xs mt-1">ابدأ محادثة جديدة!</p>
                      </div>
                    </div>
                  ) : (
                    messages.slice(-visibleCount).map(msg => {
                      const isSelf = msg.senderId == userId;
                      const avatarUrl = isSelf ? userInfo.avatarUrl : selectedUser.avatarUrl;
                      const isAdmin = isSelf ? userInfo.isAdmin : selectedUser.isAdmin;
                      const isVip = isSelf ? userInfo.isVip : selectedUser.isVip;
                      
                      return (
                        <div key={msg.id} className={`flex w-full items-end gap-2 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                          {/* Avatar for others */}
                          {!isSelf && (
                            <div className="relative flex-shrink-0">
                              {getImageUrl(avatarUrl) ? (
                                <img
                                  src={getImageUrl(avatarUrl)}
                                  alt={selectedUser.username}
                                  className="w-8 h-8 rounded-full border-2 border-purple-500/40 object-cover shadow-md"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`w-8 h-8 rounded-full border-2 border-purple-500/40 bg-gradient-to-br from-purple-800/60 to-blue-800/60 flex items-center justify-center shadow-md ${getImageUrl(avatarUrl) ? 'hidden' : 'flex'}`}>
                                <User className="w-4 h-4 text-purple-400" />
                              </div>
                              
                              {/* Admin/VIP badges */}
                              {(isAdmin || isVip) && (
                                <div className="absolute -top-1 -right-1 flex gap-0.5">
                                  {isAdmin && (
                                    <div className="w-3 h-3 bg-blood-600 rounded-full flex items-center justify-center border border-blood-400">
                                      <Shield className="w-2 h-2 text-white" />
                                    </div>
                                  )}
                                  {isVip && (
                                    <div className="w-3 h-3 bg-yellow-600 rounded-full flex items-center justify-center border border-yellow-400">
                                      <Crown className="w-2 h-2 text-white" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Message Bubble */}
                          <div className={`max-w-[75%] px-3 py-2 rounded-xl shadow-md ${
                            isSelf 
                              ? 'bg-gradient-to-r from-blue-600/60 to-purple-600/40 border border-blue-500/40 text-blue-100'
                              : 'bg-gradient-to-r from-hitman-800/60 to-dark-800/40 border border-white/20 text-white'
                          }`}>
                            {/* Username for others */}
                            {!isSelf && (
                              <div className="flex items-center gap-1 mb-1">
                                <VipName user={selectedUser} className="compact" />
                                {isAdmin && <Shield className="w-3 h-3 text-blood-400" />}
                                {isVip && <Crown className="w-3 h-3 text-yellow-400" />}
                              </div>
                            )}
                            
                            {/* Message Content */}
                            {editingMessageId === msg.id ? (
                              <div className="flex items-center gap-2 mb-2">
                                <input
                                  className="input-3d text-xs flex-1"
                                  value={editContent}
                                  onChange={e => setEditContent(e.target.value)}
                                  maxLength={500}
                                  autoFocus
                                />
                                <button
                                  className="btn-3d text-xs px-2 py-1"
                                  onClick={() => {
                                    if (!editContent.trim()) return;
                                    socket.emit('edit_message', { messageId: msg.id, newContent: editContent.trim() }, (res) => {
                                      if (res?.error) setError(res.error);
                                      setEditingMessageId(null);
                                    });
                                  }}
                                >
                                  حفظ
                                </button>
                                <button
                                  className="btn-3d-secondary text-xs px-2 py-1"
                                  onClick={() => setEditingMessageId(null)}
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <div className="text-sm break-words">
                                {msg.content}
                                {msg.edited && (
                                  <span className="text-xs text-white/50 mr-2">(معدل)</span>
                                )}
                              </div>
                            )}
                            
                            {/* Emoji Reactions */}
                            <div className="flex gap-1 items-center flex-wrap mt-2">
                              {Object.entries(msg.reactions || {})
                                .filter(([, arr]) => arr.length > 0)
                                .map(([emoji, arr]) => {
                                  const reacted = arr.includes(Number(userId));
                                  return (
                                    <button
                                      key={emoji}
                                      className={`px-2 py-0.5 rounded-full text-xs transition-all duration-300 ${
                                        reacted 
                                          ? 'bg-blood-500/40 border border-blood-500/60 text-blood-300' 
                                          : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/20'
                                      }`}
                                      onClick={() => handleReaction(msg, emoji)}
                                    >
                                      {emoji} {arr.length}
                                    </button>
                                  );
                                })}
                              
                              {/* Reaction picker toggle */}
                              <button
                                className="p-1 rounded-full bg-white/10 border border-white/20 text-white/50 hover:bg-white/20 hover:text-white/70 transition-all duration-300"
                                onClick={() =>
                                  setExpandedReactions((prev) => ({
                                    ...prev,
                                    [msg.id]: !prev[msg.id],
                                  }))
                                }
                              >
                                {expandedReactions[msg.id] ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                              </button>
                              
                              {/* Quick reaction picker */}
                              {expandedReactions[msg.id] && (
                                <div className="flex gap-1 bg-black/60 border border-white/20 rounded-lg p-1">
                                  {['👍', '😂', '🔥', '❤️', '😮', '😢'].map((emoji) => {
                                    if ((msg.reactions?.[emoji]?.length || 0) > 0) return null;
                                    return (
                                      <button
                                        key={emoji}
                                        className="p-1 rounded hover:bg-white/20 transition-colors"
                                        onClick={() => {
                                          handleReaction(msg, emoji);
                                          setExpandedReactions((prev) => ({ ...prev, [msg.id]: false }));
                                        }}
                                      >
                                        {emoji}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            
                            {/* Message Actions */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                {/* Edit button for own messages */}
                                {isSelf && editingMessageId !== msg.id && !msg.deleted && (
                                  <button
                                    className="p-1 rounded text-white/50 hover:text-yellow-400 transition-colors"
                                    title="تعديل الرسالة"
                                    onClick={() => {
                                      setEditingMessageId(msg.id);
                                      setEditContent(msg.content);
                                    }}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                )}
                                
                                {/* Delete button for own messages */}
                                {isSelf && editingMessageId !== msg.id && !msg.deleted && (
                                  <button
                                    className="p-1 rounded text-white/50 hover:text-red-400 transition-colors"
                                    title="حذف الرسالة"
                                    onClick={() => {
                                      if (!window.confirm('هل أنت متأكد من حذف الرسالة؟')) return;
                                      socket.emit('delete_message', { messageId: msg.id }, (res) => {
                                        if (res?.error) setError(res.error);
                                      });
                                    }}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                              
                              {/* Timestamp */}
                              <span className="text-xs text-white/40">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          {/* Avatar for self */}
                          {isSelf && (
                            <div className="relative flex-shrink-0">
                              {getImageUrl(avatarUrl) ? (
                                <img
                                  src={getImageUrl(avatarUrl)}
                                  alt={userInfo.username}
                                  className="w-8 h-8 rounded-full border-2 border-blue-500/40 object-cover shadow-md"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`w-8 h-8 rounded-full border-2 border-blue-500/40 bg-gradient-to-br from-blue-800/60 to-purple-800/60 flex items-center justify-center shadow-md ${getImageUrl(avatarUrl) ? 'hidden' : 'flex'}`}>
                                <User className="w-4 h-4 text-blue-400" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="bg-gradient-to-r from-hitman-900/60 to-dark-900/60 border-t border-purple-500/30 p-3">
                  <div className="flex items-end gap-2">
                    <div className="relative flex-1">
                      <input
                        ref={inputRef}
                        className="input-3d text-sm"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !sending && handleSend()}
                        placeholder="اكتب رسالة..."
                        disabled={sending}
                        autoFocus
                      />
                      
                      {/* Emoji Picker Button */}
                      <button
                        type="button"
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 transition-colors"
                        onClick={() => setShowEmojiPicker(v => !v)}
                        title="إدراج رمز تعبيري"
                        disabled={sending}
                      >
                        <Smile className="w-4 h-4 text-white/60 hover:text-yellow-400" />
                      </button>
                      
                      {/* Emoji Picker Dropdown */}
                      {showEmojiPicker && (
                        <div className="absolute left-0 bottom-12 z-10 card-3d bg-black/90 border-purple-500/50 p-3 w-80 max-h-64 overflow-y-auto">
                          <div className="grid grid-cols-8 gap-1">
                            {emojiList.map((emoji, idx) => (
                              <button
                                key={emoji + '-' + idx}
                                type="button"
                                className="text-lg hover:bg-white/20 rounded p-1 transition-colors"
                                onClick={() => insertEmoji(emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={handleSend}
                      disabled={sending || !newMessage.trim()}
                      className="btn-3d px-4 py-2 flex items-center gap-2 text-sm"
                    >
                      <Send className="w-4 h-4" />
                      {sending ? 'جاري الإرسال...' : 'إرسال'}
                    </button>
                  </div>
                  
                  {error && (
                    <div className="text-red-400 text-sm mt-2">{error}</div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center bg-gradient-to-b from-black/40 to-hitman-950/40">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/50 text-lg mb-2">اختر محادثة</p>
                  <p className="text-white/30 text-sm">ابحث عن لاعب أو اختر محادثة موجودة</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sound notification audio */}
      <audio ref={audioRef} src={notificationSound} preload="auto" />
    </div>
  );
}
