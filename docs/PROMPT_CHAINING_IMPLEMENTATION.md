# Prompt Chaining Implementation Guide

## Overview
This document describes the Prompt Chaining feature that allows users to iteratively refine AI-generated images by providing short text prompts without re-uploading images.

## Architecture

### Components Created

#### 1. **API Route: `/api/generate-chain/route.ts`**
- **Purpose**: Handles prompt chaining requests
- **Key Features**:
  - Takes a previously generated image (base64) and a new prompt
  - Uses Gemini 2.5 Flash Image model for continuous refinement
  - Maintains credit system (5 credits per refinement)
  - Stores chain history in Supabase with `source_prompt_id` tracking
  - Supports aspect ratio configuration

**Request Payload**:
```typescript
{
  prompt: string;              // New refinement instruction
  previousImage: {             // Last generated image
    mimeType: string;
    data: string;              // Base64 encoded
  };
  sourcePromptId?: string;     // Original prompt ID for tracking
  aspectRatio?: string;        // Optional aspect ratio
}
```

**Response**:
```typescript
{
  parts: Array<{
    type: 'text' | 'image';
    text?: string;
    mimeType?: string;
    data?: string;              // Base64 encoded image
  }>;
  chainInfo: {
    sourcePromptId: string | null;
    chainType: 'refinement';
  };
}
```

#### 2. **Component: `PromptChainModal.tsx`**
- **Purpose**: UI modal for entering refinement prompts
- **Features**:
  - Shows source image preview
  - Displays original prompt (if available)
  - Provides 8 quick suggestion buttons for common refinements
  - Input validation and loading states
  - Uses inline SVG icons (no external dependencies)

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onChain: (prompt: string) => void;
  isLoading?: boolean;
  sourceImage: string;
  sourcePrompt?: string;
}
```

**Quick Suggestions**:
- "Change the background to a magical forest"
- "Make it more photorealistic"
- "Add dramatic lighting"
- "Convert to watercolor painting style"
- "Add more vibrant colors"
- "Make it nighttime scene"
- "Add motion blur for dynamic feel"
- "Create a vintage film look"

#### 3. **Component: `ImageRefinementButton.tsx`**
- **Purpose**: Button overlay on generated images
- **Features**:
  - Appears on hover over generated images
  - Purple accent to distinguish from other actions
  - Disabled state during loading
  - Smooth animations

#### 4. **Updated Components**

**`Scrollable.tsx`**:
- Added `onRefineImage` prop
- Integrated `ImageRefinementButton` on generated images
- Button shows on hover with smooth opacity transition

**`page.tsx`** (Home):
- Added state management for chaining:
  - `isChainModalOpen`: Controls modal visibility
  - `chainSourceImage`: Stores the image being refined
  - `chainSourceMessage`: Stores the source message context
  - `isChaining`: Loading state for chain operations

- Added handlers:
  - `handleRefineImage()`: Opens modal with selected image
  - `handleExecuteChain()`: Executes the refinement
  - `handleCloseChainModal()`: Closes modal safely

### Type Definitions

**Updated `ChatMessage` interface**:
```typescript
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  text?: string;
  images?: string[];
  generatedImages?: string[];
  isLoading?: boolean;
  chainSourceId?: string;      // NEW: Links to source message
  promptId?: string;            // NEW: Database prompt ID
}
```

**Updated `ScrollableProps` interface**:
```typescript
interface ScrollableProps {
  // ... existing props
  onRefineImage?: (imageUrl: string, sourceMessage: ChatMessage) => void;
}
```

## User Flow

### 1. Initial Image Generation
```
User enters prompt → API generates image → Image displayed with "Refine" button
```

### 2. Image Refinement
```
User hovers over image → "Refine" button appears
↓
User clicks "Refine" → Modal opens showing:
  - Source image preview
  - Original prompt
  - Refinement input field
  - Quick suggestions
↓
User enters refinement → Clicks "Refine Image"
↓
System:
  1. Converts image to base64
  2. Sends to /api/generate-chain
  3. Gemini processes: previous image + new instruction
  4. Returns refined image
