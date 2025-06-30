#!/usr/bin/env node

/**
 * Netlify Build Environment Checker
 * Verifies that all required environment variables are available during build
 */

console.log('🌐 Netlify Build Environment Check\n');

// Check if we're in Netlify build environment
const isNetlify = process.env.NETLIFY === 'true';
const buildContext = process.env.CONTEXT || 'unknown';
const deployUrl = process.env.DEPLOY_URL || 'unknown';

console.log('📍 Build Environment:');
console.log(`  Platform: ${isNetlify ? 'Netlify' : 'Local'}`);
console.log(`  Context: ${buildContext}`);
console.log(`  Deploy URL: ${deployUrl}`);
console.log(`  Node Version: ${process.version}`);
console.log('');

// Required environment variables for the application
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

// Optional but recommended variables
const optionalVars = [
  'VITE_REVENUECAT_API_KEY',
  'VITE_ELEVENLABS_API_KEY',
  'VITE_TAVUS_API_KEY',
  'VITE_ALGORAND_MNEMONIC',
  'VITE_ALGORAND_NETWORK'
];

let hasErrors = false;

console.log('🔍 Required Environment Variables:');
for (const varName of requiredVars) {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: SET`);
  } else {
    console.log(`  ❌ ${varName}: MISSING`);
    hasErrors = true;
  }
}

console.log('\n📋 Optional Environment Variables:');
for (const varName of optionalVars) {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: SET`);
  } else {
    console.log(`  ⚠️  ${varName}: MISSING (optional)`);
  }
}

// Show all VITE_ environment variables for debugging
const viteVars = Object.keys(process.env).filter(key => key.startsWith('VITE_'));
console.log(`\n🔧 All VITE_ Variables (${viteVars.length}):`);
viteVars.forEach(varName => {
  const value = process.env[varName];
  console.log(`  ${value ? '✅' : '❌'} ${varName}`);
});

console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('❌ BUILD WILL FAIL - Missing required environment variables');
  console.log('');
  console.log('🔧 To fix this:');
  console.log('1. Go to your Netlify dashboard');
  console.log('2. Navigate to Site settings > Environment variables');
  console.log('3. Add the missing VITE_ variables');
  console.log('4. Redeploy your site');
  console.log('');
  console.log('📖 See REVENUECAT_INTEGRATION_COMPLETE.md for complete setup guide');
  
  if (isNetlify) {
    process.exit(1); // Fail the build on Netlify
  }
} else {
  console.log('✅ All required environment variables are configured');
  console.log('🚀 Build can proceed');
}

console.log('='.repeat(60));
