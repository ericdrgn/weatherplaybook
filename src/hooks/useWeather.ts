import { useState, useCallback, useEffect } from 'react';
import { DayWeather } from '../types/weather';
import { fetchWeatherData, getCurrentLocation } from '../utils/weatherApi';
import { useLocalStorage } from './useLocalStorage';

interface CachedWeatherData {
  weather: DayWeather[];
  lastUpdated: Date;
  location: {
    latitude: number;
    longitude: number;
  };
}

export function useWeather() {
  const [weather, setWeather] = useState<DayWeather[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cachedData, setCachedData] = useLocalStorage<CachedWeatherData | null>('weather-cache', null);

  // Load cached data on component mount - but don't auto-fetch
  useEffect(() => {
    if (cachedData) {
      // Always load cached data regardless of age
      setWeather(cachedData.weather);
      setLastUpdated(new Date(cachedData.lastUpdated));
      
      // Check if cached data is stale (more than 1 hour old)
      const cacheAge = new Date().getTime() - new Date(cachedData.lastUpdated).getTime();
      const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
      
      if (cacheAge >= oneHour) {
        // Data is stale but don't auto-fetch - just set a flag or log
        console.log('Weather data is stale (older than 1 hour), consider updating');
      }
    }
  }, [cachedData]);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      const weatherData = await fetchWeatherData(location.latitude, location.longitude);
      const now = new Date();
      
      setWeather(weatherData);
      setLastUpdated(now);
      
      // Cache the new data
      setCachedData({
        weather: weatherData,
        lastUpdated: now,
        location
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [setCachedData]);

  const clearCache = useCallback(() => {
    setCachedData(null);
    setWeather([]);
    setLastUpdated(null);
    setError(null);
  }, [setCachedData]);

  const isDataStale = useCallback(() => {
    if (!cachedData) return true;
    const cacheAge = new Date().getTime() - new Date(cachedData.lastUpdated).getTime();
    const oneHour = 60 * 60 * 1000;
    return cacheAge >= oneHour;
  }, [cachedData]);

  return {
    weather,
    loading,
    error,
    lastUpdated,
    fetchWeather,
    clearCache,
    hasCachedData: !!cachedData,
    isDataStale: isDataStale()
  };
}