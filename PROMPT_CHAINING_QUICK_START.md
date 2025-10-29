# Prompt Chaining - Quick Start Guide

## 🚀 What is Prompt Chaining?

Prompt Chaining allows users to refine AI-generated images iteratively by providing short text prompts, without needing to re-upload the image. Each refinement builds upon the previous result, creating a chain of improvements.

## 📁 Files Modified/Created

### New Files
1. `/src/app/api/generate-chain/route.ts` - API endpoint for chaining
2. `/src/components/PromptChainModal.tsx` - Modal UI for refinement prompts
3. `/src/components/ImageRefinementButton.tsx` - "Refine" button overlay

### Modified Files
1. `/src/app/(home)/page.tsx` - Added state & handlers for chaining
2. `/src/app/(home)/components/Scrollable.tsx` - Added refinement button to images
3. `/src/types/index.ts` - Added chain-related types

## 🎯 How to Use (User Perspective)

1. **Generate an image** using any prompt
2. **Hover over the generated image** - a purple "Refine" button appears
3. **Click "Refine"** - a modal opens showing:
   - Preview of the current image
   - The original prompt
   - Input field for refinement instructions
   - Quick suggestion buttons
4. **Enter refinement** (e.g., "make it nighttime" or "add a sunset background")
5. **Click "Refine Image"** - the system generates an improved version
6. **Repeat as needed** - chain multiple refinements together

## 💻 Developer Quick Reference

### API Endpoint

```typescript
POST /api/generate-chain

// Request
{
  prompt: string,                    // "add dramatic lighting"
  previousImage: {
    mimeType: string,                // "image/png"
    data: string                     // base64 encoded image
  },
  sourcePromptId?: string,           // Optional: for tracking
  aspectRatio?: string               // "16:9", "1:1", etc.
}

// Response
{
  parts: [
    { type: 'image', mimeType: 'image/png', data: 'base64...' }
  ],
  chainInfo: {
    sourcePromptId: string | null,
    chainType: 'refinement'
  }
}
```

### Component Integration

```typescript
import PromptChainModal from '@/components/PromptChainModal';

// In your component
const [isChainModalOpen, setIsChainModalOpen] = useState(false);
const [chainSourceImage, setChainSourceImage] = useState("");

<PromptChainModal
  isOpen={isChainModalOpen}
  onClose={() => setIsChainModalOpen(false)}
  onChain={async (prompt) => {
    // Call /api/generate-chain with prompt
  }}
  isLoading={false}
  sourceImage={chainSourceImage}
  sourcePrompt="Original prompt here"
/>
```

### Adding Refine Button to Images

```typescript
import ImageRefinementButton from '@/components/ImageRefinementButton';

<div className="relative group">
  <img src={imageUrl} alt="Generated" />
  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <ImageRefinementButton
      onRefine={() => handleRefine(imageUrl)}
      disabled={isLoading}
    />
  </div>
</div>
```

## 🎨 Styling

- **Primary Color**: Purple (`bg-purple-600`, `text-purple-600`)
- **Button Style**: Rounded (`rounded-lg`), with shadow and backdrop blur
- **Animations**: Opacity transitions on hover
- **Dark Mode**: Fully supported with `dark:` variants

## 💳 Credits

- **Cost**: 5 credits per refinement (same as initial generation)
- **Type**: `'image_generation'` transaction
- **Description**: `"Chained generation: {prompt}..."`

## 🗄️ Database

The chain relationship is tracked via:
```typescript
prompt.source_prompt_id → prompt.id
```

This allows you to:
- Trace the history of refinements
- Build a tree of image evolutions
- Analyze popular refinement patterns

## 🔍 Testing the Feature

### Manual Test Flow
1. Start the dev server: `npm run dev`
2. Navigate to the home page
3. Sign in to your account
4. Generate an image with prompt: "a cute robot"
5. Hover over the generated image
6. Click the purple "Refine" button
7. Enter refinement: "make the background a sunset"
8. Click "Refine Image"
9. Wait for the refined version
10. Verify the robot is preserved with a sunset background

### Testing Edge Cases
- [ ] Refine without signing in (should show error)
- [ ] Refine with insufficient credits (should show 402 error)
- [ ] Chain 5+ refinements in a row (should work)
- [ ] Close modal during generation (should cancel safely)
- [ ] Refine a very large image (should handle conversion)

## 🐛 Common Issues

### Issue: "Insufficient credits"
**Solution**: User needs to purchase credits

### Issue: Refined image doesn't match request
**Solution**: The prompt construction may need adjustment. Edit `/src/app/api/generate-chain/route.ts`:
```typescript
text: `Based on the image above, ${prompt}. Keep the core elements...`
```

### Issue: Button doesn't appear on hover
**Solution**: Check the `group` and `group-hover:opacity-100` classes are applied

### Issue: Modal won't close
**Solution**: Verify `isLoading` state is being managed correctly

## 📊 Monitoring

Check logs for:
```
Prompt chain generation completed
Successfully saved chained generation to database
```

Monitor credit transactions:
```
Credit Operation: deduct | User: xxx | Amount: 5
```

## 🚦 Feature Flags (Future)

Consider adding a feature flag to enable/disable chaining:
```typescript
const ENABLE_PROMPT_CHAINING = process.env.NEXT_PUBLIC_ENABLE_CHAINING === 'true';
```

## 📝 Quick Customization

### Change the refinement cost
Edit `IMAGE_GENERATION_COST` in `/src/app/api/generate-chain/route.ts`

### Modify suggestion prompts
Edit the `suggestions` array in `PromptChainModal.tsx`:
```typescript
const suggestions = [
  "Your custom suggestion here",
  // ... more suggestions
];
```

### Change button color
Update class in `ImageRefinementButton.tsx`:
```typescript
className="... bg-purple-600 ..."  // Change to your color
```

## 🎯 Next Steps

1. ✅ Feature is ready to use
2. Test with real users
3. Collect feedback on:
   - Refinement quality
   - UI/UX flow
   - Suggested improvements
4. Consider enhancements:
   - Chain history visualization
   - Undo/redo functionality
   - Preset refinement templates

## 📞 Support

For issues or questions:
1. Check the full documentation: `PROMPT_CHAINING_IMPLEMENTATION.md`
2. Review code comments in the source files
3. Check console logs for detailed error messages
4. Contact the development team

---

**Last Updated**: October 2025
**Version**: 1.0
**Status**: ✅ Production Ready
