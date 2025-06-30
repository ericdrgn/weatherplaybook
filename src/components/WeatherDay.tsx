import React from 'react';
import { DayWeather, ActivityRecommendation } from '../types/weather';
import { getWeatherDescription, getWeatherIcon } from '../utils/weatherApi';
import { Wind, Droplets, Thermometer, ChevronDown, ChevronUp, RefreshCw, Star } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface WeatherDayProps {
  weather: DayWeather;
  recommendations: ActivityRecommendation[];
  isActive: boolean;
  isToday: boolean;
  onScrollToNext?: () => void;
  onScrollToPrevious?: () => void;
  isLastDay?: boolean;
  isFirstDay?: boolean;
  onRefreshWeather?: () => void;
  isLoading?: boolean;
}

export function WeatherDay({ 
  weather, 
  recommendations, 
  isActive, 
  isToday, 
  onScrollToNext, 
  onScrollToPrevious,
  isLastDay,
  isFirstDay,
  onRefreshWeather,
  isLoading
}: WeatherDayProps) {
  const date = new Date(weather.date);
  const dayName = isToday ? 'TODAY' : date.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  const dayNumber = date.getDate();
  
  const iconName = getWeatherIcon(weather.weatherCode);
  const WeatherIcon = (LucideIcons as any)[iconName] || LucideIcons.Cloud;

  // Show all recommendations
  const allRecommendations = recommendations;

  // Weather data is already in US units from the API
  const maxTempF = Math.round(weather.maxTemp);
  const minTempF = Math.round(weather.minTemp);
  const precipitationInches = weather.precipitation.toFixed(2);
  const windSpeedMph = Math.round(weather.windSpeed);

  const getActivityTypeDisplay = (activity: any) => {
    if (activity.type.indoor && activity.type.outdoor) return 'Indoor & Outdoor';
    if (activity.type.indoor) return 'Indoor';
    if (activity.type.outdoor) return 'Outdoor';
    return 'Task';
  };

  const getActivityTypeColor = (activity: any, source?: string) => {
    if (source === 'todo') {
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
    }
    if (activity.type.indoor && activity.type.outdoor) {
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
    }
    if (activity.type.indoor) {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    }
    if (activity.type.outdoor) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    }
    return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
  };

  // Check if this is a multi-activity day
  const hasMultipleActivities = allRecommendations.length > 1;
  const multiActivitySummary = hasMultipleActivities ? 
    `${allRecommendations.length} activities planned` : '';

  // Separate primary and secondary recommendations
  const primaryRecommendations = allRecommendations.filter(rec => rec.isPrimaryDay !== false);
  const secondaryRecommendations = allRecommendations.filter(rec => rec.isPrimaryDay === false);

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-700 ${
      isActive 
        ? 'opacity-100 scale-100' 
        : 'opacity-70 scale-95'
    }`}>
      {/* Weather Section with Sidebar - Fixed Height */}
      <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 xl:p-8">
        <div className="flex gap-3 sm:gap-4 h-[200px] sm:h-[220px] lg:h-[240px] xl:h-[260px]">
          {/* Sidebar - Matches weather section height exactly */}
          <div className="flex-shrink-0">
            <div className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl transition-all duration-500 h-full ${
              isActive 
                ? 'shadow-2xl scale-105 bg-white/80 dark:bg-gray-800/80' 
                : 'shadow-lg'
            }`}>
              {/* Sidebar Content */}
              <div className="p-2 sm:p-3 flex flex-col items-center justify-between h-full">
                {/* Up Arrow */}
                <div className="flex-shrink-0">
                  {!isFirstDay ? (
                    <button
                      onClick={onScrollToPrevious}
                      className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 hover:scale-110 ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300' 
                          : 'text-gray-400 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-500'
                      }`}
                      aria-label="Scroll to previous day"
                    >
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  ) : (
                    <div className="p-1.5 sm:p-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5"></div>
                    </div>
                  )}
                </div>

                {/* Day letters stacked vertically */}
                <div className="flex flex-col items-center space-y-0 flex-1 justify-center">
                  {dayName.split('').map((letter, index) => (
                    <div
                      key={index}
                      className={`text-sm sm:text-base font-black transition-all duration-300 ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400 scale-110' 
                          : 'text-gray-400 dark:text-gray-600'
                      }`}
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed'
                      }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                
                {/* Down Arrow */}
                <div className="flex-shrink-0">
                  {!isLastDay ? (
                    <button
                      onClick={onScrollToNext}
                      className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 hover:scale-110 ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300' 
                          : 'text-gray-400 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-500'
                      }`}
                      aria-label="Scroll to next day"
                    >
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  ) : (
                    <div className="p-1.5 sm:p-2">
                      <div className="w-4 h-4 sm:w-5 sm:h-5"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Weather Overview - Matches sidebar height exactly */}
          <div className="flex-1">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-xl h-full">
              {/* Mobile: Horizontal layout, Desktop: Vertical layout */}
              <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-6 h-full">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <WeatherIcon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <div className="flex-1 sm:text-left flex flex-col justify-center">
                  {/* Date moved here */}
                  <div className="text-sm sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {monthName} {dayNumber}
                  </div>
                  
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                    {getWeatherDescription(weather.weatherCode)}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Thermometer className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-red-500" />
                      <span className="font-semibold">
                        {maxTempF}° / {minTempF}°F
                      </span>
                    </div>
                    
                    {weather.precipitation > 0 && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Droplets className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-500" />
                        <span>{precipitationInches}"</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Wind className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-500" />
                      <span>{windSpeedMph} mph</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Recommendations Section - Compact, content-driven height */}
      <div className="flex-1 px-3 sm:px-4 lg:px-6 xl:px-8 pb-6 sm:pb-8">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
          {/* Header with title and controls - Fixed horizontal layout */}
          <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-shrink-0">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Recommendations
              </h4>
              {hasMultipleActivities && (
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {multiActivitySummary}
                </p>
              )}
            </div>
            
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
          
          {/* Activities content */}
          {allRecommendations.length === 0 ? (
            <div className="text-center py-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Add some activities in settings to get personalized recommendations!
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* Primary Recommendations */}
              {primaryRecommendations.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  {primaryRecommendations.map((rec, index) => (
                    <div
                      key={`primary-${rec.activity.id}-${index}`}
                      className={`bg-white/40 dark:bg-gray-700/40 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-gray-200/30 dark:border-gray-600/30 transition-all duration-200 ${
                        rec.isPrimaryDay ? 'ring-2 ring-green-500/30 bg-white/60 dark:bg-gray-700/60' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          {rec.isPrimaryDay && (
                            <Star className="w-4 h-4 text-green-600 dark:text-green-400 fill-current" />
                          )}
                          <h5 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            {rec.activity.name}
                          </h5>
                          <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full font-medium ${getActivityTypeColor(rec.activity, rec.source)}`}>
                            {rec.source === 'todo' ? 'Task' : getActivityTypeDisplay(rec.activity)}
                          </span>
                        </div>
                      </div>

                      {/* Time Slot Display */}
                      {rec.timeSlot && (
                        <div className="flex items-center gap-2 mb-2 sm:mb-3">
                          <div className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                            {rec.timeSlot}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 sm:mb-3">
                        {rec.reason}
                      </p>
                      
                      {rec.isPrimaryDay && (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          {rec.source === 'todo' ? 'Primary day to complete this task' : 'Best match for today\'s weather'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Secondary Recommendations */}
              {secondaryRecommendations.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 border-t border-gray-200/50 dark:border-gray-600/50 pt-4">
                    Alternative Options
                  </h5>
                  <div className="space-y-3">
                    {secondaryRecommendations.map((rec, index) => (
                      <div
                        key={`secondary-${rec.activity.id}-${index}`}
                        className="bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-200/20 dark:border-gray-600/20 opacity-75"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h6 className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200">
                              {rec.activity.name}
                            </h6>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getActivityTypeColor(rec.activity, rec.source)}`}>
                              {rec.source === 'todo' ? 'Task' : getActivityTypeDisplay(rec.activity)}
                            </span>
                          </div>
                        </div>

                        {rec.timeSlot && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                            {rec.timeSlot}
                          </div>
                        )}
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {rec.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}