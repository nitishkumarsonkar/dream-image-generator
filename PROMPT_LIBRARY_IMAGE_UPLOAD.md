# Prompt Library Image Upload Feature

## Overview
Added functionality to allow users to upload both input images and generated images when adding prompts to the prompt library. This enhancement enables users to share complete examples of their prompts with visual references.

## Changes Made

### 1. New Component: `ImageUploadModal.tsx`
**Location:** `/src/app/prompt-library/ImageUploadModal.tsx`

**Features:**
- Drag-and-drop style image upload interface
- Support for multiple image uploads (up to 5 images by default)
- Image preview with thumbnails in a grid layout
- Individual image removal with hover delete buttons
- Clear all functionality
- File size validation (5MB per image by default)
- File type validation (images only)
- Responsive design that works on mobile and desktop
- Dark mode support

**Props:**
- `title`: Label for the upload section
- `onImagesSelected`: Callback when images are selected
- `onRemove`: Callback to remove a specific image
- `selectedFiles`: Array of currently selected files
- `maxImages`: Maximum number of images allowed (default: 5)
- `maxSizeMB`: Maximum file size in MB (default: 5)

### 2. Updated: `prompt-library.ts`
**Location:** `/src/utils/supabase/prompt-library.ts`

**New Function:** `savePromptWithImages()`
- Handles complete workflow of saving prompts with images
- Uploads images to Supabase Storage (`prompts-pic` bucket)
- Creates records in `prompt_images` table
- Links images to prompt library entries via `source_prompt_id`
- Supports both input and output images
- Proper error handling and rollback capabilities
- Generates unique file paths with timestamps to avoid conflicts

**Image Storage Structure:**
```
prompts-pic/
  └── prompt-library/
      └── {user_id}/
          ├── {timestamp}_input_0.{ext}
          ├── {timestamp}_input_1.{ext}
          ├── {timestamp}_output_0.{ext}
          └── {timestamp}_output_1.{ext}
```

### 3. Updated: `page.tsx`
**Location:** `/src/app/prompt-library/page.tsx`

**Changes:**
- Added import for `ImageUploadModal` component
- Added import for `savePromptWithImages` utility function
- Added state management for input and output images:
  - `inputImages`: Array of input image files
  - `outputImages`: Array of generated image files
  - `isSaving`: Loading state during save operation
- Updated `handleAdd()` function:
  - Detects if images are present
  - Routes to `savePromptWithImages()` when images exist
  - Falls back to `savePrompt()` for text-only prompts
  - Shows loading state during save
  - Clears image state after successful save
- Enhanced "Add Prompt" modal:
  - Increased width from `max-w-md` to `max-w-2xl` for better image display
  - Added scrolling with `max-h-[90vh] overflow-y-auto`
  - Integrated two `ImageUploadModal` components:
    - One for input images (optional)
    - One for generated/output images (optional)
  - Updated buttons with disabled state during save
  - Clear images on modal cancel

## User Experience

### Adding a Prompt with Images

1. Click "Add Prompt" button
2. Fill in title and prompt text (required)
3. Optionally add category
4. Optionally upload input images:
   - Click "Upload Images" button
   - Select up to 5 images
   - Preview shows thumbnails
   - Hover over thumbnail to delete individual images
5. Optionally upload generated images:
   - Same process as input images
6. Choose public/private visibility
7. Click "Save Prompt" (shows loading state)
8. Images are uploaded to Supabase Storage
9. Prompt appears in library with thumbnail preview

### Viewing Prompts with Images

- Library grid shows the first generated image as preview
- Click on prompt card to view details modal
- Details modal displays:
  - All input images (if any)
  - All generated images (if any)
  - Click on any image to open in new tab (full size)

## Technical Details

### Database Schema
The feature uses existing tables:
- `prompt_library`: Stores prompt metadata
  - `source_prompt_id`: Links to `prompt_images` records
- `prompt_images`: Stores image URLs and types
  - `prompt_id`: UUID reference
  - `image_url`: Public URL from storage
  - `image_type`: 'input' or 'output'

### Storage Integration
- Uses Supabase Storage `prompts-pic` bucket
- Files organized by user ID and timestamp
- Public URLs generated for each uploaded image
- Supports all standard image formats (PNG, JPG, GIF, WebP, etc.)

### Performance Considerations
- Images validated before upload (size, type)
- Preview URLs properly cleaned up to prevent memory leaks
- Async uploads with error handling
- Loading states prevent multiple submissions
- Optimistic UI updates for better UX

## Future Enhancements

Possible improvements:
1. Image compression before upload
2. Drag-and-drop file upload
3. Image cropping/editing
4. Batch upload progress indicators
5. Image reordering capability
6. Support for video files
7. Automatic thumbnail generation
8. Image galleries with lightbox view

## Testing Checklist

- ✅ Upload single input image
- ✅ Upload multiple input images (up to 5)
- ✅ Upload single output image
- ✅ Upload multiple output images (up to 5)
- ✅ Mix of input and output images
- ✅ File size validation
- ✅ File type validation
- ✅ Remove individual images
- ✅ Clear all images
- ✅ Save with images
- ✅ Save without images (backwards compatible)
- ✅ View prompts with images in grid
- ✅ View prompt details with images
- ✅ Cancel modal clears images
- ✅ Dark mode compatibility
- ✅ Mobile responsive design
- ✅ Loading states during save
