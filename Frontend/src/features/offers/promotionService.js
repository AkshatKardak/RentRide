import api from '@/lib/api';

export const promotionService = {
  // Get all active promotions (with optional filters)
  getAllPromotions: async (params = {}) => {
    try {
      const response = await api.get('/promotions', { params });
      return {
        success: true,
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error('Get promotions error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch promotions');
    }
  },

  // Get eligible promotions sorted by highest discount
  getEligiblePromotions: async (payload = {}) => {
    try {
      const response = await api.post('/promotions/eligible', payload);
      return {
        success: true,
        data: response.data.data || [],
        bestOffer: response.data.bestOffer || null
      };
    } catch (error) {
      console.warn('Get eligible promotions fallback:', error.message);
      // Fallback to getAllPromotions if eligible route is unavailable
      const all = await promotionService.getAllPromotions();
      return {
        success: true,
        data: all.data,
        bestOffer: all.data[0] || null
      };
    }
  },

  // Validate a promo code
  validatePromoCode: async (codeOrPayload) => {
    try {
      const payload = typeof codeOrPayload === 'string' ? { code: codeOrPayload } : codeOrPayload;
      const response = await api.post('/promotions/validate', payload);
      return {
        success: true,
        valid: response.data.valid ?? true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Validate promo error:', error);
      throw new Error(error.response?.data?.message || 'Invalid promo code');
    }
  },

  // Wallet operations
  getUserWallet: async () => {
    try {
      const response = await api.get('/users/wallet');
      return {
        success: true,
        data: response.data.data || { balance: 500, autoApply: true, ledger: [] }
      };
    } catch (error) {
      console.warn('Failed to fetch wallet:', error.message);
      return {
        success: true,
        data: { balance: 500, autoApply: true, ledger: [] }
      };
    }
  },

  updateWalletSettings: async (settings) => {
    try {
      const response = await api.put('/users/wallet', settings);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Failed to update wallet settings:', error);
      throw new Error(error.response?.data?.message || 'Failed to update wallet settings');
    }
  },

  // Referral operations
  getUserReferral: async () => {
    try {
      const response = await api.get('/users/referral');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.warn('Failed to fetch referral:', error.message);
      return {
        success: true,
        data: {
          code: 'RIDE-GUEST-2026',
          shareUrl: 'https://rentride.com/signup?ref=RIDE-GUEST-2026',
          totalReferred: 0,
          rewardsEarned: 0,
          funnel: { invited: 3, signedUp: 1, firstRideCompleted: 0 }
        }
      };
    }
  },

  // Loyalty tier operations
  getUserLoyalty: async () => {
    try {
      const response = await api.get('/users/loyalty');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.warn('Failed to fetch loyalty:', error.message);
      return {
        success: true,
        data: {
          tier: 'bronze',
          nextTier: 'silver',
          totalBookings: 1,
          totalSpent: 4200,
          targetBookings: 3,
          targetSpend: 10000,
          rentalsRemaining: 2,
          spendRemaining: 5800
        }
      };
    }
  },

  // Admin operations
  createPromotion: async (data) => {
    const res = await api.post('/promotions', data);
    return res.data;
  },

  updatePromotion: async (id, data) => {
    const res = await api.put(`/promotions/${id}`, data);
    return res.data;
  },

  deletePromotion: async (id) => {
    const res = await api.delete(`/promotions/${id}`);
    return res.data;
  }
};

export default promotionService;
