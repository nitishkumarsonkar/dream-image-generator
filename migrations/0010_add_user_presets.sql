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
  -- Structure varies by category, but all follow a component-based approach
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Example config structure for YouTube Thumbnail:
  -- {
  --   "subject": {
  --     "type": "person|object|character|none",
  --     "description": "detailed subject description",
  --     "expression": "excited|serious|happy|angry|surprised|custom",
  --     "customExpression": "optional custom expression",
  --     "position": "center|left|right",
  --     "size": "large|medium|small"
  --   },
  --   "title": {
  --     "enabled": true,
  --     "text": "placeholder or actual text",
  --     "style": "bold|modern|retro|minimal",
  --     "color": "red|yellow|white|black|custom",
  --     "customColor": "#FF5733",
  --     "position": "top|center|bottom",
  --     "alignment": "left|center|right",
  --     "fontSize": "large|medium|small"
  --   },
  --   "background": {
  --     "type": "gradient|solid|pattern|image|blur",
  --     "style": "vibrant|dark|light|professional|gaming",
  --     "colors": ["#FF5733", "#3498DB"],
  --     "description": "additional background details"
  --   },
  --   "effects": {
  --     "blur": "none|subtle|heavy",
  --     "glow": "none|soft|strong",
  --     "vignette": false,
  --     "grain": false
  --   },
  --   "mood": "energetic|calm|mysterious|professional|playful",
  --   "style": "realistic|cartoon|3d|flat|painterly",
  --   "lighting": "dramatic|soft|bright|moody|natural"
  -- }
  
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

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_presets_updated_at
  BEFORE UPDATE ON user_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_presets_updated_at();

-- Add some example preset categories as comments for reference
COMMENT ON COLUMN user_presets.category IS 
'Preset categories: youtube_thumbnail, instagram_post, instagram_story, product_photo, portrait, landscape, logo, banner, ad_creative, book_cover, custom';

COMMENT ON COLUMN user_presets.config IS 
'JSONB configuration for preset components. Structure varies by category but follows component-based approach (subject, title, background, effects, style, etc.)';
