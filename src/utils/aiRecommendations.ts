import { UserActivity, DayWeather, ActivityRecommendation, TodoItem, UserSchedule } from '../types/weather';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface WeeklySummary {
  summary: string;
  recommendations: ActivityRecommendation[][];
}

export async function getAIRecommendations(
  activities: UserActivity[],
  weather: DayWeather[],
  todos: TodoItem[] = [],
  schedule: UserSchedule
): Promise<WeeklySummary> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('AI recommendations unavailable - missing configuration.');
    }

    const apiUrl = `${SUPABASE_URL}/functions/v1/ai-recommendations`;
    
    console.log('Calling AI recommendations with:', {
      activities: activities.length,
      weather: weather.length,
      todos: todos.filter(t => !t.completed).length,
      schedule: schedule
    });
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activities,
        weather,
        todos: todos.filter(todo => !todo.completed), // Only send incomplete todos
        schedule
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API request failed:', response.status, errorText);
      throw new Error(`AI recommendations unavailable (${response.status})`);
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('AI API returned error:', data.error, data.message);
      throw new Error(data.message || 'AI recommendations unavailable');
    }

    if (!data.recommendations) {
      console.error('AI API returned no recommendations');
      throw new Error('No recommendations available from AI');
    }

    console.log('Successfully received AI recommendations:', data.recommendations.length, 'days');
    return {
      summary: data.summary || 'Weekly schedule optimized for weather and availability.',
      recommendations: data.recommendations
    };
    
  } catch (error) {
    console.error('Error fetching AI recommendations:', error);
    throw error; // Re-throw the error instead of returning fallback
  }
}