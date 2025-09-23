import Head from 'next/head';
import type { NextPage } from 'next';
import { useState } from 'react';
import ImageUploader from '../components/ImageUploader';

const Home: NextPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<string>('');

  const handleSave = (t: string) => {
    setSavedNotes(t);
  };

  return (
    <>
      <Head>
        <title>Image Uploader</title>
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

          <ImageUploader onImageSelected={setFile} onTextChange={setNotes} onSubmitText={handleSave} />

          {savedNotes && (
            <div className="mt-4 text-sm text-neutral-700">
              Saved text: <span className="font-medium">{savedNotes}</span>
            </div>
          )}

          {file && (
            <div className="mt-6 text-sm text-neutral-600">
              <p>Selected: <span className="font-medium text-neutral-800">{file.name}</span></p>
              <p>Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              <p>Type: {file.type || 'Unknown'}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
