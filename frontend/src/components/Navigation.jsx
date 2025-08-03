import { NavLink, useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useUnclaimedTasks } from "@/hooks/useUnclaimedTasks";
import { useFeatureUnlock } from "@/hooks/useFeatureUnlock";
import { useState, useEffect } from "react";
import { 
  Lock, Home, User, Target, Dumbbell, DollarSign, Shield, 
  Car, HomeIcon, Users, MessageSquare, MessageCircle, Gift, Trophy,
  Settings, LogOut, Building2, Search, ShoppingBag,
  Backpack, Group, UserPlus, Briefcase, Star, Award,
  Menu, X, ChevronRight, Crown, Sword
} from "lucide-react";

// Enhanced Menu Button with 3D effects
export function MenuButton({ isOpen, setIsOpen }) {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="btn-touch card-3d relative group overflow-hidden"
      aria-label="فتح القائمة"
    >
      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
        {isOpen ? (
          <X className="w-5 h-5 text-white group-hover:text-red-400 transition-colors" />
        ) : (
          <Menu className="w-5 h-5 text-white group-hover:text-red-400 transition-colors" />
        )}
      </div>
      
      {/* Enhanced animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blood-600/30 to-blood-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      <div className="absolute inset-0 bg-red-500/10 opacity-0 group-active:opacity-100 transition-opacity duration-100 rounded-lg"></div>
    </button>
  );
}

// Enhanced Navigation Item with 3D effects and mobile optimization
const NavItem = ({ to, label, icon: Icon, hasNotification, notificationCount, isUnlocked, onClick, category, closeMenu }) => {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-item card-3d relative group flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 border overflow-hidden ${
          isUnlocked
            ? isActive
              ? "bg-gradient-to-r from-blood-950/80 to-blood-900/60 border-blood-500/60 text-red-200 shadow-lg shadow-blood-500/30 blood-glow"
              : "text-white hover:bg-gradient-to-r hover:from-blood-950/40 hover:to-blood-900/20 hover:border-blood-500/40 hover:scale-[1.01] hover:shadow-md hover:shadow-blood-500/20"
            : "text-gray-500 cursor-not-allowed opacity-50 border-white/5 bg-black/20"
        } ${isPressed ? 'scale-[0.98]' : ''}`
      }
      onClick={(e) => {
        if (!isUnlocked) {
          e.preventDefault()
          onClick?.()
        } else {
          // Close the navigation menu when clicking an unlocked item
          closeMenu?.()
        }
      }}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {/* Icon with enhanced styling */}
      <div className="relative flex-shrink-0">
        <Icon className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 ${
          isUnlocked ? 'group-hover:text-red-400' : ''
        }`} />
        
        {/* Enhanced glow effect for active items */}
        <div className="absolute inset-0 bg-gradient-to-r from-blood-500/30 to-blood-400/30 rounded-full scale-0 group-hover:scale-150 transition-transform duration-300 opacity-0 group-hover:opacity-100 -z-10 blur-sm"></div>
        <div className="absolute inset-0 bg-blood-500/10 rounded-full scale-0 group-hover:scale-125 transition-transform duration-200 opacity-0 group-hover:opacity-100 -z-10"></div>
      </div>
      
      {/* Enhanced Label */}
      <span className="text-xs font-medium flex-1 transition-all duration-300 group-hover:text-red-200">{label}</span>
      
      {/* Lock icon for locked features */}
      {!isUnlocked && (
        <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
      )}
      
      {/* Notification badge */}
      {hasNotification && isUnlocked && (
        <div className="badge-3d flex-shrink-0">
          <span className="text-white text-xs font-bold">
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>
        </div>
      )}
      
      {/* Enhanced Chevron indicator */}
      <ChevronRight className={`w-3 h-3 flex-shrink-0 transition-all duration-300 ${
        isUnlocked ? 'group-hover:translate-x-0.5 group-hover:text-blood-400 group-hover:scale-110' : 'text-gray-600'
      }`} />
    </NavLink>
  );
};

// Category Section Component
const CategorySection = ({ title, children, icon: Icon, isCollapsed, onToggle }) => {
  return (
    <div className="category-section">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-2 text-xs text-blood-400 uppercase tracking-wider font-bold hover:text-blood-300 transition-all duration-300 group hover:bg-blood-950/20 rounded-md"
      >
        <Icon className="w-3 h-3 group-hover:scale-110 transition-transform duration-300 group-hover:text-blood-300" />
        <span className="flex-1 text-left text-xs group-hover:text-blood-300">{title}</span>
        <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${
          isCollapsed ? 'rotate-0' : 'rotate-90'
        }`} />
      </button>

      {!isCollapsed && (
        <div className="space-y-1 animate-fade-in pl-2 mt-2">
          {children}
        </div>
      )}
    </div>
  );
};

