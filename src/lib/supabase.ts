import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// These would typically come from environment variables
const supabaseUrl = 'https://your-supabase-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);