import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Force port 3005 - ensure it's always used
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in auth store');
    }
    
    // If data is FormData, let axios set Content-Type automatically (with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const status = error.response?.status;
    const url = error.config?.url;
    
    console.log(`API Error: ${status} on ${url}`);
    
    if (status === 401 && !isLoginRequest) {
      console.warn('Unauthorized access detected, logging out and redirecting to login');
      // Unauthorized - logout user (but not for login requests themselves)
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

