import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, RefreshCw, ExternalLink } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { UserActivity, TodoItem, UserSchedule } from '../types/weather';
import { Settings } from './Settings';
import { TodoDialog } from './TodoDialog';
import { WeatherDay } from './WeatherDay';
import { WeeklyOverview } from './WeeklyOverview';
import { getAIRecommendations } from '../utils/aiRecommendations';

const defaultSchedule: UserSchedule = {
  workDays: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  },
  workHours: {
    start: '09:00',
    end: '17:00'
  },
  bedtime: {
    weekdays: '22:30',
    weekends: '23:30'
  },
  wakeTime: {
    weekdays: '07:00',
    weekends: '08:30'
  }
};

// ONBOARDING CONTENT - CUSTOMIZE THIS SECTION
const ONBOARDING_CONTENT = {
  title: "Welcome to your Weather Playbook",
  subtitle: "Your Weather-Based Weekly Planner",
  description: "This project was fully vibe coded for the bolt.new hackathon. I made a point to not care about the code, prompts for the LLM, or anything else. This section is the only thing I wrote as I wanted to showcase what Bolt is capable of. Add your preferences in the settings and watch it work for you.",
  features: [
    "7-day weather forecasts with activity recommendations",
    "Personalized suggestions based on your preferences",
    "Smart scheduling around your work and sleep schedule",
    "To-do list with weather-aware planning"
  ],
  buttonText: "Check Weather",
  loadingText: "Getting Location..."
};

