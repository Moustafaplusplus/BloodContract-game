import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

// Shape-based Icons (no emojis)
const MenuIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const HomeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const SkullIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C8.7 2 6 4.7 6 8c0 1.8.7 3.4 1.8 4.6L8 14c0 .6.4 1 1 1h6c.6 0 1-.4 1-1l.2-1.4C17.3 11.4 18 9.8 18 8c0-3.3-2.7-6-6-6zm-2 14c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1s1-.4 1-1v-3c0-.6-.4-1-1-1zm4 0c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1s1-.4 1-1v-3c0-.6-.4-1-1-1z" />
  </svg>
);

const DumbbellIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z" />
  </svg>
);

const BankIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3L2 8v2h20V8l-10-5zM4 12v7h2v-7H4zm4 0v7h2v-7H8zm4 0v7h2v-7h-2zm4 0v7h2v-7h-2zm4 0v7h2v-7h-2zM2 20h20v2H2v-2z" />
  </svg>
);

const ShoppingIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const BackpackIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 8v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V8c0-1.86 1.28-3.41 3-3.86V3c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v1.14c1.72.45 3 2 3 3.86zM9 5V3h6v2H9zm7 5H8v2h8v-2z" />
  </svg>
);

const HouseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3l8 6v12h-5v-7h-6v7H4V9l8-6zm0 2.69L6 9.4V19h2v-7h8v7h2V9.4L12 5.69z" />
  </svg>
);

const CarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
  </svg>
);

const GroupIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-6 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C17 14.17 12.33 13 10 13zm8-1v2h3v2h-3v2h-2v-2h-3v-2h3v-2h2z"/>
  </svg>
);
const UserPlus = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-6 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C17 14.17 12.33 13 10 13zm8-1v2h3v2h-3v2h-2v-2h-3v-2h3v-2h2z"/>
  </svg>
);



const ChatIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v3c0 .6.4 1 1 1 .2 0 .4-.1.6-.2L14.5 18H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 12H7v-2h10v2zm0-3H7V9h10v2zm0-3H7V6h10v2z" />
  </svg>
);

const TrophyIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 3V1h10v2H7zm5 6.5c1.38 0 2.5-1.12 2.5-2.5S13.38 4.5 12 4.5 9.5 5.62 9.5 7s1.12 2.5 2.5 2.5zM18.5 7c0-1.1-.9-2-2-2h-1.06c-.28 2.88-2.42 5.17-5.19 5.76V14h2.25c.41 0 .75.34.75.75s-.34.75-.75.75H8.5c-.41 0-.75-.34-.75-.75S8.09 14 8.5 14h2.25v-3.24C7.98 10.17 5.84 7.88 5.56 5H4.5c-1.1 0-2 .9-2 2v3c0 1.1.9 2 2 2h2.22c.49 0 .91-.31 1.07-.74.16-.43.02-.92-.31-1.26-.33-.34-.82-.48-1.26-.31-.22.08-.45-.04-.53-.26s.04-.45.26-.53c.78-.31 1.66-.1 2.27.51.61.61.82 1.49.51 2.27-.08.22-.3.36-.53.26-.43-.16-.92-.02-1.26.31-.34.33-.47.83-.31 1.26.16.43.58.74 1.07.74H18.5c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27c.98-1.14 1.57-2.62 1.57-4.23 0-3.59-2.91-6.5-6.5-6.5S3 5.91 3 9.5s2.91 6.5 6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const MarketIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
  </svg>
);

const WorkIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 6h-2.5l-1.5-1.5h-5L9.5 6H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h13c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
  </svg>
);

const SwordIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6.92 5H5.14c-.25 0-.49.1-.7.29L2.29 7.44c-.39.39-.39 1.02 0 1.41L4.14 10.7c.21.19.45.29.7.29h1.78c.25 0 .49-.1.7-.29l2.15-2.15c.39-.39.39-1.02 0-1.41L7.62 5.29c-.21-.19-.45-.29-.7-.29zM12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const HospitalIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V18z"/>
  </svg>
);

const JailIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5zM12 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
);

const GoldIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 21H5V3H13V9H19Z" />
  </svg>
);



const MissionIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5zM12 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  </svg>
);

const TasksIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

export function MenuButton({ isOpen, setIsOpen }) {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="lg:hidden p-2 rounded-lg bg-black text-white border border-red-600 shadow-lg hover:bg-red-900 transition-colors"
      aria-label="فتح القائمة"
    >
      {isOpen ? <CloseIcon /> : <MenuIcon />}
    </button>
  );
}

