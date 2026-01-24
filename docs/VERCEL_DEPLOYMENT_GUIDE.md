# 🚀 Vercel Deployment Guide for Credit System

## ✅ Issue Fixed

The build error occurred because Razorpay was being initialized at module load time, but environment variables aren't available during Vercel's build phase.

### What Was Changed:

**Before:**
```typescript
// ❌ Initialized at module level - fails during build
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```

**After:**
```typescript
// ✅ Lazy initialization - only runs at runtime
function getRazorpayInstance() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured.');
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Added dynamic export
export const dynamic = 'force-dynamic';
```

---

## 📦 Vercel Deployment Checklist

### 1. **Set Environment Variables on Vercel**

Go to your Vercel project → Settings → Environment Variables

Add these variables:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET

# Supabase Configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google Gemini API (if not already set)
GOOGLE_GEMINI_API_KEY=your_gemini_key
```

**Important:** 
- Use **Test Keys** for staging/preview deployments
- Use **Live Keys** only for production after KYC verification

---

### 2. **Run Database Migration**

Before deploying, make sure the Supabase migration is run:

**Option A - Supabase CLI:**
```bash
supabase link --project-ref your-project-ref
supabase db push
```

**Option B - Manual:**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `migrations/0007_add_credits_system.sql`
3. Execute the SQL

---

### 3. **Deploy to Vercel**

```bash
# Push to your git repository
git add .
git commit -m "Add credit system with Razorpay integration"
git push origin main

# Vercel will auto-deploy (if connected to GitHub)
# Or deploy manually:
vercel --prod
```

---

### 4. **Verify Deployment**

After deployment:

1. **Check Build Logs** - Should complete without errors
2. **Visit `/credits`** - Should load without errors
3. **Check Credit Balance** - Should show 50 initial credits (for new users)
4. **Try Test Payment** - Use test card to verify payment flow

---

## 🧪 Testing on Vercel

### Test Card Numbers (Razorpay Test Mode):

| Card Number | Result |
|-------------|--------|
| 4111 1111 1111 1111 | Success |
| 4000 0000 0000 0002 | Decline |

**Other fields:**
- CVV: Any 3 digits
- Expiry: Any future date
- OTP: 123456

---

## 🔧 Troubleshooting

### Build Still Failing?

1. **Clear Vercel cache:**
   ```bash
   vercel --force
   ```

2. **Check environment variables:**
   - Ensure they're set in Vercel dashboard
   - Match exactly with `.env.local` format
   - No extra spaces or quotes

3. **Check Supabase RLS policies:**
   - Ensure policies are active
   - Test queries in Supabase SQL Editor

### Runtime Errors?

1. **Check Vercel Function Logs:**
   - Vercel Dashboard → Deployments → Your Deployment → Functions
   - Look for API route errors

2. **Verify Razorpay keys:**
   - Test vs Live mode mismatch
   - Keys are correct and active

3. **Check Supabase connection:**
   - Environment variables are correct
   - RLS policies allow operations

---

## 🌍 Environment-Specific Configuration

### Preview Deployments (Branch deployments)
```bash
# Use test keys
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=test_secret_xxx
```

### Production Deployment
```bash
# Use live keys (after KYC)
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=live_secret_xxx
```

**Set different values per environment in Vercel:**
- Settings → Environment Variables → Select "Production", "Preview", or "Development"

---

## 📊 Post-Deployment Verification

### 1. Check API Routes

Test in browser console or Postman:

```javascript
// Test create-order endpoint (should return 401 without auth)
fetch('https://your-domain.vercel.app/api/payment/razorpay/create-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 99,
    credits: 100,
    packageId: 'starter'
  })
})
```

### 2. Check Credits Page

- Navigate to `/credits`
- Verify balance loads
- Check transaction history
- Try clicking "Buy Now" (should open Razorpay)

### 3. Monitor Vercel Analytics

- Check for any 500 errors
- Monitor function execution times
- Watch for any patterns in failures

---

## 🔒 Security Checklist

- [ ] Environment variables set in Vercel (not in code)
- [ ] Using test keys in preview deployments
- [ ] RLS policies active in Supabase
- [ ] Payment signature verification working
- [ ] Error messages don't leak sensitive info

---

## 📈 Performance Optimization

### Edge Functions (Optional)

If you want faster API responses, consider using Vercel Edge Functions:

```typescript
// Add to route files
export const runtime = 'edge'; // Instead of 'nodejs'
```

**Note:** Some Node.js APIs might not be available in Edge runtime. Test thoroughly.

---

## 🎯 Next Steps After Deployment

1. **Test Complete Flow:**
   - Sign up new user
   - Verify 50 credits awarded
   - Buy credits with test payment
   - Check balance updates

2. **Monitor for Issues:**
   - Check Vercel logs daily
   - Monitor Razorpay dashboard
   - Review Supabase logs

3. **Go Live Preparation:**
   - Complete Razorpay KYC
   - Switch to live keys
   - Test with real payments
   - Set up webhooks (optional)

---

## 📞 Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Razorpay Docs:** https://razorpay.com/docs/
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## ✅ Summary

The deployment issue has been fixed by:
1. ✅ Lazy initialization of Razorpay (runtime only)
2. ✅ Added `dynamic = 'force-dynamic'` export
3. ✅ Proper error handling for missing env vars

**Your credit system should now deploy successfully on Vercel!** 🎉

---

**Last Updated:** October 13, 2025  
**Status:** Ready for Deployment ✅
