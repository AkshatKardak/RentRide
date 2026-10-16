import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
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
          profilePicture: user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=A34F32&color=fff&size=200`
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
    try {
      setLoading(true);
      const response = await userService.updateProfile({
        name: userData.name,
        phone: userData.phone,
        address: userData.address
      });

      if (response.success) {
        let currentUser = {};
        try {
          const raw = localStorage.getItem('user');
          if (raw && raw !== 'undefined' && raw !== 'null') currentUser = JSON.parse(raw);
        } catch {}
        localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data }));
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen flex items-center justify-center bg-bg">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-bg transition-colors duration-300 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div>
            <h1 className="text-3xl font-black text-text font-display">
              Profile & Account
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Manage your personal credentials, contact details, and license verification.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Avatar Header */}
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-border">
                <div className="relative">
                  <img
                    src={userData.profilePicture}
                    alt={userData.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-border"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1.5 bg-primary text-white rounded-lg shadow-sm">
                    <Camera size={13} />
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-lg font-bold text-text font-display">{userData.name || 'Member'}</h2>
                  <p className="text-xs text-text-muted font-mono">{userData.email}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary-soft text-primary border border-primary/20">
                    Verified Customer
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                    <input
                      type="text"
                      name="name"
                      value={userData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface-sunken text-xs text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                    <input
                      type="email"
                      name="email"
                      value={userData.email}
                      disabled
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface-sunken text-xs text-text-muted opacity-70 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface-sunken text-xs text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5">Primary Residence / City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                    <input
                      type="text"
                      name="address"
                      value={userData.address}
                      onChange={handleChange}
                      placeholder="Mumbai, Maharashtra"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface-sunken text-xs text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-wider shadow-sm shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader className="animate-spin w-4 h-4" /> : <Save size={14} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
