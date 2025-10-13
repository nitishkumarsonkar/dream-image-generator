# Credit System Setup Guide

## Overview
This application includes a comprehensive credit-based system for managing user access to Image Generation and AI Chat features. The system integrates with Supabase for data persistence and Razorpay for payment processing.

## Features
- ✅ **Initial Free Credits**: New users receive 50 free credits upon signup
- ✅ **Credit Deduction**: Automatic deduction for actions (5 for images, 1 for chat)
- ✅ **Supabase Integration**: Persistent credit storage with transaction history
- ✅ **Razorpay Payments**: Secure payment processing for credit purchases
- ✅ **Real-time Balance**: Live credit balance updates across the application
- ✅ **Transaction History**: Complete audit trail of all credit transactions

## Credit Pricing
- **Image Generation**: 5 credits per image
- **AI Chat Message**: 1 credit per message
- **Initial Bonus**: 50 free credits on signup

## Credit Packages
1. **Starter Pack**: 100 credits for ₹99
2. **Popular Pack**: 250 + 50 bonus credits for ₹199 ⭐ Most Popular
3. **Professional Pack**: 500 + 150 bonus credits for ₹349
4. **Enterprise Pack**: 1000 + 400 bonus credits for ₹599

---

## Setup Instructions

### 1. Database Migration

Run the Supabase migration to create the necessary tables:

```bash
# Navigate to your project directory
cd /path/to/dream-image-generator

# Run the migration using Supabase CLI
supabase migration up

# Or manually execute the migration file in Supabase dashboard
# File: migrations/0007_add_credits_system.sql
```

The migration creates:
- `user_credits` table: Stores current credit balance for each user
- `credit_transactions` table: Logs all credit transactions
- Row Level Security (RLS) policies for data protection
- Automatic credit initialization trigger for new users
- Helper functions for credit management

### 2. Environment Variables

Create or update your `.env.local` file with the following Razorpay credentials:

```bash
# Razorpay Configuration
# Get these from https://dashboard.razorpay.com/app/keys

# Test Mode Keys (for development)
RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_TEST_KEY_SECRET

# Production Keys (for live deployment)
# RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
# RAZORPAY_KEY_SECRET=YOUR_LIVE_KEY_SECRET
```

### 3. Get Razorpay API Keys

