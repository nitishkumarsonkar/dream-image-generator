# 🎨 Credit System - Visual Guide

## 📱 User Interface Overview

### 1. Navigation Bar
```
┌─────────────────────────────────────────────────────────┐
│ Dream Generator    [Home] [AI Chat] [Credits] [About]  │
│                                    👤 User  🌙  ☰       │
└─────────────────────────────────────────────────────────┘
```

### 2. Credits Page - Main Layout

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│   📊 Credits Dashboard                                    │
│   Generate images and chat with AI using your credits    │
│                                                           │
│   ┌─────────────────────────────────────────────┐        │
│   │  Available Credits                          │        │
│   │  ████████████████████████████████████       │        │
│   │     250                [View History]       │        │
│   └─────────────────────────────────────────────┘        │
│                                                           │
│   ┌─────────────────────────────────────────────┐        │
│   │ 🎨 Image Generator  💬 AI Chat  💳 Buy      │        │
│   │    (5 credits)      (1/msg)     Credits     │        │
│   └─────────────────────────────────────────────┘        │
│                                                           │
│   [Active Tab Content Here]                              │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 🖼️ Tab 1: Image Generation

```
┌───────────────────────────────────────────────────────────┐
│  Image Generation                                         │
│  Generate stunning images from text. Each costs 5 credits│
│                                                           │
│  Enter your prompt:                                       │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ A beautiful sunset over mountains with...           │ │
│  │                                                     │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  [ 🎨 Generate Image (5 credits) ]                       │
│                                                           │
│  Generated Image:                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                                                     │ │
│  │            [Generated Image Preview]                │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

**Flow:**
1. User enters prompt
2. Clicks "Generate Image"
3. System checks: Has 5 credits? ✅
4. Deducts 5 credits
5. Shows generated image
6. Balance updates: 250 → 245

---

## 💬 Tab 2: AI Chat

```
┌───────────────────────────────────────────────────────────┐
│  AI Chat                                                  │
│  Chat with our AI assistant. Each message costs 1 credit │
│                                                           │
│  ┌───────────────────────────────────────────────────┐   │
│  │                                                   │   │
│  │  👤 User:                                         │   │
│  │  "What is the weather today?"                     │   │
│  │                                                   │   │
│  │       🤖 AI:                                      │   │
│  │       "I can help you with that..."              │   │
│  │                                                   │   │
│  │  👤 User:                                         │   │
│  │  "Tell me more"                                   │   │
│  │                                                   │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────┐ [ Send ]                    │
│  │ Type your message...    │                              │
│  └─────────────────────────┘                              │
└───────────────────────────────────────────────────────────┘
```

**Flow:**
1. User types message
2. Presses Send or Enter
3. System checks: Has 1 credit? ✅
4. Deducts 1 credit
5. Shows user message
6. AI responds
7. Balance updates: 245 → 244

---

## 💳 Tab 3: Buy Credits

```
┌───────────────────────────────────────────────────────────┐
│  Purchase Credits                                         │
│  Choose a package to add more credits to your account     │
│                                                           │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  Starter Pack    │  │  Popular Pack    │  ⭐          │
│  │                  │  │  MOST POPULAR    │             │
│  │      100         │  │      300         │             │
│  │    credits       │  │    credits       │             │
│  │                  │  │   (+50 bonus!)   │             │
│  │      ₹99         │  │      ₹199        │             │
│  │                  │  │                  │             │
│  │   [ Buy Now ]    │  │   [ Buy Now ]    │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                           │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │ Professional     │  │ Enterprise Pack  │             │
│  │      650         │  │      1400        │             │
│  │    credits       │  │    credits       │             │
│  │  (+150 bonus!)   │  │  (+400 bonus!)   │             │
│  │      ₹349        │  │      ₹599        │             │
│  │   [ Buy Now ]    │  │   [ Buy Now ]    │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                           │
│  💡 Credit Usage Guide                                    │
│  • Image Generation: 5 credits per image                 │
│  • AI Chat: 1 credit per message                         │
│  • New users: Get 50 free credits on signup!             │
│  • Bonus credits: Get extra with larger packages         │
└───────────────────────────────────────────────────────────┘
```

**Flow:**
1. User selects package
2. Clicks "Buy Now"
3. Razorpay checkout opens
4. User completes payment
5. System verifies payment
6. Credits added to account
7. Balance updates: 244 → 544 (with Popular Pack)

---

## 📊 Transaction History (Expandable)

```
┌─────────────────────────────────────────────────────────┐
│  Available Credits: 544           [Hide History]        │
│                                                         │
│  Recent Transactions                                    │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Purchased 300 credits via Razorpay         +300  │ │
│  │ 10/13/2025, 2:30 PM                  Balance: 544│ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Generated image: "sunset..."              -5     │ │
│  │ 10/13/2025, 2:25 PM                  Balance: 244│ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ AI Chat message                           -1     │ │
│  │ 10/13/2025, 2:20 PM                  Balance: 249│ │
│  └───────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Welcome bonus - 50 free credits           +50    │ │
│  │ 10/12/2025, 10:00 AM                  Balance: 50│ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ Insufficient Credits Modal

