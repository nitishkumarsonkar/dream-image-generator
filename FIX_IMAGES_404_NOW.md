# 🔥 IMMEDIATE ACTION REQUIRED: Fix 404 Storage Error

## What's Wrong
Images are not getting saved when adding prompts to the library. You're getting a 404 error because the Supabase storage bucket doesn't exist.

## What You Need to Do RIGHT NOW

### Option A: Via Supabase Dashboard (Recommended - Takes 2 minutes)

**1. Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

**2. Create the Storage Bucket**
   - Click **"Storage"** in the left sidebar
   - Click **"New bucket"** button
   - Fill in:
     - **Name:** `prompts-pic` (exact spelling, with hyphen!)
     - **Public bucket:** ✅ **CHECK THIS BOX**
     - **File size limit:** `5` MB
     - **Allowed MIME types:** Leave empty (or add: `image/jpeg,image/png,image/gif,image/webp`)
   - Click **"Create bucket"**

**3. Run the Storage Policies**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New query"**
   - Open this file on your computer:
     ```
     migrations/0002_create_prompts_pic_bucket_and_policies.sql
     ```
   - Copy EVERYTHING from that file
   - Paste into the SQL Editor
   - Click **"Run"**

**4. Test It**
   - Go back to your app
   - Try uploading an image to a prompt
   - Should work now! ✅

### Option B: Quick SQL Method (If you prefer)

**1. Open Supabase SQL Editor**
   - Dashboard → SQL Editor → New query

**2. Copy and Run This:**

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prompts-pic',
  'prompts-pic',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create policies
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read prompts-pic" ON storage.objects
  FOR SELECT USING (bucket_id = 'prompts-pic');

CREATE POLICY "User insert own folder prompts-pic" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'prompts-pic'
    AND auth.role() = 'authenticated'
    AND name LIKE 'prompt-library/' || (auth.uid())::text || '/%'
  );

CREATE POLICY "User update own folder prompts-pic" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'prompts-pic'
    AND auth.role() = 'authenticated'
    AND name LIKE 'prompt-library/' || (auth.uid())::text || '/%'
  );

CREATE POLICY "User delete own folder prompts-pic" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'prompts-pic'
    AND auth.role() = 'authenticated'
    AND name LIKE 'prompt-library/' || (auth.uid())::text || '/%'
  );
```

**3. Test It**
   - Try uploading an image
   - Should work! ✅

## How to Verify It's Fixed

### ✅ Checklist

1. **Bucket exists:**
   - Dashboard → Storage → You see `prompts-pic` in the list
   
2. **Bucket is public:**
   - Click on `prompts-pic` → Should show "Public" badge
   
3. **Policies are applied:**
   - Run this SQL:
     ```sql
     SELECT policyname FROM pg_policies 
     WHERE tablename = 'objects' 
     AND policyname LIKE '%prompts-pic%';
     ```
   - Should return 4 policies

4. **Upload works:**
   - Go to your app
   - Prompt Library → Add Prompt → Upload image → Save
   - No 404 error!

5. **Image appears:**
   - After saving, you should see the image thumbnail
   - Click on the prompt to view details
   - Images should display correctly

## What This Creates

After running the fix, you'll have:

```
Supabase Storage
└── 📦 prompts-pic (PUBLIC bucket)
    └── 📁 prompt-library/
        └── 📁 {user-id}/
            ├── {timestamp}_input_0.jpg   ← Input images
            ├── {timestamp}_input_1.png
            ├── {timestamp}_output_0.jpg  ← Generated images
            └── {timestamp}_output_1.png
```

## Troubleshooting

### Still Getting 404?

**Check:**
- Bucket name is exactly `prompts-pic` (with hyphen, not underscore)
- Bucket is marked as "Public"
- You ran ALL the policy SQL, not just part of it

**Solution:**
- Delete the bucket and recreate it with exact settings above
- Re-run the policies SQL

### Getting "Policy Violation" Error?

**Check:**
- You're signed in to the app
- The policies SQL ran successfully

**Solution:**
- Re-run the policies SQL
- Check browser console for exact error message

### Images Upload But Don't Display?

**Check:**
- Bucket is marked as "Public"
- Public URLs are enabled

**Solution:**
- Dashboard → Storage → prompts-pic → Settings
- Enable "Public bucket"
- Save

## Additional Resources

For more details, see:
- `FIX_404_STORAGE_BUCKET.md` - Detailed explanation
- `STORAGE_SETUP_VISUAL_GUIDE.md` - Visual diagrams
- `QUICK_FIX_STORAGE_404.md` - Quick reference

## Summary

**The Problem:** Storage bucket doesn't exist  
**The Fix:** Create it in Supabase Dashboard  
**Time Required:** 2 minutes  
**Difficulty:** Easy ⭐

After this fix, image uploads will work perfectly! 🎉
