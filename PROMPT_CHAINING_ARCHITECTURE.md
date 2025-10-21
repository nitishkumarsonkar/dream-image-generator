# Prompt Chaining - Architecture Diagram

## System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                      Chat Interface                             │    │
│  │  ┌──────────────────────────────────────────────────────────┐ │    │
│  │  │  User Prompt: "A cute robot"                             │ │    │
│  │  └──────────────────────────────────────────────────────────┘ │    │
│  │                                                                 │    │
│  │  ┌──────────────────────────────────────────────────────────┐ │    │
│  │  │  Generated Image                                         │ │    │
│  │  │  ┌────────────────────────────────────────────────────┐ │ │    │
│  │  │  │                                                    │ │ │    │
│  │  │  │           [Robot Image]                            │ │ │    │
│  │  │  │                                                    │ │ │    │
│  │  │  │        [Refine Button] ← Appears on Hover        │ │ │    │
│  │  │  └────────────────────────────────────────────────────┘ │ │    │
│  │  └──────────────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│                              ↓ User clicks "Refine"                      │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │                  PromptChainModal                               │    │
│  │  ┌──────────────────────────────────────────────────────────┐ │    │
│  │  │  Source Image Preview:  [Robot Image]                   │ │    │
│  │  │  Original Prompt: "A cute robot"                         │ │    │
│  │  ├──────────────────────────────────────────────────────────┤ │    │
│  │  │  Refinement Input:                                       │ │    │
│  │  │  ┌────────────────────────────────────────────────────┐ │ │    │
│  │  │  │ "make the background a sunset"                     │ │ │    │
│  │  │  └────────────────────────────────────────────────────┘ │ │    │
│  │  ├──────────────────────────────────────────────────────────┤ │    │
│  │  │  Quick Suggestions:                                      │ │    │
│  │  │  [Add dramatic lighting] [Make it nighttime]            │ │    │
│  │  │  [Convert to watercolor] [More vibrant colors]          │ │    │
│  │  └──────────────────────────────────────────────────────────┘ │    │
│  │                    [Refine Image Button]                       │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLIENT PROCESSING                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. Convert image URL to Blob                                           │
│  2. Convert Blob to Base64                                              │
│  3. Extract MIME type                                                   │
│  4. Prepare API payload                                                 │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        API ENDPOINT                                      │
│                   /api/generate-chain                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  1. ✓ Authenticate User                                                 │
│  2. ✓ Check Credit Balance (5 credits required)                        │
│  3. ✓ Validate Request Body                                            │
│  4. Construct Gemini API Request:                                       │
│     ┌────────────────────────────────────────────────────────────┐    │
│     │  contents: [                                                │    │
│     │    { inlineData: { mimeType, data: base64Image } },       │    │
│     │    { text: "Based on the image above, [user prompt].      │    │
│     │             Keep core elements while modifying..." }       │    │
│     │  ]                                                          │    │
│     └────────────────────────────────────────────────────────────┘    │
│  5. Call Gemini API (gemini-2.5-flash-image)                           │
│  6. Extract Generated Image(s)                                          │
│  7. ✓ Deduct 5 Credits                                                 │
│  8. ✓ Save to Database:                                                │
│     - Create new prompt record with source_prompt_id                   │
│     - Upload images to Supabase Storage                                │
│     - Link images to prompt in prompt_images table                     │
│  9. Return Response                                                     │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        GEMINI API                                        │
│                (gemini-2.5-flash-image-preview)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │  Input:                                                        │     │
│  │  • Previous Image (base64)                                     │     │
│  │  • Refinement Instruction                                      │     │
│  │  • Aspect Ratio Config                                         │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                           ↓                                              │
│                   [AI Processing]                                        │
│                           ↓                                              │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │  Output:                                                       │     │
│  │  • Refined Image (preserving original elements)                │     │
│  │  • Optional text description                                   │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE (Supabase)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────┐        │
│  │  prompt table:                                              │        │
│  │  ┌──────────┬─────────────┬────────────┬─────────────────┐│        │
│  │  │ id       │ user_id     │ prompt_text│ source_prompt_id││        │
│  │  ├──────────┼─────────────┼────────────┼─────────────────┤│        │
│  │  │ uuid-1   │ user-123    │ "A cute ro"│ NULL            ││        │
│  │  │ uuid-2   │ user-123    │ "make bg s"│ uuid-1          ││ ← Chain│
│  │  │ uuid-3   │ user-123    │ "add night"│ uuid-2          ││        │
│  │  └──────────┴─────────────┴────────────┴─────────────────┘│        │
│  └────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────┐        │
│  │  prompt_images table:                                       │        │
│  │  ┌──────────┬─────────────┬──────────────┬─────────────┐  │        │
│  │  │ id       │ prompt_id   │ image_url    │ image_type  │  │        │
│  │  ├──────────┼─────────────┼──────────────┼─────────────┤  │        │
│  │  │ img-1    │ uuid-1      │ storage/...  │ output      │  │        │
│  │  │ img-2    │ uuid-2      │ storage/...  │ input       │  │        │
│  │  │ img-3    │ uuid-2      │ storage/...  │ output      │  │        │
│  │  └──────────┴─────────────┴──────────────┴─────────────┘  │        │
│  └────────────────────────────────────────────────────────────┘        │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────┐        │
│  │  credit_transactions table:                                 │        │
│  │  ┌──────────┬─────────┬────────┬──────────────────────┐   │        │
│  │  │ id       │ user_id │ amount │ transaction_type     │   │        │
│  │  ├──────────┼─────────┼────────┼──────────────────────┤   │        │
│  │  │ txn-1    │ user-123│  -5    │ image_generation     │   │        │
│  │  │ txn-2    │ user-123│  -5    │ image_generation     │   │        │
│  │  └──────────┴─────────┴────────┴──────────────────────┘   │        │
│  └────────────────────────────────────────────────────────────┘        │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        RESPONSE TO CLIENT                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  {                                                                       │
│    parts: [                                                              │
│      {                                                                   │
│        type: 'image',                                                    │
│        mimeType: 'image/png',                                            │
│        data: 'base64EncodedRefinedImage...'                             │
│      }                                                                   │
│    ],                                                                    │
│    chainInfo: {                                                          │
│      sourcePromptId: 'uuid-1',                                           │
│      chainType: 'refinement'                                             │
│    }                                                                     │
│  }                                                                       │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        DISPLAY REFINED IMAGE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  User Message:                                                  │    │
│  │  "🔄 Refine: make the background a sunset"                     │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Assistant Message:                                             │    │
│  │  ┌──────────────────────────────────────────────────────────┐ │    │
│  │  │  [Robot with Sunset Background]                          │ │    │
│  │  │                                                           │ │    │
│  │  │        [Refine Button] ← Can refine again!              │ │    │
│  │  └──────────────────────────────────────────────────────────┘ │    │
│  │  [Copy] [Open] [Download] [Make Public]                       │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  ✅ User can chain multiple refinements!                                │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘


## Chain Relationship Visualization

```
Original Generation:
┌─────────────────────┐
│ Prompt: "A robot"   │
│ ID: uuid-1          │
│ source_id: NULL     │
└──────────┬──────────┘
           │
           ↓ Refine: "add sunset"
           │
     ┌─────┴──────────────┐
     │ Prompt: "add sun"  │
     │ ID: uuid-2         │
     │ source_id: uuid-1  │
     └──────────┬─────────┘
                │
                ↓ Refine: "make nighttime"
                │
          ┌─────┴───────────────┐
          │ Prompt: "nighttime" │
          │ ID: uuid-3          │
          │ source_id: uuid-2   │
          └─────────────────────┘
```

## Component Hierarchy

```
page.tsx (Home Page)
├── ImageGenerationHistory (Sidebar)
├── Scrollable (Main Content)
│   ├── Chat Messages
│   │   ├── User Messages
│   │   └── Assistant Messages
│   │       └── Generated Images
│   │           └── ImageRefinementButton ← NEW
│   └── Toast Notifications
├── FixedTextarea (Input Area)
│   ├── ImageUploader
│   └── PresetsModal
└── PromptChainModal ← NEW
    ├── Source Image Preview
    ├── Original Prompt Display
    ├── Refinement Input
    ├── Quick Suggestions
    └── Action Buttons
```

## State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Global State (page.tsx)                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  messages: ChatMessage[]                                     │
│  isLoading: boolean                                          │
│  error: string                                               │
│  aspectRatio: string                                         │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Chain-specific State                                  │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  isChainModalOpen: boolean                            │  │
│  │  chainSourceImage: string                             │  │
│  │  chainSourceMessage: ChatMessage | null               │  │
│  │  isChaining: boolean                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  Event Handlers:                                             │
│  • handleRefineImage(imageUrl, sourceMessage)                │
│  • handleExecuteChain(refinementPrompt)                      │
│  • handleCloseChainModal()                                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Credit Flow

```
User initiates refinement
         ↓
Check credit balance
         ↓
     ┌───┴────┐
     │        │
Sufficient   Insufficient
     │        │
     ↓        ↓
  Allow    Show 402 Error
     ↓
Process image
     ↓
Generate result
     ↓
Deduct 5 credits
     ↓
Record transaction
     ↓
Return refined image
```

## Error Handling Flow

```
API Request
     ↓
┌────┴────────────────────────────────────┐
│                                          │
Auth Check         Credit Check      Validation
     ↓                  ↓                  ↓
   Pass              Pass              Pass
     │                  │                  │
     └──────────┬───────┴──────────────────┘
                ↓
          Gemini API Call
                ↓
         ┌──────┴──────┐
         │             │
      Success        Error
         │             │
         ↓             ↓
    Deduct Credits  Retry Logic
         │             │
         ↓             ↓
    Save to DB    Max Retries?
         │             │
         ↓        ┌────┴────┐
    Return Result │         │
                  No       Yes
                  │         │
                Retry   Return Error
```

---

**Legend:**
- ✓ = Validation/Security checkpoint
- ↓ = Data flow direction
- ← = User interaction point
- [ ] = Clickable UI element
