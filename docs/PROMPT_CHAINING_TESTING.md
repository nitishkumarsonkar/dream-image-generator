# 🧪 Prompt Chaining - Testing Guide

## Pre-Testing Setup

### 1. Environment Variables
Ensure these are set in your `.env.local`:
```bash
GENAI_API_KEY=your_gemini_api_key
# OR
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Verify User Account
- Ensure you have a user account
- User should have at least 20 credits for testing

## 🎯 Test Scenarios

### Test 1: Basic Refinement Flow
**Objective**: Verify the complete refinement workflow

**Steps**:
1. Navigate to `http://localhost:3000`
2. Sign in with your account
3. Generate an image with prompt: "A cute cartoon robot"
4. Wait for image to be generated
5. Hover over the generated image
6. Verify "Refine" button appears in top-right corner (purple)
7. Click "Refine" button
8. Verify modal opens showing:
   - Source image preview
   - Original prompt: "A cute cartoon robot"
   - Empty refinement input field
   - 8 suggestion buttons
9. Enter refinement: "make the background a sunset"
10. Click "Refine Image" button
11. Verify loading state ("Refining..." text)
12. Wait for refined image
13. Verify new image appears in chat with:
    - Robot preserved
    - Sunset background added
    - "🔄 Refine:" prefix in user message

**Expected Result**: ✅ Refined image displays with sunset background, robot preserved

**Credits Used**: 10 (5 for initial + 5 for refinement)

---

### Test 2: Multiple Chained Refinements
**Objective**: Test continuous chaining capability

**Steps**:
1. Generate image: "A modern house"
2. Refine 1: "add a swimming pool"
3. Refine 2: "make it nighttime with lights"
4. Refine 3: "add mountains in background"
5. Verify each refinement builds on the previous

**Expected Result**: ✅ Each refinement maintains previous modifications

**Credits Used**: 20 (5 × 4 generations)

---

### Test 3: Quick Suggestions
**Objective**: Verify suggestion buttons work

**Steps**:
1. Generate any image
2. Click "Refine" button
3. Click suggestion: "Add dramatic lighting"
4. Verify suggestion text appears in input field
5. Click "Refine Image"
6. Verify image has dramatic lighting added

**Expected Result**: ✅ Suggestion correctly populates and applies

---

### Test 4: Modal Close Behavior
**Objective**: Test modal closing functionality

**Steps**:
1. Generate an image
2. Click "Refine"
3. Close modal without entering prompt (click X)
4. Verify modal closes
5. Click "Refine" again
6. Enter a refinement prompt
7. Close modal with X button
8. Verify prompt is cleared
9. Click "Refine" again
10. Verify input field is empty

**Expected Result**: ✅ Modal closes properly, state resets

---

### Test 5: Loading State
**Objective**: Verify loading states prevent issues

**Steps**:
1. Generate an image
2. Click "Refine"
3. Enter prompt: "add a garden"
4. Click "Refine Image"
5. While loading, try to:
   - Close modal (should be prevented)
   - Click "Refine Image" again (should be disabled)
   - Click another "Refine" button (should be disabled)

**Expected Result**: ✅ All actions blocked during loading

---

### Test 6: Insufficient Credits
**Objective**: Test credit validation

**Steps**:
1. Reduce user credits to 4 or less (via database or settings)
2. Generate an image (should fail if < 5 credits)
3. If you have an image, try to refine
4. Verify error message: "Insufficient credits"

**Expected Result**: ✅ Error displayed, refinement blocked

**Recovery**: Add credits back to continue testing

---

### Test 7: Error Handling
**Objective**: Test error scenarios

**Steps**:
1. Temporarily disconnect internet
2. Try to refine an image
3. Verify error message displays
4. Reconnect internet
5. Try refinement again
6. Verify it works

**Expected Result**: ✅ Graceful error handling with clear messages

---

### Test 8: Dark Mode
**Objective**: Verify dark mode compatibility

**Steps**:
1. Toggle dark mode (if available in your app)
2. Generate an image
3. Click "Refine"
4. Verify modal displays correctly in dark mode:
   - Dark background
   - Light text
   - Proper contrast
   - All elements visible

**Expected Result**: ✅ All UI elements properly styled in dark mode

---

### Test 9: Mobile Responsiveness
**Objective**: Test on mobile viewport

