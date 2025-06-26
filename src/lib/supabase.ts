import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'your_supabase_url_here' || supabaseAnonKey === 'your_supabase_anon_key_here') {
  throw new Error('Please configure your Supabase credentials in the .env file. You need to replace the placeholder values with your actual Supabase project URL and anonymous key.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);