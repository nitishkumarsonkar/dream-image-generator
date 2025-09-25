"use client";

import React, { useState, useEffect } from 'react';
import ImageUploader from '../components/ImageUploader';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function HomePage() {
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
		const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string | undefined;
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
				const modelInstance = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });
				setModel(modelInstance);
			} catch (err) {
				console.error('Error initializing model:', err);
			}
		}
	}, [genAI]);

	// Function to generate response using Gemini API
	const generateGeminiResponse = async (prompt: string, imageFiles?: File[]) => {
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
				throw new Error(`${message}${err.detail ? ' — ' + JSON.stringify(err.detail) : ''}`);
			}

			const json = await resp.json();

			const extractParts = (obj: any) => {
				if (!obj) return [];
				if (Array.isArray(obj.parts)) return obj.parts;
				if (Array.isArray(obj.candidates) && obj.candidates.length > 0) {
					const c = obj.candidates[0];
					if (c?.content?.parts && Array.isArray(c.content.parts)) return c.content.parts;
					if (c?.content && typeof c.content === 'object' && (c.content.type || c.content.mimeType)) {
						return [c.content];
					}
				}
				return [];
			};

			const rawParts = extractParts(json);
			const parts = rawParts.map((p: any) => {
				if (p && p.type === 'image' && typeof p.data === 'string') {
					const cleaned = p.data.replace(/\s+/g, '');
					return { ...p, data: cleaned };
				}
				return p;
			});

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

		if (typeof window === 'undefined') {
			setError('Cannot generate response on server side');
			setIsLoading(false);
			return;
		}

		if (!genAI || !model) {
			setError('API client or model not initialized. Please wait and try again.');
			setIsLoading(false);
			return;
		}

		try {
			if (!notes.trim()) {
				throw new Error('Please enter some text before generating a response');
			}

			const parts = await generateGeminiResponse(notes, files);

			const texts: string[] = [];
			const images: string[] = [];
			if (Array.isArray(parts)) {
				for (const p of parts) {
					if (p.type === 'text' && p.text) texts.push(p.text);

					if (p.type === 'image' && p.data) {
						let imgStr = String(p.data).trim();

						if (imgStr.startsWith('data:')) {
							images.push(imgStr);
						} else {
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
			if (images.length > 0) setSelectedGeneratedIndex(0);
		} catch (err: any) {
			const errorMessage = err.message || 'Unknown error occurred';
			setError(`Failed to generate response: ${errorMessage}`);
			console.error('Detailed API Error:', err);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<main className="min-h-screen">
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

					{!isLoading && submittedNotes && (
						<div className="mt-4 p-3 bg-white rounded-lg shadow-sm text-sm text-neutral-700">
							Response: <span className="font-medium">{submittedNotes}</span>
						</div>
					)}

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
}
