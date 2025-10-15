# 🧪 Quick Testing Guide - Credit Deduction Fix

## ⚡ Fast Test Steps

### Test 1: Image Generation Credit Deduction (5 credits)

1. **Open the app** and sign in
2. **Check credits**: Look at header or go to `/credits`
3. **Note current balance**: Write it down (e.g., 50 credits)
4. **Generate an image**:
   - Go to home page (`/`)
   - Enter prompt: "A beautiful sunset over mountains"
   - Click Generate
5. **Verify deduction**:
   - New balance should be: Previous - 5
   - Example: 50 → 45 credits

### Test 2: AI Chat Credit Deduction (1 credit per message)

1. **Check current credit balance** (from Test 1 or fresh)
2. **Go to chat page**: Navigate to `/chat`
3. **Send a message**: "Help me create a prompt for a futuristic city"
4. **Wait for AI response**
5. **Verify deduction**:
   - Balance decreased by 1 credit
   - Example: 45 → 44 credits

### Test 3: Multiple Actions

1. **Starting balance**: Check current credits
2. **Perform sequence**:
   - Chat message #1 → -1 credit
   - Chat message #2 → -1 credit
   - Generate image #1 → -5 credits
   - Chat message #3 → -1 credit
   - Generate image #2 → -5 credits
3. **Expected total deduction**: -13 credits
4. **Verify**: Final balance = Starting balance - 13

### Test 4: Transaction History

1. **Go to credits page**: `/credits`
2. **View transaction history**
3. **Verify entries**:
   - Each image generation shows: `-5 credits`
   - Each chat message shows: `-1 credit`
   - Description includes action details
   - Timestamps are correct

### Test 5: Insufficient Credits Error

#### For Image Generation:
1. **Use credits** until you have less than 5 (e.g., 3 credits left)
2. **Try to generate image**
3. **Expected**: Error message "Insufficient credits"
4. **UI should prompt** to buy more credits

#### For AI Chat:
1. **Use all credits** until balance is 0
2. **Try to send chat message**
3. **Expected**: Error message "Insufficient credits"

---

## 🔍 Visual Checklist

### ✅ What You Should See:

- [ ] Credit balance updates immediately after each action
- [ ] Image generation costs 5 credits
- [ ] Each chat message costs 1 credit
- [ ] Transaction history shows all deductions
- [ ] Error shown when credits run out
- [ ] Can purchase more credits to continue

### ❌ What Should NOT Happen:

- [ ] Credits stay the same after generating image
- [ ] Credits stay the same after chat message
- [ ] Can generate images with 0 credits
- [ ] Can chat with 0 credits
- [ ] No transaction records

---

## 🐛 Debug Commands

### Check User Credits in Database:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM user_credits WHERE user_id = 'YOUR_USER_ID';
```

### Check Recent Transactions:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM credit_transactions 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Browser Console:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Should see: "Successfully deducted X credits"

---

## 📊 Expected Results Table

| Action | Starting Balance | Cost | Final Balance |
|--------|-----------------|------|---------------|
| Generate Image | 50 | -5 | 45 |
| Chat Message | 45 | -1 | 44 |
| Generate Image | 44 | -5 | 39 |
| Chat Message | 39 | -1 | 38 |
| Chat Message | 38 | -1 | 37 |

---

## 🚨 Troubleshooting

### Problem: Credits not deducting
**Check**:
- User is signed in
- Check browser console for errors
- Verify API response status (should be 200)
- Check Supabase logs

### Problem: "Insufficient credits" shown but I have credits
**Solution**:
- Hard refresh page (Cmd+Shift+R / Ctrl+Shift+R)
- Sign out and sign back in
- Clear browser cache

### Problem: Transaction history empty
**Check**:
- Database migration 0007 is applied
- RLS policies are enabled
- User ID matches in database

---

## ✨ Success Criteria

Your fix is working correctly if:

1. ✅ Credits decrease by 5 after image generation
2. ✅ Credits decrease by 1 after each chat message
3. ✅ All transactions appear in history
4. ✅ Cannot generate images with less than 5 credits
5. ✅ Cannot chat with 0 credits
6. ✅ Error messages are clear and helpful

---

## 🎯 Quick Test Script (Copy & Paste)

Test in browser console:
```javascript
// Check credit balance
fetch('/api/credits/balance')
  .then(r => r.json())
  .then(console.log);

// Generate test image (costs 5 credits)
fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    prompt: 'Test image for credit deduction' 
  })
}).then(r => r.json()).then(console.log);

// Send test chat (costs 1 credit)
fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message: 'Test message',
    sessionId: 'test-session-123'
  })
}).then(r => r.json()).then(console.log);
```

---

## 📝 Test Report Template

```
Date: ___________
Tester: ___________

✅ Image Generation Test:
- Starting credits: _____
- Generated images: _____
- Expected final credits: _____
- Actual final credits: _____
- Result: PASS / FAIL

✅ AI Chat Test:
- Starting credits: _____
- Messages sent: _____
- Expected final credits: _____
- Actual final credits: _____
- Result: PASS / FAIL

✅ Transaction History Test:
- All transactions visible: YES / NO
- Correct amounts: YES / NO
- Result: PASS / FAIL

✅ Insufficient Credits Test:
- Error shown for images: YES / NO
- Error shown for chat: YES / NO
- Result: PASS / FAIL

Overall Status: PASS / FAIL
Notes: _________________________________
```

---

**Happy Testing! 🎉**
