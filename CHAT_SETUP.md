# AI Chat Feature Setup

## Overview
The AI Chat feature (`/chat` page) provides a conversational interface where users can refine their initial image ideas into detailed, optimized prompts for image generation using Google's Gemini AI.

## Prerequisites

### 1. Google Gemini API Key
You need a Google Gemini API key to enable the AI chat functionality.

**How to get your API key:**
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on "Get API Key"
4. Create a new API key or use an existing one
5. Copy your API key

### 2. Environment Variables
Add the following to your `.env.local` file:

```bash
# Google Gemini API Configuration
GOOGLE_API_KEY=your_gemini_api_key_here

# Existing Supabase Configuration (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

## Database Setup

### Run Migration
Execute the migration to create the `chat_messages` table:

```sql
-- Run this in your Supabase SQL Editor
-- File: migrations/0005_add_chat_messages_table.sql

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'model')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own chat messages"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own chat messages"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);
```

### Verify Setup
1. Check that the `chat_messages` table exists in your Supabase project
2. Verify RLS policies are enabled
3. Test that authenticated users can insert and read their own messages

## Features

### Conversational AI
- **Intelligent questioning**: The AI asks follow-up questions to gather all necessary details
- **Context awareness**: Maintains conversation history throughout the session
- **Guided refinement**: Systematically collects information about:
  - Subject & Action
  - Art Style & Aesthetic
  - Technical Details (lighting, composition, quality)

### Final Prompt Generation
- When all information is gathered, the AI generates a comprehensive, optimized prompt
- The final prompt is prefixed with `FINAL_PROMPT:` marker
- Users can directly generate images using the refined prompt
- Option to start a new conversation for different ideas

### Session Management
- Each chat session gets a unique UUID
- Messages are persisted in Supabase for history
- Users can only access their own chat sessions (enforced by RLS)

## Usage

1. **Navigate to /chat**: Sign in if not already authenticated
2. **Describe your idea**: Start with a basic description of the image you want
3. **Answer questions**: The AI will ask clarifying questions about style, composition, etc.
4. **Get final prompt**: Once complete, the AI generates an optimized prompt
5. **Generate image**: Click "Generate Image" to use the prompt on the home page

## Architecture

### Frontend (`/app/chat/page.tsx`)
- Client-side React component with state management
- Handles user input and displays conversation
- Detects `FINAL_PROMPT:` marker and extracts the final prompt
- Protected by `AuthGuard` component

### Backend (`/app/api/chat/route.ts`)
- Next.js API route handler
- Integrates with Google Gemini AI
- Manages conversation history from Supabase
- Saves all messages to database with RLS enforcement

### System Instruction (`/lib/gemini-config.ts`)
- Defines the AI's behavior and persona
- Specifies mandatory fields to collect
- Enforces output format for final prompts

## Security

- **Authentication required**: Users must be signed in to use chat
- **Row Level Security**: Users can only access their own chat messages
- **Server-side validation**: All API calls verify user authentication
- **API key security**: Google API key stored server-side only

## Troubleshooting

### "Unauthorized" error
- Ensure user is signed in
- Check Supabase authentication is working
- Verify RLS policies are correctly set up

### "Failed to get response" error
- Verify `GOOGLE_API_KEY` is set in `.env.local`
- Check API key is valid and has quota remaining
- Review server logs for detailed error messages

### Messages not saving
- Check database connection
- Verify RLS policies allow INSERT for authenticated users
- Check browser console for error messages

## API Limits

Google Gemini has rate limits and quotas:
- Free tier: 60 requests per minute
- Consider implementing rate limiting for production use
- Monitor API usage in Google AI Studio

## Future Enhancements

Potential improvements:
- Stream responses for real-time chat experience
- Save and load past chat sessions
- Allow users to edit and regenerate prompts
- Add example prompts and templates
- Implement cost tracking and usage analytics
