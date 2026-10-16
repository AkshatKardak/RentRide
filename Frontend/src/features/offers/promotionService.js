import api from '@/lib/api';

export const promotionService = {
  // Get all active promotions
  getAllPromotions: async () => {
    try {
      const response = await api.get('/promotions');
      return {
        success: true,
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error('Get promotions error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch promotions');
    }
  },

  // Validate a promo code
  validatePromoCode: async (code) => {
    try {
      const response = await api.post('/promotions/validate', { code });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Validate promo error:', error);
      throw new Error(error.response?.data?.message || 'Invalid promo code');
    }
  },

  // Apply promo code to booking
  applyPromoCode: async (code, bookingAmount) => {
    try {
      const response = await api.post('/promotions/apply', { 
        code, 
        bookingAmount 
      });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Apply promo error:', error);
      throw new Error(error.response?.data?.message || 'Failed to apply promo code');
    }
  }
};
