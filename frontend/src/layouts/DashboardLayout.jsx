/* ============================================================================
 *  src/layouts/DashboardLayout.jsx – added Gym nav link
 * ----------------------------------------------------------------------------*/
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function DashboardLayout({ children }) {
  return (
    <div dir="rtl" className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white shadow p-4">
        <nav>
          <ul className="space-y-2">
            <li><NavLink to="/" className={({ isActive }) => `block p-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-200' : ''}`}>الصفحة الرئيسية</NavLink></li>
            <li><NavLink to="/character" className={({ isActive }) => `block p-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-200' : ''}`}>الشخصية</NavLink></li>
            <li><NavLink to="/crimes" className={({ isActive }) => `block p-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-200' : ''}`}>الجرائم</NavLink></li>
            <li><NavLink to="/gym" className={({ isActive }) => `block p-2 rounded hover:bg-gray-200 ${isActive ? 'bg-gray-200' : ''}`}>النادي الرياضي</NavLink></li>
            <li><NavLink to="/bank"       className="block px-2 py-1 rounded hover:bg-slate-700">البنك</NavLink></li>
            <li><NavLink to="/bank/history" className="block px-4 py-1 rounded hover:bg-slate-700 text-sm">سجل الفوائد</NavLink></li>
            <li><NavLink to="/inventory" className="block px-2 py-1 rounded hover:bg-slate-700">الحقيبة</NavLink></li>
            <li><NavLink to="/shop"      className="block px-2 py-1 rounded hover:bg-slate-700">المتجر</NavLink></li>
            {/* Add other nav items as needed */}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 relative p-6">
        {children}
      </main>
    </div>
  );
}