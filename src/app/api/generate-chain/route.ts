import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/app/utils/supabase/server';
import { decode } from 'base64-arraybuffer';
import { hasEnoughCredits, deductCredits } from '@/utils/supabase/credits';
import { logError, logInfo, logUserAction, logCreditOperation } from '@/lib/logger';

type PartOut = { type: 'text'; text: string } | { type: 'image'; mimeType: string; data: string };

const BUCKET_NAME = 'prompts-pic';
const IMAGE_GENERATION_COST = 5; // Credit cost for generating an image

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Check if user is authenticated
    if (!user) {
      logInfo('Unauthorized prompt chain generation attempt', { ip: request.headers.get('x-forwarded-for') });
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to generate images.' },
        { status: 401 }
      );
    }

    // Check if user has enough credits
    const enoughCredits = await hasEnoughCredits(user.id, IMAGE_GENERATION_COST, supabase);
    if (!enoughCredits) {
      logCreditOperation('check', user.id, IMAGE_GENERATION_COST, 0);
      return NextResponse.json(
        { error: 'Insufficient credits', requiredCredits: IMAGE_GENERATION_COST },
        { status: 402 } // Payment Required
      );
    }

    const apiKey = process.env.GENAI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      logError('GENAI API key missing', new Error('API Key not configured'), user.id, {
        component: 'prompt-chaining'
      });
      return NextResponse.json({ error: 'Server API key not configured. Set GENAI_API_KEY' }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });

    const { 
      prompt, 
      previousImage, 
      sourcePromptId, // Optional: ID of the original prompt for chaining tracking
      aspectRatio 
    } = body as {
      prompt: string;
      previousImage: { mimeType: string; data: string }; // Base64 encoded image
      sourcePromptId?: string;
      aspectRatio?: string;
    };

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid prompt in request body' }, { status: 400 });
    }

    if (!previousImage || !previousImage.data) {
      return NextResponse.json({ error: 'Missing previous image for chaining' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Create the prompt content: previous image + new prompt instruction
    const contents: any[] = [
      {
        inlineData: {
          mimeType: previousImage.mimeType || 'image/png',
          data: previousImage.data
        }
      },
      {
        text: `Based on the image above, ${prompt}. Keep the core elements and style of the original image while making the requested modifications.`
      }
    ];

    logUserAction('prompt_chain_initiated', user.id, {
      promptLength: prompt.length,
      sourcePromptId: sourcePromptId || 'unknown',
      aspectRatio: aspectRatio || 'default'
    });

    console.log('Calling GoogleGenAI.generateContent for prompt chaining', { 
      model: 'gemini-2.5-flash-image', 
      parts: contents.length, 
      aspectRatio 
    });

    let response: any;
    try {
      const config: any = {};
      if (aspectRatio) {
        config.imageConfig = {
          aspectRatio: aspectRatio
        };
      }
      
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents,
        config
      });
    } catch (callErr: any) {
      logError('GoogleGenAI generateContent failed for prompt chaining', callErr, user.id, {
        component: 'prompt-chaining',
        promptLength: prompt.length,
        aspectRatio: aspectRatio || 'default',
        errorStatus: callErr?.status,
        errorDetails: callErr?.details
      });
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

    // Deduct credits for successful image generation
    if (user) {
      try {
        const newBalance = await deductCredits({
          userId: user.id,
          amount: IMAGE_GENERATION_COST,
          type: 'image_generation',
          description: `Chained generation: ${prompt.slice(0, 50)}...`,
          metadata: {
            promptPreview: prompt.slice(0, 100),
            imagesGenerated: parts.filter(p => p.type === 'image').length,
            aspectRatio: aspectRatio || 'default',
            sourcePromptId: sourcePromptId || 'unknown',
            chainType: 'refinement'
          },
        }, supabase);

        logCreditOperation('deduct', user.id, IMAGE_GENERATION_COST, newBalance);
      } catch (creditError) {
        logError('Failed to deduct credits for prompt chaining', creditError as Error, user.id, {
          component: 'credit-system',
          amount: IMAGE_GENERATION_COST
        });
        return NextResponse.json(
          { error: 'Failed to deduct credits', details: creditError instanceof Error ? creditError.message : 'Unknown error' },
          { status: 500 }
        );
      }
    }

    // --- Save to Supabase (best effort) ---
    if (user) {
      try {
        const outputImagesB64 = parts.filter(p => p.type === 'image');

        // 1. Insert the chain prompt record
        const { data: promptData, error: promptError } = await supabase
          .from('prompt')
          .insert({ 
            user_id: user.id, 
            prompt_text: prompt,
            source_prompt_id: sourcePromptId || null // Track the chaining relationship
          })
          .select()
          .single();

        if (promptError) throw promptError;

        const newPromptId = promptData.id;
        const imagesToInsert = [];

        // Helper to map MIME type to file extension
        const extFromMime = (mime?: string) => {
          const m = (mime || '').toLowerCase();
          if (m.includes('png')) return 'png';
          if (m.includes('jpeg')) return 'jpg';
          if (m.includes('jpg')) return 'jpg';
          if (m.includes('webp')) return 'webp';
          if (m.includes('gif')) return 'gif';
          if (m.includes('bmp')) return 'bmp';
          if (m.includes('tiff')) return 'tiff';
          return 'png';
        };

        // Use a dedicated folder structure for chained prompts
        const resolvedBasePrefix = `${user.id}/${newPromptId}/chain`;

        // 2. Upload the input image (previous generated image)
        const inputExt = extFromMime(previousImage.mimeType);
        const inputFilePath = `${resolvedBasePrefix}/input_${Date.now()}.${inputExt}`;
        const { data: inputData, error: inputError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(inputFilePath, decode(previousImage.data), { contentType: previousImage.mimeType });
        
        if (!inputError && inputData) {
          const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(inputData.path);
          imagesToInsert.push({ prompt_id: newPromptId, image_url: publicUrl, image_type: 'input' });
        }

        // 3. Upload and record output images
        for (const img of outputImagesB64) {
          const ext = extFromMime(img.mimeType);
          const filePath = `${resolvedBasePrefix}/output_${Date.now()}.${ext}`;
          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, decode(img.data), { contentType: img.mimeType });
          if (error) {
            console.error('Error uploading chained output image:', error);
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

        logInfo('Successfully saved chained generation to database', {
          userId: user.id,
          promptId: newPromptId,
          sourcePromptId: sourcePromptId || 'unknown',
          imagesCount: imagesToInsert.length
        });

        console.log(`Successfully saved chained generation ${newPromptId} for user ${user.id}`);

      } catch (dbError) {
        logError('Failed to save chained generation to Supabase', dbError as Error, user.id, {
          component: 'database',
          operation: 'save_chain_generation'
        });
        // Do not block the user response for a DB error
      }
    }
    // --- End of Supabase save ---

    const duration = Date.now() - startTime;
    logInfo('Prompt chain generation completed', {
      userId: user.id,
      duration,
      outputImages: parts.filter(p => p.type === 'image').length
    });

    return NextResponse.json({ 
      parts, 
      debug: { candidates: !!response.candidates },
      chainInfo: {
        sourcePromptId: sourcePromptId || null,
        chainType: 'refinement'
      }
    });
  } catch (err: any) { 
    logError('API generate-chain unexpected error', err, undefined, {
      component: 'prompt-chaining',
      url: request.url,
      method: request.method
    });
    return NextResponse.json({ error: 'Unexpected server error', message: err?.message || String(err) }, { status: 500 });
  }
}