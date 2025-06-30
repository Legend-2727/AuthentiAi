# PRIVATE - Veridica API Keys and Configuration
# DO NOT COMMIT THIS FILE TO REPOSITORY
# Share this file privately with developers who need to set up the project

## Your Working API Keys (for reference/sharing)

### Supabase Configuration
```
VITE_SUPABASE_URL=https://emgtsgvwiebgybvfhbnl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZ3RzZ3Z3aWViZ3lidmZoYm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDU3MTIsImV4cCI6MjA2NDcyMTcxMn0.GfvrWX_oTeDadSzMGyr3WPK1DiU9IYMOids0Yd4ZeCA
```

### RevenueCat Configuration
```
# Production Web Billing Key (for live transactions)
VITE_REVENUECAT_PUBLIC_KEY=rcb_nxFaEtdIxcXFtxLKnIAUHGfwVyOq

# Sandbox Web Billing Key (for testing)
# VITE_REVENUECAT_PUBLIC_KEY=rcb_sb_tnaXRWTYEDSfqrrioYhfzRKVU

# Alternative Stripe Key (if needed)
# VITE_REVENUECAT_PUBLIC_KEY=strp_zaZQVUtNPxrjsPmggNjWLSTflsv
```

### Stripe Configuration
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RfYpA8wHyEoK7baQabVEg7dd7c1WgKfGzCATaUtFwe1PC0zPRoMTSMSfxFnGOKldPcc5dUGIRjyFUu5GsIMFit500baOm41Xc
```

### Algorand Configuration
```
VITE_ALGORAND_API_TOKEN=98D9CE80660AD243893D56D9F125CD2D
VITE_ALGORAND_BACKEND_MNEMONIC=social scrub month double letter rotate possible analyst spread pear lady suggest act humor joke wheel what globe across sentence knee trim system abstract warfare
```

### ElevenLabs Configuration
```
VITE_ELEVENLABS_API_KEY=sk_86ed60aaf4f52f4bc1982764e0000a6037b79cdfec1b2ac1

```

### Tavus Configuration
```
VITE_TAVUS_API_KEY=8e65c0ea578c41d69cdbf9ecbb6337ac
```

### Deployment Mode
```
VITE_DEPLOYMENT_MODE=full
```

## Complete .env file template

Copy this entire block into your `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://emgtsgvwiebgybvfhbnl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZ3RzZ3Z3aWViZ3lidmZoYm5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDU3MTIsImV4cCI6MjA2NDcyMTcxMn0.GfvrWX_oTeDadSzMGyr3WPK1DiU9IYMOids0Yd4ZeCA

# Algorand Configuration
VITE_ALGORAND_API_TOKEN=98D9CE80660AD243893D56D9F125CD2D
VITE_ALGORAND_BACKEND_MNEMONIC=social scrub month double letter rotate possible analyst spread pear lady suggest act humor joke wheel what globe across sentence knee trim system abstract warfare

# ElevenLabs API Configuration
VITE_ELEVENLABS_API_KEY=sk_86ed60aaf4f52f4bc1982764e0000a6037b79cdfec1b2ac1

# Tavus API Configuration (optional)
VITE_TAVUS_API_KEY=8e65c0ea578c41d69cdbf9ecbb6337ac

# RevenueCat Configuration (Star Purchase System)
# Available keys:
# Stripe: strp_zaZQVUtNPxrjsPmggNjWLSTflsv
# Web Billing Production: rcb_nxFaEtdIxcXFtxLKnIAUHGfwVyOq (currently active)
# Web Billing Sandbox: rcb_sb_tnaXRWTYEDSfqrrioYhfzRKVU
# Using production key - this will connect to your real RevenueCat configuration
VITE_REVENUECAT_PUBLIC_KEY=rcb_nxFaEtdIxcXFtxLKnIAUHGfwVyOq
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RfYpA8wHyEoK7baQabVEg7dd7c1WgKfGzCATaUtFwe1PC0zPRoMTSMSfxFnGOKldPcc5dUGIRjyFUu5GsIMFit500baOm41Xc

# Deployment Mode Configuration
# Options: 'full' (requires database) | 'blockchain-only' (no database required)
# Use 'blockchain-only' for deployment without Supabase Pro
VITE_DEPLOYMENT_MODE=full
```

## Quick Setup Instructions for Others

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd AuthentiAi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   - Copy the complete `.env` content from above
   - Paste it into a new file called `.env` in the project root

4. **Set up Supabase (if they want their own database)**
   ```bash
   npx supabase db reset
   npx supabase gen types typescript --local > src/lib/database.types.ts
   ```

5. **Run the project**
   ```bash
   npm run dev
   ```

## Service Account Information

### Supabase Project
- Project: emgtsgvwiebgybvfhbnl
- URL: https://emgtsgvwiebgybvfhbnl.supabase.co
- Database includes star system tables and user authentication

### RevenueCat Project
- Project: Veridica (Web Billing)
- Has $100 star package configured
- Web Billing enabled with Stripe integration

### Stripe Account
- Test mode keys provided
- Connected to RevenueCat for payments

### Algorand Account
- Test network configuration
- Account funded for blockchain operations

## Notes for Developers

- **For development**: Use the provided keys to get started quickly
- **For production**: Each developer should create their own accounts
- **RevenueCat**: Currently configured with production keys - test purchases will be real charges
- **Database**: Shared Supabase instance - data will be shared among developers
- **Blockchain**: Test network only - no real value transactions

## File Locations

1. **`.env`** - Root of project directory
2. **`DEVELOPER_SETUP.md`** - Complete setup guide (already in repo)
3. **Database migrations** - `/supabase/migrations/` (already in repo)
4. **RevenueCat integration** - `/src/lib/revenuecat.ts` (already in repo)

## Testing the Integration

After setup:
1. Go to `http://localhost:5173/dashboard`
2. Sign up/login with any email
3. Click "Buy Stars" button
4. Should see your $100 package from RevenueCat
5. Test purchase flow (will attempt real charge with current keys)

## Security Warning

🚨 **Important**: These are working API keys. For production deployment:
- Create separate production accounts
- Use different keys for each environment
- Never commit real keys to public repositories
- Rotate keys regularly
