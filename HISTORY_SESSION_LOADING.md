# History Session Loading - Implementation Summary

## Overview
Enhanced the Image Generation History sidebar to load complete generation sessions into the main view, similar to how the AI Chat history works. Users can now click any history item to view the full generation including prompt, input images, and generated outputs.

## Changes Made

### 1. Added "View All History" Button
**File**: `src/app/(home)/components/ImageGenerationHistory.tsx`

- Added a new button at the bottom of the sidebar (below Refresh button)
- Links to `/history` page to view complete history list
- Includes document icon for visual clarity
- Styled to match the existing button design

```tsx
<a href="/history" className="...">
  <svg>...</svg>
  View All History
</a>
```

### 2. Updated History Item Click Behavior
**File**: `src/app/(home)/components/ImageGenerationHistory.tsx`

**Before**: Clicking a history item only inserted the prompt text into the textarea

**After**: Clicking a history item loads the complete generation session

- Changed `onSelectPrompt` prop type from `(promptText: string)` to `(promptData: PromptHistoryItem)`
- Passes full prompt object including:
  - Prompt text
  - Input images
  - Output (generated) images
  - Metadata (id, created_at)

### 3. Added Session Loading Logic
**File**: `src/app/(home)/page.tsx`

Created new state and handler:

```typescript
// New state for loaded session
const [loadedSession, setLoadedSession] = useState<{
  promptText: string;
  inputImages: string[];
  outputImages: string[];
} | null>(null);

// New handler to load complete session
const handleLoadSession = (promptData: PromptHistoryItem) => {
  // Separates input and output images
  // Populates display with previous generation
  // Inserts prompt into textarea for editing
}
```

**Behavior**:
1. Extracts input and output images from `prompt_images` array
2. Sets `loadedSession` state with all data
3. Populates `generatedImages`, `submittedNotes`, `savedNotes`
4. Inserts prompt text into textarea via `presetAppend` mechanism
5. User can view the previous generation OR edit and regenerate

### 4. Updated Scrollable Component
**File**: `src/app/(home)/components/Scrollable.tsx`

Added display for input images from loaded sessions:

```tsx
{loadedSession && loadedSession.inputImages.length > 0 && (
  <div className="mt-6">
    <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg shadow-sm">
      <div className="mb-3 text-sm font-medium">
        Input Images ({loadedSession.inputImages.length})
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loadedSession.inputImages.map((imgUrl, idx) => (
          <img src={imgUrl} alt={`Input image ${idx + 1}`} />
        ))}
      </div>
    </div>
  </div>
)}
```

**Layout**:
- Input images displayed in a grid (2-4 columns based on screen size)
- Positioned above the generated images section
- Shows count badge
- Responsive design

### 5. Updated Types
**File**: `src/types/index.ts`

Extended `ScrollableProps` interface:

```typescript
export interface ScrollableProps {
  // ... existing props
  loadedSession?: {
    promptText: string;
    inputImages: string[];
    outputImages: string[];
  } | null;
}
```

## User Flow

### Before
1. User generates images
2. Images appear in main view
3. To reuse a prompt, must go to `/history` page
4. Click to insert prompt text only

### After
1. User generates images
2. Images appear in main view
3. Session is saved in history sidebar
4. **NEW**: Click any history item → Full session loads:
   - Prompt text shows in "Saved Prompt" section
   - Input images display in grid (if any)
   - Generated images display below
   - Prompt auto-fills in textarea
5. User can:
   - View the previous generation
   - Edit the prompt and regenerate
   - Start a new generation
6. **NEW**: Click "View All History" → Navigate to `/history` for complete list

## Visual Layout

### Loaded Session Display Order (Top to Bottom):
```
┌─────────────────────────────────────┐
│ Saved Prompt: "..."                 │
│ [Copy prompt] [Clear results]       │
├─────────────────────────────────────┤
│ Input Images (2)                    │
│ ┌────┐ ┌────┐                       │
│ │img1│ │img2│                       │
│ └────┘ └────┘                       │
├─────────────────────────────────────┤
│ Generated Image Preview             │
│ ┌──────────────────┐                │
│ │                  │                │
│ │  Output Image    │                │
│ │                  │                │
│ └──────────────────┘                │
│ [◀ Previous] [Next ▶]               │
│ [Copy] [Download]                   │
└─────────────────────────────────────┘
```

