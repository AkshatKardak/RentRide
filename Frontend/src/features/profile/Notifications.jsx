import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Bell, CheckCircle, AlertTriangle, Info, Clock, Trash2, X } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { toast } from 'react-hot-toast';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

const Notifications = () => {
    const { isDarkMode } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const theme = {
        bg: isDarkMode ? '#0f172a' : '#f8f9fa',
        cardBg: isDarkMode ? '#1e293b' : '#ffffff',
        text: isDarkMode ? '#f1f5f9' : '#1F2937',
        textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
        border: isDarkMode ? '#334155' : '#e5e7eb',
        hover: isDarkMode ? '#334155' : '#f3f4f6',
    };

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
            case 'success': return <CheckCircle className="text-green-500" size={20} />;
            case 'warning': return <AlertTriangle className="text-orange-500" size={20} />;
            case 'error': return <Bell className="text-red-500" size={20} />;
            case 'alert': return <Bell className="text-red-500" size={20} />;
            default: return <Info className="text-blue-500" size={20} />;
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
            <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-black mb-2" style={{ color: theme.text }}>Notifications</h1>
                            <p className="text-sm" style={{ color: theme.textSecondary }}>Stay updated with your activities</p>
                        </div>
                        <div className="flex gap-2">
                            {notifications.some(n => !n.read) && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearAll}
                                    className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {notifications.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-12"
                                    >
                                        <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: theme.text }} />
                                        <p className="font-bold" style={{ color: theme.textSecondary }}>No notifications yet</p>
                                    </motion.div>
                                ) : (
                                    notifications.map((notification) => (
                                        <motion.div
                                            key={notification._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                            className={`relative p-5 rounded-2xl border shadow-sm group cursor-pointer transition-all hover:shadow-md ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
                                            style={{
                                                backgroundColor: theme.cardBg,
                                                borderColor: theme.border
                                            }}
                                            onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                                        >
                                            <div className="flex gap-4">
                                                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-opacity-10 ${notification.type === 'success' ? 'bg-green-500' :
                                                        notification.type === 'warning' ? 'bg-orange-500' :
                                                            notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                                    }`}>
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className={`font-bold text-sm mb-1 ${!notification.read ? 'text-blue-500' : ''}`} style={{ color: !notification.read ? undefined : theme.text }}>
                                                            {notification.title}
                                                        </h4>
                                                        <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: theme.textSecondary }}>
                                                            <Clock size={10} /> {formatTime(notification.createdAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs leading-relaxed pr-8" style={{ color: theme.textSecondary }}>
                                                        {notification.message}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notification._id);
                                                }}
                                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-red-500"
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