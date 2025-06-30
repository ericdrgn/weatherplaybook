import React from 'react';
import { DayWeather, ActivityRecommendation } from '../types/weather';
import { getWeatherDescription } from '../utils/weatherApi';
import { RefreshCw, CheckSquare, Calendar } from 'lucide-react';

interface WeeklyOverviewProps {
  weather: DayWeather[];
  allRecommendations: ActivityRecommendation[][];
  weeklySummary?: string;
  onDayClick: (index: number) => void;
  currentDayIndex: number;
  onRefreshWeather?: () => void;
  isLoading?: boolean;
  onOpenTodos?: () => void;
}

export function WeeklyOverview({ 
  weather, 
  allRecommendations, 
  weeklySummary,
  onDayClick, 
  currentDayIndex,
  onRefreshWeather,
  isLoading,
  onOpenTodos
}: WeeklyOverviewProps) {
  const getActivityTypeDisplay = (activity: any, source?: string) => {
    if (source === 'todo') return 'Task';
    if (activity.type.indoor && activity.type.outdoor) return 'Indoor & Outdoor';
    if (activity.type.indoor) return 'Indoor';
    if (activity.type.outdoor) return 'Outdoor';
    return 'Activity';
  };

  const getActivityTypeColor = (activity: any, source?: string, isActive: boolean = false) => {
    const baseClasses = source === 'todo'
      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      : activity.type.indoor && activity.type.outdoor
        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
        : activity.type.outdoor
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';

    if (isActive) {
      return source === 'todo'
        ? 'bg-purple-200 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200'
        : activity.type.indoor && activity.type.outdoor
          ? 'bg-purple-200 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200'
          : activity.type.outdoor
            ? 'bg-green-200 dark:bg-green-800/50 text-green-800 dark:text-green-200'
            : 'bg-blue-200 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200';
    }

    return baseClasses;
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl p-6 mb-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
      {/* Header with title and controls - Fixed horizontal layout */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex-shrink-0">
          Overview
        </h2>
        
        {/* Controls */}
        <button
          onClick={onRefreshWeather}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600/80 hover:bg-blue-700/80 disabled:bg-blue-400/60 text-white rounded-full font-medium transition-all duration-200 disabled:cursor-not-allowed text-sm flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Update</span>
        </button>
      </div>

      {/* To-Do List Button */}
      <div className="mb-6">
        <button
          onClick={onOpenTodos}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600/80 hover:bg-purple-700/80 text-white rounded-full font-medium transition-all duration-200 text-sm"
        >
          <CheckSquare className="w-4 h-4" />
          <span>To-Do List</span>
        </button>
      </div>

      {/* Weekly Summary */}
      {weeklySummary && (
        <div className="mb-6">
          <div className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Weekly Strategy</h3>
                <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
                  {weeklySummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {weather.map((dayWeather, index) => {
          const date = new Date(dayWeather.date);
          const isToday = index === 0;
          const isActive = index === currentDayIndex;
          
          // Format as "Today, Monday" or just "Monday" for other days
          const fullDayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          const dayName = isToday ? `Today, ${fullDayName}` : fullDayName;
          
          // Format date as "June 30"
          const dateString = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
          
          const weatherDescription = getWeatherDescription(dayWeather.weatherCode);
          
          // Get primary activity (isPrimaryDay: true) or top activity
          const primaryActivity = allRecommendations[index]?.find(rec => rec.isPrimaryDay) || allRecommendations[index]?.[0];
          const maxTempF = Math.round(dayWeather.maxTemp);
          const minTempF = Math.round(dayWeather.minTemp);
          
          return (
            <button
              key={dayWeather.date}
              onClick={() => onDayClick(index)}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                isActive
                  ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/30 shadow-lg scale-105'
                  : 'border-gray-200/50 dark:border-gray-600/50 hover:border-gray-300 dark:hover:border-gray-500 bg-white/40 dark:bg-gray-700/40'
              }`}
            >
              {/* Day and Date - Single Line Layout */}
              <div className="text-center mb-3">
                <div className={`text-sm font-semibold ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {dayName}, {dateString}
                </div>
              </div>

              {/* Weather Description Text */}
              <div className="text-center mb-3">
                <div className={`text-xs font-medium px-2 py-1 rounded-lg ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-100 dark:bg-gray-600/50 text-gray-600 dark:text-gray-300'
                }`}>
                  {weatherDescription}
                </div>
              </div>

              {/* Temperature */}
              <div className={`text-center text-sm font-medium mb-3 ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}>
                {maxTempF}° / {minTempF}°F
              </div>

              {/* Top Activity */}
              <div className="text-center">
                {primaryActivity ? (
                  <div>
                    <div className={`text-xs font-semibold mb-1 ${
                      isActive 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-200'
                    }`}>
                      {primaryActivity.isPrimaryDay ? 'Primary Activity' : 'Top Activity'}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${getActivityTypeColor(primaryActivity.activity, primaryActivity.source, isActive)}`}>
                      {primaryActivity.activity.name}
                    </div>
                    {primaryActivity.timeSlot && (
                      <div className={`text-xs mt-1 ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {primaryActivity.timeSlot}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`text-xs ${
                    isActive 
                      ? 'text-blue-500 dark:text-blue-400' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    No activities
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}