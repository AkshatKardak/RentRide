import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { signupWithEmail, loginWithGoogle } from '@/services/firebaseAuthService';
import api from '@/lib/api';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [useFirebase, setUseFirebase] = useState(true);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleFirebaseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const result = await signupWithEmail(
        formData.name,
        formData.email,
        formData.password
      );

      if (result.success) {
        setSuccess(result.message || 'Registration successful!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTraditionalSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError('Cannot connect to server.');
      } else if (err.response?.status === 409) {
        setError('Email already exists. Please sign in.');
      } else {
        setError(err.response?.data?.message || 'Registration failed.');
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
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Google registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = useFirebase ? handleFirebaseSubmit : handleTraditionalSubmit;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-bg transition-colors duration-300 py-12">
      <div className="max-w-md w-full rounded-3xl shadow-xl p-8 border border-border bg-surface transition-all duration-300">
        
        <div className="text-center mb-6">
          <Link to="/" className="inline-block mb-2">
            <span className="text-2xl font-black text-primary font-display">RentRide</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-text font-display">
            Create an Account
          </h1>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            Unlock seamless self-drive car rentals across India
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl border border-danger/30 bg-danger-soft flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
            <p className="text-xs text-danger font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 rounded-xl border border-success/30 bg-success-soft flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-success shrink-0" />
            <p className="text-xs text-success font-medium">{success}</p>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mb-5 px-5 py-3 rounded-xl border border-border bg-surface-sunken hover:bg-surface font-semibold text-xs text-text flex items-center justify-center gap-2.5 transition-all shadow-xs disabled:opacity-50"
        >
          <FcGoogle className="w-5 h-5" />
          <span>{loading ? 'Authenticating...' : 'Sign Up with Google'}</span>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[11px] font-bold text-text-subtle uppercase tracking-wider font-mono">OR</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-sunken text-text text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-text-subtle"
              placeholder="Aarav Sharma"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-sunken text-text text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-text-subtle"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
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

          <div>
            <label className="block text-xs font-semibold text-text mb-1">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-sunken text-text text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder-text-subtle"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <p className="text-center text-xs text-text-muted mt-5">
          Already have an account?{' '}
          <Link to="/signin" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
