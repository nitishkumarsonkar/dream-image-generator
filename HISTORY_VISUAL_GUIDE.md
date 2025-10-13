# History Session Loading - Visual Guide

## Feature Overview

### 1. History Sidebar Updates

```
┌─────────────────────────┐
│  Generation History     │
│  50 prompts             │
├─────────────────────────┤
│                         │
│  ┌────┐ Prompt text...  │  ← Click to load
│  │img │ 2h ago          │     complete session
│  └────┘                 │
│                         │
│  ┌────┐ Another prom... │
│  │img │ 1d ago          │
│  └────┘                 │
│                         │
├─────────────────────────┤
│  [Refresh History]      │
│  [📄 View All History]  │  ← NEW: Links to /history
└─────────────────────────┘
```

## 2. Session Loading Flow

### Step 1: Before Clicking History Item
```
Main Content Area:
┌─────────────────────────────────────┐
│                                     │
│   Empty or previous generation      │
│                                     │
└─────────────────────────────────────┘
```

### Step 2: Click History Item
```
User clicks:
┌────┐ "A beautiful sunset..."
│img │ Generated 2 hours ago
└────┘
     ↓
   Loads complete session
```

### Step 3: After Loading
```
Main Content Area:
┌─────────────────────────────────────┐
│ Saved Prompt: "A beautiful sunset   │
│ over mountains with reflection"     │
│ [Copy prompt] [Clear results]       │
├─────────────────────────────────────┤
│ Input Images (2)             ← NEW  │
│ ┌────────┐ ┌────────┐              │
│ │ Photo  │ │ Photo  │              │
│ │ of mtns│ │ of sky │              │
│ └────────┘ └────────┘              │
├─────────────────────────────────────┤
│ Generated image preview             │
│ ┌─────────────────────────┐         │
│ │                         │         │
│ │    Beautiful sunset     │         │
│ │    with mountains       │         │
│ │                         │         │
│ └─────────────────────────┘         │
│ [◀ Previous] Image 1 of 3 [Next ▶] │
│ [Copy] [Share] [Download]           │
└─────────────────────────────────────┘

Textarea (bottom):
┌─────────────────────────────────────┐
│ A beautiful sunset over mountains   │ ← Auto-filled
│ with reflection                     │
│                                     │
└─────────────────────────────────────┘
```

## 3. Comparison with AI Chat Pattern

### AI Chat History
```
┌─────────────────┐         ┌──────────────────────┐
│ Chat History    │         │ Chat Messages        │
│                 │         │                      │
│ • Conversation 1│ ─────>  │ User: Hello          │
│ • Conversation 2│         │ AI: Hi there!        │
│ • Conversation 3│         │ User: How are you?   │
│                 │         │ AI: I'm great!       │
└─────────────────┘         └──────────────────────┘
     Click loads full conversation
```

### Image Generation History (NEW)
```
┌─────────────────┐         ┌──────────────────────┐
│ Gen History     │         │ Generation Details   │
│                 │         │                      │
│ • Generation 1  │ ─────>  │ Prompt: "..."        │
│ • Generation 2  │         │ Input Images: [...]  │
│ • Generation 3  │         │ Output Images: [...] │
│                 │         │                      │
└─────────────────┘         └──────────────────────┘
     Click loads full generation
```

## 4. View All History Button

### Bottom of Sidebar
```
┌─────────────────────────────────────┐
│                                     │
│  (History items scroll here)        │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │  Refresh History            │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📄 View All History        │   │ ← NEW
│  └─────────────────────────────┘   │
│        │                            │
│        └─────> Navigates to         │
│               /history page         │
└─────────────────────────────────────┘
```

## 5. Input Images Display

### Grid Layout - Responsive

**Mobile (< 640px)**
```
Input Images (4)
┌────────┐ ┌────────┐
│ Image1 │ │ Image2 │
└────────┘ └────────┘
┌────────┐ ┌────────┐
│ Image3 │ │ Image4 │
└────────┘ └────────┘
   (2 columns)
```

**Tablet (640px - 1024px)**
```
Input Images (6)
┌────────┐ ┌────────┐ ┌────────┐
│ Image1 │ │ Image2 │ │ Image3 │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│ Image4 │ │ Image5 │ │ Image6 │
└────────┘ └────────┘ └────────┘
        (3 columns)
```

**Desktop (> 1024px)**
```
Input Images (8)
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Image1│ │Image2│ │Image3│ │Image4│
└──────┘ └──────┘ └──────┘ └──────┘
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Image5│ │Image6│ │Image7│ │Image8│
└──────┘ └──────┘ └──────┘ └──────┘
           (4 columns)
```

## 6. Complete Page Layout

