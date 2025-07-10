import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);
const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export function MenuButton({ isOpen, setIsOpen }) {
  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="lg:hidden p-2 rounded-lg bg-black text-white border border-red-600 shadow-lg"
      aria-label="Open menu"
    >
      {isOpen ? <CloseIcon /> : <MenuIcon />}
    </button>
  );
}

export default function Navigation({ isOpen, setIsOpen }) {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'الرئيسية', icon: '🏠' },
    { to: '/character', label: 'الشخصية', icon: '👤' },
    { to: '/crimes', label: 'الجرائم', icon: '🩸' },
    { to: '/gym', label: 'النادي الرياضي', icon: '💪' },
    { to: '/bank', label: 'البنك', icon: '🏦' },
    { to: '/shop', label: 'المتجر', icon: '🛒' },
    { to: '/inventory', label: 'الحقيبة', icon: '🎒' },
    { to: '/houses', label: 'المنازل', icon: '🏠' },
    { to: '/cars', label: 'السيارات', icon: '🚗' },
    { to: '/gangs', label: 'العصابات', icon: '👥' },
    { to: '/events', label: 'الفعاليات', icon: '🎉' },
    { to: '/social', label: 'الاجتماعي', icon: '💬' },
    { to: '/achievements', label: 'الإنجازات', icon: '🏆' },
    { to: '/players', label: 'بحث اللاعبين', icon: '🔍' },
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
        className={`fixed top-0 right-0 h-full w-64 bg-black text-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800">
            <h1 className="text-xl font-bold text-red-600">هيتمان</h1>
            <p className="text-sm text-gray-400">لعبة المتصفح</p>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-white hover:bg-zinc-900 border-r-4 ${
                    isActive ? 'bg-zinc-900 border-red-600 text-red-500 font-bold' : 'border-transparent'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer with theme toggle and logout */}
          <div className="p-4 border-t border-zinc-800 space-y-2">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-white hover:bg-zinc-900 border-r-4 border-transparent"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
              <span>{isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-red-500 hover:bg-red-900 border-r-4 border-red-600 font-bold"
            >
              <LogoutIcon />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
} 