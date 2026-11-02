import axios from 'axios';

export const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (
    envUrl &&
    !envUrl.includes('rentridebackend-seven.vercel.app') &&
    !envUrl.includes('localhost:5000')
  ) {
    return envUrl.replace(/\/+$/, '');
  }

  // If running in local browser, default to local backend on port 5000
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return 'http://localhost:5000/api';
  }

  // Canonical live production backend on Render
  return 'https://rentrid-e-backend.onrender.com/api';
};

export const API_BASE_URL = resolveApiBaseUrl();

export const ensureAdminSession = async () => {
  if (typeof window === 'undefined') return 'dummy-token-12345';

  const existingToken = localStorage.getItem('adminToken');
  const rawAdminUser = localStorage.getItem('adminUser');

  if (
    existingToken &&
    existingToken !== 'undefined' &&
    existingToken !== 'null' &&
    existingToken !== 'false' &&
    rawAdminUser
  ) {
    try {
      const parsed = JSON.parse(rawAdminUser);
      if (parsed?.role === 'admin' || parsed?.isDemo) {
        return existingToken;
      }
    } catch (e) {
      // JSON parse error, will re-authenticate below
    }
  }

  // Auto-login with official demo admin credentials
  try {
    const baseUrl = resolveApiBaseUrl();
    const res = await axios.post(
      `${baseUrl}/auth/login`,
      {
        email: 'admin@rentride.com',
        password: 'password123'
      },
      { timeout: 10000 }
    );

    if (res.data?.success && res.data?.token) {
      const token = res.data.token;
      const user = res.data.user || {
        id: '6ab161ec5ee6cb8e968d7015',
        name: 'Admin User (Demo)',
        email: 'admin@rentride.com',
        role: 'admin',
        isDemo: true
      };
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      return token;
    }
  } catch (err) {
    console.warn('Backend login fallback to dummy admin token:', err.message);
  }

  // Fallback token accepted by backend authMiddleware in production
  const fallbackToken = 'dummy-token-12345';
  localStorage.setItem('adminToken', fallbackToken);
  localStorage.setItem('adminUser', JSON.stringify({
    id: 'dummy-admin-id',
    name: 'Admin User (Demo)',
    email: 'admin@rentride.com',
    role: 'admin',
    isDemo: true
  }));
  return fallbackToken;
};

export const getAdminHeaders = () => {
  const token =
    (typeof window !== 'undefined' && localStorage.getItem('adminToken')) || 'dummy-token-12345';
  return {
    Authorization: `Bearer ${token}`
  };
};

export const adminRequest = async (requestFn) => {
  try {
    return await requestFn();
  } catch (err) {
    const status = err.response?.status;
    const msg = err.response?.data?.message || '';
    if (
      status === 401 ||
      status === 403 ||
      (status === 500 &&
        (msg.toLowerCase().includes('authorized') || msg.toLowerCase().includes('token')))
    ) {
      console.warn('Admin token unauthorized or expired. Refreshing demo session and retrying...');
      await ensureAdminSession();
      return await requestFn();
    }
    throw err;
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
