# 🚨 QUICK FIX: Storage Bucket 404 Error

## The Problem
Getting 404 error when uploading images to prompt library because the `prompts-pic` storage bucket doesn't exist.

## The Solution (Choose One)

### ⚡ FASTEST: Via Supabase Dashboard (2 minutes)

1. Go to https://supabase.com/dashboard → Your Project
2. Click **Storage** in sidebar
3. Click **"New bucket"** button
4. Configure:
   - **Name:** `prompts-pic`
   - **Public:** ✅ YES (check the box)
   - **File size limit:** `5` MB
   - Click **"Create bucket"**
5. Done! Test your upload now.

### 📝 Via SQL Editor

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy and paste the entire contents of:
   ```
   migrations/0002_create_prompts_pic_bucket_and_policies.sql
   ```
3. Click **"Run"**
4. Done! Test your upload now.

## Verify It Works

After creating the bucket:

1. **Check in Supabase Dashboard:**
   - Go to Storage
   - You should see `prompts-pic` in the list
   - It should show as **Public**

2. **Test the Upload:**
   - Sign in to your app
   - Go to Prompt Library page
   - Click "Add Prompt"
   - Upload an image
   - Click "Save"
   - Should succeed without 404 error!

3. **Check the Files:**
   - Go back to Supabase → Storage → `prompts-pic`
   - You should see: `prompt-library/{your-user-id}/` folder
   - Inside: Your uploaded images

## Still Having Issues?

Check browser console (F12) for specific error messages:

- **"Bucket not found"** → Bucket not created, follow steps above
- **"new row violates row-level security"** → Run the policies SQL
- **"Not authenticated"** → Make sure you're signed in
- **"Path not allowed"** → Check file path uses `prompt-library/{user_id}/` format

## What Gets Created

**Bucket Structure:**
```
prompts-pic/               ← Your storage bucket
└── prompt-library/        ← App folder
    └── {user-id}/         ← User's folder (auto-created)
        ├── 1234_input_0.jpg
        ├── 1234_input_1.jpg
        ├── 1234_output_0.png
        └── 1234_output_1.png
```

**Policies:**
- ✅ Anyone can READ (public bucket)
- ✅ Authenticated users can UPLOAD to their own folder
- ✅ Users can DELETE/UPDATE only their own files

---

**Need Help?** Check the detailed guide in `FIX_404_STORAGE_BUCKET.md`
