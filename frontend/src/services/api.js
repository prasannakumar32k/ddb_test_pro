import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3333',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  config => {
    console.log('[API] Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  error => {
    console.error('[API] Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (!error.response) {
      console.error('[API] Network Error - Is the backend server running?');
      throw new Error('Cannot connect to server. Please ensure the backend is running.');
    }
    
    console.error(`[API] Error ${error.response.status}:`, error.response.data);
    throw error;
  }
);

// Add API health check
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data.status === 'ok';
  } catch (error) {
    console.error('[API] Health check failed:', error);
    return false;
  }
};

export default api;