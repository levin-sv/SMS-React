import axios from 'axios';
import { clearAuthSession, getToken } from '../utils/authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const authUrl = err.config?.url || '';
    const isAuthRoute =
      authUrl.includes('/auth/login') ||
      authUrl.includes('/auth/forgot-password') ||
      authUrl.includes('/auth/register');
    if (err.response?.status === 401 && !isAuthRoute) {
      clearAuthSession();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