↓
Refined image appears in chat thread
```

### 3. Continuous Chaining
Users can refine the same image multiple times in succession, creating an iterative improvement loop.

## Database Schema

The existing `prompt` table includes a `source_prompt_id` field for tracking chains:

```sql
CREATE TABLE prompt (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt_text TEXT,
  source_prompt_id UUID,  -- Links to parent prompt in chain
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Prompt Construction

The chain API constructs prompts to maintain consistency:

```typescript
const contents = [
  {
    inlineData: {
      mimeType: previousImage.mimeType,
      data: previousImage.data
    }
  },
  {
    text: `Based on the image above, ${prompt}. Keep the core elements and style of the original image while making the requested modifications.`
  }
];
```

This ensures:
- The model sees the previous image
- Instructions are contextually aware
- Core elements are preserved
- Only requested modifications are applied

## Credit System Integration

- **Cost per refinement**: 5 credits (same as initial generation)
- **Credit checks**: Performed before API call
- **Transaction type**: `'image_generation'`
- **Description format**: `"Chained generation: {prompt}..."`
- **Metadata tracking**:
  ```typescript
  {
    promptPreview: string;
    imagesGenerated: number;
    aspectRatio: string;
    sourcePromptId: string;
    chainType: 'refinement';
  }
  ```

## Error Handling

### Client-Side
- Validates user authentication
- Checks for valid image data
- Handles conversion errors
- Displays error messages inline

### Server-Side
- Credit balance validation (402 if insufficient)
- API key configuration check
- Gemini API error handling with retry logic
- Database operation error handling (non-blocking)

## Styling & UX

### Design Tokens
- **Primary color**: Purple (`purple-600`)
- **Button style**: Rounded, shadow, backdrop blur
- **Animations**: Smooth opacity transitions, scale on hover
- **Dark mode**: Full support with tailwind dark variants

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Disabled state handling

## Performance Considerations

1. **Image Conversion**: Blob to base64 happens client-side
2. **Lazy Loading**: Refinement button only renders on hover
3. **API Optimization**: Reuses existing Gemini connection
4. **Storage**: Images stored in Supabase with deduplicated paths

## Testing Checklist

- [ ] User can click "Refine" on generated images
- [ ] Modal opens with correct source image
- [ ] Quick suggestions populate input field
- [ ] Custom refinement prompts work
- [ ] Refined images appear in chat thread
- [ ] Credit deduction occurs correctly
- [ ] Chain history tracked in database
- [ ] Error states display properly
- [ ] Loading states prevent double-submission
- [ ] Dark mode displays correctly
- [ ] Mobile responsive design works

## Future Enhancements

1. **Chain History View**: Visualize the evolution of an image through multiple refinements
2. **Undo/Redo**: Return to previous states in the chain
3. **Preset Refinements**: Save common refinement patterns
4. **Comparison View**: Side-by-side before/after
5. **Bulk Refinement**: Apply same refinement to multiple images
6. **Advanced Controls**: Fine-tune refinement strength, preserve specific elements
7. **Chain Templates**: Pre-built multi-step refinement workflows

## Troubleshooting

### "Insufficient credits" error
- User needs to purchase more credits
- Check credit balance in header

### "Failed to refine image" error
- Check network connectivity
- Verify Gemini API key is configured
- Check browser console for detailed errors

### Image not loading in modal
- Verify image URL is valid
- Check CORS settings if using external images
- Ensure image hasn't been deleted from storage

### Refinement doesn't preserve original style
- Adjust prompt wording to be more specific
- Try using "Keep the same style but..." prefix
- Report to support for model fine-tuning

## Code Examples

### Opening the Chain Modal Programmatically
```typescript
const handleRefineImage = (imageUrl: string, sourceMessage: ChatMessage) => {
  setChainSourceImage(imageUrl);
  setChainSourceMessage(sourceMessage);
  setIsChainModalOpen(true);
};
```

### Executing a Chain
```typescript
const handleExecuteChain = async (refinementPrompt: string) => {
  const response = await fetch('/api/generate-chain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: refinementPrompt,
      previousImage: { mimeType, data: base64 },
      sourcePromptId: chainSourceMessage.promptId,
      aspectRatio: aspectRatio,
    }),
  });
  
  const data = await response.json();
  // Process refined images
};
```

## Summary

The Prompt Chaining feature enables continuous, iterative image refinement with minimal friction. Users can quickly improve generated images without re-uploading, maintaining context across multiple refinements. The implementation integrates seamlessly with the existing credit system, database schema, and UI patterns.
