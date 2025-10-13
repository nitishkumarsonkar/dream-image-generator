# Chat Conversation Persistence & History Implementation

## Overview
This document describes the implementation of two key features for the chat interface:
1. **Current Conversation Persistence** - Keeps the current chat visible across page navigations
2. **User-Specific History Storage** - Stores and displays all past conversations per user

## Implementation Summary

### 1. Database Schema

#### Migration: `0006_add_chat_sessions_table.sql`
Created a new `chat_sessions` table to store conversation metadata:

**Table Structure:**
- `id` (UUID) - Primary key, matches the client-side session ID
- `user_id` (UUID) - Foreign key to auth.users
- `title` (TEXT) - Generated from first user message (max 50 chars)
- `final_prompt` (TEXT) - Stores the final generated prompt if conversation completes
- `created_at` (TIMESTAMPTZ) - Session creation timestamp
- `updated_at` (TIMESTAMPTZ) - Auto-updated on any change

**Features:**
- Row Level Security (RLS) enabled
- Automatic `updated_at` timestamp trigger
- Indexes on `user_id` and `updated_at` for fast queries
- Policies for CRUD operations (users can only access their own sessions)

**Relationship:**
- One-to-many with `chat_messages` (a session has many messages)
- Messages are cascade-deleted when a session is deleted

### 2. API Endpoints

#### `/api/chat/sessions` (GET, POST, DELETE)
**GET** - List all sessions for current user
- Returns: `{ sessions: ChatSession[] }`
- Sorted by `updated_at` descending (most recent first)

**POST** - Create or update a session
- Body: `{ sessionId, title?, finalPrompt? }`
- Upsert behavior: Updates if exists, creates if new
- Returns: `{ session: ChatSession }`

**DELETE** - Remove a session
- Query param: `?sessionId=<uuid>`
- Cascade deletes all associated messages
- Returns: `{ success: true }`

#### `/api/chat/sessions/[sessionId]` (GET)
**GET** - Load a specific session with all its messages
- Returns: `{ session: ChatSession, messages: ChatMessage[] }`
- Messages sorted by `created_at` ascending (chronological order)

#### `/api/chat` (Modified POST)
Enhanced to automatically create/update session records:
- On first message: Creates session with title from user's first message
- On subsequent messages: Updates `updated_at` timestamp
- Stores both user and model messages in `chat_messages` table

### 3. Frontend Components

#### `ChatHistory.tsx`
A collapsible sidebar component that displays conversation history:

**Features:**
- Toggle button (fixed position, left side)
- Lists all user's previous conversations
- Click to load a specific conversation
- Delete button (with confirmation) for each session
- Smart title generation:
  - Uses session title if available
  - Falls back to first 40 chars of final_prompt
  - Shows "Untitled conversation" as last resort
- Smart date formatting:
  - Today: Shows time (e.g., "3:45 PM")
  - This week: Shows day (e.g., "Mon")
  - Older: Shows date (e.g., "Dec 15")
- Refresh button to reload history
- Empty state with helpful message
- Responsive design with mobile overlay

**UI Pattern:**
- Similar to `SidebarPresets.tsx` for consistency
- Dark mode support
- Smooth animations and transitions
- Accessible (ARIA labels, keyboard navigation)

#### `chat/page.tsx` (Updated)
Enhanced with session persistence and history integration:

**State Management:**
```typescript
// LocalStorage keys
const STORAGE_KEY_SESSION_ID = 'chat_current_session_id';
const STORAGE_KEY_MESSAGES = 'chat_current_messages';
const STORAGE_KEY_FINAL_PROMPT = 'chat_current_final_prompt';
```

**Key Features:**

1. **Session Initialization**
   - On mount, checks localStorage for existing session
   - Restores session ID, messages, and final prompt if found
   - Creates new session UUID if none exists

2. **Auto-Persistence**
   - useEffect hook watches `[messages, sessionId, finalPrompt]`
   - Automatically saves to localStorage on any change
   - Ensures conversation survives page navigation/refresh

3. **New Chat Button**
   - Saves current session to database before clearing
   - Generates title from first user message
   - Clears state and localStorage
   - Creates fresh session UUID

4. **Load Session**
   - Saves current session first (if has messages)
   - Fetches selected session from API
   - Updates all state (sessionId, messages, finalPrompt)
   - Updates localStorage automatically via useEffect

5. **Delete Session**
   - If deleted session is current, starts new chat
   - Otherwise, just removes from history list

### 4. Type Definitions

Updated `types/chat.ts` with comprehensive interfaces:

```typescript
export interface ChatSession {
  id: string;
  user_id: string;
  title?: string | null;
  final_prompt?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionListResponse {
  sessions: ChatSession[];
}

export interface SessionMessagesResponse {
  session: ChatSession;
  messages: ChatMessage[];
}
```

## User Flow

### Starting a New Conversation
1. User navigates to `/chat` page
2. System checks localStorage for existing session
3. If none found, creates new session UUID
4. User starts chatting
5. Messages auto-save to both localStorage and database

