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
import { useTheme } from "@/context/ThemeContext";
import Logo from "@/assets/logo.png";
import { notificationService } from "@/services/notificationService";
import { toast } from "react-hot-toast";

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
    // Poll for notifications every 30 seconds
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
    if (raw) setUser(JSON.parse(raw));
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
      case 'success': return <CheckCircle size={18} className="text-green-500" />;
      case 'warning': return <AlertCircle size={18} className="text-yellow-500" />;
      case 'error': return <AlertCircle size={18} className="text-red-500" />;
      default: return <Info size={18} className="text-blue-500" />;
    }
  };

  const tabs = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Browse Cars", path: "/browsecars" },
    { label: "My Bookings", path: "/mybookings" },
    { label: "Payment", path: "/payment" },
    { label: "Offers", path: "/offers" },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: isDarkMode ? '#334155' : '#e5e7eb'
      }}
      className="sticky top-0 z-50 backdrop-blur-md border-b shadow-sm transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: logo */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 hover:opacity-90 transition"
          type="button"
        >
          <img src={Logo} alt="RentRide" className="h-50 w-auto object-contain" />
        </button>

        {/* Center: tabs (desktop) */}
        <nav
          className="hidden md:flex items-center gap-2 border rounded-full px-2 py-1 transition-colors"
          style={{
            backgroundColor: isDarkMode ? '#1e293b' : '#f8f9fa',
            borderColor: isDarkMode ? '#334155' : '#e5e7eb'
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
              type="button"
              className="relative px-4 py-2 rounded-full text-sm font-semibold transition"
              style={{
                color: isActive(t.path)
                  ? '#10b981'
                  : isDarkMode ? '#cbd5e1' : '#6B7280'
              }}
            >
              {isActive(t.path) && (
                <motion.span
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full border shadow-sm"
                  style={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    borderColor: isDarkMode ? '#334155' : '#e5e7eb'
                  }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Right: icons + profile */}
        <div className="flex items-center gap-1.5">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-opacity-50 transition-all shadow-sm relative group"
            style={{
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              borderColor: isDarkMode ? '#334155' : '#e5e7eb'
            }}
            type="button"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-gray-500" />
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
              className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-opacity-50 transition-all shadow-sm relative"
              style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                borderColor: isDarkMode ? '#334155' : '#e5e7eb'
              }}
              type="button"
            >
              <Bell className="w-5 h-5" style={{ color: isDarkMode ? '#cbd5e1' : '#6B7280' }} />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2"
                  style={{ borderColor: isDarkMode ? '#0f172a' : '#ffffff' }}
                ></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border overflow-hidden"
                  style={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    borderColor: isDarkMode ? '#334155' : '#e5e7eb'
                  }}
                >
                  <div
                    className="p-4 border-b flex justify-between items-center"
                    style={{ borderColor: isDarkMode ? '#334155' : '#e5e7eb' }}
                  >
                    <h3 className="font-bold" style={{ color: isDarkMode ? '#f1f5f9' : '#1F2937' }}>
                      Notifications
                    </h3>
                    {notifications.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          onClick={clearAllNotifications}
                          className="text-[10px] text-red-500 font-semibold hover:underline"
                        >
                          Clear all
                        </button>
                        <button
                          onClick={() => {
                            navigate('/notifications');
                            setShowNotifications(false);
                          }}
                          className="text-[10px] text-blue-500 font-semibold hover:underline flex items-center gap-1"
                        >
                          View all <ExternalLink size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm" style={{ color: isDarkMode ? '#cbd5e1' : '#6B7280' }}>
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => markAsRead(notif.id)}
                          className="w-full p-4 border-b hover:bg-opacity-50 transition text-left"
                          style={{
                            backgroundColor: !notif.read
                              ? (isDarkMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.05)')
                              : 'transparent',
                            borderColor: isDarkMode ? '#334155' : '#e5e7eb'
                          }}
                        >
                          <div className="flex gap-3">
                            <div className="mt-1">
                              {getNotifIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-xs" style={{ color: isDarkMode ? '#f1f5f9' : '#1F2937' }}>
                                {notif.title}
                              </p>
                              <p className="text-[10px] mt-0.5" style={{ color: isDarkMode ? '#cbd5e1' : '#6B7280' }}>
                                {notif.message}
                              </p>
                              <p className="text-[10px] mt-1" style={{ color: isDarkMode ? '#94a3b8' : '#9CA3AF' }}>
                                {formatNotifTime(notif.createdAt)}
                              </p>
                            </div>
                            {!notif.read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>}
                          </div>
                        </button>
                      )).slice(0, 5)
                    )}
                  </div>
                  {notifications.length > 5 && (
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setShowNotifications(false);
                      }}
                      className="w-full py-2 text-center text-xs font-bold border-t hover:bg-opacity-50 transition"
                      style={{
                        color: '#10b981',
                        borderColor: isDarkMode ? '#334155' : '#e5e7eb',
                        backgroundColor: isDarkMode ? '#1e293b' : '#f8f9fa'
                      }}
                    >
                      View all notifications
                    </button>
                  )}
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
              className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-opacity-50 transition-all shadow-sm"
              style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                borderColor: isDarkMode ? '#334155' : '#e5e7eb'
              }}
              type="button"
            >
              <Settings className="w-5 h-5" style={{ color: isDarkMode ? '#cbd5e1' : '#6B7280' }} />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border overflow-hidden"
                  style={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    borderColor: isDarkMode ? '#334155' : '#e5e7eb'
                  }}
                >
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowSettings(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-opacity-50 rounded-xl transition"
                      style={{ color: isDarkMode ? '#f1f5f9' : '#1F2937' }}
                    >
                      Account Settings
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowSettings(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-opacity-50 rounded-xl transition"
                      style={{ color: isDarkMode ? '#f1f5f9' : '#1F2937' }}
                    >
                      Preferences
                    </button>
                    <button
                      onClick={() => {
                        navigate('/help-support');
                        setShowSettings(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-opacity-50 rounded-xl transition"
                      style={{ color: isDarkMode ? '#f1f5f9' : '#1F2937' }}
                    >
                      Help & Support
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
                setShowSettings(false);
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border hover:bg-opacity-50 transition-all shadow-sm"
              style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                borderColor: isDarkMode ? '#334155' : '#e5e7eb'
              }}
              type="button"
            >
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                {avatarText}
              </div>
              <ChevronDown size={16} style={{ color: isDarkMode ? '#cbd5e1' : '#6B7280' }} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl shadow-xl border overflow-hidden"
                  style={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    borderColor: isDarkMode ? '#334155' : '#e5e7eb'
                  }}
                >
                  <div
                    className="p-4 border-b"
                    style={{ borderColor: isDarkMode ? '#334155' : '#e5e7eb' }}
                  >
                    <p className="font-semibold" style={{ color: isDarkMode ? '#f1f5f9' : '#1F2937' }}>
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: isDarkMode ? '#cbd5e1' : '#6B7280' }}>
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-opacity-50 rounded-xl transition flex items-center gap-2"
                      style={{ color: isDarkMode ? '#f1f5f9' : '#1F2937' }}
                    >
                      <User size={16} />
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 rounded-full border flex items-center justify-center hover:bg-opacity-50 transition-all"
            style={{
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              borderColor: isDarkMode ? '#334155' : '#e5e7eb',
              color: isDarkMode ? '#cbd5e1' : '#1F2937'
            }}
            type="button"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
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
            className="md:hidden border-t overflow-hidden"
            style={{
              backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
              borderColor: isDarkMode ? '#334155' : '#e5e7eb'
            }}
          >
            <div className="px-4 py-4 space-y-2">
              {tabs.map((t) => (
                <button
                  key={t.path}
                  onClick={() => {
                    navigate(t.path);
                    setMobileOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm rounded-xl transition"
                  style={{
                    backgroundColor: isActive(t.path)
                      ? (isDarkMode ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.1)')
                      : 'transparent',
                    color: isActive(t.path)
                      ? '#10b981'
                      : isDarkMode ? '#f1f5f9' : '#1F2937',
                    fontWeight: isActive(t.path) ? '600' : '400'
                  }}
                >
                  {t.label}
                </button>
              ))}
              <button
                onClick={() => {
                  navigate('/profile');
                  setMobileOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm rounded-xl transition"
                style={{ color: isDarkMode ? '#f1f5f9' : '#1F2937' }}
              >
                Profile
              </button>
              <button
                onClick={() => {
                  navigate('/settings');
                  setMobileOpen(false);
                }}
                className="w-full px-4 py-2.5 text-left text-sm rounded-xl transition"
                style={{ color: isDarkMode ? '#f1f5f9' : '#1F2937' }}
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default DashboardNavbar;