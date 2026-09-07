import axiosInstance from './axiosConfig';

const authService = {
  login: async (email, password) => {
    const data = await axiosInstance.post('/auth/login', { email, password });
    if (data?.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  register: async (userData) => {
    const data = await axiosInstance.post('/auth/register', userData);
    if (data?.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  logout: async () => {
    localStorage.removeItem('token');
    return true;
  },

  getCurrentUser: async () => {
    const data = await axiosInstance.get('/me');
    return data;
  },
};

export default authService;
