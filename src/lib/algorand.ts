import algosdk from 'algosdk';

// Algorand configuration
const ALGORAND_CONFIG = {
  // Using Nodely testnet endpoints
  server: 'https://testnet-api.4160.nodely.io',
  indexer: 'https://testnet-idx.4160.nodely.io',
  port: 443,
  token: {
    'X-Algo-API-Token': import.meta.env.VITE_ALGORAND_API_TOKEN || '98D9CE80660AD243893D56D9F125CD2D'
  },
  // Explorer base URL for testnet
  explorerUrl: 'https://testnet.algoexplorer.io'
};

// Generate or use a fixed wallet for the backend service
// In production, this should be securely managed
// Backend wallet mnemonic from environment variables
const BACKEND_MNEMONIC = import.meta.env.VITE_ALGORAND_BACKEND_MNEMONIC || '';

export interface BlockchainProof {
  hash: string;
  filename: string;
  userId: string;
  contentType: string;
  fileSize: number;
}

export interface BlockchainResponse {
  success: boolean;
  txnId?: string;
  explorerUrl?: string;
  error?: string;
}

class AlgorandService {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;
  private backendAccount: algosdk.Account | null = null;
  private isInitialized = false;

  constructor() {
    // Initialize Algorand clients (these don't require mnemonic)
    this.algodClient = new algosdk.Algodv2(
      ALGORAND_CONFIG.token,
      ALGORAND_CONFIG.server,
      ALGORAND_CONFIG.port
    );

    this.indexerClient = new algosdk.Indexer(
      ALGORAND_CONFIG.token,
      ALGORAND_CONFIG.indexer,
      ALGORAND_CONFIG.port
    );

    // Don't initialize backend account here - do it lazily when needed
    console.log('Algorand clients initialized');
  }

  private async initializeBackendAccount(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log('Initializing Algorand backend account...');
      
      // Check if we have a valid mnemonic
      if (!BACKEND_MNEMONIC || BACKEND_MNEMONIC.trim().length === 0) {
        throw new Error('Backend mnemonic not configured. Please set VITE_ALGORAND_BACKEND_MNEMONIC in your environment variables.');
      }
      
      const words = BACKEND_MNEMONIC.trim().split(' ');
      if (words.length !== 25) {
        throw new Error(`Invalid mnemonic: expected 25 words, got ${words.length}. Please check VITE_ALGORAND_BACKEND_MNEMONIC.`);
      }
      
      this.backendAccount = algosdk.mnemonicToSecretKey(BACKEND_MNEMONIC);
      this.isInitialized = true;
      console.log('✅ Algorand Service initialized');
      console.log('Backend wallet address:', this.backendAccount.addr);
    } catch (error) {
      console.error('❌ Failed to initialize Algorand backend account:', error);
      console.warn('Blockchain features will be disabled');
      // Don't throw - let the app continue without blockchain features
    }
  }

  /**
   * Calculate SHA-256 hash of a file
   */
  async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  /**
   * Register content proof on Algorand blockchain
   */
  async registerProof(proof: BlockchainProof): Promise<BlockchainResponse> {
    try {
      console.log('Registering proof on Algorand:', proof);

      // Initialize backend account if needed
      await this.initializeBackendAccount();
      
      if (!this.backendAccount) {
        return {
          success: false,
          error: 'Backend account not initialized - blockchain features disabled'
        };
      }

      // Get network parameters
      const params = await this.algodClient.getTransactionParams().do();
      console.log('Network params:', params);

      // Create proof metadata
      const proofData = {
        hash: proof.hash,
        file: proof.filename,
        type: proof.contentType,
        size: proof.fileSize,
        user: proof.userId,
        timestamp: new Date().toISOString(),
        app: 'AuthentiAI'
      };

      // Convert proof data to note (max 1024 bytes)
      const noteText = JSON.stringify(proofData);
      const note = new TextEncoder().encode(noteText);
      
      if (note.length > 1024) {
        throw new Error('Proof data too large for blockchain note field');
      }

      console.log('Proof note:', noteText);
      console.log('Note size:', note.length, 'bytes');

      // Create zero-amount transaction with proof in note field
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: this.backendAccount.addr,
        receiver: this.backendAccount.addr, // Send to self (zero-cost proof)
        amount: 0, // Zero ALGOs
        note: note,
        suggestedParams: params,
      });

      // Sign transaction
      const signedTxn = txn.signTxn(this.backendAccount.sk);

      // Submit transaction
      console.log('Submitting transaction to Algorand...');
      const txnResponse = await this.algodClient.sendRawTransaction(signedTxn).do();
      
      console.log('Transaction submitted:', txnResponse);
      const txnId = txnResponse.txid;

      // Wait for confirmation
      console.log('Waiting for transaction confirmation...');
      const confirmedTxn = await algosdk.waitForConfirmation(this.algodClient, txnId, 4);
      
      console.log('Transaction confirmed:', confirmedTxn);

      // Generate explorer URL
      const explorerUrl = `${ALGORAND_CONFIG.explorerUrl}/tx/${txnId}`;

      return {
        success: true,
        txnId,
        explorerUrl
      };

    } catch (error) {
      console.error('Error registering proof on Algorand:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify a proof exists on the blockchain
   */
  async verifyProof(txnId: string): Promise<{ verified: boolean; data?: Record<string, unknown>; error?: string }> {
    try {
      console.log('Verifying proof transaction:', txnId);

      // Get transaction details from indexer
      const txnInfo = await this.indexerClient.lookupTransactionByID(txnId).do();
      
      if (!txnInfo.transaction) {
        return { verified: false, error: 'Transaction not found' };
      }

      const txn = txnInfo.transaction;
      
      // Decode note field
      if (txn.note) {
        const noteBuffer = new Uint8Array(txn.note);
        const noteText = new TextDecoder().decode(noteBuffer);
        
        try {
          const proofData = JSON.parse(noteText);
          return {
            verified: true,
            data: {
              ...proofData,
              transactionId: txnId,
              blockNumber: txn.confirmedRound,
              timestamp: new Date((txn.roundTime || 0) * 1000).toISOString()
            }
          };
        } catch {
          return { verified: false, error: 'Invalid proof data format' };
        }
      }

      return { verified: false, error: 'No proof data found in transaction' };

    } catch (error) {
      console.error('Error verifying proof:', error);
      return {
        verified: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get backend wallet status and balance
   */
  async getWalletStatus(): Promise<{ address: string; balance: number; error?: string }> {
    try {
      // Initialize backend account if needed
      await this.initializeBackendAccount();
      
      if (!this.backendAccount) {
        return {
          address: 'Not initialized',
          balance: 0,
          error: 'Backend account not initialized - blockchain features disabled'
        };
      }

      const accountInfo = await this.algodClient.accountInformation(this.backendAccount.addr).do();
      return {
        address: this.backendAccount.addr.toString(),
        balance: Number(accountInfo.amount) / 1000000 // Convert microAlgos to Algos
      };
    } catch (error) {
      console.error('Error getting wallet status:', error);
      return {
        address: this.backendAccount?.addr.toString() || 'Error',
        balance: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test connection to Algorand network
   */
  async testConnection(): Promise<{ connected: boolean; status?: Record<string, unknown>; error?: string }> {
    try {
      const status = await this.algodClient.status().do();
      return {
        connected: true,
        status: status as unknown as Record<string, unknown>
      };
    } catch (error) {
      console.error('Error testing Algorand connection:', error);
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const algorandService = new AlgorandService();
export default algorandService;
