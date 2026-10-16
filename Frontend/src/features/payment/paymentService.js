import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5005/api';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

/**
 * Get axios config with auth headers
 */
const getAxiosConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    withCredentials: true
  };
};

/**
 * Create Razorpay Order
 * @param {Object} orderData - { bookingId }
 * @returns {Promise<Object>} Order response
 */
const createOrder = async (orderData) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/process`,
      orderData,
      getAxiosConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error.response?.data || error;
  }
};

/**
 * Verify Payment after Razorpay success
 * @param {Object} paymentData - { orderId, paymentId, signature }
 * @returns {Promise<Object>} Verification response
 */
const verifyPayment = async (paymentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/verify`,
      paymentData,
      getAxiosConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error.response?.data || error;
  }
};

/**
 * Create Damage Payment Order
 * @param {String} damageReportId
 * @returns {Promise<Object>} Order response
 */
const createDamageOrder = async (damageReportId) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/process-damage`,
      { damageReportId },
      getAxiosConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error creating damage order:', error);
    throw error.response?.data || error;
  }
};

/**
 * Verify Damage Payment after Razorpay success
 * @param {Object} paymentData - { orderId, paymentId, signature, damageReportId }
 * @returns {Promise<Object>} Verification response
 */
const verifyDamagePayment = async (paymentData) => {
  try {
    const response = await axios.post(
      `${API_URL}/payments/verify-damage`,
      paymentData,
      getAxiosConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error verifying damage payment:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get Payment History for logged-in user
 * @returns {Promise<Object>} Payment history
 */
const getPaymentHistory = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/payments/history`,
      getAxiosConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error.response?.data || error;
  }
};

/**
 * Export all payment service functions
 */
export const paymentService = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  createDamageOrder,
  verifyDamagePayment
};

export default paymentService;