```
┌─────────────────────────────────────────────────────────┐
│          [Background Dimmed with Blur]                  │
│                                                         │
│     ┌─────────────────────────────────────────┐       │
│     │                                         │       │
│     │         ⚠️                              │       │
│     │                                         │       │
│     │   Insufficient Credits                  │       │
│     │                                         │       │
│     │   You don't have enough credits for     │       │
│     │   this action. Purchase more credits    │       │
│     │   to continue.                          │       │
│     │                                         │       │
│     │   [ Cancel ]      [ Buy Credits ]       │       │
│     │                                         │       │
│     └─────────────────────────────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Trigger:**
- User tries to generate image with < 5 credits
- User tries to send chat message with 0 credits

**Actions:**
- **Cancel**: Closes modal, stays on current tab
- **Buy Credits**: Closes modal, switches to Buy Credits tab

---

## 💳 Razorpay Payment Flow

### Step 1: User Clicks "Buy Now"
```
┌─────────────────────────────────┐
│      Professional Pack          │
│          650 credits            │
│        (+150 bonus!)            │
│           ₹349                  │
│    [ Processing... ] ← Loading  │
└─────────────────────────────────┘
```

### Step 2: Razorpay Checkout Opens
```
┌─────────────────────────────────────────┐
│  Razorpay Secure Checkout               │
│                                         │
│  Dream Generator                        │
│  Professional Pack - 650 Credits        │
│  Amount: ₹349.00                        │
│                                         │
│  Card Number                            │
│  [4111 1111 1111 1111]                 │
│                                         │
│  Expiry Date        CVV                 │
│  [12/25]           [123]               │
│                                         │
│  [ Pay ₹349 ]                          │
│                                         │
│  🔒 Secured by Razorpay                │
└─────────────────────────────────────────┘
```

### Step 3: Payment Success
```
┌─────────────────────────────────────────┐
│              ✅                          │
│                                         │
│  Payment Successful!                    │
│  650 credits added to your account.     │
│                                         │
│  [ OK ]                                 │
└─────────────────────────────────────────┘
```

Balance updates automatically: 244 → 894

---

## 📱 Mobile View

```
┌─────────────────────────┐
│ ☰  Dream Generator  🌙  │
├─────────────────────────┤
│                         │
│  Available Credits      │
│      ████████           │
│        250              │
│  [View History]         │
│                         │
├─────────────────────────┤
│ 🎨 Image (5)            │
│ 💬 Chat (1)             │
│ 💳 Buy                  │
├─────────────────────────┤
│                         │
│  [Tab Content]          │
│                         │
│                         │
│                         │
└─────────────────────────┘
```

Fully responsive:
- Stacked layout on mobile
- Touch-friendly buttons
- Optimized spacing
- Smooth scrolling

---

## 🌙 Dark Mode

```
┌───────────────────────────────────────────────────────┐
│ 🌙 Dark Mode Activated                                │
│                                                       │
│ • Dark background with subtle gradients               │
│ • High contrast text                                  │
│ • Glowing accent colors                               │
│ • Reduced eye strain                                  │
│ • Consistent across all tabs                          │
└───────────────────────────────────────────────────────┘
```

Colors:
- Background: Dark neutral (950)
- Text: Light neutral (100)
- Accents: Primary & Accent colors with glow
- Borders: Subtle with opacity

---

## 🎨 Color Scheme

### Light Mode
```
Primary:   #8B5CF6 (Purple)
Accent:    #06B6D4 (Cyan)
Background: #FAFAFA → #F5F5F5 (Gradient)
Text:      #171717
```

### Dark Mode
```
Primary:   #A78BFA (Light Purple)
Accent:    #22D3EE (Light Cyan)
Background: #0A0A0A → #171717 (Gradient)
Text:      #FAFAFA
```

---

## 💫 Animations & Interactions

### 1. Button Hover
```
Normal:  [Buy Now]
Hover:   [Buy Now] ← Scales up, shadow increases
Active:  [Buy Now] ← Scales down slightly
```

### 2. Tab Switch
```
Inactive: [AI Chat] ← Gray text
Active:   [AI Chat] ← Gradient background, white text
         Smooth transition (300ms)
