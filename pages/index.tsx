import Head from 'next/head';
import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Home: NextPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<string>('');
  const [submittedNotes, setSubmittedNotes] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedGeneratedIndex, setSelectedGeneratedIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Initialize the Gemini AI model
  const initializeAI = () => {
    if (typeof window === 'undefined') return null;
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenerativeAI(apiKey);
  };

  // Use state with initialization function
  const [genAI] = useState<GoogleGenerativeAI | null>(initializeAI);
  const [model, setModel] = useState<any>(null);

  // Initialize model
  useEffect(() => {
    if (genAI) {
      try {
        const modelInstance = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image-preview" });
        setModel(modelInstance);
      } catch (err) {
        console.error('Error initializing model:', err);
      }
    }
  }, [genAI]);

  // Function to generate response using Gemini API
  const generateGeminiResponse = async (prompt: string, imageFiles?: File[]) => {
    // Instead of calling Gemini directly from the client (which caused payload issues),
    // POST to our server API which uses the official Node client and supports inline images.
    try {
      const imagesPayload: Array<{ mimeType: string; data: string }> = [];
      if (imageFiles && imageFiles.length > 0) {
        for (const f of imageFiles) {
          const arrayBuffer = await f.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
          const b64 = window.btoa(binary);
          imagesPayload.push({ mimeType: f.type || 'image/png', data: b64 });
        }
      }

      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, images: imagesPayload }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const message = err.error || err.message || 'Server error';
        // Attach server detail for UI debug
        throw new Error(`${message}${err.detail ? ' — ' + JSON.stringify(err.detail) : ''}`);
      }

      const json = await resp.json();

      // Helper: extract parts regardless of response shape
      const extractParts = (obj: any) => {
        if (!obj) return [];
        // Direct parts
        if (Array.isArray(obj.parts)) return obj.parts;

        // Some responses return candidates -> [ { content: { parts: [...] } } ]
        if (Array.isArray(obj.candidates) && obj.candidates.length > 0) {
          const c = obj.candidates[0];
          if (c?.content?.parts && Array.isArray(c.content.parts)) return c.content.parts;
          if (c?.content && typeof c.content === 'object' && (c.content.type || c.content.mimeType)) {
            // Single content object (image/text)
            return [c.content];
          }
        }

        // Fallback: return empty array
        return [];
      };

      // Normalize and sanitize base64 data (remove whitespace/newlines)
      const rawParts = extractParts(json);
      const parts = rawParts.map((p: any) => {
        if (p && p.type === 'image' && typeof p.data === 'string') {
          // Remove any whitespace or newlines that might be injected into base64
          const cleaned = p.data.replace(/\s+/g, '');
          return { ...p, data: cleaned };
        }
        return p;
      });

      // json.parts is array of { type: 'text'|'image', text?, mimeType?, data? }
      return parts;
    } catch (err) {
      console.error('Client generate error:', err);
      throw err;
    }
  };

  // Handler for when the user submits their input
  const handleSave = async (t: string) => {
    setSavedNotes(t);
    setIsLoading(true);
    setError('');
    
    // Check if we're running on client side
    if (typeof window === 'undefined') {
      setError('Cannot generate response on server side');
      setIsLoading(false);
      return;
    }

    // Check if API client and model are initialized
    if (!genAI || !model) {
      setError('API client or model not initialized. Please wait and try again.');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Starting API call...');
      console.log('API Key available:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      
      if (!notes.trim()) {
        throw new Error('Please enter some text before generating a response');
      }
      
      // Generate response from server-side Gemini proxy
      const parts = await generateGeminiResponse(notes, files);

      console.log('Response parts received:', parts);

      // Extract text parts and image parts
      const texts: string[] = [];
      const images: string[] = [];
      if (Array.isArray(parts)) {
        for (const p of parts) {
          if (p.type === 'text' && p.text) texts.push(p.text);

          if (p.type === 'image' && p.data) {
            // p.data may already be a full data URL (starts with 'data:')
            // or it may be raw base64. Handle both safely.
            let imgStr = String(p.data).trim();

            if (imgStr.startsWith('data:')) {
              // Already a data URL — use as-is
              images.push(imgStr);
            } else {
              // Clean whitespace/newlines and strip any accidental 'base64,' prefix
              imgStr = imgStr.replace(/\s+/g, '');
              if (imgStr.startsWith('base64,')) imgStr = imgStr.slice('base64,'.length);
              const mime = p.mimeType || 'image/png';
              images.push(`data:${mime};base64,${imgStr}`);
            }
          }
        }
      }

  setSubmittedNotes(texts.join('\n\n'));
  setGeneratedImages(images);
  // set selected index to first image when new images arrive
  if (images.length > 0) setSelectedGeneratedIndex(0);
    } catch (err: any) {
      // Show user-friendly error message with more details
      const errorMessage = err.message || 'Unknown error occurred';
      setError(`Failed to generate response: ${errorMessage}`);
      console.error('Detailed API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Image Generator</title>
        <meta name="description" content="Upload an image and preview it instantly." />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>

      <main className="min-h-screen bg-neutral-100">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <header className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight">Generate Your Dream Image</h1>
            <p className="text-neutral-600 mt-2">
              Select an image to see a live preview instantly. Supported formats: PNG, JPG, GIF, etc.
            </p>
          </header>

          <ImageUploader onImagesSelected={setFiles} onTextChange={setNotes} onSubmitText={handleSave} />

          {savedNotes && (
            <div className="mt-4 text-sm text-neutral-700">
              Saved Prompt: <span className="font-medium">{savedNotes}</span>
            </div>
          )}

          {isLoading && (
            <div className="mt-4 p-3 bg-white rounded-lg shadow-sm text-sm text-neutral-700">
              Generating response...
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg shadow-sm text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Render text response if available */}
          {!isLoading && submittedNotes && (
            <div className="mt-4 p-3 bg-white rounded-lg shadow-sm text-sm text-neutral-700">
              Response: <span className="font-medium">{submittedNotes}</span>
            </div>
          )}

          {/* generated images placeholder moved below into its own wrapper (separate div) */}

          {files.length > 0 && (
            <div className="mt-6 text-sm text-neutral-600">
              <p className="font-medium">Selected files:</p>
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`}>
                    {f.name} — {(f.size / (1024 * 1024)).toFixed(2)} MB — {f.type || 'Unknown'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      {/* Separate generated images section (renders outside main content) */}
      {generatedImages.length > 0 && (
        <section className="mx-auto max-w-3xl px-6 py-8">
          <div className="p-3 bg-white rounded-lg shadow-sm text-sm text-neutral-700">
            <div className="mb-2 text-sm text-neutral-500">Generated image preview</div>
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-md bg-black/5 p-4 flex items-center justify-center">
                <img src={generatedImages[selectedGeneratedIndex]} alt={`generated-${selectedGeneratedIndex}`} className="max-h-[480px] w-full object-contain rounded-md" />
              </div>

              <div className="mt-3 flex gap-2">
                {generatedImages.map((src, i) => (
                  <button key={i} type="button" className={`rounded-md overflow-hidden border ${i === selectedGeneratedIndex ? 'ring-2 ring-black' : ''}`} onClick={() => setSelectedGeneratedIndex(i)}>
                    <img src={src} alt={`thumb-${i}`} className="h-20 w-20 object-cover" />
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <a href={generatedImages[selectedGeneratedIndex]} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-md border bg-white">Open in new tab</a>
                <a download={`generated-${selectedGeneratedIndex}.png`} href={generatedImages[selectedGeneratedIndex]} className="px-3 py-2 rounded-md bg-black text-white">Download</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
