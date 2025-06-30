// Simple test to verify Algorand blockchain integration
import { algorandService } from '../lib/algorand';

export const testBlockchainIntegration = async () => {
  console.log('🧪 Testing Blockchain Integration...');
  
  try {
    // Test 1: Connection to Algorand network
    console.log('📡 Testing connection to Algorand...');
    const connectionResult = await algorandService.testConnection();
    console.log('Connection result:', connectionResult);
    
    if (!connectionResult.connected) {
      throw new Error(`Connection failed: ${connectionResult.error}`);
    }
    console.log('✅ Successfully connected to Algorand testnet');
    
    // Test 2: Check wallet status
    console.log('💰 Checking wallet status...');
    const walletStatus = await algorandService.getWalletStatus();
    console.log('Wallet status:', walletStatus);
    
    if (walletStatus.error) {
      console.warn('⚠️ Wallet status check failed:', walletStatus.error);
    } else {
      console.log(`✅ Wallet address: ${walletStatus.address}`);
      console.log(`✅ Wallet balance: ${walletStatus.balance} ALGOs`);
    }
    
    // Test 3: Register a test proof
    console.log('📝 Testing proof registration...');
    
    // Create a test file (small text file)
    const testContent = 'AuthentiAI Test Content - ' + new Date().toISOString();
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test-content.txt', { type: 'text/plain' });
    
    const testProof = {
      hash: await algorandService.calculateFileHash(testFile),
      filename: testFile.name,
      userId: 'test-user-id',
      contentType: 'test',
      fileSize: testFile.size
    };
    
    console.log('Test proof data:', testProof);
    
    const proofResult = await algorandService.registerProof(testProof);
    console.log('Proof registration result:', proofResult);
    
    if (proofResult.success && proofResult.txnId) {
      console.log('✅ Successfully registered test proof on blockchain');
      console.log(`✅ Transaction ID: ${proofResult.txnId}`);
      console.log(`✅ Explorer URL: ${proofResult.explorerUrl}`);
      
      // Test 4: Verify the proof
      console.log('🔍 Testing proof verification...');
      
      // Wait a moment for transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const verificationResult = await algorandService.verifyProof(proofResult.txnId);
      console.log('Verification result:', verificationResult);
      
      if (verificationResult.verified) {
        console.log('✅ Successfully verified proof on blockchain');
        console.log('Verified data:', verificationResult.data);
      } else {
        console.warn('⚠️ Proof verification failed:', verificationResult.error);
      }
      
    } else {
      console.error('❌ Proof registration failed:', proofResult.error);
    }
    
    console.log('🎉 Blockchain integration test completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Blockchain integration test failed:', error);
    return false;
  }
};

// Export for use in development console
(window as Window & { testBlockchain?: typeof testBlockchainIntegration }).testBlockchain = testBlockchainIntegration;
