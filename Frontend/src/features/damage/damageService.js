import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5005/api';

const getAuthConfig = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  withCredentials: true
});

// User functions
export const getUserDamageReports = async () => {
  const response = await axios.get(`${API_URL}/damages/user/my-reports`, getAuthConfig());
  return response.data;
};

export const getDamageReportById = async (id) => {
  const response = await axios.get(`${API_URL}/damages/${id}`, getAuthConfig());
  return response.data;
};

// Admin functions
export const getPendingDamageReports = async () => {
  const response = await axios.get(`${API_URL}/damages/admin/pending`, getAuthConfig());
  return response.data;
};

export const getAdminDamageStats = async () => {
  const response = await axios.get(`${API_URL}/damages/admin/stats`, getAuthConfig());
  return response.data;
};

export const approveDamageReport = async (id, data) => {
  const response = await axios.put(`${API_URL}/damages/${id}/approve`, data, getAuthConfig());
  return response.data;
};

export const rejectDamageReport = async (id, data) => {
  const response = await axios.put(`${API_URL}/damages/${id}/reject`, data, getAuthConfig());
  return response.data;
};

export const setUnderReview = async (id) => {
  const response = await axios.put(`${API_URL}/damages/${id}/review`, {}, getAuthConfig());
  return response.data;
};

const damageService = {
  getUserDamageReports,
  getDamageReportById,
  getPendingDamageReports,
  getAdminDamageStats,
  approveDamageReport,
  rejectDamageReport,
  setUnderReview
};

export default damageService;