1. **Create Razorpay Account**:
   - Visit [https://razorpay.com](https://razorpay.com)
   - Sign up for a free account

2. **Get Test API Keys**:
   - Login to [Razorpay Dashboard](https://dashboard.razorpay.com)
   - Navigate to **Settings** → **API Keys**
   - Click on **Generate Test Key**
   - Copy both `Key ID` and `Key Secret`
   - Add them to your `.env.local` file

3. **Testing Payments**:
   - Use test mode keys for development
   - Razorpay provides test card numbers:
     - Card: `4111 1111 1111 1111`
     - CVV: Any 3 digits
     - Expiry: Any future date

4. **Go Live** (Production):
   - Complete KYC verification in Razorpay dashboard
   - Switch to **Live Mode**
   - Generate live API keys
   - Update `.env.local` with live keys
   - Update payment amounts if needed

### 4. Install Dependencies

The Razorpay package has already been installed. If you need to reinstall:

```bash
npm install razorpay
```

### 5. Verify Setup

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Test the System**:
   - Navigate to `/credits` page
   - Check credit balance display
   - Try image generation (5 credits)
   - Try AI chat (1 credit per message)
   - Test credit purchase flow

3. **Check Transaction History**:
   - Click "View History" to see all transactions
   - Verify initial 50 credits bonus appears
   - Test deductions and additions

---

## File Structure

```
src/
├── app/
│   ├── credits/
│   │   └── page.tsx                 # Main credits page with all features
│   └── api/
│       └── payment/
│           └── razorpay/
│               ├── create-order/
│               │   └── route.ts     # Create Razorpay order
│               └── verify-payment/
│                   └── route.ts     # Verify payment and add credits
├── components/
│   └── Header.tsx                   # Updated with Credits link
└── utils/
    └── supabase/
        └── credits.ts               # Credit management utilities

migrations/
└── 0007_add_credits_system.sql      # Database schema migration
```

---

## API Endpoints

### Create Payment Order
```
POST /api/payment/razorpay/create-order
```
**Request Body**:
```json
{
  "amount": 199,
  "credits": 300,
  "packageId": "popular"
}
```

**Response**:
```json
{
  "success": true,
  "orderId": "order_xyz123",
  "amount": 19900,
  "currency": "INR",
  "keyId": "rzp_test_xxx"
}
```

### Verify Payment
```
POST /api/payment/razorpay/verify-payment
```
**Request Body**:
```json
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash",
  "credits": 300,
  "amount": 199,
  "packageId": "popular"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully added 300 credits to your account",
  "newBalance": 350,
  "credits": 300
}
```

---

## Utility Functions

### Get User Credits
```typescript
import { getUserCredits } from '@/utils/supabase/credits';

const credits = await getUserCredits(userId);
```

### Check Sufficient Credits
```typescript
import { hasEnoughCredits, CREDIT_COSTS } from '@/utils/supabase/credits';

const canGenerate = await hasEnoughCredits(userId, CREDIT_COSTS.IMAGE_GENERATION);
```

### Deduct Credits
```typescript
import { deductCredits } from '@/utils/supabase/credits';

await deductCredits({
  userId: user.id,
  amount: 5,
  type: 'image_generation',
  description: 'Generated image',
  metadata: { prompt: 'beautiful sunset' }
});
```

### Add Credits
```typescript
import { addCredits } from '@/utils/supabase/credits';

await addCredits({
  userId: user.id,
  amount: 100,
  type: 'purchase',
  description: 'Purchased credits',
  metadata: { payment_id: 'pay_xxx' }
});
```

### Get Transaction History
```typescript
import { getTransactionHistory } from '@/utils/supabase/credits';

const transactions = await getTransactionHistory(userId, 20);
```

---

## Security Features

1. **Row Level Security (RLS)**:
   - Users can only access their own credits
   - All database operations are user-scoped
   - Prevents unauthorized credit manipulation

2. **Payment Signature Verification**:
   - All Razorpay payments are verified server-side
   - Prevents fraudulent payment claims
   - Uses HMAC SHA256 signature validation

3. **Server-Side Credit Operations**:
   - All credit modifications happen on server
   - Client cannot directly manipulate credits
   - Transaction logs for audit trail

4. **Authentication Required**:
   - All credit operations require authentication
   - Unauthorized users are redirected to sign-in
   - Session-based access control

---

## Troubleshooting

### Credits Not Updating
1. Check browser console for errors
2. Verify Supabase RLS policies are active
3. Ensure user is authenticated
4. Check transaction history for logged operations

### Payment Failures
1. Verify Razorpay keys are correct in `.env.local`
2. Check Razorpay dashboard for payment status
3. Ensure test mode is enabled for development
4. Verify webhook signature calculation

### Migration Issues
1. Ensure Supabase CLI is installed and configured
2. Check for existing table name conflicts
3. Review migration logs for errors
4. Manually run SQL in Supabase dashboard if needed

### Initial Credits Not Awarded
1. Check if trigger is active in Supabase
2. Verify user signup completed successfully
3. Manually insert initial credits if needed:
   ```sql
   INSERT INTO user_credits (user_id, credits) 
   VALUES ('user-uuid', 50);
   ```

---

## Testing Checklist

- [ ] New user receives 50 initial credits
- [ ] Image generation deducts 5 credits
- [ ] AI chat deducts 1 credit per message
- [ ] Insufficient credits modal appears when needed
- [ ] Payment flow completes successfully
- [ ] Credits are added after payment verification
- [ ] Transaction history displays correctly
- [ ] Credit balance updates in real-time
- [ ] RLS policies prevent unauthorized access
- [ ] Payment signature verification works

---

## Next Steps

### Integration with Existing Features

To integrate the credit system with your existing features:

1. **Home Page Image Generation**:
   ```typescript
   // In src/app/(home)/page.tsx
   import { deductCredits, CREDIT_COSTS } from '@/utils/supabase/credits';
   
   // Before generating image
   await deductCredits({
     userId: user.id,
     amount: CREDIT_COSTS.IMAGE_GENERATION,
     type: 'image_generation',
     description: 'Generated image',
   });
   ```

2. **AI Chat Page**:
   ```typescript
   // In src/app/chat/page.tsx
   import { deductCredits, CREDIT_COSTS } from '@/utils/supabase/credits';
   
   // Before sending message
   await deductCredits({
     userId: user.id,
     amount: CREDIT_COSTS.AI_CHAT_MESSAGE,
     type: 'ai_chat',
     description: 'AI Chat message',
   });
   ```

3. **Header Credit Display** (Optional):
   You can add a credit balance display in the header by importing and using the credit utilities.

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Supabase logs for database errors
3. Check Razorpay dashboard for payment issues
4. Verify all environment variables are set correctly

---

## Production Deployment

Before deploying to production:

1. **Switch to Live Razorpay Keys**:
   - Complete KYC verification
   - Generate live API keys
   - Update environment variables

2. **Run Migrations on Production Database**:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

3. **Test Payment Flow**:
   - Use real payment methods
   - Verify credits are added correctly
   - Test refund process if needed

4. **Monitor Transactions**:
   - Set up logging and monitoring
   - Track failed payments
   - Monitor credit balance anomalies

5. **Set Up Webhooks** (Optional):
   - Configure Razorpay webhooks for payment events
   - Handle payment failures, refunds, etc.
   - Create webhook handler at `/api/webhooks/razorpay`

---

## License

This credit system is part of the Dream Generator application.