**Steps**:
1. Open Chrome DevTools
2. Toggle device toolbar (Cmd+Shift+M / Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Generate an image
5. Verify "Refine" button is accessible
6. Click "Refine"
7. Verify modal fits on screen
8. Test all interactions

**Expected Result**: ✅ Fully functional on mobile devices

---

### Test 10: Large Image Handling
**Objective**: Test with high-resolution images

**Steps**:
1. Generate an image with aspect ratio 16:9
2. Verify image loads
3. Click "Refine"
4. Verify conversion completes (may take a moment)
5. Apply refinement
6. Verify result

**Expected Result**: ✅ Large images handled correctly

---

## 🔍 Detailed Verification Checks

### UI/UX Checks
- [ ] Refine button appears only on hover
- [ ] Refine button has purple color
- [ ] Modal has proper shadow and backdrop
- [ ] Source image displays in modal
- [ ] Original prompt shows if available
- [ ] Input field has placeholder text
- [ ] All 8 suggestions are visible
- [ ] Buttons have hover effects
- [ ] Loading spinner animates
- [ ] Toast notifications work (if applicable)

### Functional Checks
- [ ] Image conversion works (blob → base64)
- [ ] API request completes successfully
- [ ] Response contains refined image
- [ ] Refined image displays in chat
- [ ] Credits deducted correctly
- [ ] Database entry created
- [ ] Chain relationship recorded (`source_prompt_id`)
- [ ] Images saved to storage
- [ ] Error states display properly

### Performance Checks
- [ ] Modal opens instantly (<100ms)
- [ ] Image conversion < 1 second
- [ ] API response < 10 seconds
- [ ] No memory leaks (check DevTools)
- [ ] Smooth animations (60fps)

## 🐛 Bug Reporting Template

If you find issues, use this template:

```markdown
**Bug Title**: [Brief description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Screenshots**:
[Attach if applicable]

**Console Errors**:
[Paste console errors]

**Environment**:
- Browser: 
- OS: 
- User ID: 
- Credit Balance: 

**Additional Notes**:
[Any other relevant information]
```

## 📊 Test Results Template

```markdown
# Prompt Chaining Test Results

**Date**: [Date]
**Tester**: [Name]
**Environment**: Development / Staging / Production

## Test Summary
- Total Tests: 10
- Passed: ___
- Failed: ___
- Blocked: ___

## Detailed Results

### Test 1: Basic Refinement Flow
- Status: ✅ Pass / ❌ Fail / ⏸️ Blocked
- Notes: 

### Test 2: Multiple Chained Refinements
- Status: ✅ Pass / ❌ Fail / ⏸️ Blocked
- Notes: 

[... continue for all tests]

## Issues Found
1. 
2. 
3. 

## Recommendations
- 
- 

## Overall Assessment
[Pass / Fail / Needs Review]
```

## 🎯 Acceptance Criteria

The feature is ready for production when:

- [x] All 10 test scenarios pass
- [x] No critical bugs found
- [x] Performance meets targets (< 10s per refinement)
- [x] Mobile works flawlessly
- [x] Dark mode fully functional
- [x] Credits system accurate
- [x] Database tracking works
- [x] Error handling graceful
- [x] Documentation complete
- [x] Code reviewed

## 🚀 Quick Smoke Test (5 minutes)

For quick verification:

1. **Start**: `npm run dev`
2. **Generate**: Create any image
3. **Hover**: Verify button appears
4. **Click**: Open modal
5. **Refine**: Use a suggestion
6. **Verify**: Check refined result
7. **Credits**: Confirm deduction (10 credits used)

✅ If all above work: **Feature is functional**

## 🔧 Debugging Tools

### Browser Console
Check for errors:
```javascript
// Should see these logs on success:
"Calling GoogleGenAI.generateContent for prompt chaining"
"Prompt chain generation completed"
"Successfully saved chained generation to database"
```

### Network Tab
Monitor API calls:
```
POST /api/generate-chain
Status: 200 OK
Response Time: ~3-5s
```

### Supabase Dashboard
Verify database entries:
1. Check `prompt` table for new records with `source_prompt_id`
2. Check `prompt_images` table for input/output images
3. Check `credit_transactions` for deductions

## 🎓 Common Issues & Solutions

### Issue: "Refine button doesn't appear"
**Solution**: 
- Check hover state classes: `group` and `group-hover:opacity-100`
- Verify image container has `group` class

### Issue: "Modal opens but image doesn't show"
**Solution**: 
- Check image URL is valid
- Verify CORS settings
- Check network tab for image loading errors

### Issue: "Refinement fails silently"
**Solution**: 
- Check browser console for errors
- Verify API key is set
- Check user is authenticated
- Verify sufficient credits

### Issue: "Credits not deducted"
**Solution**: 
- Check credit_transactions table
- Verify deductCredits() is called after success
- Check for database errors in logs

### Issue: "Dark mode looks broken"
**Solution**: 
- Verify all dark: variants are applied
- Check tailwind config includes dark mode
- Test with system preference changes

## 📈 Performance Benchmarks

Target metrics:
- Modal open: < 100ms
- Image conversion: < 1s
- API request: 2-5s
- Total flow: < 10s
- Memory usage: < 50MB increase

## ✅ Final Checklist

Before marking as complete:

- [ ] All tests pass
- [ ] No console errors
- [ ] Credits work correctly
- [ ] Database entries correct
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Loading states prevent issues
- [ ] Error messages are clear
- [ ] Documentation reviewed
- [ ] Code commented
- [ ] Ready for production

---

**Happy Testing!** 🎉

If you encounter any issues, refer to:
- `PROMPT_CHAINING_IMPLEMENTATION.md` for technical details
- `PROMPT_CHAINING_QUICK_START.md` for code examples
- `PROMPT_CHAINING_ARCHITECTURE.md` for system design
