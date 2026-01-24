# Advanced Presets System - Implementation Guide

## Overview
This advanced presets system allows users to create detailed, reusable image generation templates with granular control over every aspect of the image.

## Features

### ✨ Core Features
- **Detailed Configuration**: Break down complex image types into configurable components
- **Multiple Templates**: Pre-built templates for YouTube thumbnails, Instagram posts, product photos, etc.
- **Component-Based**: Configure subject, background, title, effects, style separately
- **Reusable**: Save presets and reuse them with just core input
- **Smart Prompt Building**: Automatically generates optimized prompts from configuration

### 🎯 Example Use Cases

#### YouTube Thumbnail Preset
User configures once:
- **Subject**: Character, excited expression, large size, center position
- **Title**: Bold yellow text, bottom position, outline effect
- **Background**: Gaming gradient (purple/cyan), vibrant style
- **Effects**: Strong glow, high contrast, vignette
- **Style**: 3D, energetic mood, dramatic lighting

Then for each video, just adds:
- "Top 10 Fortnite Wins" → Generates complete thumbnail
- "New Update Guide" → Generates complete thumbnail

#### Product Photo Preset
User configures once:
- **Product**: Three-quarter angle, center position
- **Background**: White solid, minimal style
- **Lighting**: Studio lighting with soft shadows
- **Style**: E-commerce, high contrast

Then just describes product:
- "Smartwatch with black band" → Generates product photo
- "Wireless headphones" → Generates product photo

## Files Created

### Database
- `migrations/0010_add_user_presets.sql` - User presets table with RLS policies

### Types
- `src/types/presets.ts` - Comprehensive type definitions for all preset configurations
- `src/types/index.ts` - Updated to export preset types

### Core Libraries
- `src/lib/presetBuilder.ts` - Converts configurations to detailed prompts
- `src/lib/presetTemplates.ts` - Pre-built templates for common use cases

### Components
- `src/components/PresetManager.tsx` - Main preset management interface
- `src/components/presetEditors/YouTubeThumbnailEditor.tsx` - YouTube thumbnail editor
- `src/components/presetEditors/InstagramPostEditor.tsx` - Instagram post editor
- `src/components/presetEditors/ProductPhotoEditor.tsx` - Product photo editor

## Integration Steps

### 1. Run Database Migration

