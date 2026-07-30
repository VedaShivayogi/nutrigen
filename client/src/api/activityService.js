import axiosInstance from './axiosConfig';

const activityService = {
  // Water tracking
  logWater: async (amountMl, date = null) =>
    axiosInstance.post('/water', {
      amount_ml: amountMl,
      date: date || new Date().toISOString().split('T')[0],
    }),

  getWaterHistory: async () => axiosInstance.get('/water'),

  // Exercise tracking
  logExercise: async (activity, durationMinutes, caloriesEst = null, date = null) =>
    axiosInstance.post('/exercise', {
      activity,
      duration_minutes: durationMinutes,
      calories_est: caloriesEst,
      date: date || new Date().toISOString().split('T')[0],
    }),

  getExerciseHistory: async () => axiosInstance.get('/exercise'),
};

export default activityService;
