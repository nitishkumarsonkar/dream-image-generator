import Head from 'next/head';
import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Home: NextPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<string>('');
  const [submittedNotes, setSubmittedNotes] = useState<string>('');
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
        const modelInstance = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        setModel(modelInstance);
      } catch (err) {
        console.error('Error initializing model:', err);
      }
    }
  }, [genAI]);

  // Function to generate response using Gemini API
  const generateGeminiResponse = async (prompt: string) => {
    if (!genAI || !model) {
      throw new Error('API client or model not initialized');
    }

    try {
      console.log('Sending prompt to Gemini:', prompt);
      
      // Create a proper prompt structure
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 1000,
        },
      });

      const response = await result.response;
      console.log('Received response:', response);
      
      return response.text();
    } catch (err) {
      console.error('Detailed error:', err);
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
      
      // Generate response from Gemini API
      const response = await generateGeminiResponse(notes);
      
      console.log('Response received:', response);
      
      // Only update state if we got a valid response
      if (response) {
        setSubmittedNotes(response);
      } else {
        throw new Error('No response from API');
      }
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

          {!isLoading && submittedNotes && (
            <div className="mt-4 p-3 bg-white rounded-lg shadow-sm text-sm text-neutral-700">
              Response: <span className="font-medium">{submittedNotes}</span>
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