\`\`\`bash
# Apply the migration to create user_presets table
supabase db push
\`\`\`

Or manually run the migration:
\`\`\`sql
-- Run the contents of migrations/0010_add_user_presets.sql in your Supabase SQL editor
\`\`\`

### 2. Update Home Page

Add the PresetManager to your home page:

\`\`\`tsx
// In src/app/(home)/page.tsx

import PresetManager from '@/components/PresetManager';
import { UserPreset } from '@/types/presets';
import { buildPromptFromPreset } from '@/lib/presetBuilder';

export default function HomePage() {
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);
  const [user, setUser] = useState<AppUser>(null);
  
  // Handle preset selection
  const handlePresetSelect = (preset: UserPreset, userInput?: string) => {
    // Build the complete prompt from preset + user input
    const fullPrompt = buildPromptFromPreset(
      preset.config,
      preset.category,
      userInput
    );
    
    // Use the prompt for image generation
    // Update your aspect ratio based on preset
    setAspectRatio(preset.aspect_ratio);
    
    // Insert the generated prompt into your input
    handleInsertPrompt(fullPrompt);
  };
  
  return (
    <div>
      {/* Add button to open preset manager */}
      <button onClick={() => setIsPresetManagerOpen(true)}>
        Manage Presets
      </button>
      
      {/* Preset Manager Modal */}
      <PresetManager
        isOpen={isPresetManagerOpen}
        onClose={() => setIsPresetManagerOpen(false)}
        onSelectPreset={handlePresetSelect}
        userId={user?.id}
      />
      
      {/* Your existing image generation UI */}
    </div>
  );
}
\`\`\`

### 3. Update ImageUploader Component

If you want to add a preset button to the ImageUploader:

\`\`\`tsx
// In your ImageUploader component

<button
  onClick={onOpenPresets}
  className="preset-button"
>
  <span>Presets</span>
  {hasActivePreset && <span className="active-indicator">●</span>}
</button>
\`\`\`

### 4. TypeScript Compilation

If you encounter module resolution issues, try:

\`\`\`bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Restart dev server
npm run dev
\`\`\`

## Usage Flow

### Creating a Preset

1. Click "Manage Presets" / "Create Preset"
2. Choose a template (YouTube Gaming, Instagram Minimal, Product E-commerce, etc.)
3. Configure all details:
   - Subject type, position, size, expression
   - Title text style, color, position, effects
   - Background type, style, colors
   - Lighting, mood, style
   - Effects: blur, glow, contrast, saturation
4. Save with a name and description
5. Mark as favorite (optional)

### Using a Preset

1. Click on a saved preset
2. Enter the core details (e.g., "Epic Gaming Moment")
3. Click "Generate"
4. System combines preset configuration + user input into optimized prompt
5. Image generates with all the pre-configured details

## Preset Configuration Examples

### YouTube Gaming Thumbnail

\`\`\`typescript
{
  subject: {
    type: 'character',
    description: 'Gaming character',
    expression: 'excited',
    position: 'center',
    size: 'large'
  },
  title: {
    enabled: true,
    style: 'bold',
    color: 'yellow',
    position: 'bottom',
    fontSize: 'large',
    effect: 'outline'
  },
  background: {
    type: 'gradient',
    style: 'gaming',
    colors: ['#FF00FF', '#00FFFF']
  },
  effects: {
    glow: 'strong',
    contrast: 'high',
    vignette: true
  },
  style: '3d',
  mood: 'energetic',
  lighting: 'dramatic',
  clickbait: true
}
\`\`\`

User input: "TOP 10 WINS"
Generated prompt: "YouTube thumbnail for: TOP 10 WINS. Gaming character with excited expression, positioned center, large size. Text overlay: "TOP 10 WINS" bold typography, yellow color, positioned bottom, center aligned, large font, with outline effect. Gradient background gaming, colors: #FF00FF, #00FFFF. 3d style, energetic mood. Dramatic lighting. Effects: strong glow, high contrast, subtle vignette. High energy, attention-grabbing composition, designed to maximize clicks. High resolution, sharp details, vibrant colors, optimized for YouTube thumbnail display (1920x1080)."

## Benefits

### For Users
- ⚡ **Faster**: Configure once, reuse forever
- 🎯 **Consistent**: Same style across all images
- 🎨 **Professional**: Detailed control over every aspect
- 💾 **Organized**: Save and manage multiple presets
- 📝 **Simple**: Just add core idea, system handles details

### For Prompts
- 📈 **Better Quality**: More detailed, specific prompts
- 🔧 **Structured**: Component-based approach
- 🎬 **Platform-Specific**: Optimized for each use case
- ⚙️ **Configurable**: Fine-grained control
- 🚀 **Scalable**: Easy to add new preset types

## Extending the System

### Adding a New Preset Category

1. **Define Types** (in `src/types/presets.ts`):
   \`\`\`typescript
   export interface MyNewPresetConfig {
     // Define configuration structure
   }
   \`\`\`

2. **Create Template** (in `src/lib/presetTemplates.ts`):
   \`\`\`typescript
   my_new_preset: {
     category: 'my_new_category',
     name: 'My Preset',
     defaultConfig: { /* ... */ }
   }
   \`\`\`

3. **Add Prompt Builder** (in `src/lib/presetBuilder.ts`):
   \`\`\`typescript
   function buildMyNewPresetPrompt(config, userInput) {
     // Build prompt from config
   }
   \`\`\`

4. **Create Editor** (in `src/components/presetEditors/MyNewPresetEditor.tsx`):
   \`\`\`typescript
   export default function MyNewPresetEditor({ config, onChange }) {
     // Build configuration UI
   }
   \`\`\`

5. **Register in PresetManager**:
   \`\`\`typescript
   {editedPreset.category === 'my_new_category' && (
     <MyNewPresetEditor config={config} onChange={onChange} />
   )}
   \`\`\`

## Troubleshooting

### "Cannot find module" errors
- Clear `.next` folder and restart dev server
- Check that all files are saved
- Verify import paths match file structure

### Database errors
- Ensure migration is applied to your Supabase project
- Check RLS policies are enabled
- Verify user is authenticated

### Presets not saving
- Check browser console for errors
- Verify Supabase client is configured
- Check user permissions

## Next Steps

1. **Apply database migration**
2. **Integrate PresetManager into home page**
3. **Test creating a preset**
4. **Test using a preset for image generation**
5. **Customize templates to match your brand**
6. **Add more preset categories as needed**

## Support

The preset system is fully typed with TypeScript and includes:
- ✅ Comprehensive type definitions
- ✅ Database schema with RLS
- ✅ Pre-built templates
- ✅ Smart prompt generation
- ✅ Reusable UI components
- ✅ Full CRUD operations

Ready to revolutionize your image generation workflow! 🚀
