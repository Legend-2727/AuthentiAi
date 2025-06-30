import algosdk from 'algosdk';

// Your mnemonic from .env file
const mnemonic = 'social scrub month double letter rotate possible analyst spread pear lady suggest act humor joke wheel what globe across sentence knee trim system abstract warfare';

try {
  // Generate account from mnemonic
  const account = algosdk.mnemonicToSecretKey(mnemonic);
  
  // Get the address string by encoding the public key
  const address = algosdk.encodeAddress(account.addr.publicKey);
  
  console.log('📍 Algorand Account Information:');
  console.log('Address:', address);
  console.log('');
  console.log('🔗 Explorer Links:');
  console.log('Testnet Explorer:', 'https://testnet.algoexplorer.io/address/' + address);
  console.log('Mainnet Explorer:', 'https://algoexplorer.io/address/' + address);
  console.log('');
  console.log('📝 For Challenge Submission:');
  console.log('Algorand Block Explorer Link: https://testnet.algoexplorer.io/address/' + address);
  
  // Also show some additional info
  console.log('');
  console.log('📊 Additional Information:');
  console.log('Public Key (Base64):', Buffer.from(account.addr.publicKey).toString('base64'));
  console.log('Address Length:', address.length);
  
} catch (error) {
  console.error('Error generating address:', error.message);
  console.error('Full error:', error);
}
