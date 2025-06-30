# Content Ownership Verification - Testing Guide

## Overview
AuthentiAI now includes blockchain-based content ownership verification that prevents unauthorized uploads of protected content.

## How It Works

### 1. Content Registration
- When you upload content, the system calculates a SHA-256 hash of the file
- This hash is registered on the Algorand blockchain with your user ID
- The registration creates an immutable proof of ownership

### 2. Ownership Verification
- Before allowing any upload, the system checks if the content already exists
- If it exists, it verifies if you're the original owner
- Only the original owner can upload protected content

### 3. Anti-Piracy Protection
- Prevents users from uploading content that belongs to others
- Shows the original owner's information when conflicts occur
- Provides blockchain explorer links for transparency

## Testing the Feature

### Access the Demo
1. Navigate to your dashboard
2. Click on "Ownership Demo" in the sidebar (🛡️ shield icon)
3. This opens a dedicated testing page

### Test Scenarios

#### Scenario 1: New Content Upload ✅
1. Upload any file you haven't uploaded before
2. **Expected Result**: File is successfully registered on blockchain
3. You'll see: "Successfully registered on blockchain!" 
4. A transaction ID and hash will be displayed

#### Scenario 2: Re-uploading Your Own Content ✅
1. Upload the exact same file again
2. **Expected Result**: System recognizes you as the owner
3. You'll see: "Content already registered by you!"
4. Shows original registration date and blockchain proof

#### Scenario 3: Simulating Piracy Attempt 🚫
To test this properly, you would need:
1. Another user account to upload content first
2. Then try uploading the same content from your account
3. **Expected Result**: Upload blocked with ownership conflict message
4. Shows original owner's username and registration details

### Real-World Usage

#### Video Creation
- Go to "Create Video" → "Upload Video"
- The upload component now includes ownership checking
- Any uploaded video is automatically protected

#### Audio Posts
- Similar protection applies to audio content uploads
- Blockchain registration happens automatically

#### Manual Testing
- Use the "Ownership Demo" page to test with any file type
- Supports images, videos, audio, documents, etc.

## Technical Details

### Blockchain Integration
- **Network**: Algorand Testnet (via Nodely)
- **Storage**: Zero-cost transactions with proof in note field
- **Hash Algorithm**: SHA-256
- **Explorer**: Links to Algorand Explorer for verification

### Database Storage
- Ownership records stored in `proofs` table
- Links to user accounts for ownership verification
- Includes metadata like file size, type, etc.

### Security Features
- Immutable blockchain registration
- Tamper-proof ownership verification
- Transparent blockchain explorer links
- Real-time ownership checking

## Error Handling

### Ownership Conflicts
- Clear error messages showing original owner
- "Try Different File" button to start over
- Blockchain explorer links for verification

### Network Issues
- Graceful fallback if blockchain is unavailable
- Content still uploads but without blockchain protection
- Warning messages for users

## UI Indicators

### Verification Badges
- Green shield: Content verified and protected
- Red shield: Ownership conflict detected
- Loading states during verification

### Status Messages
- "Checking content ownership..."
- "Content already owned by @username"
- "Successfully registered on blockchain!"

## Future Enhancements

### Planned Features
- IPFS integration for metadata storage
- Advanced ownership transfer mechanisms
- Bulk ownership verification
- Enhanced admin tools

### Monitoring
- Track ownership verification success rates
- Monitor blockchain registration metrics
- User feedback on protection effectiveness

## Troubleshooting

### Common Issues
- **Slow verification**: Blockchain operations may take a few seconds
- **Network errors**: Check internet connection and try again
- **File too large**: Current limit is 100MB per file

### Support
- All ownership data is stored permanently on blockchain
- Transaction IDs provide permanent proof of registration
- Contact support with transaction ID for any disputes
