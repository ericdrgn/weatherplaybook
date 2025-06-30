const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface UserActivity {
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

interface DayWeather {
  date: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  type: {
    indoor: boolean;
    outdoor: boolean;
  };
}

interface UserSchedule {
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

interface ActivityRecommendation {
  activity: {
    id: string;
    name: string;
    type: {
      indoor: boolean;
      outdoor: boolean;
    };
    weatherPreferences: any;
  };
  suitabilityScore: number;
  reason: string;
  source: 'user' | 'todo';
  timeSlot?: string;
  isPrimaryDay?: boolean; // Indicates if this is the main day for this todo
}

interface WeeklySummary {
  summary: string;
  recommendations: ActivityRecommendation[][];
}

// Simple in-memory queue for rate limiting
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private readonly minInterval = 1000; // 1 second between requests

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minInterval) {
        const waitTime = this.minInterval - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const requestFn = this.queue.shift();
      if (requestFn) {
        this.lastRequestTime = Date.now();
        await requestFn();
      }
    }

    this.processing = false;
  }
}

// Global queue instance
const apiQueue = new RequestQueue();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { activities, weather, todos, schedule } = await req.json()

    if (!activities || !weather || !schedule) {
      return new Response(
        JSON.stringify({ error: 'Missing required data: activities, weather, and schedule' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Received request with:', {
      activities: activities.length,
      weather: weather.length,
      todos: todos?.length || 0,
      schedule: schedule
    });

    // Get Mistral API key from environment
    const mistralApiKey = Deno.env.get('MISTRAL_API_KEY');
    if (!mistralApiKey) {
      console.error('MISTRAL_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'API configuration error - AI recommendations unavailable' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Queue the API request to respect rate limits
    const weeklyData = await apiQueue.add(() => 
      generateWeeklyRecommendationsWithSummary(
        activities, 
        weather, 
        todos || [], 
        schedule,
        mistralApiKey
      )
    );

    return new Response(
      JSON.stringify(weeklyData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in ai-recommendations function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'AI recommendations unavailable', 
        message: 'Unable to generate recommendations at this time. Please try again later.' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateWeeklyRecommendationsWithSummary(
  activities: UserActivity[],
  weather: DayWeather[],
  todos: TodoItem[],
  schedule: UserSchedule,
  mistralApiKey: string
): Promise<WeeklySummary> {
  
  try {
    // Prepare the prompt for Mistral
    const weatherSummary = weather.map((day, index) => {
      const date = new Date(day.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `Day ${index + 1} - ${dayName} ${dateStr} (${day.date}): ${Math.round((day.maxTemp + day.minTemp) / 2)}°F, ${day.precipitation}" rain, ${day.windSpeed}mph wind`;
    }).join('\n');

    const activitiesList = activities.map(activity => {
      const type = activity.type.indoor && activity.type.outdoor ? 'indoor/outdoor' : 
                   activity.type.indoor ? 'indoor' : 'outdoor';
      const prefs = [];
      if (activity.weatherPreferences.minTemp) prefs.push(`min ${activity.weatherPreferences.minTemp}°F`);
      if (activity.weatherPreferences.maxTemp) prefs.push(`max ${activity.weatherPreferences.maxTemp}°F`);
      if (activity.weatherPreferences.maxPrecipitation) prefs.push(`max ${activity.weatherPreferences.maxPrecipitation}" rain`);
      if (activity.weatherPreferences.maxWindSpeed) prefs.push(`max ${activity.weatherPreferences.maxWindSpeed}mph wind`);
      
      return `- ID: "${activity.id}", Name: "${activity.name}" (${type}${prefs.length ? ', prefers: ' + prefs.join(', ') : ''})`;
    }).join('\n');

    const incompleteTodos = todos.filter(todo => !todo.completed);
    const todosList = incompleteTodos.map(todo => {
      const type = todo.type.indoor && todo.type.outdoor ? 'indoor/outdoor' : 
                   todo.type.indoor ? 'indoor' : 'outdoor';
      return `- ID: "${todo.id}", Name: "${todo.text}" (${type} task)`;
    }).join('\n');

    // Format schedule information
    const workDaysList = Object.entries(schedule.workDays)
      .filter(([_, isWorkDay]) => isWorkDay)
      .map(([day, _]) => day.charAt(0).toUpperCase() + day.slice(1))
      .join(', ');

    const scheduleInfo = `
WORK SCHEDULE:
- Work Days: ${workDaysList}
- Work Hours: ${schedule.workHours.start} - ${schedule.workHours.end}
- Weekday Bedtime: ${schedule.bedtime.weekdays}
- Weekend Bedtime: ${schedule.bedtime.weekends}
- Weekday Wake Time: ${schedule.wakeTime.weekdays}
- Weekend Wake Time: ${schedule.wakeTime.weekends}`;

    const prompt = `You are an expert weekly activity planner. Create an optimal 7-day schedule with a comprehensive weekly summary.

CRITICAL REQUIREMENTS:
1. Use the EXACT IDs and names provided for activities and tasks
2. EVERY DAY MUST HAVE AT LEAST ONE PRIMARY ACTIVITY (isPrimaryDay: true)
3. EACH TODO TASK can only have ONE primary day (isPrimaryDay: true) across the entire week
4. Todo tasks MUST appear on multiple other days as alternatives (isPrimaryDay: false) for flexibility
5. User hobbies/activities should appear on multiple suitable days when weather/schedule permits
6. Multiple activities can be primary on the same day if time permits (different time slots)
7. NEVER have the same activity appear as both primary AND alternative on the same day
8. Each day's recommendations are ONLY for that specific day's weather and schedule
9. Provide a detailed weekly summary that mentions SPECIFIC activities and tasks by name
10. Use proper time slot formatting: "After Work (18:00-20:00)" NOT "After Work_18:00-20:00"

WEATHER FORECAST (7 days starting from today):
${weatherSummary}

USER HOBBIES/ACTIVITIES (use exact IDs and names):
${activitiesList}

PENDING TASKS (ALL MUST BE COMPLETED THIS WEEK - use exact IDs and names):
${todosList}

${scheduleInfo}

SCHEDULING STRATEGY:
1. NEVER schedule during work hours on work days
2. Outdoor activities need suitable weather AND available time
3. Indoor tasks can be done during poor weather or evening hours
4. Multiple activities per day are encouraged when time allows (different time slots)
5. Each todo task gets EXACTLY ONE primary day but MUST appear as alternatives on other suitable days
6. User hobbies should appear on multiple days when weather/schedule is suitable
7. Provide plenty of alternatives for flexibility
8. Consider activity combinations and weather patterns across the week
9. NEVER have the same activity as both primary and alternative on the same day
10. EVERY DAY MUST HAVE AT LEAST ONE PRIMARY ACTIVITY - if no todos are primary on a day, make a hobby primary

Time Slot Options (use proper formatting with spaces, not underscores):
- Early Morning (07:00-09:00)
- Morning (09:00-12:00)  
- Afternoon (12:00-17:00) (weekends only)
- After Work (18:00-20:00)
- Evening (18:00-21:00)
- Late Evening (21:00-22:00)

EXAMPLE STRUCTURE FOR A DAY (use the actual IDs and names from the lists above):
[
  {
    "activity": {
      "id": "actual_activity_id_from_list",
      "name": "Actual Activity Name",
      "type": {"indoor": false, "outdoor": true},
      "weatherPreferences": {}
    },
    "suitabilityScore": 95,
    "reason": "Perfect weather for outdoor activity with clear skies and mild temperatures",
    "source": "user",
    "timeSlot": "Morning (09:00-12:00)",
    "isPrimaryDay": true
  },
  {
    "activity": {
      "id": "actual_todo_id_from_list",
      "name": "Actual Todo Text",
      "type": {"indoor": true, "outdoor": false},
      "weatherPreferences": {}
    },
    "suitabilityScore": 90,
    "reason": "Primary day for completing this task",
    "source": "todo",
    "timeSlot": "Afternoon (13:00-16:00)",
    "isPrimaryDay": true
  },
  {
    "activity": {
      "id": "another_activity_id_from_list",
      "name": "Another Activity Name",
      "type": {"indoor": true, "outdoor": false},
      "weatherPreferences": {}
    },
    "suitabilityScore": 70,
    "reason": "Good alternative indoor activity for evening relaxation",
    "source": "user",
    "timeSlot": "Evening (19:00-21:00)",
    "isPrimaryDay": false
  }
]

Return ONLY this JSON structure:
{
  "summary": "A detailed 2-3 sentence summary that mentions SPECIFIC activities and tasks by name from the provided lists. Focus on weather patterns and when specific activities are scheduled.",
  "recommendations": [
    [day 1 recommendations array],
    [day 2 recommendations array],
    [day 3 recommendations array],
    [day 4 recommendations array],
    [day 5 recommendations array],
    [day 6 recommendations array],
    [day 7 recommendations array]
  ]
}

VALIDATION CHECKLIST:
✓ Use exact IDs and names from the provided lists
✓ EVERY DAY has at least one primary activity (isPrimaryDay: true)
✓ Every pending task has exactly ONE primary day (isPrimaryDay: true) across the entire week
✓ Every pending task appears on multiple days as alternatives (isPrimaryDay: false)
✓ User hobbies appear on multiple suitable days when weather permits
✓ Multiple activities can be primary on the same day (different time slots)
✓ NEVER same activity as both primary and alternative on same day
✓ No activities scheduled during work hours
✓ Time slots use proper formatting with spaces: "After Work (18:00-20:00)"
✓ Weekly summary mentions specific activities and tasks by name
✓ Summary explains weather patterns and task distribution
✓ Plenty of alternatives provided for flexibility`;

    console.log('Calling Mistral API...');
    
    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mistralApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!mistralResponse.ok) {
      const errorText = await mistralResponse.text();
      console.error('Mistral API error:', mistralResponse.status, errorText);
      throw new Error(`Mistral API error: ${mistralResponse.status} - ${errorText}`);
    }

    const mistralData = await mistralResponse.json();
    console.log('Mistral response received');

    if (!mistralData.choices || !mistralData.choices[0] || !mistralData.choices[0].message) {
      console.error('Invalid Mistral response structure:', mistralData);
      throw new Error('Invalid response format from Mistral API');
    }

    const content = mistralData.choices[0].message.content;
    console.log('Mistral content:', content);

    // Parse the JSON response from Mistral
    let parsedResponse;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse Mistral response as JSON:', parseError);
      console.error('Raw content:', content);
      throw new Error('Failed to parse AI response');
    }

    if (!parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations)) {
      console.error('Invalid recommendations format:', parsedResponse);
      throw new Error('Invalid recommendations format from AI');
    }

    // Ensure we have exactly 7 days of recommendations
    const recommendations = parsedResponse.recommendations;
    while (recommendations.length < 7) {
      recommendations.push([]);
    }

    // Validate and fix duplicate primary/alternative on same day
    recommendations.forEach((dayRecs, dayIndex) => {
      const activityCounts = new Map();
      
      // Count occurrences of each activity on this day
      dayRecs.forEach(rec => {
        const key = rec.activity.id;
        if (!activityCounts.has(key)) {
          activityCounts.set(key, []);
        }
        activityCounts.get(key).push(rec);
      });
      
      // Fix duplicates - keep primary, remove alternatives
      activityCounts.forEach((recs, activityId) => {
        if (recs.length > 1) {
          console.warn(`Activity ${activityId} appears multiple times on day ${dayIndex}, fixing...`);
          const primaryRec = recs.find(r => r.isPrimaryDay);
          if (primaryRec) {
            // Keep only the primary, remove alternatives
            const indexesToRemove = [];
            dayRecs.forEach((rec, index) => {
              if (rec.activity.id === activityId && !rec.isPrimaryDay) {
                indexesToRemove.push(index);
              }
            });
            // Remove in reverse order to maintain indices
            indexesToRemove.reverse().forEach(index => {
              dayRecs.splice(index, 1);
            });
          }
        }
      });
    });

    // Validate todo primary day assignments
    const todoAssignments = new Map();
    
    // Track primary assignments
    recommendations.forEach((dayRecs, dayIndex) => {
      dayRecs.forEach(rec => {
        if (rec.isPrimaryDay && rec.source === 'todo') {
          if (todoAssignments.has(rec.activity.id)) {
            console.warn(`Todo ${rec.activity.id} has multiple primary days, fixing...`);
            rec.isPrimaryDay = false; // Make this one secondary
          } else {
            todoAssignments.set(rec.activity.id, dayIndex);
          }
        }
      });
    });

    // Ensure unassigned todos get primary days
    const unassignedTodos = incompleteTodos.filter(todo => !todoAssignments.has(todo.id));
    unassignedTodos.forEach((todo, index) => {
      const targetDay = index % 7;
      
      // Check if todo already exists on this day
      const existingRec = recommendations[targetDay].find(rec => rec.activity.id === todo.id);
      if (existingRec) {
        existingRec.isPrimaryDay = true;
      } else {
        // Add new recommendation
        recommendations[targetDay].push({
          activity: {
            id: todo.id,
            name: todo.text,
            type: todo.type,
            weatherPreferences: {}
          },
          suitabilityScore: 70,
          reason: 'Primary day for completing this task',
          source: 'todo',
          timeSlot: 'Evening (18:00-20:00)',
          isPrimaryDay: true
        });
      }
      
      todoAssignments.set(todo.id, targetDay);
    });

    // CRITICAL: Ensure every day has at least one primary activity
    recommendations.forEach((dayRecs, dayIndex) => {
      const hasPrimary = dayRecs.some(rec => rec.isPrimaryDay);
      
      if (!hasPrimary) {
        console.warn(`Day ${dayIndex} has no primary activities, fixing...`);
        
        // Try to make an existing activity primary
        if (dayRecs.length > 0) {
          // Find the highest scoring activity to make primary
          const bestActivity = dayRecs.reduce((best, current) => 
            current.suitabilityScore > best.suitabilityScore ? current : best
          );
          bestActivity.isPrimaryDay = true;
          console.log(`Made ${bestActivity.activity.name} primary on day ${dayIndex}`);
        } else {
          // No activities at all - add a default activity if we have any
          if (activities.length > 0) {
            const defaultActivity = activities[dayIndex % activities.length];
            dayRecs.push({
              activity: defaultActivity,
              suitabilityScore: 60,
              reason: 'Default activity to ensure day has primary recommendation',
              source: 'user',
              timeSlot: 'Evening (18:00-20:00)',
              isPrimaryDay: true
            });
            console.log(`Added default primary activity ${defaultActivity.name} on day ${dayIndex}`);
          }
        }
      }
    });

    const summary = parsedResponse.summary || 'Weekly schedule optimized for weather conditions and available time slots.';

    console.log('Successfully processed Mistral recommendations for', recommendations.length, 'days');
    console.log('Todo primary day assignments:', Array.from(todoAssignments.entries()));
    
    // Final validation - ensure every day has at least one primary
    const daysWithoutPrimary = recommendations.map((dayRecs, index) => ({
      day: index,
      hasPrimary: dayRecs.some(rec => rec.isPrimaryDay)
    })).filter(day => !day.hasPrimary);
    
    if (daysWithoutPrimary.length > 0) {
      console.error('Days without primary activities:', daysWithoutPrimary);
    } else {
      console.log('✓ All days have at least one primary activity');
    }
    
    return {
      summary,
      recommendations: recommendations.slice(0, 7)
    };

  } catch (error) {
    console.error('Error in generateWeeklyRecommendationsWithSummary:', error);
    throw new Error('AI recommendations are currently unavailable. Please try again later.');
  }
}