import api from '@/lib/api';

export const aiService = {
  // Feature 1: Natural Language Search
  async searchCars(query, filters = {}) {
    const response = await api.post('/ai/search-cars', { query, filters });
    return response.data;
  },

  // Feature 5: Insurance Advisor
  async getInsuranceAdvice(bookingDetails) {
    const response = await api.post('/ai/insurance-advice', bookingDetails);
    return response.data;
  },

  // Feature 6: Visual Car Recognition
  async recognizeCar(imageFile, purpose = 'find_similar') {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('purpose', purpose);

    const response = await api.post('/ai/recognize-car', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Feature 7: Damage Report
  async analyzeDamage(photos, description) {
    const formData = new FormData();
    
    photos.forEach((photo, index) => {
      formData.append('photos', photo);
    });
    
    formData.append('userDescription', description.userDescription);
    formData.append('location', description.location);

    const response = await api.post('/ai/analyze-damage', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // General chat
  async sendMessage(message, conversationHistory) {
    const response = await api.post('/ai/chat', { message, conversationHistory });
    return response.data;
  }
};
