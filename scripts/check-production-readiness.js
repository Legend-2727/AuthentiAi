#!/usr/bin/env node

/**
 * Production Readiness Checker for AuthentiAI
 * 
 * This script checks if the application is ready for production deployment
 * by verifying that required services are properly configured.
 */

/**
 * Production Readiness Checker for Veridica
 */

console.log('🔍 Checking Veridica Production Readiness...\n');

// Check critical environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY', 
  'VITE_ALGORAND_MNEMONIC'
];

let isReady = true;

console.log('📋 Environment Variables:');
for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`  ✅ ${envVar}`);
  } else {
    console.log(`  ❌ ${envVar} - MISSING`);
    isReady = false;
  }
}

console.log('\n⚠️  CRITICAL PRODUCTION REQUIREMENT:');
console.log('�️  Supabase Pro/Team plan required for production deployment');
console.log('� Cost: $25/month for Pro plan');  
console.log('🚨 localStorage fallback will be DISABLED in production build');

console.log('\n' + '='.repeat(60));
if (isReady) {
  console.log('⚡ Environment variables configured');
  console.log('📖 Next: Verify Supabase Pro is enabled before deployment');
  console.log('🎯 See PRODUCTION_DEPLOYMENT_GUIDE.md for complete checklist');
} else {
  console.log('❌ Environment configuration incomplete');
  console.log('🔧 Fix missing environment variables before deployment');
}
console.log('='.repeat(60));
