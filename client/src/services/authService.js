import axios from 'axios';

const API_BASE_URL = '/api/auth'; // Usar proxy Vite para evitar errores CORS en desarrollo

const authService = {
  register: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      const { token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token; // Simple check, in production validate token expiration
  }
};

export default authService;