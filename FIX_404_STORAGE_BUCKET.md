# Fix 404 Error - Storage Bucket Not Found

## Problem
Images are not getting saved and returning a 404 error because the `prompts-pic` storage bucket doesn't exist in Supabase.

## Root Cause
The migration file `0002_storage_policies_prompts_pic.sql` only creates the security policies for the bucket, but it doesn't create the bucket itself. Storage buckets need to be created through the Supabase Dashboard or via the Management API.

## Solution

### Option 1: Create Bucket via Supabase Dashboard (Recommended)

1. **Go to your Supabase Project Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click on "New bucket"

3. **Create the Bucket**
   - **Name:** `prompts-pic`
   - **Public bucket:** ✅ Check this box (to enable public URLs)
   - **File size limit:** 5 MB (or your preferred limit)
   - **Allowed MIME types:** Leave empty or add: `image/jpeg, image/jpg, image/png, image/gif, image/webp`
   - Click "Create bucket"

4. **Verify the Bucket**
   - The bucket should now appear in your Storage list
   - Test upload by trying to save a prompt with images

### Option 2: Create Bucket via SQL (Alternative)

If you want to create the bucket programmatically, add this to your migrations:

```sql
-- Create the prompts-pic storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prompts-pic',
  'prompts-pic',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
```

Then run this SQL in your Supabase SQL Editor.

### Option 3: Create Migration File

Create a new migration file to handle bucket creation:

**File:** `migrations/0002_create_prompts_pic_bucket.sql`

```sql
-- Create the prompts-pic storage bucket for prompt library images
-- This bucket will store both input images and generated images

-- Insert the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prompts-pic',
  'prompts-pic',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
```

## After Creating the Bucket

### 1. Verify Policies are Applied

Make sure you've run the storage policies migration:
- Run the SQL from `migrations/0002_storage_policies_prompts_pic.sql` in Supabase SQL Editor

### 2. Test the Upload

1. Sign in to your app
2. Go to Prompt Library
3. Click "Add Prompt"
4. Fill in the details
5. Upload at least one image (input or output)
6. Click "Save Prompt"
7. Check if the upload succeeds

### 3. Check Browser Console

If you still get errors, open the browser console (F12) and look for detailed error messages. Common issues:

- **"FetchError: request to ... failed"** - Bucket doesn't exist
- **"new row violates row-level security policy"** - Check policies
- **"permission denied for table storage.objects"** - Policy not applied correctly
- **"413 Payload Too Large"** - File size exceeds limit

## Folder Structure in Bucket

After successful upload, the bucket structure will be:

```
prompts-pic/
└── prompt-library/
    └── {user_id}/
        ├── {timestamp}_input_0.jpg
        ├── {timestamp}_input_1.jpg
        ├── {timestamp}_output_0.png
        └── {timestamp}_output_1.png
```

## Verification Steps

### Check if Bucket Exists

Run this in your Supabase SQL Editor:

```sql
SELECT * FROM storage.buckets WHERE id = 'prompts-pic';
```

Expected result: One row with the bucket details

### Check Storage Policies

Run this in your Supabase SQL Editor:

```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%prompts-pic%';
```

Expected result: Four policies (read, insert, update, delete)

## Troubleshooting

### Issue: "Bucket not found"
**Solution:** Create the bucket following Option 1 above

### Issue: "Not allowed to upload to this path"
**Solution:** Check that:
1. User is authenticated
2. File path uses correct format: `prompt-library/{user_id}/{filename}`
3. Storage policies are applied

### Issue: "Public URL returns 404"
**Solution:** 
1. Ensure bucket is marked as public
2. Check that the file was actually uploaded
3. Verify the public URL format

### Issue: "File size too large"
**Solution:** 
1. Check bucket file size limit
2. Update `maxSizeMB` prop in ImageUploadModal if needed
3. Adjust bucket settings in Supabase dashboard

## Additional Notes

- The bucket must be **public** for public URLs to work
- Files are organized by user ID to prevent conflicts
- Timestamps are used in filenames to ensure uniqueness
- Both input and output images are stored in the same bucket but tagged differently in the database

## Quick Fix Checklist

- [ ] Create `prompts-pic` bucket in Supabase Dashboard
- [ ] Mark bucket as public
- [ ] Set file size limit to at least 5MB
- [ ] Run storage policies migration
- [ ] Test upload with a small image
- [ ] Check browser console for any remaining errors
- [ ] Verify public URL works

After completing these steps, the 404 error should be resolved and images should save successfully!
