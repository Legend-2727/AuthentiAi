/**
 * Environment Variables Helper
 * Provides debugging and validation for environment variables
 */

export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  revenuecat: {
    apiKey: string;
  };
  elevenlabs: {
    apiKey: string;
  };
  tavus: {
    apiKey: string;
  };
  algorand: {
    mnemonic: string;
    network: 'mainnet' | 'testnet' | 'betanet' | 'localnet';
  };
}

export function getEnvVar(key: string, required: boolean = true): string | undefined {
  const value = import.meta.env[key];
  
  if (required && !value) {
    console.error(`❌ Missing required environment variable: ${key}`);
    return undefined;
  }
  
  return value;
}

export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required environment variables
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];
  
  // Optional environment variables (will show warnings if missing)
  const optionalVars = [
    'VITE_REVENUECAT_PUBLIC_KEY',
    'VITE_ELEVENLABS_API_KEY',
    'VITE_TAVUS_API_KEY',
    'VITE_ALGORAND_BACKEND_MNEMONIC',
    'VITE_ALGORAND_API_TOKEN',
  ];
  
  console.log('🔍 Environment Variables Check:');
  
  // Check required variables
  for (const varName of requiredVars) {
    const value = import.meta.env[varName];
    if (!value) {
      errors.push(`Missing required variable: ${varName}`);
      console.log(`  ❌ ${varName}: MISSING`);
    } else {
      console.log(`  ✅ ${varName}: SET`);
    }
  }
  
  // Check optional variables
  for (const varName of optionalVars) {
    const value = import.meta.env[varName];
    if (!value) {
      console.log(`  ⚠️  ${varName}: MISSING (optional)`);
    } else {
      console.log(`  ✅ ${varName}: SET`);
    }
  }
  
  console.log(`\n📊 Environment Summary:`);
  console.log(`  Mode: ${import.meta.env.MODE}`);
  console.log(`  Production: ${import.meta.env.PROD}`);
  console.log(`  Development: ${import.meta.env.DEV}`);
  console.log(`  Available VITE_ vars: ${Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')).length}`);
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getAppConfig(): Partial<AppConfig> {
  const validation = validateEnvironment();
  
  if (!validation.isValid) {
    console.warn('⚠️ Some environment variables are missing. App may not function correctly.');
  }
  
  return {
    supabase: {
      url: getEnvVar('VITE_SUPABASE_URL') || 'https://placeholder.supabase.co',
      anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY') || 'placeholder-key',
    },
    revenuecat: {
      apiKey: getEnvVar('VITE_REVENUECAT_PUBLIC_KEY', false) || '',
    },
    elevenlabs: {
      apiKey: getEnvVar('VITE_ELEVENLABS_API_KEY', false) || '',
    },
    tavus: {
      apiKey: getEnvVar('VITE_TAVUS_API_KEY', false) || '',
    },
    algorand: {
      mnemonic: getEnvVar('VITE_ALGORAND_BACKEND_MNEMONIC', false) || '',
      network: (getEnvVar('VITE_ALGORAND_NETWORK', false) as 'mainnet' | 'testnet' | 'betanet' | 'localnet') || 'testnet',
    },
  };
}
