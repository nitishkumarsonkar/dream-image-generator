# 📝 Logger Implementation Examples

This file shows how to add logging to different parts of your application.

## Example 1: Chat API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, type Content } from '@google/genai';
import { createClient } from '@/utils/supabase/server';
import { logError, logInfo, logUserAction, logCreditOperation, logWarn } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    const body = await request.json();
    const { message: userMessage, sessionId } = body;

    if (!userMessage || !sessionId) {
      logWarn('Invalid chat request', { 
        hasMessage: !!userMessage, 
        hasSessionId: !!sessionId 
      });
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logInfo('Unauthorized chat attempt', { 
        sessionId,
        authError: authError?.message 
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    userId = user.id;

    // Check credits
    const enoughCredits = await hasEnoughCredits(user.id, CHAT_CREDIT_COST, supabase);
    if (!enoughCredits) {
      logCreditOperation('check', user.id, CHAT_CREDIT_COST, false, {
        reason: 'Insufficient credits for chat',
        sessionId
      });
      return NextResponse.json(
        { error: 'Insufficient credits', requiredCredits: CHAT_CREDIT_COST },
        { status: 402 }
      );
    }

    // Log user action
    logUserAction('chat_message_sent', user.id, {
      sessionId,
      messageLength: userMessage.length,
      messagePreview: userMessage.slice(0, 50)
    });

    // Your chat logic here...
    const response = await generateChatResponse(userMessage, sessionId);

    // Deduct credits
    await deductCredits({
      userId: user.id,
      amount: CHAT_CREDIT_COST,
      type: 'chat_message',
      description: `Chat message in session ${sessionId}`,
      metadata: { sessionId, messageLength: userMessage.length }
    }, supabase);

    logCreditOperation('deduct', user.id, CHAT_CREDIT_COST, true, {
      operation: 'chat_message',
      sessionId
    });

    const duration = Date.now() - startTime;
    logInfo('Chat message processed', {
      userId: user.id,
      sessionId,
      duration,
      responseLength: response.content.length
    });

    return NextResponse.json({ response });

  } catch (error) {
    logError('Chat API error', error as Error, {
      component: 'chat-api',
      userId,
      endpoint: '/api/chat',
      method: 'POST'
    });
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
```

## Example 2: Payment Verification Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logError, logInfo, logUserAction, logWarn } from '@/lib/logger';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let userId: string | undefined;
  
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      logWarn('Unauthorized payment verification attempt', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    userId = user.id;

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      logError(
        'Payment signature verification failed',
        new Error('Invalid signature'),
        {
          component: 'payment-verification',
          userId: user.id,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id
        }
      );
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Payment verified successfully
    logUserAction('payment_verified', user.id, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      duration: Date.now() - startTime
    });

    logInfo('Payment verification successful', {
      userId: user.id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    logError('Payment verification error', error as Error, {
      component: 'payment-verification',
      userId,
      endpoint: '/api/payment/verify'
    });
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
```

## Example 3: Server Component with Error Boundary

```typescript
// src/app/history/page.tsx
import { createClient } from '@/utils/supabase/server';
import { logError, logInfo } from '@/lib/logger';

export default async function HistoryPage() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      logInfo('Unauthenticated history page access');
      return <div>Please sign in to view your history</div>;
    }

    const { data: history, error } = await supabase
      .from('prompt')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      logError('Failed to fetch user history', error, {
        component: 'history-page',
        userId: user.id
      });
      return <div>Error loading history</div>;
    }

    logInfo('History page loaded', {
      userId: user.id,
      itemCount: history?.length || 0
    });

    return (
      <div>
        {/* Render history */}
      </div>
    );

  } catch (error) {
    logError('History page error', error as Error, {
      component: 'history-page'
    });
    return <div>Error loading page</div>;
  }
}
```

## Example 4: Credit Utility Functions

```typescript
// src/utils/supabase/credits.ts
import { createClient } from './client';
import { logError, logCreditOperation, logWarn } from '@/lib/logger';

export async function deductCredits(
  params: {
    userId: string;
    amount: number;
    type: string;
    description: string;
    metadata?: any;
  },
  supabase?: any
) {
  const client = supabase || createClient();
  
  try {
    // Get current balance
    const { data: profile, error: fetchError } = await client
      .from('profiles')
      .select('credits')
      .eq('id', params.userId)
      .single();

    if (fetchError) {
      logError('Failed to fetch user credits', fetchError, {
        component: 'credit-system',
        userId: params.userId,
        operation: 'deduct'
      });
      throw fetchError;
    }

    const currentCredits = profile?.credits || 0;

    if (currentCredits < params.amount) {
      logWarn('Insufficient credits for deduction', {
        userId: params.userId,
        required: params.amount,
        available: currentCredits
      });
      throw new Error('Insufficient credits');
    }

    // Deduct credits
    const { error: updateError } = await client
      .from('profiles')
      .update({ credits: currentCredits - params.amount })
      .eq('id', params.userId);

    if (updateError) {
      logError('Failed to deduct credits', updateError, {
        component: 'credit-system',
        userId: params.userId,
        amount: params.amount
      });
      throw updateError;
    }

    // Log transaction
    await client.from('credit_transactions').insert({
      user_id: params.userId,
      amount: -params.amount,
      type: params.type,
      description: params.description,
      metadata: params.metadata
    });

    logCreditOperation('deduct', params.userId, params.amount, true, {
      type: params.type,
      previousBalance: currentCredits,
      newBalance: currentCredits - params.amount
    });

    return { success: true, newBalance: currentCredits - params.amount };

  } catch (error) {
    logError('Credit deduction error', error as Error, {
      component: 'credit-system',
      userId: params.userId,
      amount: params.amount
    });
    throw error;
  }
}
```

## Example 5: Middleware Logging

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logInfo, logWarn } from '@/lib/logger';

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const path = request.nextUrl.pathname;

  // Log API requests
  if (path.startsWith('/api/')) {
    logInfo('API request received', {
      path,
      method: request.method,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for')
    });
  }

  // Add timing header
  const response = NextResponse.next();
  const duration = Date.now() - startTime;
  
  response.headers.set('X-Response-Time', `${duration}ms`);

  // Log slow requests
  if (duration > 3000) {
    logWarn('Slow request detected', {
      path,
      method: request.method,
      duration
    });
  }

  return response;
}

export const config = {
  matcher: ['/api/:path*']
};
```

## Example 6: Error Boundary Component

```typescript
// src/components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { logError } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logError('React Error Boundary caught error', error, {
      component: 'ErrorBoundary',
      componentStack: errorInfo.componentStack
    });

    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4">
          <h2>Something went wrong</h2>
          <p>We've been notified and are looking into it.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Example 7: Background Job/Cron