export default function Navigation({ isOpen, setIsOpen }) {
  const { logout, isAdmin } = useFirebaseAuth();
  const navigate = useNavigate();
  const { pendingCount } = useFriendRequests();
  const { unreadCount } = useUnreadMessages();
  const { unclaimedCount } = useUnclaimedTasks();
  const { isFeatureUnlocked } = useFeatureUnlock();
  
  // State for collapsible categories - start with most collapsed to minimize scrolling
  const [collapsedCategories, setCollapsedCategories] = useState({
    main: false,
    economy: true,
    combat: true,
    social: true,
    advanced: true,
    extras: true
  })

  // Auto-close navigation after navigation
  const handleNavigation = (path) => {
    setIsOpen(false)
  }

  // Close menu function
  const closeMenu = () => {
    setIsOpen(false)
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Condensed navigation items - prioritized and grouped for minimal scrolling
  const navigationCategories = [
    {
      id: 'main',
      title: 'الأساسية',
      icon: Home,
      items: [
        { to: "/dashboard", label: "الرئيسية", icon: Home, feature: "dashboard" },
        { to: "/dashboard/character", label: "الشخصية", icon: User, feature: "character" },
        { to: "/dashboard/crimes", label: "الجرائم", icon: Target, feature: "crimes" },
        { to: "/dashboard/gym", label: "النادي", icon: Dumbbell, feature: "gym" },
      ]
    },
    {
      id: 'economy',
      title: 'الاقتصاد',
      icon: DollarSign,
      items: [
        { to: "/dashboard/bank", label: "البنك", icon: DollarSign, feature: "bank" },
        { to: "/dashboard/shop", label: "المتجر", icon: Shield, feature: "shop" },
        { to: "/dashboard/inventory", label: "الحقيبة", icon: Backpack, feature: "inventory" },
        { to: "/dashboard/jobs", label: "الوظائف", icon: Briefcase, feature: "jobs" },
      ]
    },
    {
      id: 'combat',
      title: 'القتال',
      icon: Sword,
      items: [
        { to: "/dashboard/blood-contracts", label: "عقود الدم", icon: Target, feature: "bloodContracts" },
        { to: "/dashboard/active-users", label: "اللاعبون", icon: Users, feature: "fights" },
        { to: "/dashboard/hospital", label: "المستشفى", icon: Building2, feature: "hospital" },
        { to: "/dashboard/jail", label: "السجن", icon: Lock, feature: "jail" },
      ]
    },
    {
      id: 'social',
      title: 'الاجتماعية',
      icon: Users,
      items: [
        { to: "/dashboard/gangs", label: "العصابات", icon: Group, feature: "gangs" },
        { to: "/dashboard/friends", label: "الأصدقاء", icon: UserPlus, hasNotification: pendingCount > 0, notificationCount: pendingCount, feature: "friends" },
        { to: "/dashboard/messages", label: "الرسائل", icon: MessageSquare, hasNotification: unreadCount > 0, notificationCount: unreadCount, feature: "messages" },
        { to: "/dashboard/global-chat", label: "الدردشة", icon: MessageCircle, feature: "chat" },
      ]
    },
    {
      id: 'advanced',
      title: 'متقدم',
      icon: Crown,
      items: [
        { to: "/dashboard/houses", label: "المنازل", icon: HomeIcon, feature: "houses" },
        { to: "/dashboard/cars", label: "السيارات", icon: Car, feature: "cars" },
        { to: "/dashboard/dogs", label: "الكلاب", icon: Trophy, feature: "dogs" },
        { to: "/dashboard/special-shop", label: "المتجر الخاص", icon: ShoppingBag, feature: "specialShop" },
        { to: "/dashboard/black-market", label: "السوق السوداء", icon: Search, feature: "blackMarket" },
        { to: "/dashboard/ministry-mission", label: "مهام الوزارة", icon: Briefcase, feature: "ministryMissions" },
      ]
    },
    {
      id: 'extras',
      title: 'إضافات',
      icon: Gift,
      items: [
        { to: "/dashboard/tasks", label: "المهام", icon: Briefcase, hasNotification: unclaimedCount > 0, notificationCount: unclaimedCount, feature: "tasks" },
        { to: "/dashboard/login-gift", label: "الهدايا", icon: Gift, feature: "loginGift" },
        { to: "/dashboard/ranking", label: "الترتيب", icon: Award, feature: "ranking" },
        { to: "/dashboard/suggestions", label: "الاقتراحات", icon: Star, feature: "suggestions" },
        { to: "/dashboard/settings", label: "الإعدادات", icon: Settings, feature: "settings" },
      ]
    }
  ];

  const getFeatureLevel = (feature) => {
    const levels = {
      'bloodContracts': 6, 'fights': 6, 'friends': 1, 'messages': 1, 'gangs': 10,
      'ministryMissions': 5, 'bank': 11, 'specialShop': 1, 'houses': 16, 'cars': 18,
      'blackMarket': 20, 'dogs': 21, 'tasks': 1, 'suggestions': 1, 'ranking': 30
    };
    return levels[feature] || 1;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 modal-overlay z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation sidebar */}
      <aside
        className={`fixed top-0 right-0 w-72 max-w-[85vw] bg-black text-white shadow-2xl transform transition-all duration-300 ease-in-out z-50 border-l border-blood-500/30 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } h-screen overflow-hidden safe-area-top safe-area-right`}
      >
        <div className="flex flex-col h-full blood-gradient">
          
          {/* Enhanced Header with Background Image */}
          <div className="relative h-20 overflow-hidden bg-black/90 border-b border-blood-500/30">
            {/* Background Image Placeholder with 3 Circles Logo */}
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
              <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3Ccircle cx=\"20\" cy=\"30\" r=\"3\"/%3E%3Ccircle cx=\"40\" cy=\"30\" r=\"3\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
            </div>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center justify-center p-4">
              <div className="text-center">
                <h1 className="text-lg font-bold text-white mb-1 drop-shadow-lg">عقد الدم</h1>
                <p className="text-xs text-white/80 drop-shadow">لعبة المتصفح الاستراتيجية</p>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation content */}
          <div className="flex-1 overflow-y-auto scrollbar-hidden">
            <nav className="p-3 space-y-3">
              {navigationCategories.map((category) => (
                <CategorySection
                  key={category.id}
                  title={category.title}
                  icon={category.icon}
                  isCollapsed={collapsedCategories[category.id]}
                  onToggle={() => toggleCategory(category.id)}
                >
                  <div className="space-y-0.5">
                    {category.items.map((item) => {
                      const isUnlocked = isFeatureUnlocked(item.feature);

                      return (
                        <NavItem
                          key={item.to}
                          to={item.to}
                          label={item.label}
                          icon={item.icon}
                          hasNotification={item.hasNotification}
                          notificationCount={item.notificationCount}
                          isUnlocked={isUnlocked}
                          category={category.id}
                          onClick={() => {
                            if (!isUnlocked) {
                              const level = getFeatureLevel(item.feature);
                              alert(`هذه الميزة تتطلب المستوى ${level}`);
                            } else {
                              handleNavigation(item.to);
                            }
                          }}
                          closeMenu={closeMenu}
                        />
                      );
                    })}
                  </div>
                </CategorySection>
              ))}
            </nav>
          </div>

          {/* Enhanced Admin Section */}
          {isAdmin && (
            <div className="p-3 border-t border-blood-500/30 bg-black/40">
              <h3 className="text-xs text-blood-400 uppercase tracking-wider mb-2 font-bold flex items-center gap-2">
                <Crown className="w-3 h-3 text-yellow-500" />
                Admin Panel
              </h3>
              <NavItem
                to="/admin/panel"
                label="لوحة الإدارة"
                icon={Settings}
                isUnlocked={true}
                onClick={() => handleNavigation('/admin/panel')}
                closeMenu={closeMenu}
              />
            </div>
          )}

          {/* Enhanced Footer with logout */}
          <div className="p-3 border-t border-blood-500/30 bg-black/40">
            <button
              onClick={handleLogout}
              className="btn-3d w-full flex items-center justify-center gap-2 text-blood-400 hover:text-white font-bold transition-all hover:bg-blood-950/30 hover:border-blood-500/50"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
