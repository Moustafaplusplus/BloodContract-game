import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

import axios from 'axios';
import { toast } from 'react-toastify';
import { MessageCircle, Send, Volume2, VolumeX, Edit2, Trash2, UserX, UserMinus, Ban } from 'lucide-react';
import { Shield, Star } from 'lucide-react';
import notificationSound from '/notification.mp3'; // Place a notification.mp3 in public/
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';
import VipName from '../profile/VipName.jsx';
import '../profile/vipSparkle.css';
import { jwtDecode } from 'jwt-decode';

export default function GlobalChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const messagesEndRef = useRef(null);
  const { socket } = useSocket();
  const { token } = useAuth();
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  // Get userId from JWT token instead of localStorage
  const userId = token ? (() => {
    try {
      const decoded = jwtDecode(token);
      return decoded.id;
    } catch {
      return null;
    }
  })() : null;
  
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
    // Fetch user info from /api/character for optimistic messages
    const fetchUserInfo = async () => {
      try {
        const res = await axios.get('/api/character');
        setUserInfo({
          username: res.data?.User?.username || res.data?.username || '',
          avatarUrl: res.data?.User?.avatarUrl || res.data?.avatarUrl || '/avatars/default.png',
          isAdmin: res.data?.User?.isAdmin || res.data?.isAdmin || false,
          isVip: res.data?.User?.isVip || res.data?.isVip || false,
        });
      } catch {
        setUserInfo({ username: '', avatarUrl: '/avatars/default.png', isAdmin: false, isVip: false });
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

    // --- Logging socket state on mount ---
    console.log('[GlobalChat] useEffect: socket', socket);
    console.log('[GlobalChat] socket.connected:', socket.connected);

    // --- Handler for connect event ---
    const handleConnect = () => {
      console.log('[GlobalChat] Socket connected:', socket.id);
      socket.emit('join_global_chat');
      console.log('[GlobalChat] join_global_chat emitted');
    };
    // --- Handler for disconnect event ---
    const handleDisconnect = (reason) => {
      console.warn('[GlobalChat] Socket disconnected:', reason);
      toast.error('تم قطع الاتصال بالدردشة العامة. سيتم إعادة المحاولة تلقائيًا.');
    };

    // --- Message/event handlers ---
    const handleGlobalMessage = (message) => {
      console.log('[GlobalChat] Received global_message:', message);
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
      console.log('[GlobalChat] Received global_message_error:', error);
      toast.error(error.error || 'فشل في إرسال الرسالة');
      setSending(false);
    };
    const handleGlobalMessageDeleted = ({ messageId }) => {
      console.log('[GlobalChat] Received global_message_deleted:', messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    };
    const handleMuted = ({ until }) => {
      console.log('[GlobalChat] Received muted event:', until);
      setIsMuted(true);
      toast.error(`تم كتمك في الدردشة حتى ${new Date(until).toLocaleTimeString('ar-SA')}`);
    };
    const handleBanned = ({ until }) => {
      console.log('[GlobalChat] Received banned event:', until);
      setIsMuted(true);
      toast.error(`تم حظرك من الدردشة حتى ${new Date(until).toLocaleTimeString('ar-SA')}`);
    };
    const handleKicked = () => {
      console.log('[GlobalChat] Received kicked event');
      toast.error('تم طردك من الدردشة العامة');
      setTimeout(() => window.location.reload(), 1500);
    };
    // Handle chat cleared event
    const handleGlobalChatCleared = () => {
      console.log('[GlobalChat] Received global_chat_cleared event');
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
      console.log('[GlobalChat] Cleaning up global chat listeners');
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
      // (No sound on send)
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
        // setMentionQuery(''); // Removed
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
        // setMentionQuery(query); // Removed
        setMentionIndex(0);
        return;
      }
    }
    setMentionDropdown(false);
    // setMentionQuery(''); // Removed
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
      // Format as yyyy/MM/dd
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
    // Regex for @username (arabic/latin, numbers, underscores)
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
        <span key={start} className="text-accent-red font-bold">@{match[1]}</span>
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
    // WhatsApp/Telegram style bubbles
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
      return 'mx-auto my-2 px-4 py-2 rounded-2xl bg-yellow-900/70 text-yellow-200 text-center text-sm font-bold w-fit max-w-[90%] border border-yellow-500';
    }
    if (message.messageType === 'ANNOUNCEMENT') {
      return 'mx-auto my-2 px-4 py-2 rounded-2xl bg-red-900/70 text-red-200 text-center text-sm font-bold w-fit max-w-[90%] border border-red-500';
    }
    if (isSelf) {
      return `ml-auto my-2 px-3 py-2 rounded-2xl border-2 border-green-500 bg-zinc-900 text-zinc-100 max-w-[80%] shadow ${highlight ? 'ring-2 ring-accent-red ring-offset-2' : ''}`;
    }
    return `mr-auto my-2 px-3 py-2 rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-200 max-w-[80%] shadow ${highlight ? 'ring-2 ring-accent-red ring-offset-2' : ''}`;
  };

  const [expandedReactions, setExpandedReactions] = useState({});
  // Emoji picker for sending
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // Game-oriented and broad emoji selection
  const emojiList = [
    // Faces
    '😀','😃','😄','😁','😆','😅','😂','🤣','😜','😎','😍','🥳','😏','😇','😱','😡','😭','😢','😤','😈','👿','🤔','😴','🥺','😬','😲','😳','😅','😆','😋','😝','😤','😪','😵','🤯','🥶','🥵',
    // Game/Combat
    '⚔️','🛡️','🏹','🗡️','🪓','🔫','🧨','🛡️','🦾','🦿','🧙‍♂️','🧙‍♀️','🧛‍♂️','🧟‍♂️','🧟‍♀️','🧞‍♂️','🧞‍♀️','🧚‍♂️','🧚‍♀️','🐉','👾','👑','💀','☠️','🦴','🦹‍♂️','🦸‍♂️','🦸‍♀️',
    // Loot/Items
    '💰','💎','🪙','🧪','🧴','🍖','🍗','🍺','🍻','🥤','🍔','🍟','🍕','🍩','🍪','🍫','🍬','🍭','🎁','🎲','🃏','🀄','🎮','🕹️','🏆','🥇','🥈','🥉','🎯','🎵','🎶','🎤','🎸','🎻','🥁',
    // Magic/Effects
    '✨','🔥','💥','⚡','🌟','🌈','❄️','💧','🌪️','🌊','🌋','🌀','🌙','☀️','🌞','🌚','🌛','🌜','🌠','🪄','🧿',
    // Social/Other
    '👍','👎','👏','🙌','🙏','🤝','💪','🫡','🫶','🤙','🤘','🖖','✌️','🤞','🫲','🫱','👋','🤟','🫂','💔','❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💯','🔔','🔊','🔇','🚩','🏳️','🏴','🏳️‍🌈','🏳️‍⚧️','🚀','🛸','🦄','🐺','🐱','🐶','🐲','🦅','🦉','🦇','🐾','🦷','🦸','🦹','🧙','🧚','🧛','🧟','🧞','🧜','🧝','🧙‍♂️','🧙‍♀️'
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
    // Find the @... part before the cursor
    const before = newMessage.slice(0, start).replace(/@([\w\u0600-\u06FF]*)$/, '');
    const after = newMessage.slice(end);
    const updated = before + '@' + username + ' ' + after;
    setNewMessage(updated);
    setMentionDropdown(false);
    // setMentionQuery(''); // Removed
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
        }, 200); // Simulate loading delay
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
    // If visibleCount just increased, scroll to the first newly revealed message
    if (visibleCount > INITIAL_VISIBLE) {
      // Try to keep the scroll position after loading more
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
    <div
      className="flex flex-col bg-black rounded-xl shadow-lg overflow-hidden border border-zinc-800 w-full h-screen min-h-screen pt-28 sm:pt-32"
      style={{ minHeight: '100dvh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-accent-red" />
          <h2 className="text-base sm:text-lg font-bold text-accent-red">الدردشة العامة</h2>
          <span className="ml-2 text-green-400 font-bold text-xs">{onlineCount} متصل الآن</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundMuted(!soundMuted)}
            className="text-zinc-400 hover:text-accent-red transition-colors"
            title={soundMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          {/* Admin: Clear All Messages Button */}
          {userInfo.isAdmin && (
            <button
              className="ml-2 text-zinc-400 hover:text-red-500 border border-red-500 rounded px-2 py-1 text-xs font-bold"
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
              مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 sm:py-3 bg-zinc-950 space-y-2"
        style={{
          minHeight: 0,
          maxHeight: '100%',
        }}
      >
        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex items-center justify-center text-xs text-zinc-400 mb-2">جاري تحميل المزيد...</div>
        )}
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-zinc-500">لا توجد رسائل بعد</div>
          </div>
        ) : (
          messages.slice(-visibleCount).map((message) => {
            // Get user info for avatar and badges
            const user = message.User || message;
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
            let avatarUrl = user.avatarUrl || '/avatars/default.png';
            if (avatarUrl.startsWith('/avatars/')) {
              avatarUrl = backendUrl + avatarUrl;
            }
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
            // WhatsApp/Telegram style bubble
            return (
              <div key={message.id} className="flex w-full items-end gap-2" style={{ direction: 'rtl', justifyContent: isSelf ? 'flex-end' : 'flex-start' }}>
                {/* Avatar (left for others, right for self) */}
                {!isSelf && (
                  <img
                    src={avatarUrl}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-zinc-800 object-cover shadow order-2"
                    title={user.username}
                  />
                )}
                <div className={getMessageStyle(message) + ' text-xs sm:text-sm inline-block align-bottom'} style={{ wordBreak: 'break-word', maxWidth: '75vw' }}>
                  <div className="flex flex-row items-center flex-wrap gap-2">
                    {/* Username and badges (for others) */}
                    {!isSelf && (
                      <span className="font-semibold text-accent-red flex items-center gap-1 cursor-pointer hover:underline"
                        onClick={e => setUserMenu({ open: true, anchor: e.target, user: { userId: message.userId, username: user.username, isVip: user.isVip, isAdmin: user.isAdmin } })}
                      >
                        <VipName isVIP={isVip} className="compact">
                          {user.username}
                        </VipName>
                        {isAdmin && <Shield className="w-4 h-4 text-accent-red" title="مشرف" />}
                      </span>
                    )}
                    {/* Message content or edit input */}
                    {editingMessageId === message.id ? (
                      <>
                        <input
                          className="bg-zinc-700 text-zinc-200 rounded px-2 py-1 text-xs sm:text-sm w-32 sm:w-48"
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          maxLength={500}
                          autoFocus
                        />
                        <button
                          className="ml-2 text-accent-red font-bold text-xs"
                          onClick={() => {
                            if (!editContent.trim()) return;
                            socket.emit('edit_global_message', { messageId: message.id, newContent: editContent.trim() }, (res) => {
                              if (res?.error) toast.error(res.error);
                              setEditingMessageId(null);
                            });
                          }}
                        >حفظ</button>
                        <button
                          className="ml-1 text-zinc-400 text-xs"
                          onClick={() => setEditingMessageId(null)}
                        >إلغاء</button>
                      </>
                    ) : (
                      <span className="text-sm">
                        {parseMentions(message.content)}
                        {message.edited && (
                          <span className="ml-1 text-xs text-zinc-400">(معدل)</span>
                        )}
                      </span>
                    )}
                    {/* Emoji Reactions */}
                    <div className="flex gap-0.5 sm:gap-1 items-center flex-wrap">
                      {Object.entries(message.reactions || {})
                        .filter(([, arr]) => arr.length > 0)
                        .map(([emoji, arr]) => {
                          const reacted = arr.includes(Number(userId));
                          return (
                            <button
                              key={emoji}
                              className={`px-1 rounded text-base sm:text-lg ${reacted ? 'bg-accent-red text-white' : 'bg-zinc-700 text-zinc-200'} hover:bg-zinc-600`}
                              onClick={() => {
                                if (!socket) return;
                                if (reacted) {
                                  socket.emit('remove_reaction', { messageId: message.id, emoji });
                                } else {
                                  socket.emit('add_reaction', { messageId: message.id, emoji });
                                }
                              }}
                            >
                              {emoji} <span className="text-xs">{arr.length}</span>
                            </button>
                          );
                        })}
                      {/* Expand/collapse button */}
                      <button
                        className="px-1 rounded text-base sm:text-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
                        onClick={() =>
                          setExpandedReactions((prev) => ({
                            ...prev,
                            [message.id]: !prev[message.id],
                          }))
                        }
                        title={expandedReactions[message.id] ? 'إخفاء الرموز' : 'إضافة رمز تعبيري'}
                      >
                        {expandedReactions[message.id] ? '×' : '➕'}
                      </button>
                      {/* Expanded emoji picker */}
                      {expandedReactions[message.id] && (
                        <div className="flex gap-1 ml-2 overflow-x-auto max-w-[60vw] sm:max-w-xs pb-1">
                          {['👍', '😂', '🔥', '❤️', '😮', '😢'].map((emoji) => {
                            if ((message.reactions?.[emoji]?.length || 0) > 0) return null;
                            return (
                              <button
                                key={emoji}
                                className="px-1 rounded text-base sm:text-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600"
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
                    {/* Edit button for own messages */}
                    {isSelf && editingMessageId !== message.id && (
                      <button
                        className="ml-2 text-zinc-400 hover:text-accent-red"
                        title="تعديل الرسالة"
                        onClick={() => {
                          setEditingMessageId(message.id);
                          setEditContent(message.content);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {/* Admin moderation controls */}
                    {userInfo.isAdmin && !isSelf && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          className="text-zinc-400 hover:text-yellow-400"
                          title="كتم المستخدم"
                          onClick={() => {
                            const duration = prompt('كم دقيقة تريد كتم المستخدم؟', '10');
                            if (!duration) return;
                            socket.emit('mute_user', { targetUserId: message.userId, durationMinutes: parseInt(duration) }, (res) => {
                              if (res?.error) toast.error(res.error);
                              else toast.success('تم كتم المستخدم');
                            });
                          }}
                        ><UserMinus className="w-4 h-4" /></button>
                        <button
                          className="text-zinc-400 hover:text-blue-400"
                          title="طرد المستخدم"
                          onClick={() => {
                            if (!window.confirm('هل أنت متأكد من طرد المستخدم من الدردشة؟')) return;
                            socket.emit('kick_user', { targetUserId: message.userId }, (res) => {
                              if (res?.error) toast.error(res.error);
                              else toast.success('تم طرد المستخدم');
                            });
                          }}
                        ><UserX className="w-4 h-4" /></button>
                        <button
                          className="text-zinc-400 hover:text-red-400"
                          title="حظر المستخدم من الدردشة"
                          onClick={() => {
                            const duration = prompt('كم دقيقة تريد حظر المستخدم؟', '60');
                            if (!duration) return;
                            socket.emit('ban_user', { targetUserId: message.userId, durationMinutes: parseInt(duration) }, (res) => {
                              if (res?.error) toast.error(res.error);
                              else toast.success('تم حظر المستخدم');
                            });
                          }}
                        ><Ban className="w-4 h-4" /></button>
                        <button
                          className="text-zinc-400 hover:text-red-600"
                          title="حذف الرسالة"
                          onClick={() => {
                            if (!window.confirm('هل أنت متأكد من حذف الرسالة؟')) return;
                            socket.emit('delete_global_message', { messageId: message.id }, (res) => {
                              if (res?.error) toast.error(res.error);
                              else toast.success('تم حذف الرسالة');
                            });
                          }}
                        ><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                    <span className="block text-xs text-zinc-500 whitespace-nowrap text-left" style={{ direction: 'ltr' }}>
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </div>
                {/* Avatar (right for self) */}
                {isSelf && (
                  <img
                    src={avatarUrl}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-zinc-800 object-cover shadow order-2"
                    title={user.username}
                  />
                )}
              </div>
            );
          })
        )}
        {/* User Options Menu */}
        {userMenu.open && userMenu.user && (
          <div
            className="fixed z-50 bg-zinc-900 border border-accent-red rounded-lg shadow-lg p-2 flex flex-col gap-2 min-w-[160px] text-right"
            style={{
              top: userMenu.anchor?.getBoundingClientRect().bottom + window.scrollY + 8,
              left: userMenu.anchor?.getBoundingClientRect().left + window.scrollX - 120,
            }}
            onMouseLeave={() => setUserMenu({ open: false, anchor: null, user: null })}
          >
            <button
              className="w-full text-right px-3 py-2 hover:bg-accent-red/30 rounded transition"
              onClick={() => {
                navigate('/dashboard/messages', { state: { userId: userMenu.user.userId, username: userMenu.user.username } });
                setUserMenu({ open: false, anchor: null, user: null });
              }}
            >
              إرسال رسالة خاصة
            </button>
            <button
              className="w-full text-right px-3 py-2 hover:bg-accent-red/30 rounded transition"
              onClick={() => {
                navigate(`/dashboard/profile/${userMenu.user.username}`);
                setUserMenu({ open: false, anchor: null, user: null });
              }}
            >
              عرض الملف الشخصي
            </button>
            <button
              className="w-full text-right px-3 py-2 hover:bg-accent-red/30 rounded transition"
              onClick={() => handleAddFriend(userMenu.user.userId)}
            >
              إضافة صديق
            </button>
            <button
              className="w-full text-right px-3 py-2 text-zinc-400 hover:bg-zinc-800 rounded transition"
              onClick={() => setUserMenu({ open: false, anchor: null, user: null })}
            >
              إغلاق
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-2 sm:px-4 py-2 sm:py-3 bg-zinc-900 border-t border-zinc-800" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0.5rem)' }}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setUserInteracted(true)}
              placeholder="اكتب رسالة للدردشة العامة..."
              className="w-full bg-zinc-800 text-zinc-200 rounded-lg px-2 sm:px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent-red border border-zinc-700 text-xs sm:text-sm"
              rows={2}
              maxLength={500}
              disabled={sending || isMuted}
            />
            {/* Mention Autocomplete Dropdown */}
            {mentionDropdown && mentionOptions.length > 0 && (
             <div className="absolute left-0 bottom-14 z-20 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg w-44 sm:w-56 max-h-40 overflow-y-auto text-xs sm:text-sm">
                {mentionOptions.map((u, i) => (
                  <div
                    key={u}
                    className={`px-3 py-2 cursor-pointer text-zinc-200 hover:bg-accent-red/80 ${i === mentionIndex ? 'bg-accent-red text-white' : ''}`}
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
               className="absolute left-2 bottom-2 text-lg sm:text-xl text-zinc-400 hover:text-accent-red transition-colors"
               tabIndex={-1}
               onClick={() => setShowEmojiPicker((v) => !v)}
               title="إدراج رمز تعبيري"
               disabled={sending || isMuted}
             >
               😊
             </button>
             {/* Emoji Picker Dropdown */}
             {showEmojiPicker && (
              <div className="absolute left-0 bottom-10 z-10 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-2 w-[90vw] max-w-xs sm:max-w-md max-h-56 overflow-y-auto">
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
           </div>
           <button
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim() || isMuted}
            className="bg-accent-red text-white rounded-lg px-3 sm:px-4 py-2 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-base"
          >
            <Send className="w-4 h-4" />
            {sending ? '...' : 'إرسال'}
          </button>
        </div>
        <div className="text-xs text-zinc-500 mt-1 text-center">
          اضغط Enter للإرسال، Shift+Enter للسطر الجديد
        </div>
      </div>
      <audio ref={audioRef} src={notificationSound} preload="auto" />
    </div>
  );
} 