export default function Navigation({ isOpen, setIsOpen }) {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // All navigation items in a flat list
  const navItems = [
    { to: "/dashboard", label: "الرئيسية", icon: HomeIcon },
    { to: "/dashboard/character", label: "الشخصية", icon: UserIcon },
    { to: "/dashboard/crimes", label: "الجرائم", icon: SkullIcon },
    { to: "/dashboard/blood-contracts", label: "عقود الدم", icon: SkullIcon },
    { to: "/dashboard/gym", label: "النادي الرياضي", icon: DumbbellIcon },
    { to: "/dashboard/active-users", label: "اللاعبون النشطون", icon: UserIcon },
    { to: "/dashboard/hospital", label: "المستشفى", icon: HospitalIcon },
    { to: "/dashboard/jail", label: "السجن", icon: JailIcon },
    { to: "/dashboard/bank", label: "البنك", icon: BankIcon },
    { to: "/dashboard/shop", label: "المتجر", icon: ShoppingIcon },
    { to: "/dashboard/special-shop", label: "سوق العملة السوداء", icon: ShoppingIcon, className: "glow-red-nav" },
    { to: "/dashboard/black-market", label: "السوق السوداء", icon: MarketIcon },
    { to: "/dashboard/jobs", label: "الوظائف", icon: WorkIcon },
    { to: "/dashboard/inventory", label: "الحقيبة", icon: BackpackIcon },
    { to: "/dashboard/houses", label: "المنازل", icon: HouseIcon },
    { to: "/dashboard/cars", label: "السيارات", icon: CarIcon },
    { to: "/dashboard/dogs", label: "الكلاب", icon: TrophyIcon },
    { to: "/dashboard/gangs", label: "العصابات", icon: GroupIcon },
    { to: "/dashboard/friends", label: "الأصدقاء", icon: UserPlus },
    { to: "/dashboard/messages", label: "الرسائل", icon: ChatIcon },
    { to: "/dashboard/global-chat", label: "الدردشة العامة", icon: ChatIcon },
    { to: "/dashboard/tasks", label: "المهام", icon: TasksIcon },
    { to: "/dashboard/ministry-mission", label: "مهام الوزارة", icon: MissionIcon },
    { to: "/dashboard/suggestions", label: "الاقتراحات", icon: SearchIcon },
    {
      label: "تصنيف اللاعبين",
      to: "/dashboard/ranking",
      icon: TrophyIcon,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-70 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Navigation sidebar */}
      <aside
        className={`fixed top-[56px] right-0 w-80 bg-black text-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 border-l border-red-900 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-x-hidden`} // Use top-[56px] to always be below HUD
      >
        <div className="flex flex-col h-[calc(100vh-56px)]">
          {/* Header */}
          <div className="p-6 border-b border-red-900 bg-gradient-to-br from-red-950 via-black to-red-900 shadow-xl">
            <div className="text-center">
              <h1 className="text-2xl font-bouya text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-400 leading-tight mb-2 animate-pulse">
                عقد الدم
              </h1>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mb-2"></div>
              <p className="text-xs text-red-300 font-medium tracking-wide">
                لعبة المتصفح
              </p>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 p-4 overflow-y-auto overflow-x-hidden">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-white hover:bg-red-900/30 border-r-4 group ${
                      isActive
                        ? "bg-red-900/50 border-red-500 text-red-300 font-bold shadow-lg shadow-red-900/20"
                        : "border-transparent hover:border-red-600"
                    }`
                  }
                >
                  <item.icon className="flex-shrink-0 group-hover:text-red-400" />
                  <span className={`text-sm${item.className ? ` ${item.className}` : ''}`}>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Admin Section */}
          {isAdmin && (
            <div className="mt-4">
              <h3 className="text-xs text-red-500 uppercase tracking-wider mb-1">Admin</h3>
              <NavLink
                to="/admin/panel"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded hover:bg-red-800 text-white ${
                    isActive ? "bg-red-800" : ""
                  }`
                }
              >
                لوحة الإدارة
              </NavLink>
            </div>
          )}

          {/* Footer with logout */}
          <div className="p-4 border-t border-red-900 bg-gradient-to-r from-black to-red-950">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-red-900 border-r-4 border-red-600 font-bold transition-all duration-200 hover:text-white group"
            >
              <LogoutIcon className="group-hover:text-white" />
              <span className="text-sm">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
