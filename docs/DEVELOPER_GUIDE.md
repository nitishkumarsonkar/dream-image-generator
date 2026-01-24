# Developer Migration Guide

## Quick Start

If you're working on this codebase after this refactoring, here's what you need to know:

## What Changed?

### Homepage (`/`)
- **Old**: Presets sidebar on the left
- **New**: History sidebar on the left, Presets in a modal

### Component Locations

#### New Components (Homepage-specific)
```
src/app/(home)/components/
├── ImageGenerationHistory.tsx    ← History sidebar
├── PresetsModal.tsx              ← Presets selection modal
└── PresetsButton.tsx             ← Button to open modal
```

#### Modified Components
```
src/app/(home)/
├── page.tsx                      ← Uses new history sidebar
└── components/
    ├── FixedTextarea.tsx         ← Passes modal handlers
    └── ImageUploader.tsx         ← Shows presets button
```

## Key APIs

### ImageGenerationHistory

```typescript
interface ImageGenerationHistoryProps {
  onSelectPrompt: (promptText: string) => void;
  className?: string;
}
```

**Usage**:
```tsx
<ImageGenerationHistory
  onSelectPrompt={(text) => insertPromptIntoTextarea(text)}
/>
```

### PresetsModal

```typescript
interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKey: PresetKey | null;
  onSelect: (key: PresetKey) => void;
  onApplyCustom?: (text: string) => void;
}
```

**Usage**:
```tsx
const [isOpen, setIsOpen] = useState(false);

<PresetsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  selectedKey={currentPreset}
  onSelect={handlePresetSelect}
  onApplyCustom={handleCustomPreset}
/>
```

### ImageUploader (New Props)

```typescript
interface ImageUploaderProps {
  // ... existing props
  onOpenPresets?: () => void;
  hasActivePreset?: boolean;
}
```

## Common Tasks

### Adding a New Preset

1. Edit `src/lib/presets.ts`:
```typescript
export const PRESETS: Record<PresetKey, Preset> = {
  // ... existing presets
  myNewPreset: {
    id: "myNewPreset",
    label: "My New Preset",
    desc: "Description",
    ratio: "16:9",
    width: 1920,
    height: 1080,
    promptTemplate: "Your template here",
  },
};
```

2. Update `PresetKey` type in `src/types/index.ts`:
```typescript
export type PresetKey = "instagram" | "ghibli" | "professional" | "other" | "myNewPreset";
```

3. Update preset order in `PresetsModal.tsx`:
```typescript
const ORDER: PresetKey[] = ['instagram', 'ghibli', 'professional', 'myNewPreset', 'other'];
```

### Modifying History Display

Edit `ImageGenerationHistory.tsx`:

```typescript
// Change limit
.limit(50)  // ← Change this number

// Change sort order
.order('created_at', { ascending: false })  // ← Modify this

// Add filters
.eq('some_field', 'some_value')
```

### Customizing Modal Appearance

Edit `PresetsModal.tsx`:

```typescript
// Modal size
<div className="... max-w-2xl ...">  // ← Change width

// Grid columns
<div className="grid gap-3 md:grid-cols-2">  // ← Change columns

// Animation
<div className="... transition-opacity">  // ← Modify transitions
```

## State Management Flow

### Preset Selection Flow
```
User clicks Presets button
  → FixedTextarea sets isPresetsModalOpen = true
    → PresetsModal renders
      → User selects preset
        → onSelect called with PresetKey
          → HomePage.handlePresetSelect updates state
            → FixedTextarea receives selectedPreset prop
              → Shows active indicator on button
                → On submit, preset template is appended
```

### History Selection Flow
```
User clicks history item
  → ImageGenerationHistory.onSelectPrompt called
    → HomePage.handleInsertPrompt called
      → Updates presetAppend state
        → FixedTextarea receives presetAppend
          → ImageUploader detects change
            → Inserts text into textarea
```

## Database Schema

The history sidebar uses these tables:

```sql
-- Main prompt table
CREATE TABLE prompt (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  prompt_text TEXT,
  created_at TIMESTAMP
);

-- Related images
CREATE TABLE prompt_images (
  id UUID PRIMARY KEY,
  prompt_id UUID REFERENCES prompt(id),
  image_url TEXT,
  image_type TEXT CHECK (image_type IN ('input', 'output')),
  created_at TIMESTAMP
);
```

No new migrations needed - uses existing schema.

## Styling

### Tailwind Classes Used

History Sidebar:
- `fixed left-0 top-16 h-[calc(100vh-4rem)] w-80`
- `bg-white dark:bg-neutral-900`
- `border-r border-neutral-200 dark:border-neutral-800`

Modal:
- `fixed inset-0 bg-black/50 z-50`
- `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`
- `rounded-xl shadow-2xl`

Buttons:
- `add-images-btn` class (defined in globals.css)
- Consistent with existing button styles

## Debugging

### Common Issues

**Issue**: History doesn't load
```typescript
// Check console for errors
// Verify Supabase connection
// Check RLS policies on prompt table
```

**Issue**: Modal doesn't close
```typescript
// Check if onClose is being called
// Verify backdrop click handler
// Check z-index conflicts
```

**Issue**: Preset not applying
```typescript
// Check if selectedPreset state is updating
// Verify handlePresetSelect is called
// Check prompt template in PRESETS
```

### Console Logs for Debugging

Add these temporarily:

```typescript
// In ImageGenerationHistory
console.log('History items:', prompts);

// In PresetsModal
console.log('Selected preset:', selectedKey);

// In FixedTextarea
console.log('Applying preset:', selectedPreset);
```

## Testing

Run tests:
```bash
npm test
```

Type check:
```bash
npm run type-check
# or
npx tsc --noEmit
```

Lint:
```bash
npm run lint
```

## Rollback Plan

If you need to revert to the old sidebar:

1. In `src/app/(home)/page.tsx`:
```typescript
// Restore this import
import { SidebarDesktop, SidebarDrawer } from "../../components/SidebarPresets";

// Replace ImageGenerationHistory with:
<SidebarDesktop
  selectedKey={selectedPreset}
  onSelect={handlePresetSelect}
  onApplyCustom={handleApplyCustom}
/>
<SidebarDrawer
  selectedKey={selectedPreset}
  onSelect={handlePresetSelect}
  onApplyCustom={handleApplyCustom}
/>
```

2. In `src/components/Header.tsx`:
```typescript
// Remove conditional
<SidebarToggleButton />
```

3. Remove new components (optional)

## Questions?

- Check `IMAGE_GENERATION_OPTIMIZATION_SUMMARY.md` for overview
- Check `LAYOUT_COMPARISON.md` for visual comparison
- Check `TESTING_CHECKLIST.md` for test scenarios
- Review component source code with inline comments
