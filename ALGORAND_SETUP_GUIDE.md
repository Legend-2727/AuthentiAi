# Algorand Blockchain Setup Guide

## Overview
AuthentiAI uses Algorand blockchain for content ownership verification. Each uploaded file gets a unique hash registered on-chain to prove ownership and authenticity.

## Current Error
**"Failed to register proof on blockchain"** - This happens because the Algorand backend mnemonic is not properly configured.

## Setup Steps

### 1. Generate Algorand Testnet Account

**Option A: Using AlgoDesk (Recommended)**
1. Go to [AlgoDesk Wallet](https://algodesktool.web.app/wallet)
2. Click "Create New Wallet"
3. **IMPORTANT**: Save the 25-word mnemonic phrase securely
4. Note the wallet address

**Option B: Using Algorand Testnet Bank**
1. Go to [Algorand Testnet Bank](https://bank.testnet.algorand.network/)
2. Click "Create Account"
3. Save the mnemonic phrase and wallet address

### 2. Fund Your Testnet Account
1. Copy your wallet address from step 1
2. Go to [Algorand Testnet Dispenser](https://bank.testnet.algorand.network/)
3. Paste your address and request testnet ALGOs
4. Wait for confirmation (usually instant)

### 3. Configure Environment Variables

Update your `.env` file:

```properties
# Algorand Configuration
VITE_ALGORAND_BACKEND_MNEMONIC=your 25 word mnemonic phrase goes here
```

**Example (DO NOT USE IN PRODUCTION):**
```properties
VITE_ALGORAND_BACKEND_MNEMONIC=abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
```

### 4. Security Notes

⚠️ **IMPORTANT SECURITY CONSIDERATIONS:**

- **Never commit real mnemonics to version control**
- **Use environment variables for all sensitive data**
- **For production, use proper key management services**
- **The example mnemonic above is for testing only**

### 5. Verification

After setup, the app will:
- ✅ Show "Algorand Service initialized" in console
- ✅ Display the wallet address
- ✅ Enable blockchain proof registration
- ✅ Allow successful file uploads with ownership verification

## Troubleshooting

### "Failed to decode mnemonic"
- Check that your mnemonic has exactly 25 words
- Ensure no extra spaces or special characters
- Verify the mnemonic is valid Algorand format

### "Backend account not initialized"
- Make sure `VITE_ALGORAND_BACKEND_MNEMONIC` is set in `.env`
- Restart the development server after changing `.env`
- Check browser console for detailed error messages

### "Insufficient funds"
- Your testnet account needs ALGOs for transactions
- Visit the testnet dispenser to get free testnet ALGOs
- Minimum ~1 ALGO recommended for testing

## Configuration Files

The Algorand service is configured in:
- `src/lib/algorand.ts` - Main service implementation
- `.env` - Environment variables
- `src/hooks/useBlockchainProof.ts` - React integration

## Network Details

**Current Configuration:**
- **Network**: Algorand Testnet
- **API**: Nodely endpoints (free tier)
- **Explorer**: AlgoExplorer Testnet
- **Indexer**: Enabled for transaction queries

## Next Steps

1. Set up your mnemonic in `.env`
2. Restart the development server
3. Test file upload on the Ownership Demo page
4. Verify transactions on [AlgoExplorer](https://testnet.algoexplorer.io)

## Support

If you need help:
1. Check the browser console for detailed error messages
2. Verify your mnemonic is exactly 25 words
3. Ensure your testnet account has sufficient ALGOs
4. Review the implementation in `src/lib/algorand.ts`
