// src/components/HUD/index.jsx
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useHud } from "@/hooks/useHud"
import { useModalManager } from "@/hooks/useModalManager"
import { useSocket } from "@/hooks/useSocket"
import { useAuth } from "@/hooks/useAuth"
import { useNotificationContext } from "@/contexts/NotificationContext"
import { useUnreadMessages } from "@/hooks/useUnreadMessages"
import { useFriendRequests } from "@/hooks/useFriendRequests"
import { toast } from "react-hot-toast"
import axios from "axios"
import MoneyIcon from "@/components/MoneyIcon"
import BlackcoinIcon from "@/components/BlackcoinIcon"
import NotificationIcon from "@/components/NotificationIcon"

// Search icon
const SearchIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27c.98-1.14 1.57-2.62 1.57-4.23 0-3.59-2.91-6.5-6.5-6.5S3 5.91 3 9.5s2.91 6.5 6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
)

// Status indicator component
const StatusIndicator = ({ icon, isActive, timeLeft, className = "" }) => {
  const formatTime = (seconds) => {
    if (seconds <= 0) return ""
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isBlue = className.includes('border-blue');
  const activeColor = isBlue ? 'blue' : 'red';

  return (
    <div className={`relative group ${className}`}>
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-sm sm:text-lg transition-all duration-200 ${
          isActive
            ? isBlue 
              ? "bg-blue-950/90 border border-blue-600/60 text-blue-400 shadow-lg shadow-blue-900/20"
              : "bg-red-950/90 border border-red-600/60 text-red-400 shadow-lg shadow-red-900/20"
            : "bg-black/80 border border-zinc-700/50 text-zinc-500 hover:border-zinc-600/70"
        }`}
      >
        {icon}
      </div>
      {isActive && timeLeft > 0 && (
        <div className={`absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 bg-black/95 border border-${activeColor}-600/50 rounded-lg px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-mono text-${activeColor}-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10`}>
          {formatTime(timeLeft)}
        </div>
      )}
    </div>
  )
}

// Common stat bar component
const StatBar = ({ 
  icon, 
  percent, 
  current, 
  max, 
  color, 
  gradientFrom, 
  gradientTo, 
  isMobile = false,
  tooltipPosition = "top-full" // or "bottom-full" for mobile
}) => {
  const baseClasses = "flex items-center gap-1 bg-black/60 border border-zinc-700/50 rounded-lg px-1.5 py-1"
  const desktopClasses = "flex items-center gap-1.5 lg:gap-2 bg-black/60 border border-zinc-700/50 rounded-lg px-2 lg:px-2.5 py-1.5 lg:py-2"
  const containerClasses = isMobile ? baseClasses : desktopClasses
  
  const textSize = isMobile ? "text-xs" : "text-xs lg:text-sm"
  const iconSize = isMobile ? "text-xs" : "text-sm lg:text-base"
  const barHeight = isMobile ? "h-4" : "h-5"
  const tooltipWidth = isMobile ? "min-w-[140px]" : "min-w-[180px] lg:min-w-[200px]"

  return (
    <div className={`group/${color} relative`}>
      <div className={containerClasses}>
        <span className={`${color} ${iconSize}`}>{icon}</span>
        <span className={`${textSize} font-mono text-white`}>{Math.round(percent)}%</span>
      </div>
      
      {/* Tooltip */}
      <div className={`absolute ${tooltipPosition} left-0 ${isMobile ? 'mb-1' : 'mt-1'} opacity-0 group-hover/${color}:opacity-100 transition-all duration-300 transform translate-y-1 group-hover/${color}:translate-y-0 pointer-events-none group-hover/${color}:pointer-events-auto z-20`}>
        <div className={`flex items-center gap-2 bg-black/95 border border-zinc-800/50 rounded-lg p-2 shadow-lg ${tooltipWidth}`}>
          <span className={`${color} ${isMobile ? 'text-xs' : 'text-sm'}`}>{icon}</span>
          <div className={`flex-1 bg-black/60 border border-zinc-800/50 rounded-full ${barHeight} relative overflow-hidden`}>
            <div
              className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} ${barHeight} rounded-full transition-all duration-500 ${color === 'text-red-400' ? 'shadow-sm' : ''}`}
              style={{ width: `${color === 'text-red-400' ? Math.min(percent, 100) : percent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-mono text-white font-bold drop-shadow-lg">
                {current}/{max}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Common resource item component
const ResourceItem = ({ 
  icon, 
  value, 
  color = "text-white", 
  isMobile = false,
  IconComponent = null 
}) => {
  const baseClasses = "flex items-center gap-1 bg-black/60 border border-zinc-700/50 rounded-lg px-1.5 py-1"
  const desktopClasses = "flex items-center gap-1.5 lg:gap-2 bg-black/60 border border-zinc-700/50 rounded-lg px-2 lg:px-2.5 py-1.5 lg:py-2"
  const containerClasses = isMobile ? baseClasses : desktopClasses
  
  const textSize = isMobile ? "text-xs" : "text-xs lg:text-sm"
  const iconSize = isMobile ? "text-xs" : "text-xs lg:text-sm"
  const iconComponentSize = isMobile ? "w-3 h-3" : "w-4 h-4 lg:w-5 lg:h-5"

  return (
    <div className={containerClasses}>
      {IconComponent ? (
        <IconComponent className={iconComponentSize} />
      ) : (
        <span className={`${color} ${iconSize}`}>{icon}</span>
      )}
      <span className={`${textSize} font-mono ${color}`}>{value}</span>
    </div>
  )
}

// Common search button component
const SearchButton = ({ onClick, isMobile = false }) => {
  const buttonClasses = isMobile 
    ? "p-1.5 rounded-lg bg-black/80 hover:bg-red-950/60 border border-zinc-700/50 hover:border-red-600/50 transition-all duration-200"
    : "p-2 lg:p-2.5 rounded-lg bg-black/80 hover:bg-red-950/60 border border-zinc-700/50 hover:border-red-600/50 transition-all duration-200"

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      aria-label="بحث اللاعبين"
    >
      <SearchIcon />
    </button>
  )
}

// Status indicators row component
const StatusIndicatorsRow = ({ 
  hospitalStatus, 
  jailStatus, 
  crimeCooldown, 
  gymCooldown, 
  attackImmunityExpiresAt,
  isMobile = false 
}) => {
  const containerClasses = isMobile 
    ? "flex items-center justify-center gap-1 mb-2"
    : "flex items-center gap-1.5 lg:gap-2"

  const getAttackImmunityTimeLeft = () => {
    if (attackImmunityExpiresAt && new Date(attackImmunityExpiresAt) > new Date()) {
      const now = new Date();
      const expiresAt = new Date(attackImmunityExpiresAt);
      const remainingMs = expiresAt.getTime() - now.getTime();
      return Math.floor(remainingMs / 1000);
    }
    return 0;
  }

  return (
    <div className={containerClasses}>
      <StatusIndicator
        icon="🏥"
        isActive={hospitalStatus.inHospital}
        timeLeft={hospitalStatus.remainingSeconds}
      />
      <StatusIndicator 
        icon="🔒" 
        isActive={jailStatus.inJail} 
        timeLeft={jailStatus.remainingSeconds} 
      />
      <StatusIndicator 
        icon="🎯" 
        isActive={crimeCooldown > 0} 
        timeLeft={crimeCooldown} 
      />
      <StatusIndicator 
        icon="💪" 
        isActive={gymCooldown > 0} 
        timeLeft={gymCooldown} 
      />
      <StatusIndicator 
        icon="🛡️" 
        isActive={attackImmunityExpiresAt && new Date(attackImmunityExpiresAt) > new Date()} 
        timeLeft={getAttackImmunityTimeLeft()}
        className="border-blue-600/50"
      />
    </div>
  )
}

export default function HUD({ menuButton }) {
  const { stats, invalidateHud } = useHud()
  const { showModal, hideModal, isModalVisible } = useModalManager()
  const { socket } = useSocket()
  const { token } = useAuth()
  const navigate = useNavigate()
  const { unreadCount: notificationCount } = useNotificationContext()
  const { unreadCount: messageCount } = useUnreadMessages()
  const { pendingCount: friendRequestCount } = useFriendRequests()

  if (!token) return null
  if (!stats) return null

  // Calculate percentages
  const healthPercent = stats.maxHp > 0 ? (stats.hp / stats.maxHp) * 100 : 0
  const energyPercent = stats.maxEnergy > 0 ? (stats.energy / stats.maxEnergy) * 100 : 0
  const expPercent = stats.nextLevelExp > 0 ? (stats.exp / stats.nextLevelExp) * 100 : 0

  // Hospital and jail status
  const hospitalStatus = stats.hospitalStatus || { inHospital: false, remainingSeconds: 0 }
  const jailStatus = stats.jailStatus || { inJail: false, remainingSeconds: 0 }
  const crimeCooldown = stats.crimeCooldown || 0
  const gymCooldown = stats.gymCooldown || 0

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-black/98 backdrop-blur-sm border-b border-red-900/30 z-50">
        <div className="px-2 py-1 sm:px-3 sm:py-2">
          {/* Mobile Layout - Stacked */}
          <div className="block sm:hidden">
            {/* Top Row: Navigation & Search */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <NotificationIcon />
                {menuButton}
              </div>
              <SearchButton onClick={() => navigate("/players")} isMobile={true} />
            </div>

            {/* Middle Row: Status Indicators */}
            <StatusIndicatorsRow 
              hospitalStatus={hospitalStatus}
              jailStatus={jailStatus}
              crimeCooldown={crimeCooldown}
              gymCooldown={gymCooldown}
              attackImmunityExpiresAt={stats.attackImmunityExpiresAt}
              isMobile={true}
            />

            {/* Bottom Row: Stats & Resources */}
            <div className="flex items-center justify-between">
              {/* Stats */}
              <div className="flex items-center gap-1">
                <StatBar 
                  icon="❤️" 
                  percent={healthPercent} 
                  current={stats.hp} 
                  max={stats.maxHp} 
                  color="text-red-400" 
                  gradientFrom="from-red-600" 
                  gradientTo="to-red-500" 
                  isMobile={true}
                  tooltipPosition="bottom-full"
                />
                <StatBar 
                  icon="⭐" 
                  percent={expPercent} 
                  current={stats.exp} 
                  max={stats.nextLevelExp} 
                  color="text-yellow-400" 
                  gradientFrom="from-yellow-600" 
                  gradientTo="to-yellow-500" 
                  isMobile={true}
                  tooltipPosition="bottom-full"
                />
                <StatBar 
                  icon="⚡" 
                  percent={energyPercent} 
                  current={stats.energy} 
                  max={stats.maxEnergy} 
                  color="text-blue-400" 
                  gradientFrom="from-blue-600" 
                  gradientTo="to-blue-500" 
                  isMobile={true}
                  tooltipPosition="bottom-full"
                />
              </div>

              {/* Resources */}
              <div className="flex items-center gap-1">
                <ResourceItem 
                  IconComponent={BlackcoinIcon}
                  value={stats.blackcoins?.toLocaleString() ?? 0}
                  color="text-red-400"
                  isMobile={true}
                />
                <ResourceItem 
                  IconComponent={MoneyIcon}
                  value={stats.money?.toLocaleString()}
                  color="text-white"
                  isMobile={true}
                />
                <ResourceItem 
                  icon="⭐"
                  value={`Lv.${stats.level}`}
                  color="text-white"
                  isMobile={true}
                />
              </div>
            </div>
          </div>

          {/* Desktop Layout - Horizontal */}
          <div className="hidden sm:flex items-center justify-between gap-2 lg:gap-4">
            {/* Left Section: Navigation & Status */}
            <div className="flex items-center gap-2 lg:gap-3">
              <NotificationIcon />
              {menuButton}
              <SearchButton onClick={() => navigate("/players")} isMobile={false} />
            </div>

            {/* Center Section: Status Indicators */}
            <StatusIndicatorsRow 
              hospitalStatus={hospitalStatus}
              jailStatus={jailStatus}
              crimeCooldown={crimeCooldown}
              gymCooldown={gymCooldown}
              attackImmunityExpiresAt={stats.attackImmunityExpiresAt}
              isMobile={false}
            />

            {/* Right Section: Stats & Resources */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Stats with individual hover */}
              <div className="flex items-center gap-1.5 lg:gap-2">
                <StatBar 
                  icon="❤️" 
                  percent={healthPercent} 
                  current={stats.hp} 
                  max={stats.maxHp} 
                  color="text-red-400" 
                  gradientFrom="from-red-600" 
                  gradientTo="to-red-500" 
                  isMobile={false}
                  tooltipPosition="top-full"
                />
                <StatBar 
                  icon="⭐" 
                  percent={expPercent} 
                  current={stats.exp} 
                  max={stats.nextLevelExp} 
                  color="text-yellow-400" 
                  gradientFrom="from-yellow-600" 
                  gradientTo="to-yellow-500" 
                  isMobile={false}
                  tooltipPosition="top-full"
                />
                <StatBar 
                  icon="⚡" 
                  percent={energyPercent} 
                  current={stats.energy} 
                  max={stats.maxEnergy} 
                  color="text-blue-400" 
                  gradientFrom="from-blue-600" 
                  gradientTo="to-blue-500" 
                  isMobile={false}
                  tooltipPosition="top-full"
                />
              </div>

              {/* Resources */}
              <div className="flex items-center gap-1.5 lg:gap-2">
                <ResourceItem 
                  IconComponent={BlackcoinIcon}
                  value={stats.blackcoins?.toLocaleString() ?? 0}
                  color="text-red-400"
                  isMobile={false}
                />
                <ResourceItem 
                  IconComponent={MoneyIcon}
                  value={stats.money?.toLocaleString()}
                  color="text-white"
                  isMobile={false}
                />
                <ResourceItem 
                  icon="⭐"
                  value={`Lv.${stats.level}`}
                  color="text-white"
                  isMobile={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}