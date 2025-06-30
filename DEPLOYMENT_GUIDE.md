# Netlify Deployment Guide

## Environment Variables Setup

Your Netlify deployment is missing the required environment variables. Follow these steps:

### 1. Access Netlify Dashboard
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Find your deployed site
3. Click on "Site settings"
4. Navigate to "Environment variables" in the left sidebar

### 2. Add Required Variables
Add these environment variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Get Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key

### 4. Set Up Supabase Edge Function
1. In your Supabase dashboard, go to Edge Functions
2. Deploy the function from `supabase/functions/ai-recommendations/`
3. Set the environment variable in Supabase:
   - Go to Settings → Environment Variables
   - Add: `MISTRAL_API_KEY=your_mistral_api_key`

### 5. Get Mistral AI API Key
1. Go to [Mistral AI](https://console.mistral.ai)
2. Create an account and get an API key
3. Add it to your Supabase environment variables

### 6. Redeploy
After adding the environment variables:
1. Go back to your Netlify site dashboard
2. Click "Deploys" tab
3. Click "Trigger deploy" → "Deploy site"

## Alternative: Local Development Only

If you want to run the app without AI features:
1. The app will work for weather forecasts
2. AI recommendations will show as unavailable
3. You can still add activities and todos manually

## Troubleshooting

### Common Issues:
1. **Environment variables not taking effect**: Redeploy after adding them
2. **Supabase function not working**: Check function logs in Supabase dashboard
3. **Mistral API errors**: Verify your API key has sufficient credits

### Testing Environment Variables:
You can test if variables are set by checking the browser console - the app will log what's available.