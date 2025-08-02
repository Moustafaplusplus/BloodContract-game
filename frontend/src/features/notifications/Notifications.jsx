import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingOrErrorPlaceholder from '@/components/LoadingOrErrorPlaceholder';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { useSocket } from '@/hooks/useSocket';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { toast } from 'react-toastify';
import MoneyIcon from '@/components/MoneyIcon';

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
      ATTACKED: '⚔️',
      HOSPITALIZED: '🏥',
      JAILED: '🔒',
      BANK_INTEREST: <MoneyIcon className="w-6 h-6" />,
      JOB_SALARY: '💼',
      BLACK_MARKET_SOLD: '🛒',
      MESSAGE_RECEIVED: '💬',
      FRIEND_REQUEST_RECEIVED: '👥',
      FRIEND_REQUEST_ACCEPTED: '✅',
      CRIME_COOLDOWN_ENDED: '⏰',
      GYM_COOLDOWN_ENDED: '💪',
      CONTRACT_EXECUTED: '🎯',
      CONTRACT_FULFILLED: '📋',
      VIP_EXPIRED: '👑',
      VIP_ACTIVATED: '👑',
      OUT_OF_HOSPITAL: '🏥',
      OUT_OF_JAIL: '🔓',
      GANG_JOIN_REQUEST: '👥',
      GANG_MEMBER_LEFT: '👥',
      ASSASSINATED: '💀',
      GHOST_ASSASSINATED: '👻',
      CONTRACT_ATTEMPTED: '🎯',
      CONTRACT_EXPIRED: '⏰',
      CONTRACT_TARGET_ASSASSINATED: '💀',
      ATTACK_IMMUNITY_ACTIVATED: '🛡️',
      ATTACK_IMMUNITY_PROTECTED: '🛡️',
      GANG_BOMB_IMMUNITY_PROTECTED: '🛡️',
      SYSTEM: '🔔'
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type) => {
    const colors = {
      ATTACKED: 'border-red-500 bg-red-900/20',
      HOSPITALIZED: 'border-red-500 bg-red-900/20',
      JAILED: 'border-orange-500 bg-orange-900/20',
      BANK_INTEREST: 'border-green-500 bg-green-900/20',
      JOB_SALARY: 'border-green-500 bg-green-900/20',
      BLACK_MARKET_SOLD: 'border-purple-500 bg-purple-900/20',
      MESSAGE_RECEIVED: 'border-blue-500 bg-blue-900/20',
      FRIEND_REQUEST_RECEIVED: 'border-cyan-500 bg-cyan-900/20',
      FRIEND_REQUEST_ACCEPTED: 'border-green-500 bg-green-900/20',
      CRIME_COOLDOWN_ENDED: 'border-yellow-500 bg-yellow-900/20',
      GYM_COOLDOWN_ENDED: 'border-yellow-500 bg-yellow-900/20',
      CONTRACT_EXECUTED: 'border-red-500 bg-red-900/20',
      CONTRACT_FULFILLED: 'border-green-500 bg-green-900/20',
      VIP_EXPIRED: 'border-gray-500 bg-gray-900/20',
      VIP_ACTIVATED: 'border-yellow-500 bg-yellow-900/20',
      OUT_OF_HOSPITAL: 'border-green-500 bg-green-900/20',
      OUT_OF_JAIL: 'border-green-500 bg-green-900/20',
      GANG_JOIN_REQUEST: 'border-cyan-500 bg-cyan-900/20',
      GANG_MEMBER_LEFT: 'border-orange-500 bg-orange-900/20',
      ASSASSINATED: 'border-red-500 bg-red-900/20',
      GHOST_ASSASSINATED: 'border-purple-500 bg-purple-900/20',
      CONTRACT_ATTEMPTED: 'border-orange-500 bg-orange-900/20',
      CONTRACT_EXPIRED: 'border-gray-500 bg-gray-900/20',
      CONTRACT_TARGET_ASSASSINATED: 'border-red-500 bg-red-900/20',
      ATTACK_IMMUNITY_ACTIVATED: 'border-blue-500 bg-blue-900/20',
      ATTACK_IMMUNITY_PROTECTED: 'border-blue-500 bg-blue-900/20',
      GANG_BOMB_IMMUNITY_PROTECTED: 'border-blue-500 bg-blue-900/20',
      SYSTEM: 'border-gray-500 bg-gray-900/20'
    };
    return colors[type] || 'border-gray-500 bg-gray-900/20';
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
      className={`p-4 border-r-4 rounded-lg mb-3 transition-all duration-200 hover:bg-zinc-800/50 ${
        getNotificationColor(notification.type)
      } ${!notification.isRead ? 'bg-zinc-800/30' : ''}`}
      onClick={handleMarkAsRead}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-2xl flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-sm mb-1 ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
              {notification.title}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {notification.content}
            </p>
            <p className="text-gray-500 text-xs mt-2">
              {formatDate(notification.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          {!notification.isRead && (
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-400 transition-colors p-1"
            aria-label="حذف الإشعار"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
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
      // If we have context notifications but no local notifications, use context ones
      setNotifications(contextNotifications);
    } else if (contextNotifications.length > 0 && notifications.length > 0) {
      // If we have both, merge them and remove duplicates
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
    return <LoadingOrErrorPlaceholder loading={true} />;
  }

  if (error) {
    return <LoadingOrErrorPlaceholder error={error} />;
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-zinc-900 hover:bg-accent-red/30 border border-accent-red/40 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">الإشعارات</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead || notifications.every(n => n.isRead)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
            >
              {markingAllRead ? 'جاري التحديث...' : 'تحديد الكل كمقروء'}
            </button>
            
            <button
              onClick={handleDeleteAll}
              disabled={deletingAll || notifications.length === 0}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
            >
              {deletingAll ? 'جاري الحذف...' : 'حذف الكل'}
            </button>

            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('jwt');
                  const response = await axios.post('/api/notifications/test', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
          
                } catch (error) {
                  console.error('Test notification error:', error);
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
            >
              اختبار الإشعارات
            </button>

            {/* Debug Panel */}
            <details className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
              <summary className="cursor-pointer text-gray-300">معلومات التصحيح</summary>
              <div className="mt-2 space-y-1 text-xs text-gray-400">
                <div>عدد الإشعارات غير المقروءة: {unreadCount}</div>
                <div>عدد الإشعارات المحلية: {notifications.length}</div>
                <div>عدد الإشعارات في السياق: {contextNotifications.length}</div>
                <div>حالة التحميل: {loading ? 'جاري التحميل' : 'مكتمل'}</div>
                <div>هل يوجد المزيد: {hasMore ? 'نعم' : 'لا'}</div>
                <div>حالة الاتصال بالسيرفر: {socket?.connected ? 'متصل' : 'غير متصل'}</div>
                <button
                  onClick={() => {
                    if (socket?.connected) {
                      // Emit a test event to verify socket is working
                      socket.emit('test', { message: 'Socket test from frontend' });
                    }
                  }}
                  className="mt-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                >
                  اختبار الاتصال
                </button>
              </div>
            </details>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">لا توجد إشعارات</h3>
              <p className="text-gray-500">ستظهر هنا الإشعارات الجديدة عند وصولها</p>
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
              <div className="inline-block w-6 h-6 border-2 border-accent-red border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-400">جاري تحميل المزيد...</span>
            </div>
          )}
          
          {!hasMore && notifications.length > 0 && (
            <div className="text-center py-4 text-gray-500">
              لا توجد المزيد من الإشعارات
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications; 