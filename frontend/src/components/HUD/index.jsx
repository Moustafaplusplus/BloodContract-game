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
import { Search, Bell } from "lucide-react"

// Icon-only stat component with hover expansion
const IconStat = ({ icon, value, percent, color, label, IconComponent = null }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Icon only view */}
      <div className="flex items-center justify-center bg-black/80 border border-white/20 rounded p-2 hover:bg-white/10 transition-colors">
        {IconComponent ? (
          <IconComponent className={`w-5 h-5 ${color}`} />
        ) : (
          <span className={`${color} text-lg`}>{icon}</span>
        )}
      </div>
      
      {/* Expanded view on hover */}
      {isExpanded && (
        <div className="absolute left-full ml-2 bg-black/95 border border-white/20 rounded px-3 py-2 min-w-[140px] z-50">
          <div className="text-sm text-white mb-2 font-bold">{label}</div>
          <div className="text-xs text-gray-300 mb-2">{value}</div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${color.replace('text-', 'bg-')}`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-300">{Math.round(percent)}%</div>
        </div>
      )}
    </div>
  )
}

// Simple notification indicator
const NotificationIndicator = ({ count }) => {
  if (count === 0) return null
  return (
    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center">
      <span className="text-white text-xs font-bold">{count > 99 ? '99+' : count}</span>
    </div>
  )
}

export default function HUD({ menuButton }) {
  const { 
    socket, 
    hudData, 
    crimeData,
    requestHudUpdate 
  } = useSocket()
  const { customToken } = useFirebaseAuth()
  const navigate = useNavigate()
  const { unreadCount: notificationCount } = useNotificationContext()
  const { unreadCount: messageCount } = useUnreadMessages()
  const { pendingCount: friendRequestCount } = useFriendRequests()

  // Request initial data when component mounts
  useEffect(() => {
    if (socket && socket.connected) {
      requestHudUpdate()
    }
  }, [socket, requestHudUpdate])

  if (!customToken || !hudData) return null

  // Calculate percentages
  const healthPercent = hudData.maxHp > 0 ? (hudData.hp / hudData.maxHp) * 100 : 0
  const energyPercent = hudData.maxEnergy > 0 ? (hudData.energy / hudData.maxEnergy) * 100 : 0
  const expPercent = hudData.nextLevelExp > 0 ? (hudData.exp / hudData.nextLevelExp) * 100 : 0

  // Calculate total notifications
  const totalNotifications = notificationCount + messageCount + friendRequestCount

  return (
    <div className="fixed left-0 top-0 bottom-0 bg-black border-r border-white/20 z-50 w-16 flex flex-col">
      {/* Menu Button */}
      <div className="p-2 border-b border-white/20">
        {menuButton}
      </div>

      {/* Level */}
      <div className="p-2 border-b border-white/20">
        <div className="flex items-center justify-center bg-black/80 border border-white/20 rounded p-2 hover:bg-white/10 transition-colors">
          <span className="text-yellow-400 text-lg">⭐</span>
        </div>
      </div>

      {/* Health */}
      <div className="p-2 border-b border-white/20">
        <IconStat 
          icon="❤️"
          value={`${hudData.hp}/${hudData.maxHp}`}
          percent={healthPercent}
          color="text-red-400"
          label="الصحة"
        />
      </div>

      {/* Energy */}
      <div className="p-2 border-b border-white/20">
        <IconStat 
          icon="⚡"
          value={`${hudData.energy}/${hudData.maxEnergy}`}
          percent={energyPercent}
          color="text-blue-400"
          label="الطاقة"
        />
      </div>

      {/* Experience */}
      <div className="p-2 border-b border-white/20">
        <IconStat 
          icon="⭐"
          value={`${hudData.exp}/${hudData.nextLevelExp}`}
          percent={expPercent}
          color="text-yellow-400"
          label="الخبرة"
        />
      </div>

      {/* Blackcoins */}
      <div className="p-2 border-b border-white/20">
        <IconStat 
          IconComponent={BlackcoinIcon}
          value={hudData.blackcoins?.toLocaleString() ?? 0}
          percent={100}
          color="text-red-400"
          label="البلاك كوين"
        />
      </div>

      {/* Money */}
      <div className="p-2 border-b border-white/20">
        <IconStat 
          IconComponent={MoneyIcon}
          value={hudData.money?.toLocaleString()}
          percent={100}
          color="text-white"
          label="المال"
        />
      </div>

      {/* Search Button */}
      <div className="p-2 border-b border-white/20">
        <button
          onClick={() => navigate('/players')}
          className="flex items-center justify-center bg-black/80 border border-white/20 rounded p-2 hover:bg-white/10 transition-colors w-full"
          title="البحث عن لاعبين"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Notifications Button */}
      <div className="p-2 border-b border-white/20">
        <div className="relative">
          <button
            onClick={() => navigate('/notifications')}
            className="flex items-center justify-center bg-black/80 border border-white/20 rounded p-2 hover:bg-white/10 transition-colors w-full relative"
            title="الإشعارات"
          >
            <Bell className="w-5 h-5 text-white" />
            {totalNotifications > 0 && (
              <NotificationIndicator count={totalNotifications} />
            )}
          </button>
        </div>
      </div>

      {/* Spacer to push content to bottom */}
      <div className="flex-1"></div>
    </div>
  )
}