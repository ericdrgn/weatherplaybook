export interface WeatherData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  daily_units: {
    time: string;
    weathercode: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    precipitation_sum: string;
    windspeed_10m_max: string;
    winddirection_10m_dominant: string;
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    windspeed_10m_max: number[];
    winddirection_10m_dominant: number[];
  };
}

export interface DayWeather {
  date: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
}

export interface UserActivity {
  id: string;
  name: string;
  type: {
    indoor: boolean;
    outdoor: boolean;
  };
  weatherPreferences: {
    minTemp?: number;
    maxTemp?: number;
    maxPrecipitation?: number;
    maxWindSpeed?: number;
  };
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  type: {
    indoor: boolean;
    outdoor: boolean;
  };
}

export interface UserSchedule {
  workDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  workHours: {
    start: string; // 24-hour format like "09:00"
    end: string;   // 24-hour format like "17:00"
  };
  bedtime: {
    weekdays: string; // 24-hour format like "22:30"
    weekends: string; // 24-hour format like "23:30"
  };
  wakeTime: {
    weekdays: string; // 24-hour format like "07:00"
    weekends: string; // 24-hour format like "08:30"
  };
}

export interface ActivityRecommendation {
  activity: UserActivity | {
    id: string;
    name: string;
    type: {
      indoor: boolean;
      outdoor: boolean;
    };
    weatherPreferences: {};
  };
  suitabilityScore: number;
  reason: string;
  source?: 'user' | 'ai' | 'todo';
  timeSlot?: string; // e.g., "Morning (8:00-12:00)", "Evening (18:00-21:00)"
  isPrimaryDay?: boolean; // Indicates if this is the main day for this todo
}