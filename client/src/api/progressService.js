import axiosInstance from './axiosConfig';

const progressService = {
  logEntry: async (weight, note = '', date = null) =>
    axiosInstance.post('/progress', {
      weight,
      note,
      date: date || new Date().toISOString().split('T')[0],
    }),

  getHistory: async () => axiosInstance.get('/progress'),
};

export default progressService;
