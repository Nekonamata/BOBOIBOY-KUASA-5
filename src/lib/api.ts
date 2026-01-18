import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    Accept: 'application/json',
  },
});

// Request interceptor untuk menambahkan token auth
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle token expired
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid, clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      // Redirect ke login jika diperlukan
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
