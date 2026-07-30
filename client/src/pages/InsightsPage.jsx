import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IoSearchOutline,
  IoChevronBackOutline,
  IoNutritionOutline,
} from 'react-icons/io5';
import { nutritionService } from '../api/nutritionService';
import axiosInstance from '../api/axiosConfig';

const searchFoodAPI = async (query) => {
  try {
    return await nutritionService.searchFood(query);
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to fetch search results.');
  }
};

const getNutritionDataAPI = async (fdcId) => {
  try {
    return await nutritionService.getNutritionData(fdcId);
  } catch (err) {
    throw new Error(err.response?.data?.error || 'Failed to fetch nutrition data.');
  }
};

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import NutritionPieChart from '../components/ui/NutritionPieChart';

const InsightsPage = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [quantity, setQuantity] = useState(100);
  const [logging, setLogging] = useState(false);
  const [logMessage, setLogMessage] = useState('');

  useEffect(() => {
    if (nutritionData) {
      document.getElementById('details-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [nutritionData]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setNutritionData(null);
    setSelectedFood(null);

    try {
      const results = await searchFoodAPI(query.trim());
      setSearchResults(results);
      if (!searchHistory.find(item => item.name.toLowerCase() === query.toLowerCase())) {
        setSearchHistory(prev => [{ id: Date.now(), name: query }, ...prev.slice(0, 4)]);
      }
    } catch (err) {
      setError(err.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFood = async (food) => {
    setIsLoading(true);
    setError(null);
    setSelectedFood(food);
    setSearchResults([]);
    setQuantity(100);
    setLogMessage('');

    try {
      const data = await getNutritionDataAPI(food.id);
      setNutritionData(data.nutrients);
    } catch (err) {
      setError(err.message);
      setNutritionData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryClick = (item) => {
    setQuery(item.name);
    handleSearchSubmit({ preventDefault: () => {} });
  };

  const clearSelection = () => {
    setSelectedFood(null);
    setNutritionData(null);
    setQuery('');
  };

  const scaleFactor = (quantity || 0) / 100;
  const scaledNutrients = nutritionData
    ? {
        calories: nutritionData.calories != null ? Math.round(nutritionData.calories * scaleFactor) : null,
        protein: nutritionData.protein != null ? +(nutritionData.protein * scaleFactor).toFixed(1) : null,
        carbs: nutritionData.carbs != null ? +(nutritionData.carbs * scaleFactor).toFixed(1) : null,
        fat: nutritionData.fat != null ? +(nutritionData.fat * scaleFactor).toFixed(1) : null,
        fiber: nutritionData.fiber != null ? +(nutritionData.fiber * scaleFactor).toFixed(1) : null,
      }
    : null;

  const macroChartData = scaledNutrients
    ? {
        Protein: scaledNutrients.protein || 0,
        Carbs: scaledNutrients.carbs || 0,
        Fat: scaledNutrients.fat || 0,
        Fiber: scaledNutrients.fiber || 0,
      }
    : null;

  const handleLogMeal = async () => {
    if (!selectedFood || !scaledNutrients) return;
    try {
      setLogging(true);
      setLogMessage('');
      await axiosInstance.post('/log-meal', {
        meal: {
          name: selectedFood.name,
          quantity_g: quantity,
          nutrients: scaledNutrients,
        },
      });
      setLogMessage('Meal logged!');
    } catch (err) {
      setLogMessage(err.response?.data?.error || 'Could not log this meal. Please try again.');
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-gradient-to-r from-primary to-secondary text-white rounded-full p-4 mb-4">
            <IoNutritionOutline className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">Nutritional Insights</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Search any food to get an instant, detailed nutritional breakdown. Make smarter choices, effortlessly.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="flex gap-2 items-center justify-center mb-4">
            <Input
              className="w-full md:w-96 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder='e.g., "1 cup of cooked quinoa"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={IoSearchOutline}
            />
            <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
              {isLoading && !selectedFood ? <Spinner size="sm" color="white" /> : 'Search'}
            </Button>
          </form>

          {searchHistory.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {searchHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleHistoryClick(item)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-light hover:text-primary-dark dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          {error && (
            <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>
          )}

          {isLoading && (
            <div className="flex justify-center py-10">
              <Spinner size="lg" color="primary" />
            </div>
          )}

          {!isLoading && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {searchResults.map((food) => (
                <motion.div
                  key={food.id}
                  whileHover={{ scale: 1.03, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Card
                    className="cursor-pointer p-0 overflow-hidden flex flex-col h-full dark:bg-gray-800"
                    onClick={() => handleSelectFood(food)}
                  >
                    <div className="w-full h-36 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      {food.image ? (
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IoNutritionOutline className="h-10 w-10 text-gray-300 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-grow">
                      <h3 className="font-semibold text-lg text-primary-dark dark:text-primary-300 mb-1">{food.name}</h3>
                      {food.brand && (
                        <p className="text-sm text-gray-500 font-medium bg-gray-100 dark:bg-gray-700 dark:text-gray-300 inline-block px-2 py-0.5 rounded">
                          {food.brand}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-3">{food.dataType}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!isLoading && nutritionData && selectedFood && (
            <motion.div
              id="details-section"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Button variant="outline" size="sm" className="mb-6 mx-auto flex items-center" onClick={clearSelection}>
                <IoChevronBackOutline className="mr-2" /> New Search
              </Button>
              <Card padding="p-6 md:p-8" className="shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:space-x-12">
                  <div className="flex-1 mb-8 lg:mb-0">
                    {selectedFood.image && (
                      <img
                        src={selectedFood.image}
                        alt={selectedFood.name}
                        className="w-full h-48 object-cover rounded-xl mb-6"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{selectedFood.name}</h2>
                    {selectedFood.brand && <p className="text-md text-gray-500 dark:text-gray-300 mb-4">{selectedFood.brand}</p>}

                    <div className="flex items-end gap-3 mb-6">
                      <Input
                        label="Quantity (g)"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                        className="w-32"
                      />
                      <p className="text-xs text-gray-400 mb-2.5">Values below scale automatically (USDA data is per 100g)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {[ 
                        { label: 'Calories', value: scaledNutrients.calories, unit: 'kcal', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' },
                        { label: 'Protein', value: scaledNutrients.protein, unit: 'g', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' },
                        { label: 'Carbs', value: scaledNutrients.carbs, unit: 'g', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' },
                        { label: 'Fat', value: scaledNutrients.fat, unit: 'g', color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300' },
                      ].map((item) => (
                        <div key={item.label} className={`p-4 rounded-xl text-center ${item.color}`}>
                          <div className="text-sm font-medium opacity-80">{item.label}</div>
                          <div className="text-2xl font-bold">
                            {item.value ?? 'N/A'}
                            <span className="text-sm font-normal ml-1">{item.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button onClick={handleLogMeal} loading={logging} variant="secondary" className="w-full mb-2">
                      Log this meal
                    </Button>
                    {logMessage && (
                      <p className={`text-sm text-center ${logMessage === 'Meal logged!' ? 'text-accent' : 'text-red-500'}`}>
                        {logMessage}
                      </p>
                    )}

                    {macroChartData && <NutritionPieChart data={macroChartData} />}
                  </div>

                  {nutritionData.micronutrients && Object.keys(nutritionData.micronutrients).length > 0 && (
                    <div className="flex-1 lg:pl-8 lg:border-l lg:border-gray-200 dark:lg:border-gray-700">
                      <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Micronutrient Details</h3>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-3 -mr-3">
                        {Object.entries(nutritionData.micronutrients).map(([key, val]) => (
                          <div key={key} className="flex justify-between items-center text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                            <span className="capitalize text-gray-600 dark:text-gray-300">{key.replace(/_/g, ' ').toLowerCase()}</span>
                            <span className="font-bold text-gray-900 dark:text-gray-200">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {!isLoading && !error && searchResults.length === 0 && !selectedFood && (
             <div className="text-center py-16 px-4">
                <IoSearchOutline className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-500"/>
                <h3 className="mt-2 text-lg font-medium text-gray-800 dark:text-white">Ready to explore?</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-300">Enter a food or drink above to begin your nutritional journey.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;