```typescript
// src/app/api/cron/cleanup/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { logInfo, logError, logWarn } from '@/lib/logger';

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logWarn('Unauthorized cron job attempt', {
        job: 'cleanup',
        ip: request.headers.get('x-forwarded-for')
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logInfo('Starting cleanup cron job');

    const supabase = await createClient();

    // Delete old logs (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('application_logs')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    if (error) {
      logError('Cleanup cron job failed', error, {
        component: 'cron-cleanup',
        job: 'cleanup'
      });
      return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }

    const duration = Date.now() - startTime;
    logInfo('Cleanup cron job completed', {
      job: 'cleanup',
      duration,
      deletedRows: data?.length || 0
    });

    return NextResponse.json({
      success: true,
      deletedRows: data?.length || 0,
      duration
    });

  } catch (error) {
    logError('Cleanup cron job error', error as Error, {
      component: 'cron-cleanup',
      job: 'cleanup'
    });
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
```

## Key Patterns to Follow

### 1. Always Track Duration
```typescript
const startTime = Date.now();
// ... do work ...
const duration = Date.now() - startTime;
logInfo('Operation completed', { duration });
```

### 2. Track User ID When Available
```typescript
let userId: string | undefined;
// ... get user ...
userId = user.id;
// ... in catch block ...
logError('Error', error, { userId });
```

### 3. Include Component Context
```typescript
logError('Error message', error, {
  component: 'specific-component-name',
  // ... other context
});
```

### 4. Log Before Returning Errors
```typescript
if (!isValid) {
  logWarn('Invalid input', { reason: 'missing field' });
  return NextResponse.json({ error: 'Invalid' }, { status: 400 });
}
```

### 5. Don't Log Sensitive Data
```typescript
// ❌ Bad
logInfo('User logged in', { password: user.password });

// ✅ Good
logInfo('User logged in', { userId: user.id });
```

---

📖 See [LOGGING_SETUP_GUIDE.md](./LOGGING_SETUP_GUIDE.md) for complete documentation.
