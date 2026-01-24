# Advanced Presets System - Visual Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PRESET MANAGER                             │
│  ┌───────────────┬────────────────┬─────────────────────────┐  │
│  │  My Presets   │   Templates    │     Preset Editor       │  │
│  │  - List       │   - YouTube    │     - Configure All     │  │
│  │  - Search     │   - Instagram  │     - Save/Update       │  │
│  │  - Favorites  │   - Products   │     - Preview           │  │
│  └───────────────┴────────────────┴─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRESET CONFIGURATION                         │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐     │
│  │ Subject  │  Title   │Background│ Effects  │  Style   │     │
│  │ - Type   │ - Text   │ - Type   │ - Blur   │ - Art    │     │
│  │ - Size   │ - Style  │ - Colors │ - Glow   │ - Mood   │     │
│  │ - Pose   │ - Color  │ - Style  │ - Grain  │ - Light  │     │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PROMPT BUILDER                             │
│  Converts Configuration → Detailed Optimized Prompt            │
│  - buildYouTubeThumbnailPrompt()                               │
│  - buildInstagramPostPrompt()                                  │
│  - buildProductPhotoPrompt()                                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    IMAGE GENERATION                             │
│  Uses Generated Prompt + User Input → Creates Image            │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. PresetManager Component
```
┌─────────────────────────────────────────────────────────┐
│                    PresetManager                        │
├─────────────────────────────────────────────────────────┤
│  State:                                                 │
│  - view: 'list' | 'templates' | 'edit'                 │
│  - presets: UserPreset[]                               │
│  - editingPreset: UserPreset | null                    │
├─────────────────────────────────────────────────────────┤
│  Functions:                                             │
│  - loadPresets()         → Fetch from database        │
│  - handleSavePreset()    → Save/Update preset         │
│  - handleDeletePreset()  → Remove preset              │
│  - handleUsePreset()     → Generate & use prompt      │
├─────────────────────────────────────────────────────────┤
│  Sub-Components:                                        │
│  - PresetList           → Shows all presets           │
│  - TemplateSelector     → Choose starting template    │
│  - PresetEditor         → Configure preset details    │
└─────────────────────────────────────────────────────────┘
```

### 2. Category Editors

```
┌────────────────────────────────────┐
│   YouTubeThumbnailEditor           │
├────────────────────────────────────┤
│  Sections:                         │
│  ✓ Subject Configuration           │
│    - Type, Expression, Position    │
│  ✓ Title/Text Configuration        │
│    - Style, Color, Effects         │
│  ✓ Background Configuration        │
│    - Type, Style, Colors           │
│  ✓ Effects Configuration           │
│    - Blur, Glow, Contrast          │
│  ✓ Style & Mood                    │
│    - Art Style, Mood, Lighting     │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│   InstagramPostEditor              │
├────────────────────────────────────┤
│  Sections:                         │
│  ✓ Subject                         │
│  ✓ Background                      │
│  ✓ Style & Composition             │
│  ✓ Filters & Effects               │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│   ProductPhotoEditor               │
├────────────────────────────────────┤
│  Sections:                         │
│  ✓ Product Details                 │
│  ✓ Background                      │
│  ✓ Lighting & Shadows              │
│  ✓ Props & Context                 │
│  ✓ Effects                         │
└────────────────────────────────────┘
```

## Data Flow

### Creating a Preset

```
User Opens Manager
       ↓
Chooses Template (YouTube Gaming, Instagram Minimal, etc.)
       ↓
Template Config Loaded Into Editor
       ↓
User Configures Each Component:
  - Subject: Character, Excited, Center, Large
  - Title: Bold Yellow, Bottom, Outline
  - Background: Gaming Gradient
  - Effects: Strong Glow, High Contrast
  - Style: 3D, Energetic, Dramatic
       ↓
User Saves Preset
       ↓
Preset Stored in Database (user_presets table)
       {
         id: "uuid",
         user_id: "user-uuid",
         name: "Epic Gaming Thumbnail",
         category: "youtube_thumbnail",
         config: { subject: {...}, title: {...}, ... },
         aspect_ratio: "16:9",
         width: 1920,
         height: 1080
       }
```

### Using a Preset

```
User Selects Preset "Epic Gaming Thumbnail"
       ↓
System Shows Input Modal
       ↓
User Enters Core Content: "TOP 10 WINS"
       ↓
buildPromptFromPreset(config, category, "TOP 10 WINS")
       ↓
Generates Detailed Prompt:
  "YouTube thumbnail for: TOP 10 WINS. Character with 
   excited expression, positioned center, large size.
   Text overlay: 'TOP 10 WINS' bold typography, yellow
   color, positioned bottom, outline effect. Gradient
   background gaming style. 3D style, energetic mood.
   Dramatic lighting. Strong glow, high contrast..."
       ↓
Prompt Sent to Image Generation
       ↓
Image Created with All Preset Details
```

## Database Schema

