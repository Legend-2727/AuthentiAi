// Utility to generate a valid Algorand mnemonic
// Run this with: node generate-mnemonic.js

import algosdk from 'algosdk';

try {
  // Generate a new account
  const account = algosdk.generateAccount();
  const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
  
  console.log('Generated Algorand Account:');
  console.log('Address:', account.addr);
  console.log('Mnemonic:', mnemonic);
  console.log('\nAdd this mnemonic to your .env file:');
  console.log(`VITE_ALGORAND_BACKEND_MNEMONIC=${mnemonic}`);
  
  // Verify the mnemonic works
  const recoveredAccount = algosdk.mnemonicToSecretKey(mnemonic);
  console.log('\nVerification successful! Address matches:', account.addr === recoveredAccount.addr);
  
} catch (error) {
  console.error('Error generating mnemonic:', error);
}
