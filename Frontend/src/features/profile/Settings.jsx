import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { Bell, Lock, Shield, Smartphone, Moon, Sun, ChevronRight, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userService } from '@/features/profile/userService';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

const Settings = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    notifications: true,
    smsAlerts: false,
    twoFactorAuth: false
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success && response.data.preferences) {
        setPreferences({
          notifications: response.data.preferences.notifications ?? true,
          smsAlerts: response.data.preferences.smsAlerts ?? false,
          twoFactorAuth: response.data.preferences.twoFactorAuth ?? false
        });
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key, value) => {
    try {
      const updated = { ...preferences, [key]: value };
      setPreferences(updated);

      await userService.updatePreferences(updated);
      toast.success('Preference updated');
    } catch (error) {
      console.error('Failed to update preference:', error);
      toast.error('Failed to update preference');
      setPreferences(preferences);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Signed out successfully');
    navigate('/signin');
  };

  const Section = ({ title, children }) => (
    <div className="mb-8">
      <h3 className="text-xs font-mono font-bold uppercase tracking-widest mb-3 ml-1 text-muted">
        {title}
      </h3>
      <div className="rounded-3xl overflow-hidden border border-border bg-surface shadow-xs divide-y divide-border">
        {children}
      </div>
    </div>
  );

  const ToggleItem = ({ icon: Icon, title, description, checked, onChange, iconColor = 'primary' }) => (
    <div className="flex items-center justify-between p-4.5 hover:bg-surface-sunken/40 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center bg-primary/10 border border-primary/20 text-primary`}>
          <Icon size={18} />
        </div>
        <div>
          <h4 className="font-bold text-sm text-text">{title}</h4>
          <p className="text-xs text-muted mt-0.5">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-11 h-6 bg-surface-sunken border border-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
      </label>
    </div>
  );

  if (loading) {
    return (
      <>
        <DashboardNavbar />
        <div className="min-h-screen bg-bg pt-24 pb-12 px-4 flex items-center justify-center font-sans">
          <Loader className="animate-spin w-8 h-8 text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-bg text-text pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-display font-black tracking-tight text-text mb-2">Account Settings</h1>
            <p className="text-xs md:text-sm text-muted">Manage your preferences, security authentications, and theme controls</p>
          </div>

          <Section title="Appearance">
            <ToggleItem
              icon={isDarkMode ? Moon : Sun}
              title="Dark Theme"
              description="Switch between Terracotta Light and Graphite Dark"
              checked={isDarkMode}
              onChange={toggleTheme}
            />
          </Section>

          <Section title="Notifications">
            <ToggleItem
              icon={Bell}
              title="Push Notifications"
              description="Receive alerts about your reservations and discounts"
              checked={preferences.notifications}
              onChange={(e) => updatePreference('notifications', e.target.checked)}
            />
            <ToggleItem
              icon={Smartphone}
              title="SMS Alerts"
              description="Get essential trip codes and OTPs via SMS"
              checked={preferences.smsAlerts}
              onChange={(e) => updatePreference('smsAlerts', e.target.checked)}
            />
          </Section>

          <Section title="Privacy & Security">
            <div 
              className="flex items-center justify-between p-4.5 cursor-pointer hover:bg-surface-sunken/40 transition-colors group" 
              onClick={() => toast.info('Change password feature is managed via Firebase Auth')}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-accent/10 border border-accent/20 text-accent">
                  <Lock size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text">Change Password</h4>
                  <p className="text-xs text-muted mt-0.5">Update credentials and security tokens</p>
                </div>
              </div>
              <ChevronRight className="text-subtle group-hover:translate-x-1 transition-transform" size={18} />
            </div>
            <ToggleItem
              icon={Shield}
              title="Two-Factor Authentication"
              description="Add cryptographic MFA protection to account"
              checked={preferences.twoFactorAuth}
              onChange={(e) => updatePreference('twoFactorAuth', e.target.checked)}
            />
          </Section>

          <div className="text-center mt-12">
            <button 
              onClick={handleSignOut}
              className="text-rose-500 hover:text-rose-600 font-bold text-xs uppercase tracking-wider transition-colors font-mono"
            >
              Sign Out from Device
            </button>
            <p className="text-[11px] font-mono text-muted mt-2">RentRide Engine v2.0</p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Settings;