```sql
user_presets
├── id (UUID, Primary Key)
├── user_id (UUID, Foreign Key → auth.users)
├── name (VARCHAR)
├── description (TEXT)
├── category (VARCHAR)
├── is_favorite (BOOLEAN)
├── aspect_ratio (VARCHAR)
├── width (INTEGER)
├── height (INTEGER)
├── config (JSONB) ← All configuration stored here
│   └── Example:
│       {
│         "subject": {
│           "type": "character",
│           "expression": "excited",
│           "position": "center",
│           "size": "large"
│         },
│         "title": {
│           "enabled": true,
│           "style": "bold",
│           "color": "yellow"
│         },
│         ...
│       }
├── generated_prompt (TEXT)
├── usage_count (INTEGER)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)
```

## Type System

```typescript
PresetCategory
├── 'youtube_thumbnail'
├── 'instagram_post'
├── 'instagram_story'
├── 'product_photo'
├── 'portrait'
├── 'landscape'
└── 'custom'

PresetConfig (Union Type)
├── YouTubeThumbnailConfig
│   ├── subject: SubjectConfig
│   ├── title: TitleConfig
│   ├── background: BackgroundConfig
│   ├── effects: EffectsConfig
│   ├── mood, style, lighting
│   └── clickbait: boolean
├── InstagramPostConfig
│   ├── subject: SubjectConfig
│   ├── background: BackgroundConfig
│   ├── effects: EffectsConfig
│   ├── style, mood, filter
│   └── composition
├── ProductPhotoConfig
│   ├── product: ProductConfig
│   ├── background: BackgroundConfig
│   ├── lighting, shadows
│   ├── props: string[]
│   └── effects: EffectsConfig
└── CustomPresetConfig
    └── freeform configuration
```

## User Journey Example

### Scenario: YouTube Content Creator

**Week 1:**
```
1. Opens "My Presets" → "Create Preset"
2. Chooses "YouTube Gaming" template
3. Customizes:
   - Subject: 3D character, excited, center
   - Title: Bold yellow, large, bottom, outline
   - Background: Purple/cyan gradient
   - Effects: Strong glow, high contrast, vignette
   - Mood: Energetic, dramatic lighting
4. Saves as "My Gaming Template"
5. Takes 5 minutes to configure perfectly
```

**Week 2-52:**
```
Every new video:
1. Opens "My Presets"
2. Clicks "My Gaming Template"
3. Types: "EPIC COMEBACK WIN"
4. Clicks Generate
5. Takes 10 seconds ✨

Result: Consistent, professional thumbnails with minimal effort!
```

## Benefits Visualization

### Without Presets
```
Video 1: Write 150-word detailed prompt (10 min)
Video 2: Write 150-word detailed prompt (10 min)
Video 3: Write 150-word detailed prompt (10 min)
Video 4: Write 150-word detailed prompt (10 min)
Video 5: Write 150-word detailed prompt (10 min)
────────────────────────────────────────────────
Total: 50 minutes
Consistency: Varies (manual typing errors)
Quality: Depends on memory
```

### With Presets
```
Setup: Configure preset once (5 min)
Video 1: Type core idea (10 sec)
Video 2: Type core idea (10 sec)
Video 3: Type core idea (10 sec)
Video 4: Type core idea (10 sec)
Video 5: Type core idea (10 sec)
────────────────────────────────────────────────
Total: 6 minutes
Consistency: Perfect (same config)
Quality: Professional (optimized prompt)
```

## Extension Points

Want to add a new preset type?

```
1. Define Type
   └── src/types/presets.ts
       export interface BookCoverConfig { ... }

2. Create Template
   └── src/lib/presetTemplates.ts
       book_cover_fiction: { ... }

3. Add Prompt Builder
   └── src/lib/presetBuilder.ts
       function buildBookCoverPrompt() { ... }

4. Create Editor
   └── src/components/presetEditors/BookCoverEditor.tsx
       export default function BookCoverEditor() { ... }

5. Register in PresetManager
   └── src/components/PresetManager.tsx
       {category === 'book_cover' && <BookCoverEditor />}

Done! New preset type ready to use.
```

## File Structure

```
dream-image-generator/
├── migrations/
│   └── 0010_add_user_presets.sql
├── src/
│   ├── types/
│   │   ├── index.ts (exports presets)
│   │   └── presets.ts (all type definitions)
│   ├── lib/
│   │   ├── presetBuilder.ts (config → prompt)
│   │   └── presetTemplates.ts (pre-built templates)
│   └── components/
│       ├── PresetManager.tsx (main UI)
│       └── presetEditors/
│           ├── YouTubeThumbnailEditor.tsx
│           ├── InstagramPostEditor.tsx
│           └── ProductPhotoEditor.tsx
└── Documentation/
    ├── PRESETS_SYSTEM_SUMMARY.md
    ├── PRESETS_SYSTEM_GUIDE.md
    ├── INTEGRATION_EXAMPLE.tsx
    └── PRESETS_ARCHITECTURE_VISUAL.md (this file)
```

---

**This system transforms complex, repetitive prompt writing into a simple, consistent, and professional workflow!** 🎨✨
