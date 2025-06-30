import { WeatherData, DayWeather } from '../types/weather';

const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeatherData(latitude: number, longitude: number): Promise<DayWeather[]> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant',
    timezone: 'auto',
    forecast_days: '7',
    temperature_unit: 'fahrenheit',
    windspeed_unit: 'mph',
    precipitation_unit: 'inch'
  });

  const response = await fetch(`${OPEN_METEO_BASE_URL}?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data: WeatherData = await response.json();
  
  return data.daily.time.map((date, index) => ({
    date,
    weatherCode: data.daily.weathercode[index],
    maxTemp: data.daily.temperature_2m_max[index],
    minTemp: data.daily.temperature_2m_min[index],
    precipitation: data.daily.precipitation_sum[index],
    windSpeed: data.daily.windspeed_10m_max[index],
    windDirection: data.daily.winddirection_10m_dominant[index]
  }));
}

export function getWeatherDescription(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  
  return weatherCodes[code] || 'Unknown';
}

export function getWeatherIcon(code: number): string {
  if (code === 0) return 'Sun';
  if (code <= 3) return 'CloudSun';
  if (code <= 48) return 'Cloud';
  if (code <= 57) return 'CloudDrizzle';
  if (code <= 67) return 'CloudRain';
  if (code <= 77) return 'Snowflake';
  if (code <= 82) return 'CloudRainWind';
  if (code <= 86) return 'CloudSnow';
  if (code <= 99) return 'Zap';
  return 'Cloud';
}

export async function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}