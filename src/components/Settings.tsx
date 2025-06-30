import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sun, Moon, Monitor, Clock, Calendar, BookOpen } from 'lucide-react';
import { UserActivity, UserSchedule } from '../types/weather';
import { useTheme } from '../hooks/useTheme';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  activities: UserActivity[];
  onActivitiesChange: (activities: UserActivity[]) => void;
  schedule: UserSchedule;
  onScheduleChange: (schedule: UserSchedule) => void;
  onShowOnboarding: () => void;
}

export function Settings({ 
  isOpen, 
  onClose, 
  activities, 
  onActivitiesChange,
  schedule,
  onScheduleChange,
  onShowOnboarding
}: SettingsProps) {
  const { themeMode, setThemeMode, isDark } = useTheme();
  const [newActivity, setNewActivity] = useState({
    name: '',
    type: {
      indoor: false,
      outdoor: true
    },
    weatherPreferences: {
      minTemp: '',
      maxTemp: '',
      maxPrecipitation: '',
      maxWindSpeed: ''
    }
  });

  const handleAddActivity = () => {
    if (!newActivity.name.trim()) return;
    if (!newActivity.type.indoor && !newActivity.type.outdoor) return;

    const activity: UserActivity = {
      id: Date.now().toString(),
      name: newActivity.name.trim(),
      type: {
        indoor: newActivity.type.indoor,
        outdoor: newActivity.type.outdoor
      },
      weatherPreferences: {
        minTemp: newActivity.weatherPreferences.minTemp ? Number(newActivity.weatherPreferences.minTemp) : undefined,
        maxTemp: newActivity.weatherPreferences.maxTemp ? Number(newActivity.weatherPreferences.maxTemp) : undefined,
        maxPrecipitation: newActivity.weatherPreferences.maxPrecipitation ? Number(newActivity.weatherPreferences.maxPrecipitation) : undefined,
        maxWindSpeed: newActivity.weatherPreferences.maxWindSpeed ? Number(newActivity.weatherPreferences.maxWindSpeed) : undefined,
      }
    };

    onActivitiesChange([...activities, activity]);
    setNewActivity({
      name: '',
      type: {
        indoor: false,
        outdoor: true
      },
      weatherPreferences: {
        minTemp: '',
        maxTemp: '',
        maxPrecipitation: '',
        maxWindSpeed: ''
      }
    });
  };

  const handleDeleteActivity = (id: string) => {
    onActivitiesChange(activities.filter(activity => activity.id !== id));
  };

  const handleScheduleChange = (field: string, value: any) => {
    onScheduleChange({
      ...schedule,
      [field]: value
    });
  };

  const handleWorkDayChange = (day: string, checked: boolean) => {
    onScheduleChange({
      ...schedule,
      workDays: {
        ...schedule.workDays,
        [day]: checked
      }
    });
  };

  const handleOnboardingClick = () => {
    onShowOnboarding();
    onClose();
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ];

  const getActivityTypeDisplay = (type: { indoor: boolean; outdoor: boolean }) => {
    if (type.indoor && type.outdoor) return 'Both';
    if (type.indoor) return 'Indoor';
    if (type.outdoor) return 'Outdoor';
    return 'None';
  };

  const getActivityTypeColor = (type: { indoor: boolean; outdoor: boolean }) => {
    if (type.indoor && type.outdoor) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
    if (type.indoor) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    if (type.outdoor) return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
  };

  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Onboarding Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Getting Started</h3>
            <button
              onClick={handleOnboardingClick}
              className="flex items-center gap-3 w-full p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <div className="font-medium text-blue-900 dark:text-blue-300">View Onboarding</div>
                <div className="text-sm text-blue-700 dark:text-blue-400">
                  Return to the welcome screen and app introduction
                </div>
              </div>
            </button>
          </div>

          {/* Theme Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Theme</h3>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setThemeMode(value as any)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    themeMode === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Settings */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule & Availability</h3>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 space-y-6">
              {/* Work Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Work Days
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {Object.entries(dayLabels).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={schedule.workDays[key as keyof typeof schedule.workDays]}
                        onChange={(e) => handleWorkDayChange(key, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{label.slice(0, 3)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Work Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Work Start Time
                  </label>
                  <input
                    type="time"
                    value={schedule.workHours.start}
                    onChange={(e) => handleScheduleChange('workHours', { ...schedule.workHours, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Work End Time
                  </label>
                  <input
                    type="time"
                    value={schedule.workHours.end}
                    onChange={(e) => handleScheduleChange('workHours', { ...schedule.workHours, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sleep Schedule */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sleep Schedule</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Weekday Bedtime
                    </label>
                    <input
                      type="time"
                      value={schedule.bedtime.weekdays}
                      onChange={(e) => handleScheduleChange('bedtime', { ...schedule.bedtime, weekdays: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Weekend Bedtime
                    </label>
                    <input
                      type="time"
                      value={schedule.bedtime.weekends}
                      onChange={(e) => handleScheduleChange('bedtime', { ...schedule.bedtime, weekends: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Weekday Wake Time
                    </label>
                    <input
                      type="time"
                      value={schedule.wakeTime.weekdays}
                      onChange={(e) => handleScheduleChange('wakeTime', { ...schedule.wakeTime, weekdays: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Weekend Wake Time
                    </label>
                    <input
                      type="time"
                      value={schedule.wakeTime.weekends}
                      onChange={(e) => handleScheduleChange('wakeTime', { ...schedule.wakeTime, weekends: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">AI Schedule Integration</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400">
                      The AI will use your work schedule and sleep times to recommend activities during your free time. 
                      Tasks will be scheduled around your work hours, and activities will be suggested for evenings, 
                      weekends, and other available time slots.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activities</h3>
            
            {/* Add New Activity */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Add New Activity</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Activity Name
                    </label>
                    <input
                      type="text"
                      value={newActivity.name}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Hiking, Reading"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Activity Type
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newActivity.type.indoor}
                          onChange={(e) => setNewActivity(prev => ({
                            ...prev,
                            type: { ...prev.type, indoor: e.target.checked }
                          }))}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Indoor</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newActivity.type.outdoor}
                          onChange={(e) => setNewActivity(prev => ({
                            ...prev,
                            type: { ...prev.type, outdoor: e.target.checked }
                          }))}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Outdoor</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Temp (°F)
                    </label>
                    <input
                      type="number"
                      value={newActivity.weatherPreferences.minTemp}
                      onChange={(e) => setNewActivity(prev => ({
                        ...prev,
                        weatherPreferences: { ...prev.weatherPreferences, minTemp: e.target.value }
                      }))}
                      placeholder="50"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Temp (°F)
                    </label>
                    <input
                      type="number"
                      value={newActivity.weatherPreferences.maxTemp}
                      onChange={(e) => setNewActivity(prev => ({
                        ...prev,
                        weatherPreferences: { ...prev.weatherPreferences, maxTemp: e.target.value }
                      }))}
                      placeholder="85"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Rain (in)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newActivity.weatherPreferences.maxPrecipitation}
                      onChange={(e) => setNewActivity(prev => ({
                        ...prev,
                        weatherPreferences: { ...prev.weatherPreferences, maxPrecipitation: e.target.value }
                      }))}
                      placeholder="0.2"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Wind (mph)
                    </label>
                    <input
                      type="number"
                      value={newActivity.weatherPreferences.maxWindSpeed}
                      onChange={(e) => setNewActivity(prev => ({
                        ...prev,
                        weatherPreferences: { ...prev.weatherPreferences, maxWindSpeed: e.target.value }
                      }))}
                      placeholder="12"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddActivity}
                  disabled={!newActivity.name.trim() || (!newActivity.type.indoor && !newActivity.type.outdoor)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Activity
                </button>
              </div>
            </div>

            {/* Activities List */}
            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No activities added yet. Add some activities to get personalized recommendations!
                </div>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{activity.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getActivityTypeColor(activity.type)}`}>
                          {getActivityTypeDisplay(activity.type)}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        {activity.weatherPreferences.minTemp && (
                          <div>Min temp: {activity.weatherPreferences.minTemp}°F</div>
                        )}
                        {activity.weatherPreferences.maxTemp && (
                          <div>Max temp: {activity.weatherPreferences.maxTemp}°F</div>
                        )}
                        {activity.weatherPreferences.maxPrecipitation && (
                          <div>Max rain: {activity.weatherPreferences.maxPrecipitation}"</div>
                        )}
                        {activity.weatherPreferences.maxWindSpeed && (
                          <div>Max wind: {activity.weatherPreferences.maxWindSpeed}mph</div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteActivity(activity.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}