```

### 3. Modal Appearance
```
Frame 1: Opacity 0%, Scale 95%
Frame 2: Opacity 50%, Scale 97%
Frame 3: Opacity 100%, Scale 100%
         Duration: 200ms ease-out
```

### 4. Credit Update
```
245 → 244
    ↓
Fades out old number
Fades in new number
Highlight briefly (300ms)
```

---

## 🎯 User Journey Example

### Scenario: New user wants to generate an image

```
Step 1: User signs up
        └─> Receives 50 free credits automatically
        
Step 2: Navigates to /credits page
        └─> Sees 50 credits in balance
        
Step 3: Clicks "Image Generator" tab
        └─> Enters prompt: "A beautiful sunset"
        
Step 4: Clicks "Generate Image (5 credits)"
        └─> System checks: 50 >= 5? ✅
        └─> Deducts 5 credits
        └─> Balance: 50 → 45
        └─> Shows generated image
        
Step 5: Generates 9 more images
        └─> Balance: 45 → 0
        
Step 6: Tries to generate another
        └─> System checks: 0 >= 5? ❌
        └─> Shows "Insufficient Credits" modal
        
Step 7: Clicks "Buy Credits"
        └─> Switched to Buy Credits tab
        
Step 8: Selects "Popular Pack" (300 credits, ₹199)
        └─> Razorpay checkout opens
        
Step 9: Completes payment
        └─> Payment verified
        └─> Credits added: 0 + 300 = 300
        └─> Balance: 300
        
Step 10: Can now continue generating!
```

---

## 📈 Credit System Benefits

### For Users
✅ Clear pricing (no surprises)
✅ Free credits to start
✅ Bonus credits with larger packs
✅ Transaction history for transparency
✅ Secure payment via Razorpay

### For Business
✅ Predictable revenue model
✅ User retention (purchased credits)
✅ Upsell opportunities (bonus packs)
✅ Fraud prevention (server-side validation)
✅ Complete audit trail

### For Developers
✅ Easy to integrate
✅ Scalable architecture
✅ Well-documented
✅ Type-safe (TypeScript)
✅ Reusable utilities

---

## 🎊 Success States

### After Image Generation
```
┌─────────────────────────────────────┐
│  ✅ Image generated successfully!   │
│  Credits remaining: 245             │
└─────────────────────────────────────┘
```

### After Credit Purchase
```
┌─────────────────────────────────────┐
│  ✅ Payment successful!             │
│  300 credits added to your account. │
│  New balance: 544                   │
└─────────────────────────────────────┘
```

### After Chat Message
```
User message sent → AI responds → Credits deducted
(Seamless, no interruption)
```

---

## 🔔 Notifications (Future Enhancement)

```
┌──────────────────────────────────┐
│ 🔔 Low Credit Warning            │
│ You have 10 credits remaining.   │
│ Consider purchasing more.        │
│ [ Buy Now ]  [ Dismiss ]         │
└──────────────────────────────────┘
```

Could trigger at:
- 10 credits remaining
- 5 credits remaining
- 0 credits

---

This visual guide shows how the credit system looks and works from a user's perspective. The actual implementation matches these designs with smooth animations and responsive layouts! 🎨✨
