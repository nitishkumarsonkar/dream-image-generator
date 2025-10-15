# Storage Bucket Setup - Visual Guide

## 🎯 The Issue

```
Your App
    ↓ (tries to upload image)
    ↓
Supabase Storage
    ↓
❌ 404 Error: Bucket "prompts-pic" not found!
```

## ✅ The Fix

### Step 1: Create the Bucket

**Supabase Dashboard → Storage → New Bucket**

```
┌─────────────────────────────────────┐
│  Create a new bucket                │
├─────────────────────────────────────┤
│  Name: prompts-pic                  │
│  Public: [✓] Yes                    │
│  File size limit: 5 MB              │
│  Allowed MIME types: (leave empty)  │
│                                     │
│  [Cancel]  [Create bucket]          │
└─────────────────────────────────────┘
```

### Step 2: Verify Bucket Exists

**Supabase Dashboard → Storage**

```
📦 Storage Buckets
├── 📁 prompts-pic     [Public] ← You should see this!
└── 📁 (other buckets)
```

### Step 3: Test Upload Flow

```
User fills form
    ↓
Clicks "Save Prompt"
    ↓
App uploads files to:
  prompts-pic/prompt-library/{user-id}/timestamp_input_0.jpg
    ↓
✅ Success! Image saved
    ↓
Image URL returned:
  https://your-project.supabase.co/storage/v1/object/public/prompts-pic/...
    ↓
Image displayed in prompt library
```

## 📊 Bucket Structure After Upload

```
prompts-pic/                          ← Storage bucket (PUBLIC)
│
└── prompt-library/                   ← Application folder
    │
    ├── abc123-user-id/              ← User 1's folder
    │   ├── 1697200000_input_0.jpg
    │   ├── 1697200000_input_1.png
    │   └── 1697200000_output_0.jpg
    │
    ├── def456-user-id/              ← User 2's folder
    │   ├── 1697201000_input_0.jpg
    │   └── 1697201000_output_0.png
    │
    └── xyz789-user-id/              ← User 3's folder
        └── 1697202000_output_0.jpg
```

## 🔒 Security Policies

```
┌────────────────────────────────────────────────┐
│ Storage Policies for "prompts-pic"            │
├────────────────────────────────────────────────┤
│                                                │
│ READ:    Anyone (public access)               │
│          ✅ GET /storage/v1/object/public/... │
│                                                │
│ INSERT:  Only authenticated users             │
│          ✅ Upload to own folder only         │
│          ❌ Can't upload to others' folders   │
│                                                │
│ UPDATE:  Only file owners                     │
│          ✅ Update own files only             │
│                                                │
│ DELETE:  Only file owners                     │
│          ✅ Delete own files only             │
│                                                │
└────────────────────────────────────────────────┘
```

## 🔍 How to Verify Everything Works

### 1. Check Bucket Exists (SQL)

```sql
SELECT * FROM storage.buckets WHERE id = 'prompts-pic';
```

**Expected Result:**
```
id          | name        | public | file_size_limit
------------|-------------|--------|----------------
prompts-pic | prompts-pic | true   | 5242880
```

### 2. Check Policies Exist (SQL)

```sql
SELECT policyname 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%prompts-pic%';
```

**Expected Result:**
```
policyname
----------------------------------
Public read prompts-pic
User insert own folder prompts-pic
User update own folder prompts-pic
User delete own folder prompts-pic
```

### 3. Test Upload in App

1. Open your app
2. Sign in
3. Go to Prompt Library
4. Click "Add Prompt"
5. Upload an image (input or output)
6. Click "Save Prompt"
7. ✅ Should save without errors!

### 4. View Uploaded Files

**Supabase Dashboard → Storage → prompts-pic**

```
📦 prompts-pic
└── 📁 prompt-library
    └── 📁 {your-user-id}
        ├── 🖼️ 1697200000_input_0.jpg
        └── 🖼️ 1697200000_output_0.png
```

## ⚠️ Common Issues & Solutions

### Issue: Still getting 404

**Cause:** Bucket not created properly  
**Fix:** Double-check bucket name is exactly `prompts-pic` (with hyphen, not underscore)

### Issue: "new row violates row-level security policy"

**Cause:** Storage policies not applied  
**Fix:** Run the SQL from `migrations/0002_create_prompts_pic_bucket_and_policies.sql`

### Issue: "Not allowed to upload to this path"

**Cause:** File path format incorrect or not authenticated  
**Fix:** 
- Make sure you're signed in
- Path must be: `prompt-library/{user_id}/{filename}`
- Check `user_id` matches authenticated user

### Issue: Image uploads but URL returns 404

**Cause:** Bucket not marked as public  
**Fix:** 
1. Go to Storage → prompts-pic
2. Click settings
3. Toggle "Public bucket" ON
4. Save

## 📚 Quick Reference

| Item | Value |
|------|-------|
| Bucket Name | `prompts-pic` |
| Public? | YES ✅ |
| Max File Size | 5 MB |
| Allowed Types | Images (jpg, png, gif, webp) |
| Path Format | `prompt-library/{user_id}/{timestamp}_{type}_{index}.{ext}` |
| Public URL | `https://{project}.supabase.co/storage/v1/object/public/prompts-pic/...` |

---

**🎉 After Setup:** Your prompt library will support image uploads with proper storage and public access!
