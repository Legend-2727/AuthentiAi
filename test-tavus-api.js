// Test Tavus API connectivity
// This is a standalone test script to check if Tavus API is working

const TAVUS_API_BASE = 'https://tavusapi.com/v2';
const apiKey = 'your_api_key_here'; // Replace with actual key

async function testTavusAPI() {
  console.log('Testing Tavus API connectivity...');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT SET');
  
  try {
    // Test simple endpoint
    const response = await fetch(`${TAVUS_API_BASE}/replicas?limit=1`, {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('API Response:', data);
    
    if (data && (data.data || data.replicas)) {
      console.log('✅ Tavus API is working!');
    } else {
      console.log('⚠️ Tavus API returned unexpected format');
    }
    
  } catch (error) {
    console.error('❌ Tavus API test failed:', error);
  }
}

// Uncomment and add your API key to test
// testTavusAPI();