```
┌──────────────────────────────────────────────────────────┐
│                      Header                              │
└──────────────────────────────────────────────────────────┘
┌─────────────┬────────────────────────────────────────────┐
│  History    │         Main Content                       │
│  Sidebar    │                                            │
│             │  ┌──────────────────────────────────────┐  │
│ ┌────────┐  │  │ Saved Prompt: "..."                  │  │
│ │ [img]  │  │  │ [Copy] [Clear]                       │  │
│ │ Prompt │  │  └──────────────────────────────────────┘  │
│ │ 2h ago │  │                                            │
│ └────────┘  │  ┌──────────────────────────────────────┐  │
│             │  │ Input Images (2)                     │  │
│ ┌────────┐  │  │ ┌─────┐ ┌─────┐                     │  │
│ │ [img]  │  │  │ │ img1│ │ img2│                     │  │
│ │ Prompt │  │  │ └─────┘ └─────┘                     │  │
│ │ 5h ago │  │  └──────────────────────────────────────┘  │
│ └────────┘  │                                            │
│             │  ┌──────────────────────────────────────┐  │
│ [Refresh]   │  │ Generated Images                     │  │
│             │  │ ┌────────────────────────┐           │  │
│ [View All]  │  │ │                        │           │  │
│             │  │ │   AI Generated Image   │           │  │
└─────────────┤  │ │                        │           │  │
              │  │ └────────────────────────┘           │  │
              │  │ [◀] [▶] [Copy] [Download]           │  │
              │  └──────────────────────────────────────┘  │
              │                                            │
              │  ┌──────────────────────────────────────┐  │
              │  │ Textarea                             │  │
              │  │ [Add Images] [Presets] [Submit]      │  │
              │  └──────────────────────────────────────┘  │
              └────────────────────────────────────────────┘
```

## 7. User Interaction Flow

### Scenario: View Previous Generation

```
1. User opens homepage
   ↓
2. History sidebar shows recent generations
   ↓
3. User clicks "A sunset photo..." from 2 hours ago
   ↓
4. Main content area updates:
   • Shows saved prompt
   • Displays input images (if any)
   • Shows generated output images
   • Prompt fills textarea
   ↓
5. User can:
   ├─ View the generation
   ├─ Copy the prompt
   ├─ Edit and regenerate
   ├─ Clear and start new
   └─ Click "View All History" for more
```

### Scenario: Iterate on Previous Prompt

```
1. Click history item: "Sunset over mountains"
   ↓
2. Session loads (prompt + images visible)
   ↓
3. Prompt appears in textarea: "A beautiful sunset..."
   ↓
4. User edits: "A beautiful sunset with birds"
   ↓
5. User clicks Submit
   ↓
6. New generation appears
   ↓
7. New item added to history sidebar
   ↓
8. Original session still viewable by clicking history
```

## 8. Empty States

### No Input Images
```
┌─────────────────────────────────────┐
│ Saved Prompt: "Generate a logo"     │
│ [Copy prompt] [Clear results]       │
├─────────────────────────────────────┤
│ (No input images section shown)     │
├─────────────────────────────────────┤
│ Generated image preview             │
│ ┌─────────────────────────┐         │
│ │     Generated Logo      │         │
│ └─────────────────────────┘         │
└─────────────────────────────────────┘
```

### No Generated Images (Error case)
```
┌─────────────────────────────────────┐
│ Saved Prompt: "..."                 │
│ [Copy prompt] [Clear results]       │
├─────────────────────────────────────┤
│ Input Images (2)                    │
│ ┌─────┐ ┌─────┐                     │
│ │img1 │ │img2 │                     │
│ └─────┘ └─────┘                     │
├─────────────────────────────────────┤
│ ⚠️ No images were generated         │
└─────────────────────────────────────┘
```

## 9. Button States

### View All History Button

**Normal**
```
┌─────────────────────────────┐
│ 📄 View All History         │
│ ────────────────────────    │
└─────────────────────────────┘
```

**Hover**
```
┌─────────────────────────────┐
│ 📄 View All History         │
│ ════════════════════════    │  (highlighted)
└─────────────────────────────┘
```

**Click**
```
Navigates to /history page
         ↓
┌─────────────────────────────────────┐
│       Complete History Page         │
│                                     │
│  All generations in list/grid       │
└─────────────────────────────────────┘
```

## 10. Key Visual Differences

### Before This Update
```
History Sidebar:
┌────────────────┐
│ • Prompt 1     │  ← Click: Insert text only
│ • Prompt 2     │
│ • Prompt 3     │
│                │
│ [Refresh]      │
└────────────────┘
(No "View All" button)
```

### After This Update
```
History Sidebar:
┌────────────────┐
│ ┌────┐ Prompt1│  ← Click: Load full session!
│ │img │ 2h ago │
│ └────┘         │
│                │
│ ┌────┐ Prompt2│
│ │img │ 5h ago │
│ └────┘         │
│                │
│ [Refresh]      │
│ [View All]     │  ← NEW!
└────────────────┘
```

---

## Summary of Visual Changes

✅ **History sidebar** now shows:
  - Thumbnail previews
  - Click loads full session
  - "View All History" button

✅ **Main content** now displays:
  - Complete generation details
  - Input images in grid
  - Output images
  - Auto-filled prompt

✅ **Workflow** now allows:
  - Quick session viewing
  - Easy prompt iteration
  - Access to full history page
  - Complete context at a glance

## Icon Reference

- 📄 = Document/List icon (View All History)
- ⚠️ = Warning icon (Errors)
- 🗑️ = Trash icon (Delete)
- 🔄 = Refresh icon (Reload)
- ◀ = Previous arrow
- ▶ = Next arrow
