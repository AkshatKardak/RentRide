import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  CalendarCheck,
  Users,
  CreditCard,
  AlertTriangle,
  Tag,
  BarChart3,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{"name":"Admin User","email":"admin@rentride.com"}');

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Vehicles', path: '/admin/vehicles', icon: Car },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Payments', path: '/admin/payments', icon: CreditCard },
    { label: 'Damage Inspections', path: '/admin/damage', icon: AlertTriangle },
    { label: 'Promotions', path: '/admin/promotions', icon: Tag },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 z-50 w-64 border-r transition-transform duration-200 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-6 border-b flex items-center justify-between border-inherit">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
                R
              </div>
              <div>
                <span className="font-black text-lg tracking-tight">RentRide</span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-500">
                  Fleet Control
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-inherit">
            <div className={`p-3 rounded-xl mb-3 flex items-center gap-3 ${
              isDarkMode ? 'bg-slate-800/60' : 'bg-slate-100'
            }`}>
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-500 font-bold flex items-center justify-center text-sm">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{adminUser.name || 'Admin User'}</p>
                <p className="text-[10px] text-slate-400 truncate">{adminUser.email || 'admin@rentride.com'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className={`sticky top-0 z-30 h-16 border-b backdrop-blur-md flex items-center justify-between px-4 lg:px-8 ${
          isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Admin</span>
              <ChevronRight size={14} />
              <span className="text-emerald-500 font-bold capitalize">
                {location.pathname.split('/')[2] || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-colors ${
                isDarkMode ? 'border-slate-800 bg-slate-900 text-amber-400' : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              to="/browsecars"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Visit Portal ↗
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
