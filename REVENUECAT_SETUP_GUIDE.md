# RevenueCat Integration Guide for Veridica

This guide explains how to set up RevenueCat for the star purchase system in Veridica.

## 🚀 Quick Setup

### 1. RevenueCat Dashboard Setup

1. **Create Account**: Go to [RevenueCat Dashboard](https://app.revenuecat.com) and create an account
2. **Create Project**: Set up a new project called "Veridica"
3. **Configure Products**:
   - Create these product IDs in your Stripe/Apple/Google console:
     - `stars_100` - 100 Stars ($4.99)
     - `stars_250` - 250 Stars ($9.99) 
     - `stars_500` - 500 Stars ($19.99)
     - `stars_1000` - 1000 Stars ($34.99)

4. **Create Entitlement**:
   - Name: `stars_entitlement`
   - Attach all star products to this entitlement

5. **Create Packages**:
   - Package IDs should match product IDs
   - Group them in the "default" offering

### 2. Get API Keys

1. Go to **Project Settings → API Keys**
2. Copy your **Public Web SDK Key**
3. Add it to your `.env` file:

```bash
# RevenueCat Configuration
VITE_REVENUECAT_PUBLIC_KEY=rcb_xxxxxxxxxxxxxxxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxx
```

### 3. Stripe Configuration

1. In your Stripe dashboard, create the products mentioned above
2. Set up webhooks to sync with RevenueCat
3. Add your Stripe keys to both Stripe and RevenueCat dashboards

## 🌟 How the Star System Works

### User Experience
1. **Star Wallet**: Users see their star balance in the header
2. **Give Star**: Users can give stars to creators on content
3. **Buy Stars**: When out of stars, users can purchase more via RevenueCat
4. **Payment**: Powered by Stripe with RevenueCat handling the subscription logic

### Technical Flow
1. User clicks "Give Star" on content
2. App checks local star balance
3. If balance > 0: Deduct 1 star and send to creator
4. If balance = 0: Show RevenueCat purchase modal
5. User selects package and pays via Stripe
6. RevenueCat confirms purchase and updates entitlements
7. App syncs new star balance

## 🛠️ Development Features

### Mock Mode
When RevenueCat is not configured, the app runs in mock mode:
- Shows sample star packages ($4.99, $9.99, $19.99, $34.99)
- Simulates successful purchases
- Stars are stored locally for testing

### Production Mode
With proper RevenueCat setup:
- Real Stripe payments
- Server-side validation
- Entitlement management
- Purchase restoration

## 📱 Components Included

### StarWallet
- Displays current star balance
- "Buy Stars" button
- Real-time balance updates

### BuyStarsModal
- Shows available star packages
- Best value highlighting
- Stripe payment integration
- Loading and success states

### GiveStarButton
- Multiple variants (default, compact, icon-only)
- Automatic purchase prompt when out of stars
- Creator attribution
- Success feedback

## 🔧 Configuration Options

### Environment Variables
```bash
# Required for production
VITE_REVENUECAT_PUBLIC_KEY=your_key_here
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Optional - for advanced features
VITE_DEPLOYMENT_MODE=full
```

### Package Customization
You can modify star packages in `src/lib/revenuecat.ts`:
```typescript
const getMockStarPackages = (): StarPackage[] => [
  // Add your custom packages here
];
```

## 🎯 Next Steps

1. **Set up RevenueCat account** with the configuration above
2. **Configure Stripe products** with the specified IDs
3. **Add your API keys** to the environment variables
4. **Test the purchase flow** in development
5. **Deploy to production** with real payments

## 🔗 Useful Links

- [RevenueCat Documentation](https://docs.revenuecat.com)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [RevenueCat Web SDK Docs](https://docs.revenuecat.com/docs/web)
- [Veridica GitHub Repository](https://github.com/Legend-2727/AuthentiAi)

## 🎉 Features Ready

✅ **Star Wallet System** - Real-time balance tracking  
✅ **Purchase Flow** - RevenueCat + Stripe integration  
✅ **Creator Tipping** - Give stars to content creators  
✅ **Mock Mode** - Works without RevenueCat for testing  
✅ **Mobile Responsive** - Works on all devices  
✅ **Dark Mode** - Consistent with app theme  
✅ **Error Handling** - Graceful fallbacks and user feedback  

Your Veridica star purchase system is now fully integrated and ready for production! 🌟
