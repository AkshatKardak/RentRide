import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
  Sun,
  Moon,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const adminUser = JSON.parse(
    localStorage.getItem('adminUser') || '{"name":"Admin User","email":"admin@rentride.com"}'
  );

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
    <div className={`min-h-screen flex font-sans ${isDarkMode ? 'bg-bg text-text' : 'bg-bg text-text'}`}>
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-overlay z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 border-r transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDarkMode
            ? 'bg-surface border-border shadow-2xl shadow-black/40'
            : 'bg-surface border-border shadow-sm'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-5 border-b border-border flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl p-1.5 flex items-center justify-center bg-primary/10 border border-primary/25 shadow-md shadow-primary/10 transition-transform group-hover:scale-105">
                <img
                  src="/tab.png"
                  alt="RentRide Logo"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>
              <div>
                <span className="font-display font-black text-lg tracking-tight flex items-center">
                  Rent<span className="text-primary ml-0.5">Ride</span>
                </span>
                <span className="block text-[10px] uppercase font-mono font-bold tracking-widest text-primary">
                  Fleet Control
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg lg:hidden hover:bg-surface-sunken text-muted hover:text-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? isDarkMode
                        ? 'bg-primary/20 border border-primary/35 text-primary shadow-sm shadow-primary/10 font-bold'
                        : 'bg-primary text-white shadow-md shadow-primary/25 font-bold'
                      : 'text-muted hover:text-text hover:bg-surface-sunken border border-transparent'
                  }`}
                >
                  <Icon
                    size={17}
                    className={isActive ? (isDarkMode ? 'text-primary' : 'text-white') : 'text-subtle'}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-border">
            <div className="p-3 rounded-xl mb-3 flex items-center gap-3 border border-border bg-surface-sunken/70">
              <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary font-mono font-bold flex items-center justify-center text-xs">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-text">{adminUser.name || 'Administrator'}</p>
                <p className="text-[10px] text-muted truncate font-mono">{adminUser.email || 'admin@rentride.com'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors border border-rose-500/20 hover:border-rose-500/40"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-border backdrop-blur-md bg-surface/85 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl lg:hidden hover:bg-surface-sunken text-muted hover:text-text transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-xs font-medium text-muted">
              <span>Admin</span>
              <ChevronRight size={14} className="text-subtle" />
              <span className="text-primary font-bold capitalize">
                {location.pathname.split('/')[2] || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl border border-border bg-surface-sunken text-text hover:border-primary/40 transition-colors"
            >
              {isDarkMode ? <Sun size={17} className="text-accent" /> : <Moon size={17} className="text-primary" />}
            </button>

            <Link
              to="/browsecars"
              className="text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-surface-sunken text-text flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Visit Portal</span>
              <ExternalLink size={12} className="text-primary" />
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
