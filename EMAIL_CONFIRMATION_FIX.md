# Email Confirmation Link Fix

## Problem
Sign-up confirmation emails were using `localhost:3000` as the redirect URL instead of your production domain.

## Solution Applied

### 1. Updated `sign-in.ts` File
Added `emailRedirectTo` option to the `signUp` function to use the configured site URL:

```typescript
export async function signUp(email: string, password: string, fullName?: string) {
  const supabase = createClient()
  
  // Get the site URL from environment or use current origin as fallback
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  })

  return { data, error }
}
```

### 2. Added Environment Variable
Added `NEXT_PUBLIC_APP_URL` to `.env.local`:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Next Steps for Production Deployment

### Step 1: Update Environment Variable
When deploying to production (e.g., Vercel), update the `NEXT_PUBLIC_APP_URL` in your environment variables:

**For Vercel:**
1. Go to your project settings → Environment Variables
2. Add/Update: `NEXT_PUBLIC_APP_URL` = `https://your-production-domain.com`
3. Redeploy your application

**For local .env.local:**
```bash
# For production
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

### Step 2: Update Supabase Site URL Settings
You also need to configure the allowed redirect URLs in Supabase:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Update the following settings:

   **Site URL:**
   ```
   https://your-production-domain.com
   ```

   **Redirect URLs (add all of these):**
   ```
   http://localhost:3000/auth/callback
   https://your-production-domain.com/auth/callback
   https://*.vercel.app/auth/callback  # If using Vercel
   ```

### Step 3: Test the Fix

**Local Testing:**
1. Restart your development server: `npm run dev`
2. Sign up with a test email
3. Check the confirmation email - it should now use the correct URL

**Production Testing:**
1. Deploy to production with updated environment variables
2. Sign up with a test email
3. Verify the confirmation link uses your production domain

## How It Works

1. **Client-Side Signup**: When a user signs up, the `signUp` function now includes an `emailRedirectTo` parameter
2. **Environment Variable**: The redirect URL is read from `NEXT_PUBLIC_APP_URL`
3. **Email Template**: Supabase uses this URL in the confirmation email link
4. **Callback Handler**: After clicking the link, users are redirected to `/auth/callback` on your domain
5. **Session Setup**: The callback handler verifies the token and sets up the user session

## Additional Configuration (Optional)

If you want to customize the email template:
1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Edit the "Confirm signup" template
3. The `{{ .ConfirmationURL }}` variable will use your configured redirect URL

## Troubleshooting

**Issue: Still seeing localhost in emails**
- ✅ Clear browser cache and restart dev server
- ✅ Make sure `.env.local` has the correct `NEXT_PUBLIC_APP_URL`
- ✅ Verify Supabase Site URL settings match your environment

**Issue: Redirect not working after clicking email link**
- ✅ Check that `/auth/callback` route exists in your app
- ✅ Verify the URL is added to Supabase redirect allowlist
- ✅ Check browser console for any errors

**Issue: Different URLs for dev and production**
- ✅ Use environment-specific values in Vercel/hosting platform
- ✅ Keep `localhost:3000` for local development
- ✅ Use production domain for deployed environments

## Files Modified

1. ✅ `/src/utils/supabase/auth/sign-in.ts` - Added emailRedirectTo option
2. ✅ `/.env.local` - Added NEXT_PUBLIC_APP_URL variable

## Verification Checklist

- [ ] `.env.local` has `NEXT_PUBLIC_APP_URL` set correctly
- [ ] Production environment variables are configured
- [ ] Supabase Site URL is updated
- [ ] Supabase Redirect URLs include all environments
- [ ] Test signup works in local development
- [ ] Test signup works in production
- [ ] Confirmation emails show correct domain

---

**Note**: Remember to update `NEXT_PUBLIC_APP_URL` to your actual production URL before deploying!
