# Architecture Diagram - Chat Persistence & History

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    chat/page.tsx                          │  │
│  │                                                            │  │
│  │  State:                                                    │  │
│  │  • messages: Message[]                                     │  │
│  │  • sessionId: string (UUID)                                │  │
│  │  • finalPrompt: string                                     │  │
│  │  • isLoading: boolean                                      │  │
│  │                                                            │  │
│  │  LocalStorage:                                             │  │
│  │  • chat_current_session_id                                 │  │
│  │  • chat_current_messages                                   │  │
│  │  • chat_current_final_prompt                               │  │
│  │                                                            │  │
│  │  ┌──────────────────┐    ┌──────────────────┐           │  │
│  │  │   New Chat Btn   │    │  ChatHistory     │           │  │
│  │  │  handleNewChat() │    │   Component      │           │  │
│  │  └──────────────────┘    └──────────────────┘           │  │
│  │          │                        │                       │  │
│  │          │                        │                       │  │
│  │          ▼                        ▼                       │  │
│  │  ┌─────────────────────────────────────────────┐        │  │
│  │  │         Message Display Area                 │        │  │
│  │  │  • User messages (blue, right-aligned)       │        │  │
│  │  │  • Model messages (gray, left-aligned)       │        │  │
│  │  │  • Auto-scroll to bottom                     │        │  │
│  │  └─────────────────────────────────────────────┘        │  │
│  │                                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Requests
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Routes (Next.js)                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /api/chat (POST)                                         │  │
│  │  • Accepts: { message, sessionId }                        │  │
│  │  • Calls Gemini AI API                                    │  │
│  │  • Saves user message to DB                               │  │
│  │  • Saves AI response to DB                                │  │
│  │  • Creates/updates session record                         │  │
│  │  • Returns: { response, sessionId }                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /api/chat/sessions (GET, POST, DELETE)                  │  │
│  │  • GET: List all user's sessions                          │  │
│  │  • POST: Create/update session                            │  │
│  │  • DELETE: Remove session + messages                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /api/chat/sessions/[sessionId] (GET)                    │  │
│  │  • Load specific session with all messages                │  │
│  │  • Returns: { session, messages }                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Supabase Client
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Database (Supabase PostgreSQL)                 │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  chat_sessions                                            │  │
│  │  ├── id (UUID, PK)              [indexed]                │  │
│  │  ├── user_id (UUID, FK)         [indexed, RLS]           │  │
│  │  ├── title (TEXT)                                         │  │
│  │  ├── final_prompt (TEXT)                                  │  │
│  │  ├── created_at (TIMESTAMPTZ)                             │  │
│  │  └── updated_at (TIMESTAMPTZ)   [indexed, auto-update]   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                       │                                          │
│                       │ One-to-Many                              │
│                       │                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  chat_messages                                            │  │
│  │  ├── id (UUID, PK)                                        │  │
│  │  ├── session_id (UUID, FK) ──→ chat_sessions.id          │  │
│  │  ├── user_id (UUID, FK)         [indexed, RLS]           │  │
│  │  ├── role ('user' | 'model')                              │  │
│  │  ├── content (TEXT)                                       │  │
│  │  └── created_at (TIMESTAMPTZ)   [indexed]                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  RLS Policies:                                                   │
│  • Users can only access their own data                         │
│  • Enforced at database level                                   │
│  • Applies to both tables                                       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Starting a New Conversation

```
User opens /chat
       │
       ▼
Check localStorage
       │
       ├─── Found? ──► Restore session
       │                    │
       │                    ▼
       │              Show old messages
       │
       └─── Not found? ──► Create new UUID
                            │
                            ▼
                     Start fresh chat
```

### 2. Sending a Message

```
User types message
       │
       ▼
Add to messages state
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
Save to localStorage    POST /api/chat
       │                      │
       │                      ├──► Save to chat_messages
       │                      │
       │                      ├──► Call Gemini AI
       │                      │
       │                      ├──► Save AI response to chat_messages
       │                      │
       │                      └──► Create/update chat_sessions
       │
       ▼
Update UI immediately
```

### 3. Loading History

```
User clicks history toggle
       │
       ▼
GET /api/chat/sessions
       │
       ▼
Fetch user's sessions (sorted by updated_at)
       │
       ▼
Display in sidebar
       │
       ├──► User clicks session
       │           │
       │           ▼
       │    Save current session
       │           │
       │           ▼
       │    GET /api/chat/sessions/[id]
       │           │
       │           ▼
       │    Load messages
       │           │
       │           ▼
       │    Update state + localStorage
       │
       └──► User clicks delete
                   │
                   ▼
            Confirm dialog
                   │
                   ▼
            DELETE /api/chat/sessions?sessionId=...
                   │
                   ▼
            Remove from UI
```

