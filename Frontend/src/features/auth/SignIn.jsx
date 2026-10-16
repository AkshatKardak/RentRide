import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { loginWithEmail, loginWithGoogle } from '@/services/firebaseAuthService';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useFirebase, setUseFirebase] = useState(true);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleFirebaseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginWithEmail(email, password);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTraditionalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError(err.response?.data?.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await loginWithGoogle();
      if (result.success) {
        toast.success('Successfully logged in with Google!');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = useFirebase ? handleFirebaseSubmit : handleTraditionalSubmit;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg transition-colors duration-300">
      <div className="max-w-md w-full rounded-3xl shadow-xl p-8 border border-border bg-surface transition-all duration-300">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="text-2xl font-black text-primary font-display">RentRide</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-text font-display">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Sign in to access your garage and bookings
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl border border-danger/30 bg-danger-soft flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
            <p className="text-xs text-danger font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-5 px-5 py-3 rounded-xl border border-border bg-surface-sunken hover:bg-surface font-semibold text-xs text-text flex items-center justify-center gap-2.5 transition-all shadow-xs disabled:opacity-50"
        >
          <FcGoogle className="w-5 h-5" />
          <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] font-bold text-text-subtle uppercase tracking-wider font-mono">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-sunken text-text text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-text-subtle"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-border bg-surface-sunken text-text text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-text-subtle"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setUseFirebase(!useFirebase)}
            className="text-[11px] text-text-subtle hover:text-primary transition"
          >
            {useFirebase ? 'Mode: Cloud Identity (Firebase)' : 'Mode: Local MongoDB Backend'}
          </button>
        </div>

        <p className="text-center text-xs text-text-muted mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-primary hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
