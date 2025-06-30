import React from 'react';
import { createRoot } from 'react-dom/client';

// Simple test component
const TestApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#e0e0e0', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🎉 React is Working!
      </h1>
      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
        <h2>Environment Variables:</h2>
        <ul>
          <li>Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'NOT SET'}</li>
          <li>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET (hidden)' : 'NOT SET'}</li>
          <li>Tavus Key: {import.meta.env.VITE_TAVUS_API_KEY ? 'SET (hidden)' : 'NOT SET'}</li>
          <li>ElevenLabs Key: {import.meta.env.VITE_ELEVENLABS_API_KEY ? 'SET (hidden)' : 'NOT SET'}</li>
        </ul>
      </div>
      <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '5px' }}>
        <h3>Next Steps:</h3>
        <p>If you see this page, React is working. The blank screen issue was likely caused by:</p>
        <ul>
          <li>Component import/export errors</li>
          <li>Context provider issues</li>
          <li>Routing problems</li>
          <li>Missing dependencies</li>
        </ul>
      </div>
    </div>
  );
};

// Render the test app
const root = createRoot(document.getElementById('root')!);
root.render(<TestApp />);
