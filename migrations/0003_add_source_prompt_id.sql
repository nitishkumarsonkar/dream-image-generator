-- Add source_prompt_id to prompt_library to link library items to their source generation
ALTER TABLE prompt_library 
ADD COLUMN source_prompt_id UUID REFERENCES prompt(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_prompt_library_source_prompt_id ON prompt_library(source_prompt_id);

-- Update RLS policies to allow users to view library items with source prompts
-- (This leverages existing policies since we're just adding a nullable reference)
