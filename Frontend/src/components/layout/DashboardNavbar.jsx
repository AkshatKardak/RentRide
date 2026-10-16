import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Info,
  Moon,
  Sun,
  ExternalLink
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import Logo from "@/assets/logo.png";
import { notificationService } from "@/services/notificationService";

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState(null);

  const notifRef = useRef(null);
  const settingsRef = useRef(null);
  const userMenuRef = useRef(null);

  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getUserNotifications();
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Failed to fetch navbar notifications:', error);
    }
  };

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw && raw !== 'undefined' && raw !== 'null') {
      try {
        setUser(JSON.parse(raw));
      } catch (err) {
        console.warn('Failed to parse user in navbar:', err);
      }
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarText = useMemo(() => {
    const name = user?.name || "User";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [user]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/signin");
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      setShowNotifications(false);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const formatNotifTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-success" />;
      case 'warning': return <AlertCircle size={16} className="text-warning" />;
      case 'error': return <AlertCircle size={16} className="text-danger" />;
      default: return <Info size={16} className="text-info" />;
    }
  };

  const tabs = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Browse Fleet", path: "/browsecars" },
    { label: "My Bookings", path: "/mybookings" },
    { label: "Payment", path: "/payment" },
    { label: "Offers", path: "/offers" },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-surface/85 backdrop-blur-md border-b border-border shadow-sm transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: logo */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 hover:opacity-90 transition focus:outline-none"
          type="button"
        >
          <img src={Logo} alt="RentRide" className="h-10 w-auto object-contain" />
        </button>

        {/* Center: tabs (desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 border border-border bg-surface-sunken/80 rounded-full px-2 py-1 transition-colors">
          {tabs.map((t) => (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
              type="button"
              className={`relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                isActive(t.path) ? 'text-primary' : 'text-text-muted hover:text-text'
              }`}
            >
              {isActive(t.path) && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-surface border border-border shadow-xs"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Right: actions + profile */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full border border-border bg-surface hover:bg-surface-sunken flex items-center justify-center transition-all shadow-xs"
            type="button"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun size={17} className="text-accent" />
            ) : (
              <Moon size={17} className="text-text-muted" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative hidden sm:block" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSettings(false);
                setShowUserMenu(false);
              }}
              className="w-9 h-9 rounded-full border border-border bg-surface hover:bg-surface-sunken flex items-center justify-center transition-all shadow-xs relative"
              type="button"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-text-muted" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-surface" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border border-border bg-surface overflow-hidden z-50"
                >
                  <div className="p-3.5 border-b border-border flex justify-between items-center bg-surface-subtle">
                    <h3 className="font-semibold text-xs text-text">
                      Notifications
                    </h3>
                    {notifications.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={clearAllNotifications}
                          className="text-[11px] text-danger hover:underline font-medium"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => {
                            navigate('/notifications');
                            setShowNotifications(false);
                          }}
                          className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
                        >
                          View all <ExternalLink size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-text-muted">
                        No new notifications
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <button
                          key={notif._id || notif.id}
                          onClick={() => markAsRead(notif._id || notif.id)}
                          className={`w-full p-3.5 text-left transition-colors flex gap-2.5 items-start ${
                            !notif.read ? 'bg-primary-soft/30 hover:bg-primary-soft/50' : 'hover:bg-surface-sunken'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs text-text truncate">{notif.title}</p>
                            <p className="text-[11px] text-text-muted line-clamp-2 mt-0.5">{notif.message}</p>
                            <p className="text-[10px] text-text-subtle font-mono mt-1">{formatNotifTime(notif.createdAt)}</p>
                          </div>
                          {!notif.read && <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shrink-0" />}
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Settings */}
          <div className="relative hidden sm:block" ref={settingsRef}>
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setShowNotifications(false);
                setShowUserMenu(false);
              }}
              className="w-9 h-9 rounded-full border border-border bg-surface hover:bg-surface-sunken flex items-center justify-center transition-all shadow-xs"
              type="button"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 text-text-muted" />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-52 rounded-2xl shadow-xl border border-border bg-surface overflow-hidden p-1.5 z-50"
                >
                  <button
                    onClick={() => { navigate('/settings'); setShowSettings(false); }}
                    className="w-full px-3.5 py-2 text-left text-xs text-text hover:bg-surface-sunken rounded-xl transition"
                  >
                    Account Settings
                  </button>
                  <button
                    onClick={() => { navigate('/help-support'); setShowSettings(false); }}
                    className="w-full px-3.5 py-2 text-left text-xs text-text hover:bg-surface-sunken rounded-xl transition"
                  >
                    Help & Support
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile User Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
                setShowSettings(false);
              }}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border border-border bg-surface hover:bg-surface-sunken transition-all shadow-xs"
              type="button"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center text-[11px] font-bold">
                {avatarText}
              </div>
              <ChevronDown size={14} className="text-text-muted" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border border-border bg-surface overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-border bg-surface-subtle">
                    <p className="font-semibold text-xs text-text">{user?.name || "User"}</p>
                    <p className="text-[11px] text-text-muted truncate mt-0.5">{user?.email || "user@example.com"}</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                      className="w-full px-3 py-2 text-left text-xs text-text hover:bg-surface-sunken rounded-xl transition flex items-center gap-2"
                    >
                      <User size={14} /> Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-left text-xs text-danger hover:bg-danger-soft rounded-xl transition flex items-center gap-2"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-full border border-border flex items-center justify-center text-text"
            type="button"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-1 overflow-hidden"
          >
            {tabs.map((t) => (
              <button
                key={t.path}
                onClick={() => { navigate(t.path); setMobileOpen(false); }}
                className={`w-full px-3 py-2 text-left text-xs rounded-xl transition ${
                  isActive(t.path) ? 'bg-primary-soft text-primary font-bold' : 'text-text hover:bg-surface-sunken'
                }`}
              >
                {t.label}
              </button>
            ))}
            <button
              onClick={() => { navigate('/profile'); setMobileOpen(false); }}
              className="w-full px-3 py-2 text-left text-xs text-text hover:bg-surface-sunken rounded-xl transition"
            >
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-left text-xs text-danger hover:bg-danger-soft rounded-xl transition"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default DashboardNavbar;