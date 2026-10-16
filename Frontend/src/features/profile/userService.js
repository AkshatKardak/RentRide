import api from '@/lib/api';

export const userService = {
    // Get user profile
    getProfile: async () => {
        try {
            const response = await api.get('/users/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to fetch profile' };
        }
    },

    // Update user profile
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/users/profile', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to update profile' };
        }
    },

    // Update user preferences
    updatePreferences: async (preferences) => {
        try {
            const response = await api.put('/users/preferences', preferences);
            return response.data;
        } catch (error) {
            throw error.response?.data || { success: false, message: 'Failed to update preferences' };
        }
    }
};

export default userService;
