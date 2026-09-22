import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { signupWithEmail, loginWithGoogle } from '../../services/firebaseAuthService';
import api from '../../services/api';

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

  // Firebase Registration
  const handleFirebaseSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
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
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Traditional Registration
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
        setError('Email already exists. Please use a different email or sign in.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

const handleGoogleSignup = async () => {
  setError('');
  setLoading(true);

  try {
    const result = await loginWithGoogle();

    if (result.success) {
      setSuccess('Successfully signed up with Google!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
  } catch (err) {
    setError(err.message || 'Google sign-up failed');
    setLoading(false);
  }
};


  const handleSubmit = useFirebase ? handleFirebaseSubmit : handleTraditionalSubmit;

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#FFFFFF',
    cardBg: isDarkMode ? '#1e293b' : '#FFFFFF',
    text: isDarkMode ? '#f1f5f9' : '#1F2937',
    textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
    border: isDarkMode ? '#334155' : '#E5E7EB',
    inputBg: isDarkMode ? '#1e293b' : '#F8F9FA',
    primary: isDarkMode ? '#10b981' : '#10b981',
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 transition-colors duration-300"
      style={{ backgroundColor: theme.bg }}
    >

      <div
        className="max-w-md w-full rounded-2xl shadow-2xl p-8 transition-all duration-300"
        style={{
          backgroundColor: theme.cardBg,
          border: `1px solid ${theme.border}`
        }}
      >
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: theme.text }}
          >
            Create Account
          </h1>
          <p style={{ color: theme.textSecondary }}>
            Join RentRide today
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-xl border flex items-center gap-3" style={{
            backgroundColor: isDarkMode ? 'rgba(16, 185, 129, 0.1)' : '#D1FAE5',
            borderColor: '#10B981'
          }}>
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-sm text-green-500">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border flex items-center gap-3" style={{
            backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2',
            borderColor: '#EF4444'
          }}>
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Google Sign Up */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full mb-6 px-6 py-3 rounded-xl border font-bold flex items-center justify-center gap-3 hover:shadow-md transition-all disabled:opacity-50"
          style={{
            backgroundColor: theme.cardBg,
            borderColor: theme.border,
            color: theme.text
          }}
        >
          <FcGoogle className="w-6 h-6" />
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
          <span className="text-sm" style={{ color: theme.textSecondary }}>OR</span>
          <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.text }}
            >
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-green-500 outline-none"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text
              }}
              placeholder="Enter your name"
              required
              minLength={2}
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.text }}
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-green-500 outline-none"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.text }}
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-green-500 outline-none"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  color: theme.text
                }}
                placeholder="Create a password (min 6 characters)"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: theme.textSecondary }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.text }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-green-500 outline-none"
              style={{
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
                color: theme.text
              }}
              placeholder="Confirm your password"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.primary
            }}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle Authentication Method */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setUseFirebase(!useFirebase)}
            className="text-xs"
            style={{ color: theme.textSecondary }}
          >
            {useFirebase ? 'Using Firebase Auth' : 'Using Traditional Auth'}
          </button>
        </div>

        <p
          className="text-center mt-6"
          style={{ color: theme.textSecondary }}
        >
          Already have an account?{' '}
          <Link
            to="/signin"
            className="font-semibold hover:underline"
            style={{ color: theme.primary }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
