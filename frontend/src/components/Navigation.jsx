import { NavLink, useNavigate } from "react-router-dom";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useFriendRequests } from "@/hooks/useFriendRequests";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { useUnclaimedTasks } from "@/hooks/useUnclaimedTasks";
import { useFeatureUnlock } from "@/hooks/useFeatureUnlock";
import { 
  Lock, Home, User, Target, Dumbbell, DollarSign, Shield, 
  Car, HomeIcon, Users, MessageSquare, MessageCircle, Gift, Trophy,
  Settings, LogOut, Building2, Search, ShoppingBag,
  Backpack, Group, UserPlus, Briefcase, Star, Award
} from "lucide-react";

// Menu button component
export function MenuButton({ isOpen, setIsOpen }) {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="p-2 rounded border border-white/20 bg-black/80 text-white hover:border-red-500/50 hover:bg-red-950/20 transition-all"
      aria-label="فتح القائمة"
    >
      {isOpen ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );
}

// Navigation item component
const NavItem = ({ to, label, icon: Icon, hasNotification, notificationCount, isUnlocked, onClick }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all border border-white/10 ${
        isUnlocked
          ? isActive
            ? "bg-red-950/50 border-red-500/50 text-red-300 font-bold"
            : "text-white hover:bg-red-950/30 hover:border-red-500/30"
          : "text-gray-500 cursor-not-allowed opacity-60"
      }`
    }
    onClick={onClick}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    <span className="text-sm">{label}</span>
    
    {!isUnlocked && (
      <Lock className="w-4 h-4 text-gray-500 mr-auto" />
    )}
    
    {hasNotification && isUnlocked && (
      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold min-w-[20px] mr-auto">
        {notificationCount > 99 ? '99+' : notificationCount}
      </span>
    )}
  </NavLink>
);

export default function Navigation({ isOpen, setIsOpen }) {
  const { logout, isAdmin } = useFirebaseAuth();
  const navigate = useNavigate();
  const { pendingCount } = useFriendRequests();
  const { unreadCount } = useUnreadMessages();
  const { unclaimedCount } = useUnclaimedTasks();
  const { isFeatureUnlocked } = useFeatureUnlock();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Organized navigation items by category
  const navItems = [
    // Main
    { to: "/dashboard", label: "الرئيسية", icon: Home, feature: "dashboard" },
    { to: "/dashboard/character", label: "الشخصية", icon: User, feature: "character" },
    
    // Combat & Activities
    { to: "/dashboard/crimes", label: "الجرائم", icon: Target, feature: "crimes" },
    { to: "/dashboard/blood-contracts", label: "عقود الدم", icon: Target, feature: "bloodContracts" },
    { to: "/dashboard/gym", label: "النادي الرياضي", icon: Dumbbell, feature: "gym" },
    { to: "/dashboard/active-users", label: "اللاعبون النشطون", icon: Users, feature: "fights" },
    
    // Status & Confinement
    { to: "/dashboard/hospital", label: "المستشفى", icon: Building2, feature: "hospital" },
    { to: "/dashboard/jail", label: "السجن", icon: Lock, feature: "jail" },
    
    // Economy
    { to: "/dashboard/bank", label: "البنك", icon: DollarSign, feature: "bank" },
    { to: "/dashboard/shop", label: "المتجر", icon: Shield, feature: "shop" },
    { to: "/dashboard/special-shop", label: "سوق العملة السوداء", icon: ShoppingBag, feature: "specialShop" },
    { to: "/dashboard/black-market", label: "السوق السوداء", icon: Search, feature: "blackMarket" },
    { to: "/dashboard/jobs", label: "الوظائف", icon: Briefcase, feature: "jobs" },
    
    // Assets
    { to: "/dashboard/inventory", label: "الحقيبة", icon: Backpack, feature: "inventory" },
    { to: "/dashboard/houses", label: "المنازل", icon: HomeIcon, feature: "houses" },
    { to: "/dashboard/cars", label: "السيارات", icon: Car, feature: "cars" },
    { to: "/dashboard/dogs", label: "الكلاب", icon: Trophy, feature: "dogs" },
    { to: "/dashboard/gangs", label: "العصابات", icon: Group, feature: "gangs" },
    
    // Social
    { to: "/dashboard/friends", label: "الأصدقاء", icon: UserPlus, hasNotification: pendingCount > 0, notificationCount: pendingCount, feature: "friends" },
    { to: "/dashboard/messages", label: "الرسائل", icon: MessageSquare, hasNotification: unreadCount > 0, notificationCount: unreadCount, feature: "messages" },
    { to: "/dashboard/global-chat", label: "الدردشة العامة", icon: MessageCircle, feature: "chat" },
    
    // Content
    { to: "/dashboard/tasks", label: "المهام", icon: Briefcase, hasNotification: unclaimedCount > 0, notificationCount: unclaimedCount, feature: "tasks" },
    { to: "/dashboard/login-gift", label: "مكافآت الدخول", icon: Gift, hasNotification: true, notificationCount: 1, feature: "loginGift" },
    { to: "/dashboard/ministry-mission", label: "مهام الوزارة", icon: Star, feature: "ministryMissions" },
    { to: "/dashboard/suggestions", label: "الاقتراحات", icon: Search, feature: "suggestions" },
    { to: "/dashboard/ranking", label: "تصنيف اللاعبين", icon: Award, feature: "ranking" },
    
    // Settings
    { to: "/dashboard/settings", label: "الإعدادات", icon: Settings, feature: "settings" },
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
          className="lg:hidden fixed inset-0 bg-black/70 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation sidebar */}
      <aside
        className={`fixed top-12 right-0 w-80 bg-black text-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 border-l border-white/20 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-hidden h-[calc(100vh-48px)]`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/20 bg-black/80">
            <div className="text-center">
              <h1 className="text-xl font-bold text-red-500 mb-1">عقد الدم</h1>
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mb-2"></div>
              <p className="text-xs text-white/70">لعبة المتصفح</p>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isUnlocked = isFeatureUnlocked(item.feature);
                
                return (
                  <div key={item.to} className="relative">
                    <NavItem
                      to={item.to}
                      label={item.label}
                      icon={item.icon}
                      hasNotification={item.hasNotification}
                      notificationCount={item.notificationCount}
                      isUnlocked={isUnlocked}
                      onClick={() => {
                        if (!isUnlocked) {
                          const level = getFeatureLevel(item.feature);
                          alert(`هذه الميزة تتطلب المستوى ${level}`);
                        } else {
                          setIsOpen(false);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </nav>

          {/* Admin Section */}
          {isAdmin && (
            <div className="p-4 border-t border-white/20">
              <h3 className="text-xs text-red-500 uppercase tracking-wider mb-2">Admin</h3>
              <NavLink
                to="/admin/panel"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded border border-white/10 text-white hover:bg-red-950/30 hover:border-red-500/30 transition-all ${
                    isActive ? "bg-red-950/50 border-red-500/50" : ""
                  }`
                }
              >
                لوحة الإدارة
              </NavLink>
            </div>
          )}

          {/* Footer with logout */}
          <div className="p-4 border-t border-white/20 bg-black/80">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-950/30 border border-white/10 hover:border-red-500/30 font-bold transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
