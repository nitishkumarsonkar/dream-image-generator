import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logError, logInfo, logWarn } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    const sessionId = params.sessionId;

    if (!sessionId) {
      logWarn('Chat session messages requested without session ID');
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client and get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logWarn('Unauthorized chat session messages access attempt', {
        sessionId,
        authError: authError?.message,
        ip: request.headers.get('x-forwarded-for')
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    userId = user.id;

    // Fetch session metadata
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id, title, final_prompt, created_at, updated_at')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError) {
      logWarn('Chat session not found or access denied', {
        userId: user.id,
        sessionId,
        error: sessionError.message
      });
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Fetch all messages for this session
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      logError('Failed to fetch chat messages', messagesError, user.id, {
        component: 'chat-session-messages',
        sessionId,
        operation: 'fetch_messages'
      });
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logInfo('Chat session messages retrieved', {
      userId: user.id,
      sessionId,
      messageCount: messages?.length || 0,
      duration
    });

    return NextResponse.json({
      session,
      messages: messages || [],
    });

  } catch (error) {
    logError('Chat session messages GET API error', error as Error, userId, {
      component: 'chat-session-messages',
      sessionId: params.sessionId,
      endpoint: `/api/chat/sessions/${params.sessionId}`,
      method: 'GET',
      duration: Date.now() - startTime
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
