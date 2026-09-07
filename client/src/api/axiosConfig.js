import axios from 'axios';

const defaultLocalApiBaseUrl =
  typeof window !== 'undefined' && window.location.hostname.includes('localhost')
    ? 'http://127.0.0.1:5000'
    : 'https://nutri-gen-3.onrender.com';

const normalizeBaseUrl = (url = '') => {
  const trimmed = url.trim().replace(/\/$/, '');
  return trimmed.endsWith('/api') ? trimmed.slice(0, -4) : trimmed;
};

const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || defaultLocalApiBaseUrl
);

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

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.url) {
      config.url = normalizeUrl(config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;