import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create client even with missing credentials to prevent app crash
// The app will show appropriate error messages for missing functionality
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true, // Enable persistent sessions
      autoRefreshToken: true, // Enable automatic token refresh
      detectSessionInUrl: true, // Look for auth tokens in URL
      storage: localStorage // Use localStorage for session storage
    }
  }
);