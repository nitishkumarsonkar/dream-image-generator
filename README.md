# Next Image Uploader (Next.js + TypeScript + TailwindCSS)

Minimal landing page built with Next.js that lets users:
- Upload an image via a file input
- See a live preview instantly
- Enter notes in a text box positioned to the right of the preview
- Submit the text via a button (parent receives the saved value)

This project uses functional React components with hooks (useState, useRef, useEffect) and is fully typed with TypeScript.

## Tech Stack

- Next.js 14
- React 18
- TypeScript 5
- TailwindCSS 3
- PostCSS

## Features

- Clean, minimal UI
- Image-only validation (accept="image/*" and MIME type check)
- Basic max size validation (default 5MB)
- Instant image preview using URL.createObjectURL with cleanup
- Notes text area to the right of the preview (responsive layout; stacks on small screens)
- Submit button to save the notes text (prop-based callback)
- Strict TypeScript types for components and hooks

## Getting Started

Prerequisites:
- Node.js 18+ recommended
- npm

Install dependencies:

```bash
cd next-image-uploader
npm install
```

Run the development server:

```bash
npm run dev
```

Open the app in your browser:

```
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Project Structure

```
next-image-uploader/
├─ components/
│  └─ ImageUploader.tsx       # Image input + preview + notes text box + submit button
├─ pages/
│  ├─ _app.tsx                # Tailwind styles import
│  └─ index.tsx               # Landing page wiring and demo state
├─ styles/
│  └─ globals.css             # Tailwind directives
├─ tailwind.config.js
├─ postcss.config.js
├─ tsconfig.json
├─ next-env.d.ts
└─ package.json
```

## How It Works

- components/ImageUploader.tsx
  - Props:
    - onImageSelected?: (file: File) => void
    - onTextChange?: (text: string) => void
    - onSubmitText?: (text: string) => void
    - initialText?: string
    - maxSizeMB?: number (default 5)
    - className?: string
  - Behavior:
    - Accepts only image/* files
    - Checks max file size
    - Previews selected image
    - Controls the notes textarea state and calls onTextChange on change
    - Calls onSubmitText(text) when the Submit button is clicked (no-op if text is empty)

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
