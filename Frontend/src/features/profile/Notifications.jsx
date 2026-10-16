import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Trash2, X } from 'lucide-react';
import { notificationService } from '@/features/profile/notificationService';
import { toast } from 'react-hot-toast';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

const Notifications = () => {
  const { isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getUserNotifications();
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error('Failed to clear notifications');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-primary" size={18} />;
      case 'warning': return <AlertTriangle className="text-accent" size={18} />;
      case 'error': return <Bell className="text-rose-500" size={18} />;
      case 'alert': return <Bell className="text-rose-500" size={18} />;
      default: return <Info className="text-primary" size={18} />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-bg text-text pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-black tracking-tight text-text mb-2">Notifications</h1>
              <p className="text-xs md:text-sm text-muted">Stay updated with your trips, fleet alerts, and rewards</p>
            </div>
            <div className="flex gap-2">
              {notifications.some(n => !n.read) && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-bold text-primary hover:underline px-3 py-1.5 rounded-lg transition-colors font-mono"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs font-bold text-rose-500 hover:underline px-3 py-1.5 rounded-lg transition-colors font-mono"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3.5">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <AnimatePresence>
                {notifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 rounded-3xl border border-border bg-surface"
                  >
                    <Bell className="w-16 h-16 mx-auto mb-4 text-muted/20" />
                    <p className="font-bold text-sm text-muted">No notifications yet</p>
                  </motion.div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                      className={`relative p-5 rounded-3xl border shadow-xs group cursor-pointer transition-all hover:border-primary/40 ${
                        !notification.read
                          ? 'border-l-4 border-l-primary bg-primary/5 border-border'
                          : 'border-border bg-surface'
                      }`}
                      onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                    >
                      <div className="flex gap-4">
                        <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center bg-surface-sunken border border-border`}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className={`font-bold text-sm mb-1 ${!notification.read ? 'text-primary' : 'text-text'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-[10px] font-mono font-bold flex items-center gap-1 text-muted">
                              <Clock size={10} /> {formatTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-muted leading-relaxed pr-8">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification._id);
                        }}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-surface-sunken rounded-full text-muted hover:text-rose-500"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Notifications;