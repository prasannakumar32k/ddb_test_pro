import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3333',
  timeout: 10000,
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
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log('[API] Response:', response.status, response.data);
    return response;
  },
  error => {
    console.error('[API] Error', error.response?.status, ':', error.response?.data);
    return Promise.reject(error);
  }
);

export default api;