# Quick Setup Guide - Chat Persistence & History

## 🚀 Quick Start (5 minutes)

### Step 1: Apply Database Migration
Run the SQL migration to create the `chat_sessions` table:

```bash
# If using Supabase CLI
supabase db push
```

**OR** manually in Supabase Dashboard:
1. Go to SQL Editor in your Supabase project
2. Copy the contents of `migrations/0006_add_chat_sessions_table.sql`
3. Paste and run the SQL

### Step 2: Verify Installation
Check that everything is working:

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the chat page:**
   - Go to `http://localhost:3000/chat`
   - You should see a "New Chat" button in the top-right
   - You should see a toggle button on the left side for history

3. **Test conversation persistence:**
   - Send a few messages in the chat
   - Navigate to another page (e.g., `/history`)
   - Come back to `/chat`
   - ✅ Your conversation should still be there!

4. **Test history sidebar:**
   - Click the toggle button on the left
   - Sidebar should open showing "Chat History"
   - Start a new chat (click "New Chat")
   - Open sidebar again
   - ✅ You should see your previous conversation listed

### Step 3: Test Full Workflow

1. **Create a conversation:**
   - Send: "I want to create a sunset image"
   - Wait for AI response
   - Continue the conversation

2. **Start a new chat:**
   - Click "New Chat" button
   - ✅ Screen should clear
   - ✅ Old conversation saved automatically

3. **Browse history:**
   - Click the toggle button (left side)
   - ✅ See your previous conversation listed
   - Click on it
   - ✅ It should load completely

4. **Test refresh:**
   - With a conversation visible, refresh the page (F5 or Cmd+R)
   - ✅ Conversation should still be there

5. **Test delete:**
   - Open history sidebar
   - Hover over a conversation
   - Click the delete icon (trash can)
   - Confirm deletion
   - ✅ Conversation should be removed

## 📋 What Was Implemented

### Features
✅ Current conversation persists across page navigation  
✅ Current conversation survives browser refresh  
✅ All conversations saved per user in database  
✅ Collapsible history sidebar with toggle button  
✅ Load any previous conversation  
✅ Delete conversations (with confirmation)  
✅ "New Chat" button to start fresh  
✅ Auto-save on first message  
✅ Smart title generation from first message  
✅ Responsive design (mobile-friendly)  
✅ Dark mode support  

### Files Created
- `migrations/0006_add_chat_sessions_table.sql` - Database schema
- `src/app/api/chat/sessions/route.ts` - Session management API
- `src/app/api/chat/sessions/[sessionId]/route.ts` - Load session API
- `src/components/ChatHistory.tsx` - History sidebar component
- `CHAT_PERSISTENCE_IMPLEMENTATION.md` - Detailed documentation
- `CHAT_SETUP_QUICK.md` - This file

### Files Modified
- `src/app/chat/page.tsx` - Added persistence logic
- `src/app/api/chat/route.ts` - Auto-create sessions
- `src/types/chat.ts` - Updated types

## 🔍 How It Works

### Current Session Persistence
- Uses browser **localStorage** to save current conversation
- Automatically saves after each message
- Restores on page load if found
- Only cleared when user clicks "New Chat" or refreshes app

### History Storage
- Uses **Supabase database** for long-term storage
- Each conversation is a "session" with metadata
- Sessions contain multiple messages
- User-specific (requires authentication)
- Can be accessed from any device

### Data Flow
```
User sends message
  ↓
Saved to localStorage (instant)
  ↓
Sent to API
  ↓
Saved to database (chat_messages + chat_sessions)
  ↓
AI responds
  ↓
Response saved to localStorage + database
```

## 🐛 Troubleshooting

### History sidebar not showing
- Make sure you're logged in (authentication required)
- Check browser console for errors
- Verify database migration was applied successfully

### Conversation not persisting
- Check if localStorage is enabled in browser
- Try opening browser dev tools → Application → Local Storage
- Look for keys: `chat_current_session_id`, `chat_current_messages`

### Can't load old conversations
- Check network tab for failed API calls
- Verify Supabase connection is working
- Check if RLS policies are enabled (they should be)

### Messages not saving to database
- Open Supabase Dashboard → Table Editor → `chat_messages`
- Check if messages are being inserted
- Look for error messages in server console

## 📱 Mobile Considerations

The implementation is fully responsive:
- History sidebar slides in/out smoothly
- Overlay on mobile when sidebar is open (tap outside to close)
- Touch-friendly buttons and hit areas
- Adapts to different screen sizes

## 🔒 Security Notes

- All data is user-specific (enforced by Row Level Security)
- Users can only see/modify their own conversations
- Authentication required for all operations
- Session IDs are UUIDs (not predictable)

## 📊 Database Structure

```
chat_sessions (new table)
├── id (UUID, PK)
├── user_id (UUID, FK to auth.users)
├── title (TEXT, from first message)
├── final_prompt (TEXT, optional)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ, auto-updated)

chat_messages (existing table)
├── id (UUID, PK)
├── session_id (UUID, FK to chat_sessions) ← references sessions
├── user_id (UUID, FK to auth.users)
├── role (TEXT: 'user' or 'model')
├── content (TEXT)
└── created_at (TIMESTAMPTZ)
```

## 🎉 Success!

If you can:
1. ✅ Send messages and see them persist after refresh
2. ✅ Open the history sidebar
3. ✅ Load an old conversation
4. ✅ Start a new chat and see old one in history
5. ✅ Delete a conversation

**Then everything is working correctly!** 🎊

## 📚 Need More Info?

See `CHAT_PERSISTENCE_IMPLEMENTATION.md` for:
- Detailed technical documentation
- API endpoint specifications
- Component architecture
- Type definitions
- Future enhancement ideas
- Complete testing checklist

## 💬 Questions?

Common questions:

**Q: Can I have the same conversation open in two tabs?**  
A: Each tab has its own localStorage, so they work independently. Changes in one tab won't affect the other until you manually load the session.

**Q: What happens if I lose internet connection?**  
A: Current conversation still works (localStorage), but won't save to database until connection is restored. History sidebar won't load new sessions.

**Q: Can I export my conversations?**  
A: Not yet, but this could be added as a future enhancement. For now, you can copy/paste from the chat interface.

**Q: How long are conversations stored?**  
A: Forever, until you delete them. There's no automatic cleanup.

**Q: Can I rename conversations?**  
A: Not currently, but this could be added. For now, the title is auto-generated from the first message.

---

**Happy chatting! 💬✨**
