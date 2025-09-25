import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

type PartOut = { type: 'text'; text: string } | { type: 'image'; mimeType: string; data: string };

// Increase body size limit to accept base64 image payloads from the client.
// Adjust this value to your expected maximum. For production, prefer uploading
// images to cloud storage and sending URLs instead of large inline payloads.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.GENAI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GENAI API key missing. Set GENAI_API_KEY in .env.local');
    return res.status(500).json({ error: 'Server API key not configured. Set GENAI_API_KEY in .env.local' });
  }

  try {
    const { prompt, images } = req.body as { prompt: string; images?: Array<{ mimeType: string; data: string }> };

    const MAX_IMAGES = 5; // server-side hard limit
    const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

    if (Array.isArray(images) && images.length > MAX_IMAGES) {
      return res.status(400).json({ error: `Too many images. Maximum allowed is ${MAX_IMAGES}` });
    }

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid prompt in request body' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const contents: any[] = [];
    if (Array.isArray(images)) {
      for (const [idx, img] of images.entries()) {
        if (!img || !img.data) {
          console.warn(`Skipping invalid image at index ${idx}`);
          continue;
        }
        // estimate decoded byte size from base64 length
        const approxBytes = Math.ceil((img.data.length * 3) / 4);
        if (approxBytes > MAX_IMAGE_BYTES) {
          return res.status(400).json({ error: `Image at index ${idx} exceeds ${MAX_IMAGE_BYTES} bytes (approx)` });
        }
        contents.push({ inlineData: { mimeType: img.mimeType || 'image/png', data: img.data } });
      }
    }
    // push the prompt as plain text part (matches the genai Node client example)
    contents.push({ text: prompt });

    console.log('Calling GoogleGenAI.generateContent', { model: 'gemini-2.5-flash-image-preview', parts: contents.length });

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents,
      });
    } catch (callErr: any) {
      console.error('generateContent call failed:', callErr);
      // Try to surface underlying response body if present
      const detail = {
        message: callErr?.message,
        status: callErr?.status,
        details: callErr?.details || callErr?.body || null,
      };
      return res.status(500).json({ error: 'generateContent failed', detail });
    }

    const parts: PartOut[] = [];
    const candidate = response.candidates?.[0];
    if (candidate && candidate.content && Array.isArray(candidate.content.parts)) {
      for (const part of candidate.content.parts) {
        if (part.text) parts.push({ type: 'text', text: part.text });
        else if (part.inlineData && part.inlineData.data) {
          parts.push({ type: 'image', mimeType: part.inlineData.mimeType || 'image/png', data: part.inlineData.data });
        }
      }
    }

    return res.status(200).json({ parts, debug: { candidates: !!response.candidates } });
  } catch (err: any) {
    console.error('API generate unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected server error', message: err?.message || String(err) });
  }
}
