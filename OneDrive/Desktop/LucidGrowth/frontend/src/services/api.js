/**
 * API Service
 * 
 * Handles all API calls to the backend
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// Email API endpoints
export const emailAPI = {
  // Get email configuration
  getConfig: () => api.get('/api/emails/config'),

  // Get all emails
  getEmails: (params = {}) => api.get('/api/emails', { params }),

  // Get email by ID
  getEmailById: (id) => api.get(`/api/emails/${id}`),

  // Get receiving chain for email
  getReceivingChain: (id) => api.get(`/api/emails/${id}/receiving-chain`),

  // Get ESP info for email
  getESPInfo: (id) => api.get(`/api/emails/${id}/esp`),

  // Trigger email processing
  processEmails: () => api.post('/api/emails/process'),

  // Delete email
  deleteEmail: (id) => api.delete(`/api/emails/${id}`),

  // Get email statistics
  getStats: () => api.get('/api/emails/stats/summary'),
};

// Health API endpoints
export const healthAPI = {
  // Basic health check
  getHealth: () => api.get('/health'),

  // Detailed health check
  getDetailedHealth: () => api.get('/health/detailed'),
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please try again.';
    }
    
    if (error.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }
    
    return error.message || 'An unexpected error occurred.';
  },

  // Format API response
  formatResponse: (response) => {
    if (response.success) {
      return response.data;
    }
    throw new Error(response.error || 'API request failed');
  },

  // Check if API is available
  checkConnection: async () => {
    try {
      await healthAPI.getHealth();
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default api;
