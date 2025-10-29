# 🚀 Logger Quick Reference

## Import
```typescript
import { logInfo, logError, logWarn, logDebug, logUserAction, logCreditOperation } from '@/lib/logger';
```

## Common Patterns

### ✅ Log Info
```typescript
logInfo('User action completed', { userId, action: 'download' });
```

### ⚠️ Log Warning
```typescript
logWarn('Rate limit approaching', { userId, requests: 95 });
```

### ❌ Log Error
```typescript
logError('Operation failed', error, {
  component: 'payment',
  userId,
  orderId
});
```

### 🐛 Log Debug (dev only)
```typescript
logDebug('Cache hit', { key: 'user:123', ttl: 3600 });
```

### 👤 Log User Action
```typescript
logUserAction('image_generated', userId, {
  promptLength: 150,
  model: 'gemini-2.5'
});
```

### 💳 Log Credit Operation
```typescript
logCreditOperation('deduct', userId, 5, true, {
  operation: 'image_generation',
  remaining: 45
});
```

## API Route Template

```typescript
export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    // Your logic
    const result = await doSomething();
    
    logInfo('Operation completed', {
      duration: Date.now() - startTime,
      userId
    });
    
    return NextResponse.json(result);
  } catch (error) {
    logError('Operation failed', error as Error, {
      component: 'api-route',
      userId
    });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

## Environment Setup

```env
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

## View Logs

```bash
# All logs
tail -f logs/combined.log

# Errors only
tail -f logs/error.log

# Search
grep "userId.*123" logs/combined.log
```

## Sentry Dashboard
https://sentry.io → Select Project → Issues

---
📖 Full Guide: [LOGGING_SETUP_GUIDE.md](./LOGGING_SETUP_GUIDE.md)
