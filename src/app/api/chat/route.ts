import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, type Content } from '@google/genai';
import { createClient } from '@/utils/supabase/server';
import { IMAGE_PROMPT_SYSTEM_INSTRUCTION } from '@/lib/gemini-config';
import { hasEnoughCredits, deductCredits } from '@/utils/supabase/credits';

// Initialize Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

// Credit cost for AI chat messages
const CHAT_CREDIT_COST = 1;

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  created_at?: string;
}

interface ChatRequestBody {
  message: string;
  sessionId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ChatRequestBody = await request.json();
    const { message: userMessage, sessionId } = body;

    if (!userMessage || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Create Supabase client and get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has enough credits
    const enoughCredits = await hasEnoughCredits(user.id, CHAT_CREDIT_COST, supabase);
    if (!enoughCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits', requiredCredits: CHAT_CREDIT_COST },
        { status: 402 } // Payment Required
      );
    }

    // Fetch all past messages for this session from Supabase
    const { data: pastMessages, error: fetchError } = await supabase
      .from('chat_messages')
      .select('role, content, created_at')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('Error fetching messages:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch message history' },
        { status: 500 }
      );
    }

    // Build the conversation history for Gemini
    const history: Content[] = [];
    
    // Add system instruction as the first user-model exchange if no history exists
    if (!pastMessages || pastMessages.length === 0) {
      history.push({
        role: 'user',
        parts: [{ text: 'Hello, I need help creating an image prompt.' }],
      });
      history.push({
        role: 'model',
        parts: [{ text: IMAGE_PROMPT_SYSTEM_INSTRUCTION + '\n\nHello! I\'d be happy to help you create a detailed image prompt. What image idea do you have in mind?' }],
      });
    } else {
      // Map existing messages to Gemini format
      history.push(...pastMessages.map((msg: ChatMessage) => ({
        role: msg.role as 'user' | 'model',
        parts: [{ text: msg.content }],
      })));
    }

    // Create chat with history
    const chat = ai.chats.create({
      model: 'gemini-2.0-flash-exp',
      history: history,
    });

    // Send the new user message and get model response
    const result = await chat.sendMessage({
      message: userMessage,
    });

    const modelResponse = result.text;

    // Deduct credits for the AI chat message
    try {
      await deductCredits({
        userId: user.id,
        amount: CHAT_CREDIT_COST,
        type: 'ai_chat',
        description: `AI chat message in session ${sessionId}`,
        metadata: {
          sessionId,
          messagePreview: userMessage.slice(0, 50),
        },
      }, supabase);
    } catch (creditError) {
      console.error('Error deducting credits:', creditError);
      return NextResponse.json(
        { error: 'Failed to deduct credits', details: creditError instanceof Error ? creditError.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Save the user message to Supabase
    const { error: insertUserError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        role: 'user',
        content: userMessage,
      });

    if (insertUserError) {
      console.error('Error saving user message:', insertUserError);
      // Continue anyway - we don't want to fail the request
    }

    // Save the model response to Supabase
    const { error: insertModelError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        role: 'model',
        content: modelResponse,
      });

    if (insertModelError) {
      console.error('Error saving model message:', insertModelError);
      // Continue anyway - we don't want to fail the request
    }

    // Create or update session record (for first message or final prompt updates)
    // Check if this is the first message of the session
    if (!pastMessages || pastMessages.length === 0) {
      // Create a session record with a title from the first user message
      const title = userMessage.slice(0, 50);
      const { error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          id: sessionId,
          user_id: user.id,
          title,
        });

      if (sessionError && sessionError.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating session:', sessionError);
      }
    } else {
      // Update session timestamp to keep it at top of history
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user.id);
    }

    // Return the model's response
    return NextResponse.json({
      response: modelResponse,
      sessionId,
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
