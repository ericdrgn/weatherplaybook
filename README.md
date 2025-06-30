# Weather Playbook 🌤️

A smart weather-based weekly activity planner that uses AI to recommend the perfect activities based on 7-day weather forecasts, your personal schedule, and preferences.

![Weather Playbook](https://img.shields.io/badge/Built%20with-Bolt.new-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🎯 Project Overview

Weather Playbook was created for the Bolt.new hackathon as a demonstration of rapid full-stack development. The entire application was "vibe coded" - built through natural language prompts without traditional coding, showcasing the power of AI-assisted development.

### ✨ Key Features

- **🌦️ 7-Day Weather Forecasts** - Real-time weather data with detailed daily breakdowns
- **🤖 AI-Powered Recommendations** - Smart activity suggestions based on weather, schedule, and preferences
- **📅 Smart Scheduling** - Respects work hours, sleep schedule, and personal availability
- **✅ Intelligent To-Do Planning** - Automatically schedules tasks on optimal days
- **🎨 Beautiful UI/UX** - Modern, responsive design with dark/light theme support
- **📱 Mobile-First Design** - Optimized for all screen sizes
- **⚡ Real-Time Updates** - Fresh weather data and recommendations on demand

## 🏗️ Architecture

### Frontend Stack
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript** - Full type safety throughout the application
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Vite** - Lightning-fast build tool and dev server
- **Lucide React** - Beautiful, customizable icons

### Backend & AI
- **Supabase Edge Functions** - Serverless functions for AI processing
- **Mistral AI** - Large language model for intelligent recommendations
- **Open-Meteo API** - Free, accurate weather data
- **Geolocation API** - Automatic location detection

### Data Management
- **Local Storage** - Client-side persistence for user preferences
- **Custom Hooks** - Reusable state management logic
- **Type-Safe APIs** - Full TypeScript integration

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for AI features)
- Mistral AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/weather-playbook.git
   cd weather-playbook
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy Supabase Edge Function**
   The AI recommendations function is located in `supabase/functions/ai-recommendations/`
   
   Set the Mistral AI API key in your Supabase dashboard:
   ```bash
   # In Supabase dashboard, add environment variable:
   MISTRAL_API_KEY=your_mistral_api_key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
weather-playbook/
├── public/
│   └── bolt-icon.png          # Bolt.new badge icon
├── src/
│   ├── components/            # React components
│   │   ├── WeatherApp.tsx     # Main application component
│   │   ├── WeatherDay.tsx     # Individual day view
│   │   ├── WeeklyOverview.tsx # Week summary view
│   │   ├── Settings.tsx       # User preferences
│   │   └── TodoDialog.tsx     # Task management
│   ├── hooks/                 # Custom React hooks
│   │   ├── useWeather.ts      # Weather data management
│   │   ├── useLocalStorage.ts # Persistent storage
│   │   └── useTheme.ts        # Theme management
│   ├── types/                 # TypeScript definitions
│   │   └── weather.ts         # Data models
│   ├── utils/                 # Utility functions
│   │   ├── weatherApi.ts      # Weather API integration
│   │   └── aiRecommendations.ts # AI service calls
│   ├── App.tsx               # Root component
│   ├── main.tsx              # Application entry point
│   └── index.css             # Global styles
├── supabase/
│   └── functions/
│       └── ai-recommendations/ # AI processing function
│           └── index.ts
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## 🎮 How to Use

### 1. **Initial Setup**
- Grant location permission for weather data
- Configure your work schedule in Settings
- Add your favorite activities with weather preferences
- Create to-do items that need completion

### 2. **Getting Recommendations**
- The AI analyzes weather patterns for the week
- Considers your work schedule and sleep times
- Matches activities to optimal weather conditions
- Schedules tasks on the best available days

### 3. **Managing Your Week**
- View the weekly overview for a quick summary
- Scroll through individual days for detailed plans
- Check off completed tasks
- Refresh for updated weather and recommendations

## 🧠 AI Intelligence

The AI recommendation system uses advanced prompt engineering to:

- **Weather Analysis** - Evaluates temperature, precipitation, wind, and conditions
- **Schedule Optimization** - Respects work hours, sleep schedule, and availability
- **Activity Matching** - Pairs activities with ideal weather conditions
- **Task Distribution** - Spreads to-dos across the week strategically
- **Flexibility Planning** - Provides primary and alternative options

### AI Prompt Strategy
The system uses a sophisticated prompt that includes:
- Detailed weather forecasts with specific conditions
- User activity preferences and weather requirements
- Complete work and sleep schedule information
- Pending tasks that need completion
- Time slot availability and constraints

## 🎨 Design Philosophy

### Visual Design
- **Apple-level aesthetics** - Clean, sophisticated, and intuitive
- **Glassmorphism effects** - Modern backdrop blur and transparency
- **Smooth animations** - Micro-interactions and hover states
- **Responsive layout** - Mobile-first with desktop enhancements

### User Experience
- **Progressive disclosure** - Information revealed contextually
- **Single responsibility** - Each view has a clear purpose
- **Consistent spacing** - 8px grid system throughout
- **Accessible design** - Proper contrast and keyboard navigation

## 🔧 Technical Features

### Performance Optimizations
- **Smart caching** - Weather data and AI recommendations cached locally
- **Lazy loading** - Components loaded on demand
- **Optimized re-renders** - Minimal React updates
- **Efficient scrolling** - Smooth day navigation

### Data Management
- **Type safety** - Full TypeScript coverage
- **Error handling** - Graceful fallbacks for API failures
- **Offline support** - Cached data available without internet
- **Data validation** - Input sanitization and validation

### API Integration
- **Rate limiting** - Respectful API usage with queuing
- **Error recovery** - Automatic retries and fallbacks
- **Real-time updates** - Fresh data on user request
- **Geolocation** - Automatic location detection

## 🌟 Unique Features

### Smart Scheduling
- **Multi-day planning** - Tasks can appear on multiple days with one primary day
- **Time slot optimization** - Activities scheduled in available time windows
- **Weather-aware planning** - Outdoor activities matched to good weather
- **Conflict avoidance** - No scheduling during work or sleep hours

### Intelligent Recommendations
- **Primary vs. Alternative** - Clear distinction between main and backup plans
- **Suitability scoring** - Numerical ranking of activity-weather matches
- **Contextual reasoning** - Explanations for each recommendation
- **Weekly strategy** - Coherent plan across all seven days

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
The project is optimized for Netlify deployment with:
- Automatic builds from Git
- Environment variable support
- Edge function compatibility

### Environment Variables
Required for full functionality:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `MISTRAL_API_KEY` - Mistral AI API key (set in Supabase)

## 🤝 Contributing

This project was built for the Bolt.new hackathon to demonstrate AI-assisted development. While it's primarily a showcase, contributions are welcome!

### Development Guidelines
- Follow the existing TypeScript patterns
- Maintain the component structure
- Add proper error handling
- Include responsive design considerations

## 📄 License

MIT License - feel free to use this project as inspiration for your own weather-based applications!

## 🙏 Acknowledgments

- **Bolt.new** - For the amazing AI-powered development platform
- **Open-Meteo** - For free, accurate weather data
- **Mistral AI** - For intelligent recommendation generation
- **Supabase** - For serverless backend infrastructure
- **The React Team** - For the incredible framework

## 🔗 Links

- [Live Demo](https://weatherplaybook.netlify.app)
- [Bolt.new Platform](https://bolt.new)
- [Open-Meteo API](https://open-meteo.com)
- [Mistral AI](https://mistral.ai)

---

**Built with ❤️ using Bolt.new for the hackathon**

*This project demonstrates the power of AI-assisted development - the entire application was created through natural language prompts, showcasing how modern AI tools can accelerate the development process while maintaining high code quality and user experience standards.*
