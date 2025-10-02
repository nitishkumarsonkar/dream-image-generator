import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/utils/supabase/server';
import { decode } from 'base64-arraybuffer';

type PartOut = { type: 'text'; text: string } | { type: 'image'; mimeType: string; data: string };

const BUCKET_NAME = 'generation_images';

// Note: Route Handlers in the app router don't support the `config` export used by
// pages/api to increase bodyParser size. When sending large payloads, prefer
// uploading to storage and sending URLs, or configure your hosting platform
// to accept larger request bodies. This handler will still accept typical
// JSON POST payloads.

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const apiKey = process.env.GENAI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GENAI API key missing. Set GENAI_API_KEY in environment');
      return NextResponse.json({ error: 'Server API key not configured. Set GENAI_API_KEY' }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

    const { prompt, images: inputImagesB64 } = body as { prompt: string; images?: Array<{ mimeType: string; data: string }> };

    const MAX_IMAGES = 5; // server-side hard limit
    const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

    if (Array.isArray(inputImagesB64) && inputImagesB64.length > MAX_IMAGES) {
      return NextResponse.json({ error: `Too many images. Maximum allowed is ${MAX_IMAGES}` }, { status: 400 });
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid prompt in request body' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const contents: any[] = [];
    if (Array.isArray(inputImagesB64)) {
      for (const [idx, img] of inputImagesB64.entries()) {
        if (!img || !img.data) {
          console.warn(`Skipping invalid image at index ${idx}`);
          continue;
        }
        const approxBytes = Math.ceil((img.data.length * 3) / 4);
        if (approxBytes > MAX_IMAGE_BYTES) {
          return NextResponse.json({ error: `Image at index ${idx} exceeds ${MAX_IMAGE_BYTES} bytes (approx)` }, { status: 400 });
        }
        contents.push({ inlineData: { mimeType: img.mimeType || 'image/png', data: img.data } });
      }
    }

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
      const detail = {
        message: callErr?.message,
        status: callErr?.status,
        details: callErr?.details || callErr?.body || null,
      };
      return NextResponse.json({ error: 'generateContent failed', detail }, { status: 500 });
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

    // --- Save to Supabase (best effort) ---
    if (user) {
      try {
        const outputImagesB64 = parts.filter(p => p.type === 'image');

        // 1. Insert the main prompt record
        const { data: promptData, error: promptError } = await supabase
          .from('prompt')
          .insert({ user_id: user.id, prompt_text: prompt })
          .select()
          .single();

        if (promptError) throw promptError;

        const newPromptId = promptData.id;
        const imagesToInsert = [];

        // 2. Upload and record input images
        if (inputImagesB64) {
          for (const img of inputImagesB64) {
            const filePath = `${user.id}/${newPromptId}/input_${Date.now()}`;
            const { data, error } = await supabase.storage
              .from(BUCKET_NAME)
              .upload(filePath, decode(img.data), { contentType: img.mimeType });
            if (error) {
              console.error('Error uploading input image:', error);
              continue; // Skip this image
            }
            const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
            imagesToInsert.push({ prompt_id: newPromptId, image_url: publicUrl, image_type: 'input' });
          }
        }

        // 3. Upload and record output images
        for (const img of outputImagesB64) {
          const filePath = `${user.id}/${newPromptId}/output_${Date.now()}`;
          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, decode(img.data), { contentType: img.mimeType });
          if (error) {
            console.error('Error uploading output image:', error);
            continue; // Skip this image
          }
          const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
          imagesToInsert.push({ prompt_id: newPromptId, image_url: publicUrl, image_type: 'output' });
        }

        // 4. Batch insert all image records
        if (imagesToInsert.length > 0) {
          const { error: imagesError } = await supabase.from('prompt_images').insert(imagesToInsert);
          if (imagesError) throw imagesError;
        }

        console.log(`Successfully saved generation ${newPromptId} for user ${user.id}`);

      } catch (dbError) {
        console.error('Failed to save generation to Supabase:', dbError);
        // Do not block the user response for a DB error
      }
    }
    // --- End of Supabase save ---

    return NextResponse.json({ parts, debug: { candidates: !!response.candidates } });
  } catch (err: any) { 
    console.error('API generate unexpected error:', err);
    return NextResponse.json({ error: 'Unexpected server error', message: err?.message || String(err) }, { status: 500 });
  }
}
