import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useSocket } from '@/hooks/useSocket';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { toast } from 'react-toastify';
import MoneyIcon from '@/components/MoneyIcon';
import { 
  Bell, 
  Trash2, 
  CheckCircle, 
  ArrowLeft, 
  RefreshCw, 
  Shield,
  Sword,
  DollarSign,
  MessageCircle,
  Users,
  Clock,
  Zap,
  Crown,
  Heart,
  ImageIcon,
  AlertTriangle,
  Info,
  Target,
  Home,
  Briefcase,
  ShoppingCart,
  User,
  Activity,
  Star,
  XCircle,
  Eye,
  Loader
} from 'lucide-react';

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { customToken } = useFirebaseAuth();

  const handleMarkAsRead = async () => {
    if (!notification.isRead && customToken) {
      try {
        await axios.patch(`/api/notifications/${notification.id}/read`, {}, {
          headers: {
            Authorization: `Bearer ${customToken}`
          }
        });
        onMarkAsRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (!customToken) return;
    try {
      setIsDeleting(true);
      await axios.delete(`/api/notifications/${notification.id}`, {
        headers: {
          Authorization: `Bearer ${customToken}`
        }
      });
      onDelete(notification.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      ATTACKED: <Sword className="w-6 h-6 text-red-400" />,
      HOSPITALIZED: <Heart className="w-6 h-6 text-red-400" />,
      JAILED: <Shield className="w-6 h-6 text-orange-400" />,
      BANK_INTEREST: <MoneyIcon className="w-6 h-6" />,
      JOB_SALARY: <Briefcase className="w-6 h-6 text-green-400" />,
      BLACK_MARKET_SOLD: <ShoppingCart className="w-6 h-6 text-purple-400" />,
      MESSAGE_RECEIVED: <MessageCircle className="w-6 h-6 text-blue-400" />,
      FRIEND_REQUEST_RECEIVED: <Users className="w-6 h-6 text-cyan-400" />,
      FRIEND_REQUEST_ACCEPTED: <CheckCircle className="w-6 h-6 text-green-400" />,
      CRIME_COOLDOWN_ENDED: <Clock className="w-6 h-6 text-yellow-400" />,
      GYM_COOLDOWN_ENDED: <Zap className="w-6 h-6 text-yellow-400" />,
      CONTRACT_EXECUTED: <Target className="w-6 h-6 text-red-400" />,
      CONTRACT_FULFILLED: <CheckCircle className="w-6 h-6 text-green-400" />,
      VIP_EXPIRED: <Crown className="w-6 h-6 text-gray-400" />,
      VIP_ACTIVATED: <Crown className="w-6 h-6 text-yellow-400" />,
      OUT_OF_HOSPITAL: <Heart className="w-6 h-6 text-green-400" />,
      OUT_OF_JAIL: <Shield className="w-6 h-6 text-green-400" />,
      GANG_JOIN_REQUEST: <Users className="w-6 h-6 text-cyan-400" />,
      GANG_MEMBER_LEFT: <Users className="w-6 h-6 text-orange-400" />,
      ASSASSINATED: <Target className="w-6 h-6 text-red-400" />,
      GHOST_ASSASSINATED: <Target className="w-6 h-6 text-purple-400" />,
      CONTRACT_ATTEMPTED: <Target className="w-6 h-6 text-orange-400" />,
      CONTRACT_EXPIRED: <Clock className="w-6 h-6 text-gray-400" />,
      CONTRACT_TARGET_ASSASSINATED: <Target className="w-6 h-6 text-red-400" />,
      ATTACK_IMMUNITY_ACTIVATED: <Shield className="w-6 h-6 text-blue-400" />,
      ATTACK_IMMUNITY_PROTECTED: <Shield className="w-6 h-6 text-blue-400" />,
      GANG_BOMB_IMMUNITY_PROTECTED: <Shield className="w-6 h-6 text-blue-400" />,
      SYSTEM: <Bell className="w-6 h-6 text-gray-400" />
    };
    return icons[type] || <Bell className="w-6 h-6 text-gray-400" />;
  };

  const getNotificationColor = (type) => {
    const colors = {
      ATTACKED: 'border-red-500/50 bg-red-950/30',
      HOSPITALIZED: 'border-red-500/50 bg-red-950/30',
      JAILED: 'border-orange-500/50 bg-orange-950/30',
      BANK_INTEREST: 'border-green-500/50 bg-green-950/30',
      JOB_SALARY: 'border-green-500/50 bg-green-950/30',
      BLACK_MARKET_SOLD: 'border-purple-500/50 bg-purple-950/30',
      MESSAGE_RECEIVED: 'border-blue-500/50 bg-blue-950/30',
      FRIEND_REQUEST_RECEIVED: 'border-cyan-500/50 bg-cyan-950/30',
      FRIEND_REQUEST_ACCEPTED: 'border-green-500/50 bg-green-950/30',
      CRIME_COOLDOWN_ENDED: 'border-yellow-500/50 bg-yellow-950/30',
      GYM_COOLDOWN_ENDED: 'border-yellow-500/50 bg-yellow-950/30',
      CONTRACT_EXECUTED: 'border-red-500/50 bg-red-950/30',
      CONTRACT_FULFILLED: 'border-green-500/50 bg-green-950/30',
      VIP_EXPIRED: 'border-gray-500/50 bg-gray-950/30',
      VIP_ACTIVATED: 'border-yellow-500/50 bg-yellow-950/30',
      OUT_OF_HOSPITAL: 'border-green-500/50 bg-green-950/30',
      OUT_OF_JAIL: 'border-green-500/50 bg-green-950/30',
      GANG_JOIN_REQUEST: 'border-cyan-500/50 bg-cyan-950/30',
      GANG_MEMBER_LEFT: 'border-orange-500/50 bg-orange-950/30',
      ASSASSINATED: 'border-red-500/50 bg-red-950/30',
      GHOST_ASSASSINATED: 'border-purple-500/50 bg-purple-950/30',
      CONTRACT_ATTEMPTED: 'border-orange-500/50 bg-orange-950/30',
      CONTRACT_EXPIRED: 'border-gray-500/50 bg-gray-950/30',
      CONTRACT_TARGET_ASSASSINATED: 'border-red-500/50 bg-red-950/30',
      ATTACK_IMMUNITY_ACTIVATED: 'border-blue-500/50 bg-blue-950/30',
      ATTACK_IMMUNITY_PROTECTED: 'border-blue-500/50 bg-blue-950/30',
      GANG_BOMB_IMMUNITY_PROTECTED: 'border-blue-500/50 bg-blue-950/30',
      SYSTEM: 'border-gray-500/50 bg-gray-950/30'
    };
    return colors[type] || 'border-gray-500/50 bg-gray-950/30';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  return (
    <div 
      className={`card-3d p-4 transition-all duration-300 hover:scale-[1.01] cursor-pointer ${
        getNotificationColor(notification.type)
      } ${!notification.isRead ? 'border-l-4 border-l-blood-500' : ''}`}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-sm mb-1 ${!notification.isRead ? 'text-white' : 'text-white/80'}`}>
              {notification.title}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed break-words">
              {notification.content}
            </p>
            <p className="text-white/50 text-xs mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(notification.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {!notification.isRead && (
            <div className="w-2 h-2 bg-blood-500 rounded-full animate-pulse"></div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className="p-1.5 rounded text-white/50 hover:text-red-400 hover:bg-red-500/20 transition-all duration-300"
            title="حذف الإشعار"
          >
            {isDeleting ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Notifications = () => {
  const { fetchNotifications, markAsRead, markAllAsRead, deleteNotification, notifications: contextNotifications, unreadCount } = useNotificationContext();
  const { socket } = useSocket();
  const { customToken } = useFirebaseAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  
  const navigate = useNavigate();
  const observer = useRef();
  const lastNotificationRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreNotifications();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  const loadNotifications = async (page = 1, append = false) => {
    try {
      setError(null);
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await fetchNotifications(page, 30);
      
      if (result) {
        const { notifications: newNotifications, hasMore: moreAvailable } = result;
        
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        
        setHasMore(moreAvailable);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('فشل في تحميل الإشعارات');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreNotifications = () => {
    if (!loadingMore && hasMore) {
      loadNotifications(currentPage + 1, true);
    }
  };

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  // Socket test response handler
  useEffect(() => {
    if (!socket) return;

    const handleTestResponse = (data) => {
      toast.success('تم اختبار الاتصال بنجاح!', {
        position: "bottom-center",
        autoClose: 2000,
      });
    };

    socket.on('test_response', handleTestResponse);

    return () => {
      socket.off('test_response', handleTestResponse);
    };
  }, [socket]);

  // Update local notifications when context notifications change (real-time updates)
  useEffect(() => {
    if (contextNotifications.length > 0 && notifications.length === 0) {
      setNotifications(contextNotifications);
    } else if (contextNotifications.length > 0 && notifications.length > 0) {
      const merged = [...contextNotifications];
      notifications.forEach(notification => {
        if (!merged.find(n => n.id === notification.id)) {
          merged.push(notification);
        }
      });
      setNotifications(merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  }, [contextNotifications, notifications.length]);

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleDelete = async (notificationId) => {
    await deleteNotification(notificationId);
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      await markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
      return;
    }

    try {
      setDeletingAll(true);
      if (!customToken) throw new Error('No authentication token');
      
      await axios.delete('/api/notifications', {
        headers: {
          Authorization: `Bearer ${customToken}`
        }
      });
      setNotifications([]);
      setHasMore(false);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    } finally {
      setDeletingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen blood-gradient text-white flex items-center justify-center">
        <div className="text-center card-3d p-8">
          <div className="w-12 h-12 border border-blue-500/50 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-300">جاري تحميل الإشعارات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen blood-gradient text-white flex items-center justify-center">
        <div className="text-center card-3d p-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => loadNotifications()}
            className="btn-3d px-4 py-2 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      <div className="container mx-auto max-w-6xl p-3 space-y-4">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-gray-800 to-purple-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%233b82f6\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"8\"/%3E%3Cpath d=\"M15 15l3 3-3 3-3-3z\"/%3E%3Cpath d=\"M45 15l3 3-3 3-3-3z\"/%3E%3Cpath d=\"M15 45l3 3-3 3-3-3z\"/%3E%3Cpath d=\"M45 45l3 3-3 3-3-3z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          <div className="absolute inset-0 bg-black/60"></div>

          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">الإشعارات</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">Notifications</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg flex items-center gap-1">
                  <Bell className="w-4 h-4 text-blue-400" />
                  {unreadCount}
                </div>
                <div className="text-xs text-white/80 drop-shadow">غير مقروء</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-3d-secondary px-4 py-2 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            رجوع
          </button>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead || notifications.every(n => n.isRead)}
              className="btn-3d bg-green-600/80 hover:bg-green-700/80 disabled:opacity-50 px-4 py-2 text-sm flex items-center gap-2"
            >
              {markingAllRead ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  تحديد الكل كمقروء
                </>
              )}
            </button>
            
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll || notifications.length === 0}
              className="btn-3d bg-red-600/80 hover:bg-red-700/80 disabled:opacity-50 px-4 py-2 text-sm flex items-center gap-2"
            >
              {deletingAll ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  حذف الكل
                </>
              )}
            </button>

            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('jwt');
                  await axios.post('/api/notifications/test', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                } catch (error) {
                  console.error('Test notification error:', error);
                }
              }}
              className="btn-3d bg-blue-600/80 hover:bg-blue-700/80 px-4 py-2 text-sm flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              اختبار الإشعارات
            </button>
          </div>
        </div>

        {/* Debug Panel */}
        <details className="card-3d p-4">
          <summary className="cursor-pointer text-white/80 font-bold flex items-center gap-2">
            <Info className="w-4 h-4" />
            معلومات التصحيح
          </summary>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="card-3d bg-black/40 border-white/10 p-2 text-center">
              <div className="text-white/70">غي�� المقروءة</div>
              <div className="text-lg font-bold text-red-400">{unreadCount}</div>
            </div>
            <div className="card-3d bg-black/40 border-white/10 p-2 text-center">
              <div className="text-white/70">المحلية</div>
              <div className="text-lg font-bold text-blue-400">{notifications.length}</div>
            </div>
            <div className="card-3d bg-black/40 border-white/10 p-2 text-center">
              <div className="text-white/70">في السياق</div>
              <div className="text-lg font-bold text-purple-400">{contextNotifications.length}</div>
            </div>
            <div className="card-3d bg-black/40 border-white/10 p-2 text-center">
              <div className="text-white/70">الاتصال</div>
              <div className={`text-lg font-bold ${socket?.connected ? 'text-green-400' : 'text-red-400'}`}>
                {socket?.connected ? 'متصل' : 'منقطع'}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              if (socket?.connected) {
                socket.emit('test', { message: 'Socket test from frontend' });
              }
            }}
            className="btn-3d-secondary mt-3 px-4 py-2 text-xs"
          >
            اختبار ��لاتصال
          </button>
        </details>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="card-3d p-12 text-center">
              <Bell className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white/50 mb-2">لا توجد إشعارات</h3>
              <p className="text-white/30">ستظهر هنا الإشعارات الجديدة عند وصولها</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={notification.id}
                ref={index === notifications.length - 1 ? lastNotificationRef : null}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              </div>
            ))
          )}
          
          {loadingMore && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-blue-400">
                <Loader className="w-5 h-5 animate-spin" />
                <span>جاري تحميل المزيد...</span>
              </div>
            </div>
          )}
          
          {!hasMore && notifications.length > 0 && (
            <div className="text-center py-4">
              <div className="card-3d bg-black/40 border-white/10 p-3 inline-block">
                <span className="text-white/50 text-sm">لا توجد المزيد من الإشعارات</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
