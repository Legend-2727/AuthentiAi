import React from 'react';

export const EnvDebug: React.FC = () => {
  const envVars = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '[REDACTED]' : 'undefined',
    VITE_REVENUECAT_API_KEY: import.meta.env.VITE_REVENUECAT_API_KEY ? '[REDACTED]' : 'undefined',
    VITE_ELEVENLABS_API_KEY: import.meta.env.VITE_ELEVENLABS_API_KEY ? '[REDACTED]' : 'undefined',
    VITE_TAVUS_API_KEY: import.meta.env.VITE_TAVUS_API_KEY ? '[REDACTED]' : 'undefined',
    VITE_ALGORAND_NETWORK: import.meta.env.VITE_ALGORAND_NETWORK,
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    DEV: import.meta.env.DEV,
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Environment Variables Debug</h1>
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <pre className="text-sm overflow-x-auto">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </div>
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>This page shows the current environment variables available to the application.</p>
        <p>API keys are redacted for security but show whether they are defined or undefined.</p>
      </div>
    </div>
  );
};
