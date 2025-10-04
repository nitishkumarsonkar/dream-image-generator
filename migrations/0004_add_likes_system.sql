-- Add like_count column to prompt_library table
ALTER TABLE prompt_library 
ADD COLUMN like_count INT NOT NULL DEFAULT 0;

-- Create prompt_library_likes table for tracking user likes
CREATE TABLE IF NOT EXISTS prompt_library_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt_library_id UUID REFERENCES prompt_library(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_library_id)
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_prompt_library_likes_user_id ON prompt_library_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_library_likes_prompt_library_id ON prompt_library_likes(prompt_library_id);

-- Enable Row Level Security
ALTER TABLE prompt_library_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prompt_library_likes table
-- Users can view their own likes
CREATE POLICY "Users can view their own likes" ON prompt_library_likes
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own likes
CREATE POLICY "Users can insert their own likes" ON prompt_library_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes" ON prompt_library_likes
  FOR DELETE USING (auth.uid() = user_id);
