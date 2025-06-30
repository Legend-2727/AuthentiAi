import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { getAppConfig, validateEnvironment } from './environment';

// Validate environment and get configuration
const envValidation = validateEnvironment();
const config = getAppConfig();

if (!envValidation.isValid) {
  console.error('❌ Environment validation failed:', envValidation.errors);
}

// Create client with validated configuration
export const supabase = createClient<Database>(
  config.supabase!.url, 
  config.supabase!.anonKey,
  {
    auth: {
      persistSession: true, // Enable persistent sessions
      autoRefreshToken: true, // Enable automatic token refresh
      detectSessionInUrl: true, // Look for auth tokens in URL
      storage: localStorage // Use localStorage for session storage
    }
  }
);