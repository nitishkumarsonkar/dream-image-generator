-- =====================================================
-- RUN THIS SQL IN YOUR SUPABASE SQL EDITOR
-- =====================================================
-- This creates the user_presets table for advanced presets system
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/editor
-- Copy and paste this entire file and click "Run"

-- Migration: Add user_presets table for custom detailed presets
-- This allows users to create and save detailed, reusable image generation templates

CREATE TABLE IF NOT EXISTS user_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic preset info
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- e.g., 'youtube_thumbnail', 'instagram_post', 'product_photo', 'custom'
  is_favorite BOOLEAN DEFAULT false,
  
  -- Image specifications
  aspect_ratio VARCHAR(10) NOT NULL DEFAULT '16:9',
  width INTEGER NOT NULL DEFAULT 1920,
  height INTEGER NOT NULL DEFAULT 1080,
  
  -- Detailed preset configuration (JSONB for flexibility)
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Generated prompt template (auto-generated from config)
  generated_prompt TEXT,
  
  -- Metadata
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_aspect_ratio CHECK (aspect_ratio IN ('1:1', '4:5', '16:9', '9:16', '3:2', '2:3', '21:9')),
  CONSTRAINT valid_dimensions CHECK (width > 0 AND height > 0 AND width <= 4096 AND height <= 4096)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_presets_user_id ON user_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presets_category ON user_presets(category);
CREATE INDEX IF NOT EXISTS idx_user_presets_is_favorite ON user_presets(user_id, is_favorite);
CREATE INDEX IF NOT EXISTS idx_user_presets_created_at ON user_presets(created_at DESC);

-- RLS Policies
ALTER TABLE user_presets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can view their own presets" ON user_presets;
DROP POLICY IF EXISTS "Users can create their own presets" ON user_presets;
DROP POLICY IF EXISTS "Users can update their own presets" ON user_presets;
DROP POLICY IF EXISTS "Users can delete their own presets" ON user_presets;

-- Users can only see their own presets
CREATE POLICY "Users can view their own presets"
  ON user_presets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own presets
CREATE POLICY "Users can create their own presets"
  ON user_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own presets
CREATE POLICY "Users can update their own presets"
  ON user_presets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own presets
CREATE POLICY "Users can delete their own presets"
  ON user_presets FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_presets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_presets_updated_at ON user_presets;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_presets_updated_at
  BEFORE UPDATE ON user_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_presets_updated_at();

-- Add comments for documentation
COMMENT ON TABLE user_presets IS 'Stores user-created advanced presets for image generation';
COMMENT ON COLUMN user_presets.category IS 'Preset categories: youtube_thumbnail, instagram_post, instagram_story, product_photo, portrait, landscape, logo, banner, ad_creative, book_cover, custom';
COMMENT ON COLUMN user_presets.config IS 'JSONB configuration for preset components. Structure varies by category but follows component-based approach (subject, title, background, effects, style, etc.)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully! The user_presets table has been created.';
END $$;
