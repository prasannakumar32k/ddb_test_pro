import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3333/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Add request interceptor
api.interceptors.request.use(
  config => {
    // Remove duplicate /api prefix if present
    if (config.url?.startsWith('/api/')) {
      config.url = config.url.replace('/api/', '/');
    }
    console.log(`[API] ${config.method.toUpperCase()} Request to ${config.url}`);
    return config;
  },
  error => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  response => {
    console.log(`[API] Response from ${response.config.url}:`, response.data);
    return response;
  },
  error => {
    console.error('[API] Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;