## Technical Details

### Data Structure
```typescript
interface PromptHistoryItem {
  id: string;
  prompt_text: string | null;
  created_at: string;
  prompt_images?: Array<{
    image_url: string;
    image_type: 'input' | 'output';
  }>;
}
```

### Image Separation Logic
```typescript
const inputImages = promptData.prompt_images
  ?.filter(img => img.image_type === 'input')
  .map(img => img.image_url) || [];

const outputImages = promptData.prompt_images
  ?.filter(img => img.image_type === 'output')
  .map(img => img.image_url) || [];
```

### State Management
- `loadedSession`: Stores current loaded session data
- Cleared when user clicks "Clear results"
- Persists until new generation or clear action
- Independent of current form state

## Features

### History Sidebar
✅ Shows recent generations with thumbnails  
✅ Click to load complete session  
✅ Delete individual items  
✅ Refresh to reload  
✅ "View All History" button links to full history page  
✅ Collapsible toggle

### Session Display
✅ Shows prompt text  
✅ Displays input images in grid  
✅ Displays generated output images  
✅ Prompt auto-fills in textarea  
✅ Copy and clear buttons  
✅ Responsive layout

### User Experience
✅ Similar to AI Chat session loading  
✅ Quick access to previous generations  
✅ Easy to regenerate with modifications  
✅ Visual separation of input vs output  
✅ Smooth transitions

## Database Schema Used

No changes to database schema. Uses existing tables:

```sql
-- Main prompt table
prompt (
  id,
  user_id,
  prompt_text,
  created_at
)

-- Related images table
prompt_images (
  id,
  prompt_id,
  image_url,
  image_type -- 'input' or 'output'
)
```

## Styling

### Input Images Grid
- **Desktop (lg)**: 4 columns
- **Tablet (md)**: 3 columns
- **Mobile**: 2 columns
- Image height: 128px (h-32)
- Object-fit: cover
- Rounded corners with overflow hidden

### View All History Button
- Full width
- Icon + text layout
- Border style matching Refresh button
- Hover states for feedback

## Testing Checklist

- [ ] Click history item loads complete session
- [ ] Input images display correctly in grid
- [ ] Output images display below input images
- [ ] Prompt text appears in saved prompt section
- [ ] Prompt auto-fills in textarea
- [ ] "View All History" button navigates to /history
- [ ] Clear results clears loaded session
- [ ] Responsive layout works on mobile
- [ ] Multiple input images display in grid
- [ ] No input images doesn't show section
- [ ] Session persists until cleared
- [ ] Can edit and regenerate from loaded session

## Benefits

### For Users
🎯 Quick access to previous generations  
🔄 Easy to iterate on prompts  
👁️ Visual reminder of input images used  
📊 Complete context at a glance  
🚀 Faster workflow

### For Developers
🧩 Consistent with chat history pattern  
📦 Reuses existing data structures  
🔧 Easy to maintain  
🎨 Follows existing design system  
✅ Type-safe implementation

## Next Steps (Optional Enhancements)

1. **Add Edit Mode**: Allow editing prompt directly in loaded session
2. **Compare Generations**: Show diff between original and new generation
3. **Session Metadata**: Display aspect ratio, preset used, timestamp
4. **Batch Operations**: Load multiple sessions for comparison
5. **Session Sharing**: Generate shareable link for loaded session
6. **Session Favorites**: Pin important generations
7. **Session Tags**: Categorize generations
8. **Advanced Filters**: Filter by date, preset, input count

## Files Modified

### Modified (5 files):
1. `src/app/(home)/components/ImageGenerationHistory.tsx` - Added button, updated click handler
2. `src/app/(home)/page.tsx` - Added session loading logic
3. `src/app/(home)/components/Scrollable.tsx` - Display input images
4. `src/types/index.ts` - Updated prop types
5. No new files created

## Compatibility

- ✅ Backward compatible
- ✅ No breaking changes
- ✅ Works with existing database
- ✅ No migration needed
- ✅ All existing features preserved

---

**Implementation Date**: October 12, 2025  
**Status**: ✅ Complete - Ready for Testing  
**Pattern**: Similar to AI Chat History  
**Impact**: Improved user workflow for iterating on prompts
