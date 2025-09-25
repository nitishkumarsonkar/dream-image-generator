# Dream Image Generator (Next.js + TypeScript + Gemini AI)

An interactive web application that allows users to:
- Upload and preview images instantly
- Enter text prompts for AI-powered image analysis
- Get AI-generated responses using Google's Gemini AI
- Save and view response history

This project uses functional React components with hooks (useState, useRef, useEffect) and is fully typed with TypeScript.

## Tech Stack

- Next.js 14
- React 18
- TypeScript 5
- TailwindCSS 3
- Google Gemini AI
- PostCSS

## Features

- Clean, minimal UI with responsive design
- Real-time image preview
- Image validation (file type and size)
- Integration with Google's Gemini AI for text generation
- Asynchronous API handling with loading states
- Error handling and user feedback
- Type-safe implementation with TypeScript

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm package manager
- Google Gemini API key (Get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/nitishkumarsonkar/dream-image-generator.git
cd dream-image-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open the app in your browser:
```
http://localhost:3000
```

## Project Structure

```
dream-image-generator/
├─ components/
│  └─ ImageUploader.tsx    # Image upload component with preview
├─ pages/
│  ├─ _app.tsx            # App configuration and global styles
│  └─ index.tsx           # Main page with Gemini AI integration
├─ styles/
│  └─ globals.css         # Global styles and Tailwind directives
├─ env.d.ts              # Environment variable types
├─ tailwind.config.js    # Tailwind configuration
├─ postcss.config.js     # PostCSS configuration
├─ next-env.d.ts         # Next.js TypeScript definitions
└─ package.json          # Project dependencies and scripts
```

## How It Works

### Image Upload Component
- Handles image file selection and validation
- Provides instant image preview
- Manages text input for AI prompts
- Responsive layout that works on all screen sizes

### Gemini AI Integration
- Processes user text input through Google's Gemini AI
- Generates contextual responses
- Handles API communication with proper error handling
- Provides loading states for better UX

### API Usage
Example cURL request to test the Gemini API:
```bash
curl -X POST \
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "Your prompt text here"
          }
        ]
      }
    ],
    "generationConfig": {
      "temperature": 0.7,
      "topK": 40,
      "topP": 0.8,
      "maxOutputTokens": 1000
    }
  }'
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Environment Variables

- `NEXT_PUBLIC_GEMINI_API_KEY`: Your Google Gemini API key (required)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the ISC License.

- pages/index.tsx
  - Demonstrates using ImageUploader:
    - Stores selected File in file state
    - Stores live notes text in notes state
    - Saves submitted text into savedNotes state via handleSave

## Customization

- Change max size:
  - Pass maxSizeMB to the component, e.g. <ImageUploader maxSizeMB={2} />
- Pre-fill notes:
  - Pass initialText, e.g. <ImageUploader initialText="Hello" />
- Handle submit:
  - Provide onSubmitText to integrate with an API or form handling:
    ```tsx
    const handleSave = async (t: string) => {
      // TODO: call your API here
      console.log('Saving text:', t);
    };
    <ImageUploader onSubmitText={handleSave} />
    ```

## Scripts

- npm run dev — start dev server
- npm run build — build for production
- npm start — start production server

## Notes

- This app uses TailwindCSS for minimal styling; adjust classes as needed.
- The preview URL is revoked on cleanup to avoid memory leaks.
- The Submit button is disabled for empty/whitespace-only notes.
