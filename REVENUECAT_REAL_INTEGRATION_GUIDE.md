# RevenueCat Real Integration Guide - Veridica Star System

This guide will help you transition from the mock RevenueCat integration to real transactions with Stripe and proper backend synchronization.

## Current Status

✅ **Completed:**
- RevenueCat Web SDK installed and configured
- Star system UI components implemented
- Database tables created (star_balances, star_purchases, star_transactions)
- Basic integration layer created in `src/lib/revenuecat.ts`
- Environment variables set up

🔄 **In Progress:**
- Transitioning from mock to real RevenueCat integration

## Step-by-Step Setup for Real Transactions

### 1. Configure RevenueCat Dashboard Products

Based on your screenshot, you're at step 4 "Connect the SDK". Before proceeding, you need to set up your products:

#### A. Create Products in RevenueCat Dashboard

1. Go to your RevenueCat dashboard → Products section
2. Create the following products (match our mock packages):

```
Product 1:
- Product ID: stars_100
- Title: 100 Stars
- Description: Support creators with 100 stars
- Price: $4.99

Product 2:
- Product ID: stars_250  
- Title: 250 Stars
- Description: Support creators with 250 stars
- Price: $9.99

Product 3:
- Product ID: stars_500
- Title: 500 Stars
- Description: Support creators with 500 stars
- Price: $19.99

Product 4:
- Product ID: stars_1000
- Title: 1000 Stars
- Description: Support creators with 1000 stars
- Price: $34.99
```

#### B. Create Entitlements

1. Go to Entitlements section
2. Create an entitlement called `stars_entitlement`
3. Attach all your star products to this entitlement

#### C. Create Offerings

1. Go to Offerings section
2. Create an offering called `default` (or any name you prefer)
3. Add all your star packages to this offering
4. Set package types (can be custom or one-time)

### 2. Configure Environment Variables

Update your `.env` file with real values:

```bash
# RevenueCat Configuration
VITE_REVENUECAT_PUBLIC_KEY=your_actual_revenuecat_public_key
VITE_STRIPE_PUBLISHABLE_KEY=your_actual_stripe_publishable_key
```

**Important:** Make sure you're using the PUBLIC/PUBLISHABLE keys, not the secret ones!

### 3. Test the Integration

#### A. Enable Real Mode
1. Check that your environment variables are set correctly
2. The integration will automatically detect real keys and switch from mock mode

#### B. Test Purchase Flow
1. Start your development server: `npm run dev`
2. Navigate to `/star-demo` in your app
3. Try purchasing stars using the "Buy Stars" button
4. Use Stripe's test card numbers:
   - Success: `4242424242424242`
   - Declined: `4000000000000002`

### 4. Set Up RevenueCat Webhooks (Critical for Production)

To ensure star balances are updated reliably, you need to set up webhooks:

#### A. Create Webhook Endpoint

Create a new API endpoint in your app (example: `/api/revenuecat-webhook`):

```typescript
// Example webhook handler (you'll need to implement this)
export async function POST(request: Request) {
  const body = await request.json();
  
  // Verify webhook signature (important for security)
  // Process the purchase event
  // Update user's star balance in Supabase
  
  return new Response('OK', { status: 200 });
}
```

#### B. Configure Webhook in RevenueCat Dashboard

1. Go to RevenueCat Dashboard → Project Settings → Webhooks
2. Add your webhook URL: `https://your-domain.com/api/revenuecat-webhook`
3. Select events to listen for:
   - `INITIAL_PURCHASE`
   - `NON_RENEWING_PURCHASE`
   - `TRANSFER`

### 5. Regenerate Database Types

After the migration, you need to regenerate TypeScript types:

```bash
# Generate new types for Supabase
npx supabase gen types typescript --local > src/lib/database.types.ts
```

### 6. Update Backend Integration

Once types are regenerated, update the backend functions in `src/lib/revenuecat.ts`:

1. Uncomment the actual Supabase calls
2. Replace the mock implementations
3. Test star balance sync with the backend

### 7. Production Checklist

Before going live:

- [ ] Test all purchase flows with Stripe test cards
- [ ] Verify star balances update correctly
- [ ] Test webhook delivery and processing
- [ ] Ensure error handling works properly
- [ ] Test refund scenarios
- [ ] Verify star giving/tipping works
- [ ] Test with real Stripe account (small amounts)

## Troubleshooting

### Common Issues

1. **"No offerings found"**
   - Check that products are created in RevenueCat dashboard
   - Verify offering is configured and contains products
   - Ensure API key is correct

2. **Purchases not completing**
   - Check Stripe integration in RevenueCat
   - Verify Stripe publishable key is correct
   - Check browser console for errors

3. **Star balances not updating**
   - Check webhook configuration
   - Verify database functions are working
   - Check Supabase logs for errors

### Debug Mode

Enable debug logging by adding to your `.env`:

```bash
VITE_REVENUECAT_DEBUG=true
```

## Next Steps

1. **Complete RevenueCat Dashboard Setup**
   - Create products and entitlements
   - Configure offerings
   - Test with your API keys

2. **Test Real Purchases**
   - Use Stripe test cards
   - Verify star balance updates

3. **Set Up Webhooks**
   - Create webhook endpoint
   - Configure in RevenueCat dashboard

4. **Go Live**
   - Switch to production Stripe account
   - Update API keys
   - Monitor transactions

## Support

If you run into issues:
- Check RevenueCat documentation: https://docs.revenuecat.com
- Review Stripe integration guides
- Check browser console and network tab for errors
- Test with the Star System Demo page: `/star-demo`

## Testing Guide

### Test Cards for Development

```
# Successful payments
4242424242424242 (Visa)
4000056655665556 (Visa debit)
5555555555554444 (Mastercard)

# Declined payments
4000000000000002 (Generic decline)
4000000000009995 (Insufficient funds)
4000000000009987 (Lost card)

# Use any future expiry date, any 3-digit CVC, any 5-digit postal code
```

### Test Scenarios

1. **Basic Purchase Flow**
   - Select a star package
   - Complete payment
   - Verify stars added to balance

2. **Error Handling**
   - Try with declined card
   - Cancel payment midway
   - Verify graceful error handling

3. **Star Usage**
   - Give stars to content creators
   - Verify balance decreases
   - Test insufficient balance scenario

4. **Persistence**
   - Purchase stars
   - Refresh page
   - Verify balance persists
