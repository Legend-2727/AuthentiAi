# Veridica - Setup Guide for Developers

This guide will help you set up the Veridica project on your local machine.

## Prerequisites

- Node.js 18+ and npm
- Git
- A modern web browser

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd AuthentiAi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your .env file** (see sections below)

5. **Run the development server**
   ```bash
   npm run dev
   ```

## Environment Configuration

### Required Services

You'll need to set up accounts and get API keys for these services:

#### 1. Supabase (Database & Authentication)
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Get your Project URL and Anon Key from Settings > API
- Update `.env`:
  ```
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your_anon_key
  ```

#### 2. RevenueCat (Star Purchase System)
- Go to [revenuecat.com](https://revenuecat.com)
- Create a project with Web Billing enabled
- Set up products and offerings in your dashboard
- Get your Web Billing API key from Project Settings > API Keys
- Update `.env`:
  ```
  VITE_REVENUECAT_PUBLIC_KEY=rcb_your_web_billing_key
  ```

#### 3. Stripe (Payment Processing)
- Go to [stripe.com](https://stripe.com)
- Get your publishable key from your dashboard
- Update `.env`:
  ```
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
  ```

### Optional Services

#### 4. ElevenLabs (Voice Synthesis)
- Go to [elevenlabs.io](https://elevenlabs.io)
- Get your API key
- Update `.env`:
  ```
  VITE_ELEVENLABS_API_KEY=your_elevenlabs_key
  ```

#### 5. Algorand (Blockchain Features)
- Get Nodely API token from [nodely.io](https://nodely.io)
- Generate an Algorand account at [bank.testnet.algorand.network](https://bank.testnet.algorand.network/)
- Update `.env`:
  ```
  VITE_ALGORAND_API_TOKEN=your_nodely_token
  VITE_ALGORAND_BACKEND_MNEMONIC=your_25_word_mnemonic
  ```

#### 6. Tavus (Video Generation - Optional)
- Go to [tavus.io](https://tavus.io)
- Get your API key
- Update `.env`:
  ```
  VITE_TAVUS_API_KEY=your_tavus_key
  ```

## Database Setup (Supabase)

1. **Apply migrations**
   ```bash
   npx supabase db reset
   ```

2. **Generate TypeScript types**
   ```bash
   npx supabase gen types typescript --local > src/lib/database.types.ts
   ```

## Deployment Modes

The app supports two deployment modes:

### Full Mode (Recommended)
- Requires all services (Supabase, RevenueCat, etc.)
- Full functionality including user accounts and star purchases
- Set `VITE_DEPLOYMENT_MODE=full`

### Blockchain-Only Mode
- Only requires Algorand configuration
- No user accounts or star purchases
- Set `VITE_DEPLOYMENT_MODE=blockchain-only`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## Testing the Star Purchase System

1. Start the development server
2. Go to `/dashboard` and sign up/login
3. Click the "Buy Stars" button
4. You should see either:
   - Real packages from your RevenueCat dashboard (if configured)
   - Mock packages for testing (if RevenueCat not configured)

## Troubleshooting

### RevenueCat Not Working
- Ensure you're using the Web Billing API key (starts with `rcb_`)
- Check that your RevenueCat project has Web Billing enabled
- Verify products and offerings are configured in RevenueCat dashboard

### Supabase Connection Issues
- Verify your Supabase URL and keys are correct
- Check that your Supabase project is running
- Ensure database migrations have been applied

### Build Errors
- Run `npm run type-check` to see TypeScript errors
- Ensure all environment variables are set
- Try deleting `node_modules` and running `npm install` again

## Project Structure

```
src/
├── components/          # UI components
│   ├── StarWallet.tsx   # Star balance display
│   ├── BuyStarsModal.tsx # Star purchase modal
│   └── GiveStarButton.tsx # Give stars to creators
├── lib/
│   ├── revenuecat.ts    # RevenueCat integration
│   ├── supabase.ts      # Supabase client
│   └── database.types.ts # Generated DB types
├── pages/               # Route components
└── contexts/            # React contexts
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the setup guides in the repository
3. Check the browser console for error messages
4. Ensure all environment variables are correctly set

## Security Notes

- Never commit your `.env` file
- Use test/sandbox keys during development
- Switch to production keys only when deploying
- Keep your API keys secure and rotate them regularly
