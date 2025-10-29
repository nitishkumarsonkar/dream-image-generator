import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logError, logInfo, logUserAction, logWarn } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    // Create Supabase client and get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logWarn('Unauthorized chat sessions access attempt', {
        authError: authError?.message,
        ip: request.headers.get('x-forwarded-for')
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    userId = user.id;

    // Fetch all sessions for this user
    const { data: sessions, error: fetchError } = await supabase
      .from('chat_sessions')
      .select('id, title, final_prompt, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (fetchError) {
      logError('Failed to fetch chat sessions', fetchError, user.id, {
        component: 'chat-sessions',
        operation: 'fetch_sessions'
      });
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    logInfo('Chat sessions retrieved', {
      userId: user.id,
      sessionCount: sessions?.length || 0,
      duration
    });

    return NextResponse.json({ sessions });

  } catch (error) {
    logError('Chat sessions GET API error', error as Error, userId, {
      component: 'chat-sessions',
      endpoint: '/api/chat/sessions',
      method: 'GET',
      duration: Date.now() - startTime
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    // Parse request body
    const body = await request.json();
    const { sessionId, title, finalPrompt } = body;

    if (!sessionId) {
      logWarn('Chat session creation attempted without session ID', {
        hasTitle: !!title,
        hasFinalPrompt: !!finalPrompt
      });
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client and get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logWarn('Unauthorized chat session creation attempt', {
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

    // Check if session already exists
    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (existingSession) {
      // Update existing session
      const { data: updatedSession, error: updateError } = await supabase
        .from('chat_sessions')
        .update({
          title,
          final_prompt: finalPrompt,
        })
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        logError('Failed to update chat session', updateError, user.id, {
          component: 'chat-sessions',
          sessionId,
          operation: 'update_session'
        });
        return NextResponse.json(
          { error: 'Failed to update session' },
          { status: 500 }
        );
      }

      logUserAction('chat_session_updated', user.id, {
        sessionId,
        title: title?.slice(0, 50),
        hasFinalPrompt: !!finalPrompt
      });

      return NextResponse.json({ session: updatedSession });
    } else {
      // Create new session
      const { data: newSession, error: insertError } = await supabase
        .from('chat_sessions')
        .insert({
          id: sessionId,
          user_id: user.id,
          title,
          final_prompt: finalPrompt,
        })
        .select()
        .single();

      if (insertError) {
        logError('Failed to create chat session', insertError, user.id, {
          component: 'chat-sessions',
          sessionId,
          operation: 'create_session'
        });
        return NextResponse.json(
          { error: 'Failed to create session' },
          { status: 500 }
        );
      }

      logUserAction('chat_session_created', user.id, {
        sessionId,
        title: title?.slice(0, 50),
        hasFinalPrompt: !!finalPrompt
      });

      return NextResponse.json({ session: newSession });
    }

  } catch (error) {
    logError('Chat sessions POST API error', error as Error, userId, {
      component: 'chat-sessions',
      endpoint: '/api/chat/sessions',
      method: 'POST',
      duration: Date.now() - startTime
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    // Get session ID from query params
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      logWarn('Chat session deletion attempted without session ID', {
        ip: request.headers.get('x-forwarded-for')
      });
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client and get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logWarn('Unauthorized chat session deletion attempt', {
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

    // Delete the session (messages will be cascade deleted)
    const { error: deleteError } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (deleteError) {
      logError('Failed to delete chat session', deleteError, user.id, {
        component: 'chat-sessions',
        sessionId,
        operation: 'delete_session'
      });
      return NextResponse.json(
        { error: 'Failed to delete session' },
        { status: 500 }
      );
    }

    logUserAction('chat_session_deleted', user.id, {
      sessionId
    });

    const duration = Date.now() - startTime;
    logInfo('Chat session deleted successfully', {
      userId: user.id,
      sessionId,
      duration
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    logError('Chat sessions DELETE API error', error as Error, userId, {
      component: 'chat-sessions',
      endpoint: '/api/chat/sessions',
      method: 'DELETE',
      duration: Date.now() - startTime
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
