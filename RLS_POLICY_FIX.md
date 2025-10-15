# 🚨 RLS Policy Issue - Quick Fix

## Issue
`'new row violates row-level security policy for table "user_credits"'`

This error occurs when trying to initialize credits for a user because the RLS policy requires `auth.uid() = user_id`.

## Solution: Manually Initialize Credits

### Option 1: Run in Supabase SQL Editor (Recommended)

```sql
-- Get your user ID first
SELECT id, email FROM auth.users;

-- Replace 'YOUR_USER_ID' with your actual user ID from above query
INSERT INTO public.user_credits (user_id, credits)
VALUES ('YOUR_USER_ID', 50)
ON CONFLICT (user_id) DO NOTHING;

-- Log the initial transaction
INSERT INTO public.credit_transactions (
  user_id,
  amount,
  transaction_type,
  description,
  balance_after,
  metadata
)
VALUES (
  'YOUR_USER_ID',
  50,
  'initial_bonus',
  'Welcome bonus - 50 free credits',
  50,
  '{"source": "manual_initialization"}'::jsonb
);
```

### Option 2: Use Service Role (Bypass RLS)

If you need to initialize credits programmatically without RLS restrictions, you need to use the **service role key** instead of the anon key. However, this should ONLY be used in secure server-side code.

### Option 3: Update RLS Policy (Temporary Workaround)

Add a policy that allows authenticated users to insert their own credits:

```sql
-- Allow service role to bypass RLS for initialization
ALTER TABLE public.user_credits FORCE ROW LEVEL SECURITY;

-- Or create a more permissive INSERT policy
DROP POLICY IF EXISTS "Users can insert own credits" ON public.user_credits;

CREATE POLICY "Users can insert own credits"
    ON public.user_credits
    FOR INSERT
    WITH CHECK (true);  -- WARNING: This allows anyone to insert!
```

**⚠️ WARNING**: Option 3 is NOT recommended for production as it's less secure!

## Recommended Approach

### Use a Database Function with SECURITY DEFINER

Create a function that bypasses RLS to initialize credits:

```sql
-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.initialize_user_credits_safe;

-- Create a SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.initialize_user_credits_safe(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs with the privileges of the function creator
SET search_path = public
AS $$
BEGIN
  -- Insert initial credits
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (target_user_id, 50)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Log the initial transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    transaction_type,
    description,
    balance_after,
    metadata
  )
  VALUES (
    target_user_id,
    50,
    'initial_bonus',
    'Welcome bonus - 50 free credits',
    50,
    jsonb_build_object('source', 'auto_initialization')
  )
  ON CONFLICT DO NOTHING;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.initialize_user_credits_safe TO authenticated;
```

Then update the `getUserCredits` function to call this:

```typescript
// In src/utils/supabase/credits.ts
if (error.code === 'PGRST116') {
  // Call the safe initialization function
  const { error: initError } = await client
    .rpc('initialize_user_credits_safe', { target_user_id: userId });

  if (initError) {
    console.error('Error initializing user credits:', initError);
    throw new Error('Failed to initialize credits');
  }

  // Fetch the newly created credits
  const { data: newData, error: fetchError } = await client
    .from('user_credits')
    .select('credits')
    .eq('user_id', userId)
    .single();

  return newData?.credits ?? 50;
}
```

## Quick Fix For Now

**Just run this in Supabase SQL Editor:**

```sql
-- Initialize credits for ALL existing users who don't have credits yet
INSERT INTO public.user_credits (user_id, credits)
SELECT id, 50
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_credits)
ON CONFLICT (user_id) DO NOTHING;

-- Log transactions for all new credit records
INSERT INTO public.credit_transactions (
  user_id,
  amount,
  transaction_type,
  description,
  balance_after,
  metadata
)
SELECT 
  uc.user_id,
  50,
  'initial_bonus',
  'Welcome bonus - 50 free credits',
  50,
  '{"source": "batch_initialization"}'::jsonb
FROM public.user_credits uc
WHERE NOT EXISTS (
  SELECT 1 FROM public.credit_transactions ct 
  WHERE ct.user_id = uc.user_id
);
```

This will initialize credits for all users at once!

## Verify It Worked

```sql
-- Check your credits
SELECT * FROM public.user_credits WHERE user_id = auth.uid();

-- Check your transactions
SELECT * FROM public.credit_transactions WHERE user_id = auth.uid() ORDER BY created_at DESC;
```

---

**After running the SQL script above, try chatting again - it should work!**