### 4. Starting New Chat

```
User clicks "New Chat"
       │
       ▼
Has current messages?
       │
       ├─── Yes ──► Save current session
       │                 │
       │                 ▼
       │            POST /api/chat/sessions
       │                 │
       │                 └──► Store in database
       │
       └─── No ──► Skip save
       │
       ▼
Clear state (messages, finalPrompt)
       │
       ▼
Generate new UUID
       │
       ▼
Clear localStorage
       │
       ▼
Fresh chat ready
```

## Component Hierarchy

```
AuthGuard
  │
  ├── ChatHistory (sidebar)
  │     │
  │     ├── Toggle Button (fixed position)
  │     │
  │     ├── Sidebar Panel
  │     │     │
  │     │     ├── Header
  │     │     │     └── Title + Session count
  │     │     │
  │     │     ├── Sessions List
  │     │     │     │
  │     │     │     └── Session Item (foreach)
  │     │     │           ├── Title
  │     │     │           ├── Date
  │     │     │           └── Delete Button
  │     │     │
  │     │     └── Refresh Button
  │     │
  │     └── Mobile Overlay
  │
  └── Chat Page
        │
        ├── Header
        │     ├── Title
        │     └── New Chat Button
        │
        ├── Messages Area
        │     │
        │     └── Message (foreach)
        │           ├── User Message (blue)
        │           └── Model Message (gray)
        │
        ├── Final Prompt Display (conditional)
        │     ├── Prompt Text
        │     ├── Generate Image Button
        │     └── Start Over Button
        │
        └── Input Area (conditional)
              ├── Textarea
              └── Send Button
```

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                    React State                           │
│  • messages: Message[]                                   │
│  • sessionId: string                                     │
│  • finalPrompt: string                                   │
│  • isLoading: boolean                                    │
│  • input: string                                         │
└─────────────────────────────────────────────────────────┘
       │                    ▲
       │ useEffect          │ setState
       ▼                    │
┌─────────────────────────────────────────────────────────┐
│                  Browser localStorage                    │
│  • chat_current_session_id: string                       │
│  • chat_current_messages: JSON                           │
│  • chat_current_final_prompt: string                     │
└─────────────────────────────────────────────────────────┘
       │                    ▲
       │ API calls          │ API responses
       ▼                    │
┌─────────────────────────────────────────────────────────┐
│              Supabase Database                           │
│  • chat_sessions (permanent storage)                     │
│  • chat_messages (permanent storage)                     │
└─────────────────────────────────────────────────────────┘
```

## Key Design Decisions

### Why localStorage for current session?
✅ **Instant restoration** - No API call needed on page load
✅ **Works offline** - User can continue chatting without internet
✅ **Reduces API calls** - Don't need to fetch current session every time
✅ **Better UX** - Immediate feedback, no loading states

### Why database for history?
✅ **Persistent** - Survives browser data clearing
✅ **Multi-device** - Access from any device
✅ **Searchable** - Can implement search features later
✅ **Shareable** - Could add sharing features
✅ **Secure** - Protected by RLS policies

### Why dual storage?
- **Current session**: Speed and offline capability (localStorage)
- **History**: Persistence and accessibility (database)
- **Best of both worlds**: Fast UX + reliable storage

### Session creation timing
- **On first message** - Don't create empty sessions
- **Auto-save** - No explicit "save" button needed
- **Lazy creation** - Only when needed

## Security Model

```
Client Request
      │
      ▼
API Route (Next.js)
      │
      ├──► Check authentication
      │     │
      │     └─── Not authenticated? → 401 Unauthorized
      │
      ▼
Supabase Client
      │
      ├──► User credentials included
      │
      ▼
PostgreSQL Database
      │
      ├──► RLS Policy Check
      │     │
      │     ├─── user_id matches auth.uid()? → Allow
      │     │
      │     └─── user_id doesn't match? → Deny (403)
      │
      ▼
Return Data (only user's own data)
```

---

This architecture ensures:
- ✅ Fast, responsive UI
- ✅ Reliable data persistence
- ✅ Secure, user-specific data
- ✅ Scalable design
- ✅ Offline capability
- ✅ Easy to extend