export function WeatherApp() {
  const { weather, loading, error, lastUpdated, fetchWeather, isDataStale } = useWeather();
  const [activities, setActivities] = useLocalStorage<UserActivity[]>('user-activities', []);
  const [schedule, setSchedule] = useLocalStorage<UserSchedule>('user-schedule', defaultSchedule);
  
  // Initialize todos with proper type validation
  const [todos, setTodos] = useLocalStorage<TodoItem[]>('user-todos', [], (storedTodos) => {
    // Ensure all todos have the required type property
    return storedTodos.map(todo => ({
      ...todo,
      type: todo.type || { indoor: false, outdoor: true }
    }));
  });
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [todosOpen, setTodosOpen] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [showOverview, setShowOverview] = useState(true);
  const [recommendations, setRecommendations] = useLocalStorage<any[][]>('ai-recommendations-cache', []);
  const [weeklySummary, setWeeklySummary] = useLocalStorage<string>('weekly-summary-cache', '');
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [lastRecommendationUpdate, setLastRecommendationUpdate] = useLocalStorage<string | null>('last-recommendation-update', null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || weather.length === 0) return;

    const handleScroll = () => {
      if (isScrolling.current) return;
      
      const scrollTop = container.scrollTop;
      const overviewElement = overviewRef.current;
      
      // Hide overview when scrolling past it
      if (scrollTop > 100) {
        setShowOverview(false);
      } else {
        setShowOverview(true);
      }
      
      // Calculate current day based on scroll position
      // Get actual overview height instead of using fixed value
      const overviewHeight = overviewElement ? overviewElement.offsetHeight : 0;
      const adjustedScrollTop = Math.max(0, scrollTop - overviewHeight);
      const windowHeight = window.innerHeight;
      const newIndex = Math.round(adjustedScrollTop / windowHeight);
      
      if (newIndex !== currentDayIndex && newIndex >= 0 && newIndex < weather.length) {
        setCurrentDayIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [weather.length, currentDayIndex, showOverview]);

  // Check if recommendations need to be regenerated
  const needsRecommendationUpdate = () => {
    if (!lastRecommendationUpdate) return true;
    if (recommendations.length !== weather.length) return true;
    
    // Check if any data has changed since last update
    const lastUpdate = new Date(lastRecommendationUpdate);
    const dataKeys = ['user-activities', 'user-todos', 'user-schedule', 'weather-cache'];
    
    for (const key of dataKeys) {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          const parsed = JSON.parse(item);
          // Simple check - if any data was modified after last recommendation update
          if (parsed.lastUpdated && new Date(parsed.lastUpdated) > lastUpdate) {
            return true;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
    
    return false;
  };

  // Only generate recommendations when explicitly requested or when data changes significantly
  const generateRecommendations = async (force = false) => {
    if (!force && !needsRecommendationUpdate()) {
      console.log('Using cached recommendations - no update needed');
      return;
    }

    if (weather.length === 0 || (activities.length === 0 && todos.filter(t => !t.completed).length === 0)) {
      setRecommendations(Array(weather.length).fill([]));
      setWeeklySummary('');
      setRecommendationError(null);
      return;
    }

    setLoadingRecommendations(true);
    setRecommendationError(null);
    
    try {
      console.log('Generating AI recommendations...');
      const aiData = await getAIRecommendations(activities, weather, todos, schedule);
      setRecommendations(aiData.recommendations);
      setWeeklySummary(aiData.summary);
      setLastRecommendationUpdate(new Date().toISOString());
      console.log('AI recommendations generated successfully');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendationError(error instanceof Error ? error.message : 'Failed to generate recommendations');
      // Keep existing recommendations on error instead of clearing
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Only auto-generate recommendations on initial load if we have weather but no cached recommendations
  useEffect(() => {
    if (weather.length > 0 && recommendations.length === 0 && !lastRecommendationUpdate) {
      generateRecommendations();
    }
  }, [weather.length]); // Only depend on weather length, not the full weather array

  const handleRefreshWeather = async () => {
    await fetchWeather();
    // Force regenerate recommendations after weather update
    await generateRecommendations(true);
  };

  const scrollToDay = (index: number) => {
    const container = containerRef.current;
    const overviewElement = overviewRef.current;
    if (!container) return;

    isScrolling.current = true;
    
    // Get actual overview height dynamically
    const overviewHeight = overviewElement ? overviewElement.offsetHeight : 0;
    const targetScrollTop = overviewHeight + (index * window.innerHeight);
    
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });

    setTimeout(() => {
      isScrolling.current = false;
    }, 500);
  };

  const scrollToNextDay = () => {
    if (currentDayIndex < weather.length - 1) {
      scrollToDay(currentDayIndex + 1);
    }
  };

  const scrollToPreviousDay = () => {
    if (currentDayIndex > 0) {
      scrollToDay(currentDayIndex - 1);
    }
  };

  // Handle settings changes - NO automatic recommendation updates
  const handleActivitiesChange = (newActivities: UserActivity[]) => {
    setActivities(newActivities);
    // Don't automatically trigger recommendation update
  };

  const handleScheduleChange = (newSchedule: UserSchedule) => {
    setSchedule(newSchedule);
    // Don't automatically trigger recommendation update
  };

  const handleTodosChange = (newTodos: TodoItem[]) => {
    setTodos(newTodos);
    // Don't automatically trigger recommendation update
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleStartFromOnboarding = async () => {
    setShowOnboarding(false);
    // Always trigger a full refresh from onboarding - fetch weather AND generate recommendations
    await handleRefreshWeather();
  };

  // Show onboarding if explicitly requested or if no weather data and not loading
  const shouldShowOnboarding = showOnboarding || (weather.length === 0 && !loading && !error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 transition-colors duration-300">
      {/* Bolt.new Badge - Positioned absolutely in top right corner */}
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-4 right-4 z-50 group"
        aria-label="Visit Bolt.new"
      >
        <div className="relative">
          <img 
            src="/bolt-icon.png" 
            alt="Bolt.new" 
            className="w-16 h-16 rounded-2xl shadow-2xl group-hover:scale-110 transition-all duration-300"
          />
          {/* Glow effect */}
          <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 group-hover:from-blue-400/40 group-hover:to-purple-400/40 transition-all duration-300 -z-10 blur-lg"></div>
        </div>
      </a>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-all duration-200"
              aria-label="Settings"
            >
              <SettingsIcon className="w-6 h-6 text-gray-800 dark:text-gray-100 drop-shadow-sm" />
            </button>

            <div className="text-xl font-bold text-gray-800 dark:text-gray-100 drop-shadow-sm">
              Weather Playbook
            </div>

            {/* Spacer to balance the layout since bolt icon is now positioned absolutely */}
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {error && (
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-red-50/90 dark:bg-red-900/30 border border-red-200/50 dark:border-red-800/30 rounded-xl p-6 flex items-center gap-3 backdrop-blur-sm">
              <div className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0">⚠️</div>
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">Weather Error</h3>
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {recommendationError && (
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-orange-50/90 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/30 rounded-xl p-6 flex items-center gap-3 backdrop-blur-sm">
              <div className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0">🤖</div>
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-300">AI Recommendations Unavailable</h3>
                <p className="text-orange-700 dark:text-orange-400 text-sm">{recommendationError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Data staleness indicator */}
        {weather.length > 0 && isDataStale && (
          <div className="max-w-4xl mx-auto p-4">
            <div className="bg-yellow-50/90 dark:bg-yellow-900/30 border border-yellow-200/50 dark:border-yellow-800/30 rounded-xl p-4 flex items-center gap-3 backdrop-blur-sm">
              <div className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0">⏰</div>
              <div className="flex-1">
                <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                  Weather data is more than 1 hour old. Click "Update" for fresh forecasts and recommendations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Onboarding Screen */}
        {shouldShowOnboarding && (
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
            <div className="text-center max-w-2xl mx-auto p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {ONBOARDING_CONTENT.title}
              </h2>
              
              <p className="text-lg text-blue-600 dark:text-blue-400 font-medium mb-6">
                {ONBOARDING_CONTENT.subtitle}
              </p>
              
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                {ONBOARDING_CONTENT.description}
              </p>

              {/* Features List */}
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 mb-8 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Features</h3>
                <ul className="space-y-3 text-left">
                  {ONBOARDING_CONTENT.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleStartFromOnboarding}
                  disabled={loading || loadingRecommendations}
                  className="flex items-center gap-2 px-8 py-4 bg-blue-600/90 hover:bg-blue-700/90 disabled:bg-blue-400/70 text-white rounded-full font-medium transition-all duration-200 disabled:cursor-not-allowed backdrop-blur-sm shadow-lg hover:shadow-xl text-lg"
                >
                  <RefreshCw className={`w-5 h-5 ${(loading || loadingRecommendations) ? 'animate-spin' : ''}`} />
                  {(loading || loadingRecommendations) ? ONBOARDING_CONTENT.loadingText : ONBOARDING_CONTENT.buttonText}
                </button>
                
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-600/80 hover:bg-gray-700/80 text-white rounded-full font-medium transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl"
                >
                  <SettingsIcon className="w-5 h-5" />
                  Setup
                </button>
              </div>
            </div>
          </div>
        )}

        {weather.length > 0 && !shouldShowOnboarding && (
          <>
            {/* Scrollable Content */}
            <div
              ref={containerRef}
              className="h-screen overflow-y-auto scroll-smooth"
            >
              {/* Weekly Overview Section */}
              <div ref={overviewRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <WeeklyOverview
                  weather={weather}
                  allRecommendations={recommendations}
                  weeklySummary={weeklySummary}
                  onDayClick={scrollToDay}
                  currentDayIndex={currentDayIndex}
                  onRefreshWeather={handleRefreshWeather}
                  isLoading={loading || loadingRecommendations}
                  onOpenTodos={() => setTodosOpen(true)}
                />
              </div>

              {/* Weather Days */}
              <div style={{ scrollSnapType: 'y mandatory' }}>
                {weather.map((dayWeather, index) => (
                  <div
                    key={dayWeather.date}
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    <WeatherDay
                      weather={dayWeather}
                      recommendations={recommendations[index] || []}
                      isActive={index === currentDayIndex}
                      isToday={index === 0}
                      onScrollToNext={scrollToNextDay}
                      onScrollToPrevious={scrollToPreviousDay}
                      isLastDay={index === weather.length - 1}
                      isFirstDay={index === 0}
                      onRefreshWeather={handleRefreshWeather}
                      isLoading={loading || loadingRecommendations}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Settings Modal */}
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        activities={activities}
        onActivitiesChange={handleActivitiesChange}
        schedule={schedule}
        onScheduleChange={handleScheduleChange}
        onShowOnboarding={handleShowOnboarding}
      />

      {/* Todo Dialog */}
      <TodoDialog
        isOpen={todosOpen}
        onClose={() => setTodosOpen(false)}
        todos={todos}
        onTodosChange={handleTodosChange}
      />
    </div>
  );
}