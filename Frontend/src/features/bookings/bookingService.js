import api from '@/lib/api';

export const bookingService = {
  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Create booking error:', error.response?.data || error);
      throw error;
    }
  },

  // Get user's bookings
  getUserBookings: async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      return response.data;
    } catch (error) {
      console.error('Get user bookings error:', error.response?.data || error);
      throw error;
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Get booking error:', error.response?.data || error);
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Cancel booking error:', error.response?.data || error);
      throw error;
    }
  },

  // Get all bookings (Admin only)
  getAllBookings: async (params = {}) => {
    try {
      const response = await api.get('/bookings', { params });
      return response.data;
    } catch (error) {
      console.error('Get all bookings error:', error.response?.data || error);
      throw error;
    }
  }
};
