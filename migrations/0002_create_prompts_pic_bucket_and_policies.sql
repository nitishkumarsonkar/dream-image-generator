-- Create the prompts-pic storage bucket for prompt library images
-- This bucket will store both input images and generated images from the prompt library

-- Step 1: Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prompts-pic',
  'prompts-pic',
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Enable Row Level Security on sto rage.objects (should already be enabled)
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Create Storage Policies

-- READ: Allow anyone to read objects in prompts-pic bucket via API
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read prompts-pic'
  ) THEN
    CREATE POLICY "Public read prompts-pic" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'prompts-pic'
      );
  END IF;
END $$;

-- INSERT: Only authenticated users can upload into their own userId-prefixed folders within prompts-pic
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'User insert own folder prompts-pic'
  ) THEN
    CREATE POLICY "User insert own folder prompts-pic" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'prompts-pic'
        AND auth.role() = 'authenticated'
        AND (
          name LIKE 'prompt-library/' || (auth.uid())::text || '/%'
        )
      );
  END IF;
END $$;

-- UPDATE: Only owners can update within their own userId-prefixed folders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'User update own folder prompts-pic'
  ) THEN
    CREATE POLICY "User update own folder prompts-pic" ON storage.objects
      FOR UPDATE USING (
        bucket_id = 'prompts-pic'
        AND auth.role() = 'authenticated'
        AND (
          name LIKE 'prompt-library/' || (auth.uid())::text || '/%'
        )
      );
  END IF;
END $$;

-- DELETE: Only owners can delete within their own userId-prefixed folders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'User delete own folder prompts-pic'
  ) THEN
    CREATE POLICY "User delete own folder prompts-pic" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'prompts-pic'
        AND auth.role() = 'authenticated'
        AND (
          name LIKE 'prompt-library/' || (auth.uid())::text || '/%'
        )
      );
  END IF;
END $$;

-- Verification queries (optional, comment out if running as migration)
-- SELECT * FROM storage.buckets WHERE id = 'prompts-pic';
-- SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%prompts-pic%';
