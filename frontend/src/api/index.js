import axios from 'axios';
import BACKEND_URL from '../config';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { BACKEND_URL };
export default api;
