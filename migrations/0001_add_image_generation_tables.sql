
-- Create the main table for tracking image generation events
CREATE TABLE IF NOT EXISTS prompt (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Create a table to store all images related to a generation (both inputs and outputs)
CREATE TABLE IF NOT EXISTS prompt_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES prompt(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('input', 'output')), -- Type constraint
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for the new tables
ALTER TABLE prompt ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_images ENABLE ROW LEVEL SECURITY;

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompt_user_id ON prompt(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_images_prompt_id ON prompt_images(prompt_id);

-- RLS Policies for prompt table
CREATE POLICY "Users can view their own prompt" ON prompt
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prompt" ON prompt
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompt" ON prompt
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompt" ON prompt
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for prompt_images table
-- Users can access images if they own the parent prompt record
CREATE POLICY "Users can view their own prompt images" ON prompt_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM prompt
      WHERE prompt.id = prompt_images.prompt_id
        AND prompt.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own prompt images" ON prompt_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM prompt
      WHERE prompt.id = prompt_images.prompt_id
        AND prompt.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own prompt images" ON prompt_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM prompt
      WHERE prompt.id = prompt_images.prompt_id
        AND prompt.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own prompt images" ON prompt_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1
      FROM prompt
      WHERE prompt.id = prompt_images.prompt_id
        AND prompt.user_id = auth.uid()
    )
  );
