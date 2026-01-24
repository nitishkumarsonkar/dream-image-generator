# Testing Checklist - Image Generation Flow Optimization

## Pre-Test Setup
- [ ] Ensure you have a Supabase account and the app is connected
- [ ] Sign in to the application
- [ ] Have at least a few previously generated images in your history

## 1. History Sidebar Tests

### Display & Visibility
- [ ] History sidebar is visible on page load (desktop)
- [ ] History sidebar shows toggle button in top-left
- [ ] Toggle button correctly opens/closes the sidebar
- [ ] Sidebar shows correct count of prompts in header
- [ ] If no history exists, shows "No prompts yet" empty state

### History Items
- [ ] Each history item displays:
  - [ ] Preview thumbnail (if image was generated)
  - [ ] Truncated prompt text (max 60 chars)
  - [ ] Formatted date/time
  - [ ] Delete button (visible on hover)
- [ ] Preview images are properly sized and cropped
- [ ] Long prompt text is truncated with ellipsis

### Interaction
- [ ] Clicking a history item inserts the prompt into textarea
- [ ] Clicking doesn't trigger if delete is in progress
- [ ] Refresh button reloads the history
- [ ] Refresh button shows "Refreshing..." state when loading

### Delete Functionality
- [ ] Hover over a history item shows delete button
- [ ] Delete button shows trash icon
- [ ] Clicking delete shows confirmation dialog
- [ ] Confirming delete removes item from list
- [ ] Canceling delete keeps item in list
- [ ] Delete in progress shows loading spinner
- [ ] Cannot interact with item while deleting

### Responsive Behavior
- [ ] Desktop (≥768px): Sidebar open by default
- [ ] Mobile (<768px): Sidebar closed by default
- [ ] Toggle button works on both mobile and desktop
- [ ] Sidebar overlay appears on mobile when open
- [ ] Clicking overlay closes sidebar on mobile
- [ ] Main content shifts with margin on desktop

## 2. Presets Modal Tests

### Opening & Closing
- [ ] Presets button is visible next to "Add Images" button
- [ ] Presets button has icon and "Presets" label
- [ ] Clicking Presets button opens modal
- [ ] Modal appears centered with backdrop
- [ ] Clicking backdrop closes modal
- [ ] Clicking X button closes modal
- [ ] Modal is responsive on mobile

### Preset Display
- [ ] All presets are displayed in grid (Instagram, Ghibli, Professional, Other)
- [ ] Each preset shows:
  - [ ] Label (e.g., "Instagram Portrait")
  - [ ] Description
  - [ ] Aspect ratio badge
  - [ ] Resolution badge (except "Other")
- [ ] Currently selected preset has visual indicator (checkmark)
- [ ] Presets have hover state

### Preset Selection
- [ ] Clicking a preset selects it
- [ ] Selecting a non-custom preset closes modal
- [ ] Selecting "Other" keeps modal open
- [ ] Selecting "Other" shows custom textarea
- [ ] Custom textarea has placeholder text
- [ ] Custom textarea allows typing
- [ ] "Apply Custom" button is disabled when textarea is empty
- [ ] "Apply Custom" button enables when text is entered
- [ ] Clicking "Apply Custom" closes modal and applies preset
- [ ] "Clear" button clears custom textarea

### Active Indicator
- [ ] Presets button shows blue dot when preset is selected
- [ ] Blue dot disappears when no preset is selected
- [ ] Blue dot persists after modal is closed

## 3. Image Generation Flow

### With History Selection
- [ ] Click a prompt from history
- [ ] Prompt appears in textarea
- [ ] Can edit the inserted prompt
- [ ] Can select a preset after inserting from history
- [ ] Submitting generates image as expected
- [ ] New generation appears in history sidebar

### With Preset
- [ ] Select a preset from modal
- [ ] Modal closes (except for "Other")
- [ ] Preset indicator shows on Presets button
- [ ] Type a prompt in textarea
- [ ] Submit generates image
- [ ] Generated image matches preset specifications
- [ ] New generation appears in history

### Without Preset
- [ ] Type a prompt without selecting preset
- [ ] Submit generates image
- [ ] Image generates with default settings
- [ ] New generation appears in history

### With Custom Preset
- [ ] Select "Other" preset
- [ ] Enter custom text
- [ ] Apply custom preset
- [ ] Type main prompt
- [ ] Submit generates image
- [ ] Custom preset text is appended to prompt

## 4. Layout & Spacing Tests

### Desktop Layout
- [ ] History sidebar width is appropriate (320px/80rem)
- [ ] Main content has correct left margin (md:ml-80)
- [ ] No horizontal scrollbar
- [ ] Content doesn't overlap sidebar
- [ ] All buttons are accessible
- [ ] Modal appears centered

### Mobile Layout
- [ ] History sidebar as overlay doesn't break layout
- [ ] Presets modal is full-width
- [ ] All buttons are touch-friendly
- [ ] No content cutoff
- [ ] Textarea remains usable
- [ ] Submit button accessible

### Button Positioning
- [ ] "Add Images" and "Presets" buttons are side-by-side
- [ ] Buttons have consistent styling
- [ ] Buttons align properly with textarea
- [ ] "Aspect Ratio" and "Submit" buttons remain on right
- [ ] No layout shift when buttons are added

## 5. Integration Tests

### Authentication
- [ ] History only shows when signed in
- [ ] History shows user's own prompts only
- [ ] Sign out clears history display
- [ ] Sign in loads history

### Database
- [ ] History fetches from Supabase correctly
- [ ] Delete removes record from database
- [ ] New generations save to database
- [ ] Refresh fetches latest data

### State Management
- [ ] Preset selection persists during session
- [ ] History updates after generation
- [ ] Modal state doesn't interfere with other components
- [ ] No memory leaks or performance issues

## 6. Error Handling

### History Errors
- [ ] Database connection error shows gracefully
- [ ] Empty history shows appropriate message
- [ ] Delete error shows alert
- [ ] Refresh error doesn't break UI

### Modal Errors
- [ ] Modal renders correctly even with missing props
- [ ] Custom preset validation works
- [ ] No console errors when using modal

### General
- [ ] No TypeScript errors in console
- [ ] No React warnings in console
- [ ] No accessibility errors
- [ ] No layout shift or flicker

## 7. Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## 8. Accessibility Tests

- [ ] All buttons have proper aria-labels
- [ ] Modal has proper focus management
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader can announce history items
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators are visible

## 9. Performance Tests

- [ ] History loads quickly (< 1s)
- [ ] Modal opens without lag
- [ ] No performance degradation with many history items
- [ ] Smooth animations (sidebar, modal)
- [ ] No jank when scrolling history

## 10. Regression Tests

### Existing Features Still Work
- [ ] Image upload still works
- [ ] Aspect ratio selection still works
- [ ] Submit button still works
- [ ] Generated images display correctly
- [ ] Error messages show correctly
- [ ] Theme toggle still works
- [ ] Navigation still works
- [ ] Other pages not affected (Chat, About, Prompt Library)

## Known Limitations

Document any issues found:
- 
- 
- 

## Sign-Off

- [ ] All critical tests pass
- [ ] No blocking bugs
- [ ] Ready for production

**Tester Name**: _______________
**Date**: _______________
**Environment**: _______________
