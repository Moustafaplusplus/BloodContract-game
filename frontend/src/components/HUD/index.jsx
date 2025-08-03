// src/components/HUD/index.jsx
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSocket } from "@/hooks/useSocket"
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth"
import { useNotificationContext } from "@/contexts/NotificationContext"
import { useUnreadMessages } from "@/hooks/useUnreadMessages"
import { useFriendRequests } from "@/hooks/useFriendRequests"
import MoneyIcon from "@/components/MoneyIcon"
import BlackcoinIcon from "@/components/BlackcoinIcon"
import { 
  Search, 
  Bell, 
  Wifi, 
  WifiOff, 
  ChevronRight, 
  ChevronLeft,
  Heart,
  Zap,
  Star,
  DollarSign,
  Coins,
  User,
  Menu,
  X
} from "lucide-react"

// 3D Stat Component with enhanced mobile-first design
const StatComponent = ({ icon: Icon, value, maxValue, percent, color, label, isExpanded }) => {
  return (
    <div className="stat-container card-3d p-2 relative group">
      {/* Icon and Progress Ring */}
      <div className="flex items-center justify-center mb-1">
        <div className="relative">
          {/* Progress Ring */}
          <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
            {/* Background circle */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="rgba(0, 0, 0, 0.3)"
              strokeWidth="2"
            />
            {/* Progress circle */}
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={`rgb(${color})`}
              strokeWidth="2.5"
              strokeDasharray={`${Math.min(percent, 100)}, 100`}
              className="transition-all duration-500 ease-out"
              style={{
                filter: `drop-shadow(0 0 4px rgb(${color}))`
              }}
            />
          </svg>
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon
              className="w-4 h-4 transition-all duration-300 group-hover:scale-110"
              style={{ color: `rgb(${color})` }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Value Display */}
      {isExpanded && (
        <div className="text-center animate-fade-in">
          <div className="text-xs text-white/60 mb-0.5">{label}</div>
          <div className="text-xs font-bold text-white">
            {maxValue ? `${value}/${maxValue}` : value.toLocaleString()}
          </div>
          {maxValue && (
            <div className="text-xs text-white/40 mt-0.5">
              {Math.round(percent)}%
            </div>
          )}
        </div>
      )}

      {/* Enhanced Hover Tooltip for collapsed state */}
      {!isExpanded && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50">
          <div className="card-3d bg-black/95 border-blood-500/30 px-2 py-1.5 min-w-[120px]">
            <div className="text-xs font-bold text-white mb-0.5">{label}</div>
            <div className="text-xs text-white/90">
              {maxValue ? `${value}/${maxValue}` : value.toLocaleString()}
            </div>
            {maxValue && (
              <div className="text-xs text-white/60 mt-0.5">
                {Math.round(percent)}%
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced Notification Badge
const NotificationBadge = ({ count, isExpanded }) => {
  if (count === 0) return null
  
  return (
    <div className={`badge-3d ${isExpanded ? 'absolute -top-1 -right-1' : 'absolute -top-2 -right-2'}`}>
      <span className="text-white text-xs font-bold">
        {count > 99 ? '99+' : count}
      </span>
    </div>
  )
}

// Action Button Component
const ActionButton = ({ icon: Icon, label, onClick, notification, isExpanded }) => {
  return (
    <button
      onClick={onClick}
      className="btn-touch card-3d relative group flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 hover:border-blood-500/40"
      title={label}
    >
      <Icon className="w-4 h-4 text-white group-hover:text-blood-400 transition-colors duration-300" />

      {notification > 0 && (
        <NotificationBadge count={notification} isExpanded={isExpanded} />
      )}

      {/* Enhanced Expanded label */}
      {isExpanded && (
        <span className="ml-2 text-xs text-white group-hover:text-blood-400 transition-colors duration-300">
          {label}
        </span>
      )}
    </button>
  )
}

// Connection Status Indicator
const ConnectionStatus = ({ isConnected, connectionAttempts, isExpanded }) => {
  return (
    <div className={`card-3d p-2 flex items-center justify-center ${isConnected ? 'border-green-500/30' : 'border-blood-500/30'}`}>
      {isConnected ? (
        <Wifi className="w-3 h-3 text-green-400" />
      ) : (
        <WifiOff className="w-3 h-3 text-blood-400" />
      )}

      {isExpanded && (
        <div className="ml-2 animate-fade-in">
          <div className="text-xs text-white/90">
            {isConnected ? 'متصل' : 'غير متصل'}
          </div>
          {!isConnected && connectionAttempts > 0 && (
            <div className="text-xs text-blood-400">
              المحاولة {connectionAttempts}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function HUD({ menuButton }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const { 
    socket, 
    hudData, 
    crimeData,
    isConnected,
    connectionAttempts
  } = useSocket()
  const { customToken } = useFirebaseAuth()
  const navigate = useNavigate()
  const { unreadCount: notificationCount } = useNotificationContext()
  const { unreadCount: messageCount } = useUnreadMessages()
  const { pendingCount: friendRequestCount } = useFriendRequests()

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // Auto-collapse on mobile
      if (window.innerWidth < 768) {
        setIsExpanded(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Request initial data when component mounts
  useEffect(() => {
    if (socket && socket.connected) {
      socket.emit('hud:request')
    }
  }, [socket])

  // Debug logging for HUD data - moved before early return
  useEffect(() => {
    if (hudData) {
      const healthPercent = hudData.maxHp > 0 ? (hudData.hp / hudData.maxHp) * 100 : 0
      const energyPercent = hudData.maxEnergy > 0 ? (hudData.energy / hudData.maxEnergy) * 100 : 0
      const expPercent = hudData.nextLevelExp > 0 ? (hudData.exp / hudData.nextLevelExp) * 100 : 0
      
      console.log('[HUD] Debug data:', {
        energy: hudData?.energy,
        maxEnergy: hudData?.maxEnergy,
        energyPercent,
        hp: hudData?.hp,
        maxHp: hudData?.maxHp,
        healthPercent,
        level: hudData?.level,
        exp: hudData?.exp,
        nextLevelExp: hudData?.nextLevelExp,
        expPercent
      });
    }
  }, [hudData]);

  // Auto-collapse after interaction on mobile
  const handleMobileAction = (action) => {
    if (isMobile) {
      action()
      setIsExpanded(false)
    } else {
      action()
    }
  }

  if (!customToken || !hudData) {
    return (
      <div className={`fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-16'} safe-area-left`}>
        <div className="h-full card-3d border-r border-white/20 flex items-center justify-center">
          <div className="loading-shimmer w-8 h-8 rounded-full"></div>
        </div>
      </div>
    )
  }

  // Calculate percentages for stats
  const healthPercent = hudData.maxHp > 0 ? (hudData.hp / hudData.maxHp) * 100 : 0
  const energyPercent = hudData.maxEnergy > 0 ? (hudData.energy / hudData.maxEnergy) * 100 : 0
  const expPercent = hudData.nextLevelExp > 0 ? (hudData.exp / hudData.nextLevelExp) * 100 : 0

  // Calculate total notifications
  const totalNotifications = notificationCount + messageCount + friendRequestCount

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* HUD Container */}
      <div 
        className={`fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-in-out safe-area-left ${
          isExpanded ? 'w-64' : 'w-16'
        } ${isMobile ? 'shadow-2xl' : ''}`}
      >
        <div className="h-full blood-gradient border-r border-blood-500/30 flex flex-col">
          
          {/* Enhanced Header with Menu Button and Toggle */}
          <div className="p-2 border-b border-blood-500/20 flex items-center justify-between">
            {/* Menu Button */}
            <div className={`transition-all duration-300 ${isExpanded ? 'w-auto' : 'w-full flex justify-center'}`}>
              {menuButton}
            </div>
            
            {/* Enhanced Expand/Collapse Toggle */}
            {isExpanded && (
              <button
                onClick={() => setIsExpanded(false)}
                className="btn-touch card-3d w-8 h-8 flex items-center justify-center ml-1 group"
                title="طي الشريط الجانبي"
              >
                <ChevronLeft className="w-3 h-3 text-white group-hover:text-blood-400 transition-colors" />
              </button>
            )}

            {!isExpanded && (
              <button
                onClick={() => setIsExpanded(true)}
                className="absolute -right-2 top-1/2 -translate-y-1/2 btn-touch card-3d w-5 h-8 flex items-center justify-center group z-10"
                title="توسيع الشريط الجانبي"
              >
                <ChevronRight className="w-2 h-2 text-white group-hover:text-blood-400 transition-colors" />
              </button>
            )}
          </div>

          {/* Enhanced User Level */}
          <div className="p-2 border-b border-blood-500/20">
            <StatComponent
              icon={Star}
              value={hudData.level}
              maxValue={null}
              percent={expPercent}
              color="255, 193, 7"
              label={`المستوى ${hudData.level}`}
              isExpanded={isExpanded}
            />
          </div>

          {/* Enhanced Core Stats */}
          <div className="flex-1 overflow-y-auto scrollbar-hidden">
            <div className="space-y-2 p-2">
              
              {/* Health */}
              <StatComponent
                icon={Heart}
                value={hudData.hp}
                maxValue={hudData.maxHp}
                percent={healthPercent}
                color="239, 68, 68"
                label="الصحة"
                isExpanded={isExpanded}
              />

              {/* Energy */}
              <StatComponent
                icon={Zap}
                value={hudData.energy}
                maxValue={hudData.maxEnergy}
                percent={energyPercent}
                color="59, 130, 246"
                label="الطاقة"
                isExpanded={isExpanded}
              />

              {/* Experience */}
              <StatComponent
                icon={Star}
                value={hudData.exp}
                maxValue={hudData.nextLevelExp}
                percent={expPercent}
                color="255, 193, 7"
                label="الخبرة"
                isExpanded={isExpanded}
              />

              {/* Money */}
              <StatComponent
                icon={DollarSign}
                value={hudData.money || 0}
                maxValue={null}
                percent={100}
                color="34, 197, 94"
                label="المال"
                isExpanded={isExpanded}
              />

              {/* Blackcoins */}
              <StatComponent
                icon={Coins}
                value={hudData.blackcoins || 0}
                maxValue={null}
                percent={100}
                color="220, 38, 38"
                label="البلاك كوين"
                isExpanded={isExpanded}
              />
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="border-t border-blood-500/20 p-2 space-y-2">

            {/* Search Players */}
            <ActionButton
              icon={Search}
              label="البحث عن لاعبين"
              onClick={() => handleMobileAction(() => navigate('/players'))}
              notification={0}
              isExpanded={isExpanded}
            />

            {/* Notifications */}
            <ActionButton
              icon={Bell}
              label="الإشعارات"
              onClick={() => handleMobileAction(() => navigate('/notifications'))}
              notification={totalNotifications}
              isExpanded={isExpanded}
            />
          </div>

          {/* Enhanced Connection Status */}
          <div className="border-t border-blood-500/20 p-2">
            <ConnectionStatus
              isConnected={isConnected}
              connectionAttempts={connectionAttempts}
              isExpanded={isExpanded}
            />
          </div>
        </div>
      </div>
    </>
  )
}
