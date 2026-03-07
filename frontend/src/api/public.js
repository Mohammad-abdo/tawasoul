import axios from 'axios';

// Public API client (no authentication required)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const publicApiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public Pages API
export const publicPages = {
  getAll: () => 
    publicApiClient.get('/public/pages'),
  
  getByType: (pageType) => 
    publicApiClient.get(`/public/pages/${pageType}`),
};

