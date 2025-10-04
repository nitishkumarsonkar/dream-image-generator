-- Storage RLS policies for prompts-pic bucket
-- Allows:
--  - Public read of any object in bucket prompts-pic (public URLs will also work regardless)
--  - Authenticated users to insert/update/delete only within their own folder prefix: {userId}/...

-- Ensure storage RLS is enabled (it is by default on storage.objects)
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

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

-- INSERT: Only owners can write into their own userId-prefixed folders within prompts-pic
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'User insert own folder prompts-pic'
  ) THEN
    CREATE POLICY "User insert own folder prompts-pic" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'prompts-pic'
        AND (
          position((auth.uid())::text || '/' in name) = 1
          OR name LIKE (auth.uid())::text || '/%'
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
        AND (
          position((auth.uid())::text || '/' in name) = 1
          OR name LIKE (auth.uid())::text || '/%'
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
        AND (
          position((auth.uid())::text || '/' in name) = 1
          OR name LIKE (auth.uid())::text || '/%'
        )
      );
  END IF;
END $$;