### Continuing a Conversation
1. User navigates away from chat (e.g., to `/history`)
2. Returns to `/chat`
3. System restores session from localStorage
4. Previous messages reappear instantly
5. User continues chatting seamlessly

### Browsing History
1. User clicks toggle button (left side)
2. Sidebar opens showing all past conversations
3. User clicks on a conversation
4. Current session saves to database automatically
5. Selected session loads with all messages
6. User can continue that conversation or browse others

### Deleting Conversations
1. User hovers over a history item
2. Delete icon appears
3. User clicks delete and confirms
4. Conversation removed from database and UI
5. If it was the current session, new chat starts automatically

### Starting Fresh
1. User clicks "New Chat" button
2. Current conversation saves to database
3. Screen clears
4. New session UUID generated
5. User starts fresh conversation

## Technical Details

### Persistence Strategy
- **Short-term (current session)**: localStorage
  - Survives page navigation
  - Survives page refresh
  - Cleared only by user action (New Chat) or browser data clear
  
- **Long-term (history)**: Supabase database
  - Persists across devices/browsers
  - User-specific (requires authentication)
  - Can be deleted individually

### Session Management
- Sessions use UUID v4 for unique identification
- Same UUID used client-side and database-side
- Client generates UUID on session creation
- Database accepts client-provided UUID (not auto-generated)

### Data Consistency
- Messages saved to DB immediately after sending
- Sessions created on first message of conversation
- `updated_at` timestamp refreshed on each message
- Manual save triggered when switching sessions or starting new chat

### Performance Optimizations
- Database indexes on `user_id` and `updated_at`
- Messages fetched only when loading specific session
- Session list fetched once, can be manually refreshed
- LocalStorage for instant UI restoration (no API call on mount)

### Security
- Row Level Security (RLS) on both tables
- Users can only access their own data
- Authentication required for all endpoints
- Policies enforce user_id matching at database level

## Future Enhancements

Potential improvements to consider:
1. **Search** - Add search functionality to history sidebar
2. **Folders/Tags** - Organize conversations by category
3. **Export** - Download conversations as JSON/PDF
4. **Share** - Share conversations with other users
5. **Auto-title** - Use AI to generate better titles from conversation content
6. **Favorites** - Pin important conversations to top
7. **Archive** - Archive old conversations without deleting
8. **Offline Support** - Full offline mode with sync when online
9. **Real-time Sync** - Use Supabase real-time for multi-device sync

## Files Changed/Created

### Created
- `migrations/0006_add_chat_sessions_table.sql`
- `src/app/api/chat/sessions/route.ts`
- `src/app/api/chat/sessions/[sessionId]/route.ts`
- `src/components/ChatHistory.tsx`
- `CHAT_PERSISTENCE_IMPLEMENTATION.md` (this file)

### Modified
- `src/app/chat/page.tsx` - Added persistence and history integration
- `src/app/api/chat/route.ts` - Auto-create/update sessions
- `src/types/chat.ts` - Added session-related types

## Testing Checklist

- [ ] Create new conversation and verify it persists after page refresh
- [ ] Navigate to another page and back, verify conversation still visible
- [ ] Send multiple messages and verify all saved to database
- [ ] Click "New Chat" and verify old session saved to history
- [ ] Open history sidebar and verify all sessions listed
- [ ] Click on old session and verify it loads correctly
- [ ] Delete a session and verify it's removed
- [ ] Delete current session and verify new chat starts
- [ ] Test with multiple browser tabs (should work independently)
- [ ] Test dark mode compatibility
- [ ] Test mobile responsive design
- [ ] Test with no internet (localStorage should still work)

## Migration Instructions

To apply this implementation to your database:

1. **Run the migration:**
   ```bash
   # Apply the migration to your Supabase instance
   # Option 1: Using Supabase CLI
   supabase db push

   # Option 2: Manually in Supabase Dashboard
   # - Go to SQL Editor
   # - Copy contents of migrations/0006_add_chat_sessions_table.sql
   # - Run the SQL
   ```

2. **Verify tables:**
   ```sql
   -- Check if table exists
   SELECT * FROM chat_sessions LIMIT 1;
   
   -- Verify RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'chat_sessions';
   ```

3. **Test the feature:**
   - Start a new conversation
   - Refresh the page
   - Open history sidebar
   - Load an old conversation

## Troubleshooting

### Conversation not persisting after refresh
- Check browser console for localStorage errors
- Verify localStorage is not disabled in browser settings
- Check if private/incognito mode is being used (may clear on close)

### History not loading
- Check Supabase logs for database errors
- Verify user is authenticated
- Check RLS policies are enabled and correct
- Verify API routes are accessible (no 401/403 errors)

### Session not saving to database
- Check network tab for failed API calls
- Verify Supabase connection is working
- Check for duplicate session ID errors (should be ignored)
- Verify user has permission to insert into chat_sessions

### Messages missing when loading session
- Verify session_id matches between chat_sessions and chat_messages
- Check that messages were actually saved (check database directly)
- Verify query is using correct user_id
- Check for foreign key constraint errors
