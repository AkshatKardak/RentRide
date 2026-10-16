import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { User, Mail, Phone, MapPin, Camera, Save, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userService } from '@/services/userService';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

const UserProfile = () => {
    const { isDarkMode } = useTheme();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        profilePicture: ''
    });

    const theme = {
        bg: isDarkMode ? '#0f172a' : '#f8f9fa',
        cardBg: isDarkMode ? '#1e293b' : '#ffffff',
        text: isDarkMode ? '#f1f5f9' : '#1F2937',
        textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
        border: isDarkMode ? '#334155' : '#e5e7eb',
        inputBg: isDarkMode ? '#0f172a' : '#f8f9fa',
    };

    // Fetch real user data from API
    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setFetching(true);
            const response = await userService.getProfile();
            
            if (response.success) {
                const user = response.data;
                setUserData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    address: user.address || '',
                    profilePicture: user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=4F46E5&color=fff&size=200`
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            toast.error(error.message || 'Failed to load profile');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await userService.updateProfile({
                name: userData.name,
                phone: userData.phone,
                address: userData.address,
                profilePicture: userData.profilePicture
            });

            if (response.success) {
                toast.success('Profile updated successfully!');
                // Update local storage
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...currentUser,
                    name: userData.name,
                    phone: userData.phone,
                    address: userData.address,
                    profilePicture: userData.profilePicture
                }));
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <>
                <DashboardNavbar />
                <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center" style={{ backgroundColor: theme.bg }}>
                    <Loader className="animate-spin w-8 h-8" style={{ color: theme.text }} />
                </div>
            </>
        );
    }

    return (
        <>
            <DashboardNavbar />
            <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300" style={{ backgroundColor: theme.bg }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden" style={{ backgroundColor: theme.cardBg }}>
                        {/* Header/Cover */}
                        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                            <div className="absolute -bottom-16 left-8">
                                <div className="relative">
                                    <img
                                        src={userData.profilePicture}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                                        style={{ borderColor: theme.cardBg }}
                                    />
                                    <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition shadow-md">
                                        <Camera size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-20 px-8 pb-8">
                            <h1 className="text-3xl font-black mb-1" style={{ color: theme.text }}>{userData.name}</h1>
                            <p className="text-sm font-medium mb-8" style={{ color: theme.textSecondary }}>{userData.email}</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Full Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.textSecondary }} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={userData.name}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                style={{
                                                    backgroundColor: theme.inputBg,
                                                    borderColor: theme.border,
                                                    color: theme.text
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.textSecondary }} />
                                            <input
                                                type="email"
                                                name="email"
                                                value={userData.email}
                                                onChange={handleChange}
                                                disabled
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border opacity-60 cursor-not-allowed"
                                                style={{
                                                    backgroundColor: theme.inputBg,
                                                    borderColor: theme.border,
                                                    color: theme.text
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Phone Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.textSecondary }} />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={userData.phone}
                                                onChange={handleChange}
                                                placeholder="+91 1234567890"
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                style={{
                                                    backgroundColor: theme.inputBg,
                                                    borderColor: theme.border,
                                                    color: theme.text
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.textSecondary }}>Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: theme.textSecondary }} />
                                            <input
                                                type="text"
                                                name="address"
                                                value={userData.address}
                                                onChange={handleChange}
                                                placeholder="Your address"
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                style={{
                                                    backgroundColor: theme.inputBg,
                                                    borderColor: theme.border,
                                                    color: theme.text
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t" style={{ borderColor: theme.border }}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {loading ? <Loader className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default UserProfile;
