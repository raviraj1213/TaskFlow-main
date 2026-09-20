import axios from 'axios';

// Auto-format the API URL to always include /api at the end
const rawBaseUrl = import.meta.env.VITE_API_URL || '';
const formattedBaseUrl = rawBaseUrl.endsWith('/api') 
  ? rawBaseUrl 
  : rawBaseUrl 
    ? `${rawBaseUrl}/api` 
    : '/api';

const api = axios.create({
  baseURL: formattedBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;