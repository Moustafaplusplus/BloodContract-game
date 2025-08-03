import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  MessageCircle, 
  Send, 
  Volume2, 
  VolumeX, 
  Edit2, 
  Trash2, 
  UserX, 
  UserMinus, 
  Ban, 
  Shield, 
  Star,
  Users,
  ImageIcon,
  Smile,
  MessageSquare,
  Globe,
  Crown,
  Heart,
  ThumbsUp,
  Plus,
  X,
  User,
  UserPlus,
  Eye
} from 'lucide-react';
import notificationSound from '/notification.mp3';
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';
import VipName from '../profile/VipName.jsx';
import '../profile/vipSparkle.css';

import { getImageUrl } from '@/utils/imageUtils.js';

export default function GlobalChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { customToken } = useFirebaseAuth();
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  // User ID is handled by the backend through Firebase authentication
  const userId = customToken ? 'authenticated' : null;
  
  const audioRef = useRef(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);

  // Fetch user info for optimistic messages
  const [userInfo, setUserInfo] = useState({ username: '', avatarUrl: '', isAdmin: false, isVip: false });
  // Mention autocomplete state
  const [mentionDropdown, setMentionDropdown] = useState(false);
  const [mentionOptions, setMentionOptions] = useState([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  
  useEffect(() => {
    // Fetch user info from /api/profile for optimistic messages (safer than /api/character)
    const fetchUserInfo = async () => {
      try {
        const res = await axios.get('/api/profile');
        setUserInfo({
          username: res.data?.username || '',
          avatarUrl: res.data?.avatarUrl || '',
          isAdmin: res.data?.isAdmin || false,
          isVip: res.data?.isVip || false,
        });
      } catch {
        setUserInfo({ username: '', avatarUrl: '', isAdmin: false, isVip: false });
      }
    };
    if (userId) fetchUserInfo();
  }, [userId]);

  // Fetch recent messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('/api/global-chat/messages?limit=50');
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        toast.error('فشل في تحميل الرسائل');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // --- Robust Socket Event Listener Setup ---
  useEffect(() => {
    if (!socket) return;

    // --- Handler for connect event ---
    const handleConnect = () => {
      socket.emit('join_global_chat');
    };
    // --- Handler for disconnect event ---
    const handleDisconnect = (reason) => {
      
      toast.error('تم قطع الاتصال بالدردشة العامة. سيتم إعادة المحاولة تلقائيًا.');
    };

    // --- Message/event handlers ---
    const handleGlobalMessage = (message) => {
      setMessages(prev => {
        const idx = prev.findIndex(m => m.id === message.id);
        if (idx !== -1) {
          // Update existing message (edit)
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...message };
          return updated;
        } else {
          // Add new message
          return [...prev, message];
        }
      });
      // Only play sound for messages from other users
      if (!soundMuted && userInteracted && message.userId?.toString() !== userId) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      }
    };
    const handleGlobalMessageError = (error) => {
      toast.error(error.error || 'فشل في إرسال الرسالة');
      setSending(false);
    };
    const handleGlobalMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    };
    const handleMuted = ({ until }) => {
      setIsMuted(true);
      toast.error(`تم كتمك في الدردشة حتى ${new Date(until).toLocaleTimeString('ar-SA')}`);
    };
    const handleBanned = ({ until }) => {
      setIsMuted(true);
      toast.error(`تم حظرك من الدردشة حتى ${new Date(until).toLocaleTimeString('ar-SA')}`);
    };
    const handleKicked = () => {
      toast.error('تم طردك من الدردشة العامة');
      setTimeout(() => window.location.reload(), 1500);
    };
    // Handle chat cleared event
    const handleGlobalChatCleared = () => {
      setMessages([]);
      toast.info('تم مسح جميع رسائل الدردشة العامة');
    };

    // --- Attach listeners (always after connect) ---
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('global_message', handleGlobalMessage);
    socket.on('global_message_error', handleGlobalMessageError);
    socket.on('global_message_deleted', handleGlobalMessageDeleted);
    socket.on('muted', handleMuted);
    socket.on('banned', handleBanned);
    socket.on('kicked', handleKicked);
    socket.on('global_chat_cleared', handleGlobalChatCleared);

    // If already connected, emit join_global_chat immediately
    if (socket.connected) {
      handleConnect();
    }

    // --- Cleanup listeners on unmount or socket change ---
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('global_message', handleGlobalMessage);
      socket.off('global_message_error', handleGlobalMessageError);
      socket.off('global_message_deleted', handleGlobalMessageDeleted);
      socket.off('muted', handleMuted);
      socket.off('banned', handleBanned);
      socket.off('kicked', handleKicked);
      socket.off('global_chat_cleared', handleGlobalChatCleared);
      socket.emit('leave_global_chat');
    };
  }, [socket, userInteracted, soundMuted, userId]);

  // Listen for online_count event
  useEffect(() => {
    if (!socket) return;
    const handleOnlineCount = ({ count }) => setOnlineCount(count);
    socket.on('online_count', handleOnlineCount);
    // Request current count on mount
    socket.emit('get_online_count');
    return () => {
      socket.off('online_count', handleOnlineCount);
    };
  }, [socket]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    setUserInteracted(true);
    if (!newMessage.trim() || sending || isMuted) return;
    setSending(true);
    try {
      socket.emit('send_global_message', { content: newMessage.trim() });
      setNewMessage('');
    } catch (error) {
      console.error('[Global Chat] Error sending message:', error);
      toast.error('فشل في إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e) => {
    // Mention dropdown navigation
    if (mentionDropdown) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex((i) => (i + 1) % mentionOptions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex((i) => (i - 1 + mentionOptions.length) % mentionOptions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (mentionOptions[mentionIndex]) {
          insertMention(mentionOptions[mentionIndex]);
        }
        return;
      }
      if (e.key === 'Escape') {
        setMentionDropdown(false);
        return;
      }
    }
    // Normal send
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Mention detection in textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const before = newMessage.slice(0, pos);
    // Detect @mention
    const match = before.match(/@([\w\u0600-\u06FF]*)$/);
    if (match) {
      const query = match[1] || '';
      // Collect unique usernames from messages and self
      const usernames = Array.from(new Set([
        ...messages.map(m => (m.User?.username || m.username)).filter(Boolean),
        userInfo.username
      ])).filter(Boolean);
      // Filter by query
      const filtered = usernames.filter(u => u.toLowerCase().startsWith(query.toLowerCase()) && u !== '');
      if (filtered.length > 0) {
        setMentionOptions(filtered);
        setMentionDropdown(true);
        setMentionIndex(0);
        return;
      }
    }
    setMentionDropdown(false);
  }, [newMessage, messages, userInfo.username]);

  // Format timestamp (show date if not today)
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

  // Parse message content for @mentions and wrap them
  const parseMentions = (content) => {
    if (!content) return null;
    const mentionRegex = /@([\w\u0600-\u06FF]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      const start = match.index;
      const end = mentionRegex.lastIndex;
      if (start > lastIndex) {
        parts.push(content.slice(lastIndex, start));
      }
      parts.push(
        <span key={start} className="text-blood-400 font-bold">@{match[1]}</span>
      );
      lastIndex = end;
    }
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
    return parts.length > 0 ? parts : content;
  };

  // Get message styling based on type
  const getMessageStyle = (message) => {
    const isSelf = message.userId?.toString() === userId;
    let highlight = false;
    if (
      message.messageType === 'GLOBAL' &&
      userInfo.username &&
      message.content &&
      message.content.includes('@' + userInfo.username)
    ) {
      highlight = true;
    }
    if (message.messageType === 'SYSTEM') {
      return 'mx-auto my-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-950/40 to-amber-950/30 border border-yellow-500/50 text-yellow-300 text-center text-sm font-bold w-fit max-w-[90%] shadow-md';
    }
    if (message.messageType === 'ANNOUNCEMENT') {
      return 'mx-auto my-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blood-950/40 to-red-950/30 border border-blood-500/50 text-blood-300 text-center text-sm font-bold w-fit max-w-[90%] shadow-md';
    }
    if (isSelf) {
      return `ml-auto my-2 px-3 py-2 rounded-xl bg-gradient-to-r from-green-950/60 to-emerald-950/40 border border-green-500/40 text-green-100 max-w-[80%] shadow-md ${highlight ? 'ring-2 ring-blood-500 ring-offset-2 ring-offset-black' : ''}`;
    }
    return `mr-auto my-2 px-3 py-2 rounded-xl bg-gradient-to-r from-hitman-800/60 to-dark-800/40 border border-white/20 text-white max-w-[80%] shadow-md ${highlight ? 'ring-2 ring-blood-500 ring-offset-2 ring-offset-black' : ''}`;
  };

  const [expandedReactions, setExpandedReactions] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Game-oriented emoji selection
  const emojiList = [
    '😀','😃','😄','😁','😆','😅','😂','🤣','😜','😎','😍','🥳','😏','😇','😱','😡','😭','😢','😤','😈','👿','🤔','😴','🥺','😬','😲','😳','😋','😝','😪','😵','🤯','🥶','🥵',
    '⚔️','🛡️','🏹','🗡️','🪓','🔫','🧨','🦾','🧙‍♂️','🧛‍♂️','🧟‍♂️','🐉','👾','👑','💀','☠️','🦴','🦹‍♂️','🦸‍♂️',
    '💰','💎','🪙','🧪','🧴','🍖','🍗','🍺','🍻','🥤','🍔','🍟','🍕','🍩','🍪','🍫','🍬','🍭','🎁','🎲','🃏','🎮','🕹️','🏆','🥇','🥈','🥉','🎯',
    '✨','🔥','💥','⚡','🌟','🌈','❄️','💧','🌪️','🌊','🌋','🌀','🌙','☀️','🌞','🌚','🌛','🌜','🌠','🪄','🧿',
    '👍','👎','👏','🙌','🙏','🤝','💪','🫡','🫶','🤙','🤘','🖖','✌️','🤞','👋','🤟','🫂','💔','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💯','🔔','🔊','🔇','🚩','🚀','🛸','🦄','🐺','🐱','🐶','🐲','🦅','🦉','🦇','🐾'
  ];
  
  const textareaRef = useRef(null);
  
  // Insert emoji at cursor position
  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = newMessage.slice(0, start);
    const after = newMessage.slice(end);
    const updated = before + emoji + after;
    setNewMessage(updated);
    setShowEmojiPicker(false);
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    }, 0);
  };
  
  // Insert mention at cursor position
  const insertMention = (username) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = newMessage.slice(0, start).replace(/@([\w\u0600-\u06FF]*)$/, '');
    const after = newMessage.slice(end);
    const updated = before + '@' + username + ' ' + after;
    setNewMessage(updated);
    setMentionDropdown(false);
    setTimeout(() => {
      textarea.focus();
      const pos = (before + '@' + username + ' ').length;
      textarea.selectionStart = textarea.selectionEnd = pos;
    }, 0);
  };
  
  // Infinite scroll state
  const INITIAL_VISIBLE = 30;
  const LOAD_MORE_COUNT = 20;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [loadingMore, setLoadingMore] = useState(false);
  const messagesContainerRef = useRef(null);

  // Reset visibleCount when messages are cleared or reloaded
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [messages.length]);

  // Infinite scroll handler
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

  // Preserve scroll position when loading more
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

  // Add friend handler
  const handleAddFriend = async (userId) => {
    try {
      await axios.post('/api/friendship/add', { friendId: userId });
      toast.success('تم إرسال طلب الصداقة');
      setUserMenu({ open: false, anchor: null, user: null });
    } catch {
      toast.error('تعذر إرسال طلب الصداقة');
    }
  };
  
  // User options menu state
  const [userMenu, setUserMenu] = useState({ open: false, anchor: null, user: null });
  const navigate = useNavigate();

  if (loading) {
    return <LoadingOrErrorPlaceholder loading loadingText="جاري تحميل الرسائل..." />;
  }

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      <div className="container mx-auto max-w-6xl p-3 space-y-4">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-900 via-gray-800 to-blue-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%2323c55e\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3Ccircle cx=\"20\" cy=\"30\" r=\"3\"/%3E%3Ccircle cx=\"40\" cy=\"30\" r=\"3\"/%3E%3Ccircle cx=\"30\" cy=\"20\" r=\"2\"/%3E%3Ccircle cx=\"30\" cy=\"40\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">الدردشة العامة</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">Global Chat</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Globe className="w-4 h-4 text-green-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg flex items-center gap-1">
                  <Users className="w-4 h-4 text-green-400" />
                  {onlineCount}
                </div>
                <div className="text-xs text-white/80 drop-shadow">متصل الآن</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="card-3d bg-black/80 backdrop-blur-sm p-0 overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blood-950/40 to-dark-950/40 border-b border-blood-500/30">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-blood-500/20 border border-blood-500/40">
                <MessageSquare className="w-4 h-4 text-blood-400" />
              </div>
              <h3 className="font-bold text-blood-400 text-sm">الدردشة المباشرة</h3>
              <div className="badge-3d text-xs">
                {onlineCount} متصل
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
              
              {userInfo.isAdmin && (
                <button
                  className="btn-3d-secondary text-xs px-3 py-1 flex items-center gap-1"
                  title="مسح جميع رسائل الدردشة العامة"
                  onClick={() => {
                    if (window.confirm('هل أنت متأكد أنك تريد مسح جميع رسائل الدردشة العامة؟ لا يمكن التراجع عن هذا الإجراء.')) {
                      socket.emit('clear_global_chat', {}, (res) => {
                        if (res?.error) toast.error(res.error);
                        else toast.success('تم مسح جميع الرسائل بنجاح');
                      });
                    }
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                  مسح الكل
                </button>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={messagesContainerRef}
            className="h-96 overflow-y-auto px-4 py-3 bg-gradient-to-b from-black/40 to-hitman-950/40 space-y-2 custom-scrollbar"
          >
            {/* Loading more indicator */}
            {loadingMore && (
              <div className="text-center text-xs text-white/50 mb-2">
                <div className="inline-flex items-center gap-2">
                  <div className="w-3 h-3 border border-blood-500/50 border-t-blood-500 rounded-full animate-spin"></div>
                  جاري تحميل المزيد...
                </div>
              </div>
            )}
            
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/50 text-sm">لا توجد رسائل بعد</p>
                  <p className="text-white/30 text-xs mt-1">كن أول من يرسل رسالة!</p>
                </div>
              </div>
            ) : (
              messages.slice(-visibleCount).map((message) => {
                const user = message.User || message;
                let avatarUrl = user.avatarUrl || '';
                const isAdmin = user.isAdmin;
                const isVip = user.isVip;
                const isSelf = message.userId?.toString() === userId;
                
                // System/announcement messages
                if (message.messageType !== 'GLOBAL') {
                  return (
                    <div key={message.id} className={getMessageStyle(message)}>
                      {parseMentions(message.content)}
                    </div>
                  );
                }
                
                // Chat message bubble
                return (
                  <div key={message.id} className={`flex w-full items-end gap-2 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                    {/* Avatar for others */}
                    {!isSelf && (
                      <div className="relative flex-shrink-0">
                        {avatarUrl ? (
                          <img
                            src={getImageUrl(avatarUrl)}
                            alt={user.username}
                            className="w-8 h-8 rounded-full border-2 border-blood-500/40 object-cover shadow-md"
                            title={user.username}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-8 h-8 rounded-full border-2 border-blood-500/40 bg-gradient-to-br from-blood-800/60 to-hitman-800/60 flex items-center justify-center shadow-md ${avatarUrl ? 'hidden' : 'flex'}`}>
                          <User className="w-4 h-4 text-blood-400" />
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
                    
                    {/* Message Content */}
                    <div className={getMessageStyle(message) + ' max-w-[75%]'}>
                      {/* Username for others */}
                      {!isSelf && (
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            className="font-semibold text-blood-400 hover:text-blood-300 transition-colors text-xs flex items-center gap-1"
                            onClick={e => setUserMenu({ 
                              open: true, 
                              anchor: e.target, 
                              user: { 
                                userId: message.userId, 
                                username: message.username, 
                                displayName: message.displayName, 
                                isVip: message.isVip, 
                                isAdmin: message.isAdmin 
                              } 
                            })}
                          >
                            <VipName 
                              user={{ 
                                username: message.username, 
                                displayName: message.displayName, 
                                vipExpiresAt: message.vipExpiresAt 
                              }} 
                              className="compact" 
                              disableLink={true} 
                            />
                          </button>
                        </div>
                      )}
                      
                      {/* Message Text or Edit Input */}
                      {editingMessageId === message.id ? (
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
                              socket.emit('edit_global_message', { messageId: message.id, newContent: editContent.trim() }, (res) => {
                                if (res?.error) toast.error(res.error);
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
                          {parseMentions(message.content)}
                          {message.edited && (
                            <span className="text-xs text-white/50 mr-2">(معدل)</span>
                          )}
                        </div>
                      )}
                      
                      {/* Emoji Reactions */}
                      <div className="flex gap-1 items-center flex-wrap mt-2">
                        {Object.entries(message.reactions || {})
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
                                onClick={() => {
                                  if (!socket) return;
                                  if (reacted) {
                                    socket.emit('remove_reaction', { messageId: message.id, emoji });
                                  } else {
                                    socket.emit('add_reaction', { messageId: message.id, emoji });
                                  }
                                }}
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
                              [message.id]: !prev[message.id],
                            }))
                          }
                          title={expandedReactions[message.id] ? 'إخفاء الرموز' : 'إضافة رمز تعبيري'}
                        >
                          {expandedReactions[message.id] ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        </button>
                        
                        {/* Quick reaction picker */}
                        {expandedReactions[message.id] && (
                          <div className="flex gap-1 bg-black/60 border border-white/20 rounded-lg p-1">
                            {['👍', '😂', '🔥', '❤️', '😮', '😢'].map((emoji) => {
                              if ((message.reactions?.[emoji]?.length || 0) > 0) return null;
                              return (
                                <button
                                  key={emoji}
                                  className="p-1 rounded hover:bg-white/20 transition-colors"
                                  onClick={() => {
                                    if (!socket) return;
                                    socket.emit('add_reaction', { messageId: message.id, emoji });
                                    setExpandedReactions((prev) => ({ ...prev, [message.id]: false }));
                                  }}
                                >
                                  {emoji}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          {/* Edit button for own messages */}
                          {isSelf && editingMessageId !== message.id && (
                            <button
                              className="p-1 rounded text-white/50 hover:text-yellow-400 transition-colors"
                              title="تعديل الرسالة"
                              onClick={() => {
                                setEditingMessageId(message.id);
                                setEditContent(message.content);
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                          
                          {/* Admin moderation controls */}
                          {userInfo.isAdmin && !isSelf && (
                            <>
                              <button
                                className="p-1 rounded text-white/50 hover:text-yellow-400 transition-colors"
                                title="كتم المستخدم"
                                onClick={() => {
                                  const duration = prompt('كم دقيقة تريد كتم المستخدم؟', '10');
                                  if (!duration) return;
                                  socket.emit('mute_user', { targetUserId: message.userId, durationMinutes: parseInt(duration) }, (res) => {
                                    if (res?.error) toast.error(res.error);
                                    else toast.success('تم كتم المستخدم');
                                  });
                                }}
                              >
                                <UserMinus className="w-3 h-3" />
                              </button>
                              <button
                                className="p-1 rounded text-white/50 hover:text-blue-400 transition-colors"
                                title="طرد المستخدم"
                                onClick={() => {
                                  if (!window.confirm('هل أنت متأكد من طرد المستخدم من الدردشة؟')) return;
                                  socket.emit('kick_user', { targetUserId: message.userId }, (res) => {
                                    if (res?.error) toast.error(res.error);
                                    else toast.success('تم طرد المستخدم');
                                  });
                                }}
                              >
                                <UserX className="w-3 h-3" />
                              </button>
                              <button
                                className="p-1 rounded text-white/50 hover:text-red-400 transition-colors"
                                title="حظر المستخدم من الدردشة"
                                onClick={() => {
                                  const duration = prompt('كم دقيقة تريد حظر المستخدم؟', '60');
                                  if (!duration) return;
                                  socket.emit('ban_user', { targetUserId: message.userId, durationMinutes: parseInt(duration) }, (res) => {
                                    if (res?.error) toast.error(res.error);
                                    else toast.success('تم حظر المستخدم');
                                  });
                                }}
                              >
                                <Ban className="w-3 h-3" />
                              </button>
                              <button
                                className="p-1 rounded text-white/50 hover:text-red-600 transition-colors"
                                title="حذف الرسالة"
                                onClick={() => {
                                  if (!window.confirm('هل أنت متأكد من حذف الرسالة؟')) return;
                                  socket.emit('delete_global_message', { messageId: message.id }, (res) => {
                                    if (res?.error) toast.error(res.error);
                                    else toast.success('تم حذف الرسالة');
                                  });
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                        
                        {/* Timestamp */}
                        <span className="text-xs text-white/40">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Avatar for self */}
                    {isSelf && (
                      <div className="relative flex-shrink-0">
                        {avatarUrl ? (
                          <img
                            src={getImageUrl(avatarUrl)}
                            alt={user.username}
                            className="w-8 h-8 rounded-full border-2 border-green-500/40 object-cover shadow-md"
                            title={user.username}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-8 h-8 rounded-full border-2 border-green-500/40 bg-gradient-to-br from-green-800/60 to-emerald-800/60 flex items-center justify-center shadow-md ${avatarUrl ? 'hidden' : 'flex'}`}>
                          <User className="w-4 h-4 text-green-400" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            
            {/* User Options Menu */}
            {userMenu.open && userMenu.user && (
              <div
                className="fixed z-50 card-3d bg-black/90 border-blood-500/50 p-3 min-w-[160px] space-y-2"
                style={{
                  top: userMenu.anchor?.getBoundingClientRect().bottom + window.scrollY + 8,
                  left: userMenu.anchor?.getBoundingClientRect().left + window.scrollX - 120,
                }}
                onMouseLeave={() => setUserMenu({ open: false, anchor: null, user: null })}
              >
                <button
                  className="btn-3d-secondary w-full text-xs py-2 flex items-center gap-2"
                  onClick={() => {
                    navigate('/dashboard/messages', { state: { userId: userMenu.user.userId, username: userMenu.user.username } });
                    setUserMenu({ open: false, anchor: null, user: null });
                  }}
                >
                  <MessageCircle className="w-3 h-3" />
                  رسالة خاصة
                </button>
                <button
                  className="btn-3d-secondary w-full text-xs py-2 flex items-center gap-2"
                  onClick={() => {
                    navigate(`/dashboard/profile/${userMenu.user.username}`);
                    setUserMenu({ open: false, anchor: null, user: null });
                  }}
                >
                  <Eye className="w-3 h-3" />
                  الملف الشخصي
                </button>
                <button
                  className="btn-3d-secondary w-full text-xs py-2 flex items-center gap-2"
                  onClick={() => handleAddFriend(userMenu.user.userId)}
                >
                  <UserPlus className="w-3 h-3" />
                  إضافة صديق
                </button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 bg-gradient-to-r from-hitman-900/60 to-dark-900/60 border-t border-blood-500/30">
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setUserInteracted(true)}
                  placeholder={isMuted ? "أنت مكتوم من الدردشة" : "اكتب رسالة..."}
                  className="input-3d resize-none text-sm"
                  rows={2}
                  maxLength={500}
                  disabled={sending || isMuted}
                />
                
                {/* Mention Autocomplete Dropdown */}
                {mentionDropdown && mentionOptions.length > 0 && (
                  <div className="absolute left-0 bottom-14 z-20 card-3d bg-black/90 border-blood-500/50 w-48 max-h-40 overflow-y-auto">
                    {mentionOptions.map((u, i) => (
                      <div
                        key={u}
                        className={`px-3 py-2 cursor-pointer text-xs transition-colors ${
                          i === mentionIndex 
                            ? 'bg-blood-500/40 text-blood-300' 
                            : 'text-white/70 hover:bg-blood-500/20'
                        }`}
                        onMouseDown={e => { e.preventDefault(); insertMention(u); }}
                      >
                        @{u}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Emoji Picker Button */}
                <button
                  type="button"
                  className="absolute left-2 bottom-2 p-1 rounded hover:bg-white/10 transition-colors"
                  onClick={() => setShowEmojiPicker((v) => !v)}
                  title="إدراج رمز تعبيري"
                  disabled={sending || isMuted}
                >
                  <Smile className="w-4 h-4 text-white/60 hover:text-yellow-400" />
                </button>
                
                {/* Emoji Picker Dropdown */}
                {showEmojiPicker && (
                  <div className="absolute left-0 bottom-12 z-10 card-3d bg-black/90 border-blood-500/50 p-3 w-80 max-h-64 overflow-y-auto">
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
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim() || isMuted}
                className="btn-3d px-4 py-2 flex items-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                {sending ? 'جاري الإرسال...' : 'إرسال'}
              </button>
            </div>
            
            <div className="text-xs text-white/50 mt-2 text-center">
              اضغط Enter للإرسال، Shift+Enter للسطر الجديد
            </div>
          </div>
        </div>
      </div>
      
      <audio ref={audioRef} src={notificationSound} preload="auto" />
    </div>
  );
}
