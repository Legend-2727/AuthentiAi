# Supabase Connection Error Fix

## Problem
The application is showing "Failed to fetch" errors during login and signup because the Supabase environment variables in `.env` are set to placeholder values.

## Current .env file has:
```
VITE_SUPABASE_URL=https://your-actual-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

## Solution Steps:

### 1. Get Your Supabase Credentials
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account (or create one if you don't have it)
3. Either:
   - Select your existing project if you had one working before
   - Create a new project if needed

### 2. Find Your Project Settings
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Project API Keys** → **anon public** key (long string starting with `eyJ...`)

### 3. Update Your .env File
Replace the placeholder values in your `.env` file with your actual credentials:

```env
VITE_SUPABASE_URL=https://your-actual-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
VITE_ELEVENLABS_API_KEY=sk_eae44fd98723afddbe8923b4181550045e18db92e9dfd260
```

**Important:** 
- Replace `https://your-actual-project-ref.supabase.co` with your actual Project URL
- Replace `your-actual-anon-key-here` with your actual anon public key
- Keep the ElevenLabs API key as is

### 4. Restart Development Server
After updating the `.env` file:
1. Stop your development server (Ctrl+C)
2. Start it again with `npm run dev`

### 5. Verify Database Setup
Make sure your Supabase project has the required tables. If you're starting fresh, you may need to run the database migrations that are in the `supabase/migrations/` folder.

## If You Had Working Credentials Before
If this was working before and suddenly stopped:
1. Check if your Supabase project is still active
2. Verify the credentials haven't changed
3. Make sure you didn't accidentally modify the `.env` file

## Need Help?
If you're still having issues:
1. Double-check that your Supabase project URL and anon key are correct
2. Ensure there are no extra spaces or quotes around the values in `.env`
3. Verify your Supabase project is active and not paused