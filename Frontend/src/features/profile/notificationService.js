import axios from 'axios';
import { resolveApiBaseUrl } from '@/lib/api';

const API_URL = resolveApiBaseUrl();

const getAxiosConfig = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

const getUserNotifications = async () => {
    try {
        const response = await axios.get(`${API_URL}/notifications`, getAxiosConfig());
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const markAsRead = async (id) => {
    try {
        const response = await axios.put(`${API_URL}/notifications/${id}/read`, {}, getAxiosConfig());
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const markAllRead = async () => {
    try {
        const response = await axios.put(`${API_URL}/notifications/read-all`, {}, getAxiosConfig());
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const deleteNotification = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/notifications/${id}`, getAxiosConfig());
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const clearAllNotifications = async () => {
    try {
        const response = await axios.delete(`${API_URL}/notifications/clear-all`, getAxiosConfig());
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const notificationService = {
    getUserNotifications,
    markAsRead,
    markAllRead,
    deleteNotification,
    clearAllNotifications
};

export default notificationService;
