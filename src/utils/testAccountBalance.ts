import { algorandService } from '../lib/algorand';

export async function testAccountBalance() {
  try {
    console.log('🔍 Testing Algorand account balance...');
    
    const backendAccount = algorandService.getBackendAccount();
    
    console.log('Backend account address:', backendAccount.addr.toString());
    
    // Get account information
    const accountInfo = await algorandService.algodClient.accountInformation(backendAccount.addr).do();
    
    console.log('Account balance:', accountInfo.amount, 'microALGO');
    console.log('Account balance:', accountInfo.amount / 1_000_000, 'ALGO');
    console.log('Account status:', accountInfo.status);
    
    if (accountInfo.amount > 1000) {
      console.log('✅ Account has sufficient funds for transactions!');
      return true;
    } else {
      console.log('❌ Account needs more funds');
      return false;
    }
  } catch (error) {
    console.error('Error checking account balance:', error);
    return false;
  }
}

// Test function to verify a simple transaction
export async function testSimpleTransaction() {
  try {
    console.log('🧪 Testing simple Algorand transaction...');
    
    // Create a test proof
    const testProof = {
      hash: 'test_hash_' + Date.now(),
      filename: 'test_file.txt',
      userId: 'test_user',
      contentType: 'test',
      fileSize: 100
    };
    
    const result = await algorandService.registerProof(testProof);
    
    if (result.success) {
      console.log('✅ Test transaction successful!');
      console.log('Transaction ID:', result.transactionId);
      return true;
    } else {
      console.log('❌ Test transaction failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error in test transaction:', error);
    return false;
  }
}
