import api from './api';

export const carService = {
  // Get all cars (Public route)
  getAllCars: async (filters = {}) => {
    try {
      // Standardize filter for backend controller
      const backendFilters = { ...filters };
      if (backendFilters.status === 'Available') {
        backendFilters.available = 'true';
        delete backendFilters.status;
      }

      const response = await api.get('/cars', { params: backendFilters });

      return {
        success: true,
        data: response.data.data || response.data || [],
        total: response.data.total ?? (response.data.data || response.data || []).length,
        count: response.data.count
      };
    } catch (error) {
      console.error('Get all cars error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch cars');
    }
  },

  // Get featured cars (Public route)
  getFeaturedCars: async () => {
    try {
      const response = await api.get('/cars/featured');

      return {
        success: true,
        data: response.data.data || response.data || []
      };
    } catch (error) {
      console.error('Get featured cars error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch featured cars');
    }
  },

  // Get distinct filter options directly from database
  getFilterOptions: async () => {
    try {
      const response = await api.get('/cars/filters/options');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get filter options error:', error);
      return { success: false, data: null };
    }
  },

  // Get single car by ID (Public route)
  getCarById: async (carId) => {
    try {
      const response = await api.get(`/cars/${carId}`);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Get car by ID error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch car details');
    }
  },

  // Create car (Admin only)
  createCar: async (carData) => {
    try {
      const response = await api.post('/cars', carData);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Create car error:', error);
      throw new Error(error.response?.data?.message || 'Failed to create car');
    }
  },

  // Update car (Admin only)
  updateCar: async (carId, carData) => {
    try {
      const response = await api.put(`/cars/${carId}`, carData);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Update car error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update car');
    }
  },

  // Delete car (Admin only)
  deleteCar: async (carId) => {
    try {
      const response = await api.delete(`/cars/${carId}`);

      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Delete car error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete car');
    }
  }
};
