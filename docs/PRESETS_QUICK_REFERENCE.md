# 🚀 Presets System - Quick Reference Card

## What It Does
**Transforms**: Writing detailed prompts every time  
**Into**: Configure once, reuse forever with just core input

## Files Created
```
✅ migrations/0010_add_user_presets.sql
✅ src/types/presets.ts
✅ src/lib/presetBuilder.ts
✅ src/lib/presetTemplates.ts
✅ src/components/PresetManager.tsx
✅ src/components/presetEditors/YouTubeThumbnailEditor.tsx
✅ src/components/presetEditors/InstagramPostEditor.tsx
✅ src/components/presetEditors/ProductPhotoEditor.tsx
```

## Quick Start (3 Steps)

### 1. Run Migration
```bash
supabase db push
```

### 2. Add Imports
```tsx
import PresetManager from "@/components/PresetManager";
import { UserPreset } from "@/types/presets";
import { buildPromptFromPreset } from "@/lib/presetBuilder";
```

### 3. Add to Page
```tsx
// State
const [isOpen, setIsOpen] = useState(false);

// Handler
const handlePresetSelect = (preset: UserPreset, input?: string) => {
  const prompt = buildPromptFromPreset(preset.config, preset.category, input);
  handleInsertPrompt(prompt);
};

// Button
<button onClick={() => setIsOpen(true)}>My Presets</button>

// Component
<PresetManager
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSelectPreset={handlePresetSelect}
  userId={user?.id}
/>
```

## Pre-Built Templates

### YouTube (3 templates)
- **Gaming**: Clickbait, bold, energetic
- **Tutorial**: Clean, professional
- **Vlog**: Natural, lifestyle

### Instagram (3 templates)
- **Minimal**: Clean, muted
- **Vibrant**: Bold colors
- **Story**: Vertical with overlay

### Products (3 templates)
- **E-commerce**: White bg, clean
- **Lifestyle**: With props
- **Luxury**: Dark, premium

## Configuration Options

### Every Preset Can Configure

**Subject**
- Type, Expression, Position, Size, Angle, Details

**Title/Text**
- Enable/Disable, Text, Style, Color, Position, Alignment, Size, Effects

**Background**
- Type, Style, Colors, Texture, Description

**Effects**
- Blur, Glow, Vignette, Grain, Color Grading, Contrast, Saturation

**Style & Mood**
- Art Style, Mood, Lighting, Platform-Specific Options

## Example Workflow

### Create Preset (Once)
```
1. Click "Create Preset"
2. Choose "YouTube Gaming"
3. Configure:
   Subject → Character, Excited, Center
   Title → Bold Yellow, Bottom, Outline
   Background → Gaming Gradient
   Effects → Strong Glow, High Contrast
   Style → 3D, Dramatic
4. Save as "My Gaming Preset"
```

### Use Preset (Every Time)
```
1. Click "My Gaming Preset"
2. Enter: "TOP 10 WINS"
3. Click Generate
4. Done! ✨
```

## Generated Prompt Quality

**User Config**: Gaming thumbnail with excited character, bold yellow title, gradient background, 3D style  
**User Input**: "TOP 10 WINS"

**Generated**:
> YouTube thumbnail for: TOP 10 WINS. Character with excited expression, positioned center, large size, three-quarter angle. Text overlay: "TOP 10 WINS" bold typography, yellow color, positioned bottom, center aligned, large font, with outline effect. Gradient background gaming style, colors: #FF00FF, #00FFFF, #FF0080. 3D style, energetic mood. Dramatic lighting. Effects: strong glow, high contrast, subtle vignette, cinematic color grading. High energy, attention-grabbing composition, designed to maximize clicks. High resolution, sharp details, vibrant colors, optimized for YouTube thumbnail display (1920x1080).

## Key Features

✅ **10+ Professional Templates**  
✅ **Fully Typed (TypeScript)**  
✅ **Database with RLS**  
✅ **Favorites System**  
✅ **Usage Tracking**  
✅ **Search & Filter**  
✅ **Dark Mode Support**  
✅ **Extensible Architecture**

## Time Savings

**Traditional Approach**:
- Video 1: 10 min writing prompt
- Video 2: 10 min writing prompt
- Video 3: 10 min writing prompt
- **Total**: 30 minutes

**With Presets**:
- Setup: 5 min (once)
- Video 1: 10 sec
- Video 2: 10 sec
- Video 3: 10 sec
- **Total**: 5.5 minutes

**Saved: 24.5 minutes (82% faster!) ⚡**

## Integration Points

### Option 1: Standalone Button
```tsx
<button onClick={() => setIsPresetManagerOpen(true)}>
  My Presets
</button>
```

### Option 2: In Sidebar
```tsx
<SidebarButton onClick={() => setIsPresetManagerOpen(true)}>
  My Presets
</SidebarButton>
```

### Option 3: In ImageUploader
```tsx
<ImageUploader
  onOpenPresets={() => setIsPresetManagerOpen(true)}
  hasActivePreset={!!activePreset}
/>
```

## Database Schema (Simple View)

```
user_presets
├── id, user_id, name, description
├── category (youtube_thumbnail, instagram_post, etc.)
├── aspect_ratio, width, height
├── config (JSONB - all settings)
├── is_favorite, usage_count
└── created_at, updated_at
```

## API Reference

### buildPromptFromPreset()
```tsx
buildPromptFromPreset(
  config: PresetConfig,
  category: PresetCategory,
  userInput?: string
): string
```

Converts preset configuration + user input into detailed prompt.

### PresetManager Props
```tsx
interface PresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: UserPreset, userInput?: string) => void;
  userId?: string;
}
```

## Extending

### Add New Preset Type
1. Define type in `src/types/presets.ts`
2. Add template in `src/lib/presetTemplates.ts`
3. Add prompt builder in `src/lib/presetBuilder.ts`
4. Create editor in `src/components/presetEditors/`
5. Register in `PresetManager.tsx`

## Troubleshooting

**Module not found?**
```bash
rm -rf .next && npm run dev
```

**Database error?**
```bash
supabase db push
```

**Type errors?**
```bash
npm install
```

## Documentation

📚 **Full Guides**:
- `PRESETS_SYSTEM_SUMMARY.md` - Overview & benefits
- `PRESETS_SYSTEM_GUIDE.md` - Detailed integration
- `INTEGRATION_EXAMPLE.tsx` - Code examples
- `PRESETS_ARCHITECTURE_VISUAL.md` - System architecture

## Support

Built with:
- ✅ React + TypeScript
- ✅ Supabase (PostgreSQL + RLS)
- ✅ Tailwind CSS
- ✅ Next.js

---

**Ready to transform your image generation workflow!** 🎨✨

Need help? Check the full guides above. 📚
