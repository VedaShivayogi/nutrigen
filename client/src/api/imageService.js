import axiosInstance from './axiosConfig';

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop';

/**
 * Fetch a food image from backend or Unsplash.
 * @param {string} foodName 
 * @returns {Promise<string>} Image URL
 */
export const fetchFoodImage = async (foodName) => {
  if (!foodName) return DEFAULT_FOOD_IMAGE;
  try {
    const response = await axiosInstance.get(`/nutrition/image?q=${encodeURIComponent(foodName)}`);
    return response?.image || DEFAULT_FOOD_IMAGE;
  } catch (e) {
    console.warn('Food image fetch failed, using fallback image:', e);
    return DEFAULT_FOOD_IMAGE;
  }
};

export default {
  fetchFoodImage,
};

