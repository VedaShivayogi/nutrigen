import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://nutri-gen-3.onrender.com').replace(/\/$/, '');

const normalizeUrl = (url = '') => {
  if (!url || /^https?:\/\//i.test(url)) {
    return url;
  }

  const trimmedUrl = url.startsWith('/') ? url.slice(1) : url;
  if (trimmedUrl.startsWith('api/')) {
    return `/${trimmedUrl}`;
  }

  return `/api/${trimmedUrl}`;
};

// Separate axios instance so the admin token never mixes with a regular user's token.
const adminAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.url) {
    config.url = normalizeUrl(config.url);
  }

  return config;
});

adminAxios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
    }
    return Promise.reject(error);
  }
);

const adminService = {
  login: async (username, password) => {
    const data = await adminAxios.post('/admin/login', { username, password });
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
  },

  isLoggedIn: () => !!localStorage.getItem('adminToken'),

  getAllUsers: async () => adminAxios.get('/admin/users'),

  getUserHistory: async (uid) => adminAxios.get(`/admin/users/${uid}/history`),
};

export default adminService;
