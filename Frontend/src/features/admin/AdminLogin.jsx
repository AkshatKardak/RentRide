import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFillDemo = () => {
    setEmail('admin@rentride.com');
    setPassword('password123');
    setError('');
    toast.success('Demo credentials filled!');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${baseUrl}/auth/login`, {
        email: email.trim(),
        password: password
      });

      if (res.data?.success && res.data?.token) {
        const user = res.data.user;
        if (user.role !== 'admin' && !user.isDemo) {
          setError('Access denied. Administrator privileges required.');
          setLoading(false);
          return;
        }

        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('adminUser', JSON.stringify(user));
        toast.success(`Welcome back, ${user.name || 'Admin'}!`);
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError(res.data?.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.message || 'Unable to connect to auth service. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Warm Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl p-2.5 flex items-center justify-center bg-primary/10 border border-primary/25 shadow-xl shadow-primary/10">
            <img
              src="/tab.png"
              alt="RentRide Logo"
              className="w-full h-full object-contain filter drop-shadow-sm"
            />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-display font-black tracking-tight text-text">
          Rent<span className="text-primary">Ride</span> Admin
        </h2>
        <p className="mt-1 text-center text-xs text-muted">
          Executive control & fleet analytics management
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0"
      >
        <div className="bg-surface py-8 px-6 shadow-2xl border border-border sm:rounded-3xl sm:px-10 backdrop-blur-md">
          {/* Demo Login Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 font-mono">
                <CheckCircle2 size={14} /> Admin Demo Login
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-xs font-bold text-primary hover:underline"
              >
                1-Click Fill
              </button>
            </div>
            <div className="text-xs text-muted space-y-0.5 font-mono">
              <p>Email: <span className="text-text font-bold">admin@rentride.com</span></p>
              <p>Password: <span className="text-text font-bold">password123</span></p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5 font-mono">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rentride.com"
                  className="w-full pl-10 pr-4 py-3 bg-surface-sunken border border-border rounded-xl text-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-surface-sunken border border-border rounded-xl text-text text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-sm shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Enter</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
