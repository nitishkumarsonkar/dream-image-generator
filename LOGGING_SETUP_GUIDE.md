# 🔍 Logging System Setup Guide

## Overview

Your project now has a comprehensive logging system using **Winston** for file-based logging and **Sentry** for production error monitoring.

## 📦 Installed Packages

- `winston` - Production-ready logging library
- `@sentry/nextjs` - Error tracking and monitoring for Next.js

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Application Code                       │
│  (API Routes, Components, Server Actions)              │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │   Logger (logger.ts) │
         └──────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│   Winston    │      │     Sentry       │
│ File Logging │      │ Error Tracking   │
└──────┬───────┘      └────────┬─────────┘
       │                       │
       ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│  logs/*.log  │      │  Sentry Cloud    │
│   - error    │      │   Dashboard      │
│   - combined │      │                  │
│   - exceptions│      │  - Alerts        │
│   - rejections│      │  - Stack Traces  │
└──────────────┘      └──────────────────┘
```

## 📁 File Structure

```
dream-image-generator/
├── src/lib/logger.ts              # Main logger configuration
├── sentry.client.config.ts        # Sentry browser-side config
├── sentry.server.config.ts        # Sentry server-side config
├── sentry.edge.config.ts          # Sentry edge runtime config
├── next.config.js                 # Updated with Sentry integration
├── logs/                          # Log files (gitignored)
│   ├── error.log                 # Error-level logs only
│   ├── combined.log              # All logs
│   ├── exceptions.log            # Uncaught exceptions
│   └── rejections.log            # Unhandled promise rejections
└── .env.local                     # Environment variables
```

## 🚀 Setup Instructions

### 1. Configure Sentry (Production Monitoring)

1. **Create a Sentry Account**
   - Go to [https://sentry.io](https://sentry.io)
   - Sign up for a free account

2. **Create a New Project**
   - Select "Next.js" as the platform
   - Copy the DSN (Data Source Name)

3. **Update Environment Variables**
   - Open `.env.local`
   - Add your Sentry credentials:

   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   SENTRY_ORG=your-organization-name
   SENTRY_PROJECT=your-project-name
   ```

4. **Create Auth Token (Optional - for source maps)**
   - Go to Settings → Auth Tokens in Sentry
   - Create a new token with `project:releases` scope
   - Add to `.env.local`:
   ```env
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

### 2. Local Development

In development, logs are:
- ✅ Written to console (colorized)
- ✅ Written to `logs/` directory
- ❌ NOT sent to Sentry (filtered out)

### 3. Production Deployment

In production, logs are:
- ✅ Written to `logs/` directory
- ✅ Sent to Sentry for errors
- ❌ NOT written to console

## 📝 Usage Examples

### Import the Logger

```typescript
import { logInfo, logError, logWarn, logDebug, logUserAction, logCreditOperation } from '@/lib/logger';
```

### Basic Logging

```typescript
// Info level
logInfo('User logged in successfully', { userId: '123' });

// Warning level
logWarn('Rate limit approaching', { userId: '123', requests: 95 });

// Error level
logError('Payment processing failed', error, {
  component: 'payment',
  userId: '123',
  amount: 100
});

// Debug level (only in development)
logDebug('Cache hit', { key: 'user:123', ttl: 3600 });
```

### Specialized Logging Functions

#### User Actions
```typescript
logUserAction('image_generated', userId, {
  promptLength: 150,
  aspectRatio: '16:9',
  model: 'gemini-2.5-flash-image'
});
```

#### Credit Operations
```typescript
logCreditOperation('deduct', userId, 5, true, {
  operation: 'image_generation',
  remainingCredits: 45
});
```

### In API Routes

```typescript
export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const user = await getUser();
    
    logUserAction('api_call', user.id, {
      endpoint: '/api/generate',
      method: 'POST'
    });
    
    // Your logic here...
    
    const duration = Date.now() - startTime;
    logInfo('API call completed', {
      endpoint: '/api/generate',
      duration,
      userId: user.id
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logError('API call failed', error as Error, {
      component: 'api-generate',
      endpoint: '/api/generate',
      userId: user?.id
    });
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### In Server Components

```typescript
import { logInfo, logError } from '@/lib/logger';

export default async function Page() {
  try {
    const data = await fetchData();
    logInfo('Data fetched successfully', { recordCount: data.length });
    return <div>{/* render */}</div>;
  } catch (error) {
    logError('Failed to fetch data', error as Error, {
      component: 'homepage'
    });
    return <div>Error loading page</div>;
  }
}
```

## 🔍 Viewing Logs

### Local Development

#### View All Logs
```bash
tail -f logs/combined.log
```

#### View Only Errors
```bash
tail -f logs/error.log
```

#### View Exceptions
```bash
tail -f logs/exceptions.log
```

#### Search Logs
```bash
# Search for specific user
grep "userId.*123" logs/combined.log

# Search for errors
grep "error" logs/combined.log

# Search by component
grep "component.*image-generation" logs/combined.log
```

### Production (Sentry Dashboard)

1. Go to [sentry.io](https://sentry.io)
2. Select your project
3. View:
   - **Issues**: All errors grouped by type
   - **Performance**: Request traces and timing
   - **Releases**: Deploy tracking
   - **Alerts**: Configure notifications

## 📊 Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| `error` | Errors that need attention | API failures, DB errors |
| `warn` | Warning conditions | Rate limits, deprecations |
| `info` | General information | User actions, API calls |
| `debug` | Detailed debugging info | Cache operations, queries |

## 🎯 Best Practices

### DO ✅

```typescript
// Include context in logs
logError('Payment failed', error, {
  component: 'payment',
  userId: user.id,
  amount: 100,
  paymentMethod: 'razorpay'
});

// Log user actions
logUserAction('image_downloaded', userId, {
  imageId: '123',
  format: 'png'
});

// Use appropriate log levels
logInfo('Normal operation');
logWarn('Concerning but not critical');
logError('Critical issue', error);
```

### DON'T ❌

```typescript
// Don't log sensitive data
logInfo('User logged in', {
  password: user.password,  // ❌ Never log passwords
  apiKey: process.env.API_KEY  // ❌ Never log API keys
});

// Don't log entire objects (can be huge)
logInfo('Request received', {
  request: request  // ❌ Too much data
});

// Don't use console.log in production code
console.log('Debug info');  // ❌ Use logDebug instead
```

## 🔐 Security & Privacy

The logger automatically:
- ✅ Filters passwords from breadcrumbs
- ✅ Removes auth tokens from logs
- ✅ Strips cookies from requests
- ✅ Prevents logging in development (Sentry)
- ✅ Limits log file sizes (5MB max)
- ✅ Rotates log files (keeps last 5)

## 🚨 Error Monitoring with Sentry

### Features Enabled

1. **Error Tracking**: All errors automatically sent to Sentry
2. **Performance Monitoring**: Track slow API calls
3. **Session Replay**: See what users did before errors (production only)
4. **Source Maps**: See original TypeScript code in stack traces
5. **Breadcrumbs**: See events leading up to errors

### Configure Alerts

In Sentry Dashboard:
1. Go to **Alerts** → **Create Alert**
2. Choose conditions:
   - Error frequency exceeds threshold
   - New issue appears
   - Performance degradation
3. Configure notifications:
   - Email
   - Slack
   - Discord
   - PagerDuty

## 🧪 Testing the Logger

### Test File Logging
```typescript
import { logInfo, logError } from '@/lib/logger';

logInfo('Test log', { test: true });
logError('Test error', new Error('Test'), { test: true });
```

Then check:
```bash
cat logs/combined.log
cat logs/error.log
```

### Test Sentry Integration

1. Add this to any API route:
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.captureMessage('Test Sentry integration');
Sentry.captureException(new Error('Test error'));
```

2. Call the API
3. Check Sentry dashboard for the events

## 📈 Monitoring Checklist

- [ ] Sentry DSN configured in `.env.local`
- [ ] Logs directory created and gitignored
- [ ] Test error logged and appears in `logs/error.log`
- [ ] Test error appears in Sentry dashboard
- [ ] Alerts configured in Sentry
- [ ] Source maps uploading (for production)

## 🔧 Troubleshooting

### Logs not appearing in files?

Check that the `logs/` directory exists:
```bash
mkdir -p logs
```

### Errors not appearing in Sentry?

1. Check environment:
   ```bash
   echo $NODE_ENV
   ```
   Sentry is disabled in development by default.

2. Verify DSN:
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

3. Force test in development:
   ```typescript
   // Temporarily comment out this check in logger.ts
   if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
   ```

### Log files too large?

The logger automatically rotates files at 5MB. To change:
```typescript
// In src/lib/logger.ts
maxsize: 10485760, // 10MB
maxFiles: 10,      // Keep last 10 files
```

## 📚 Additional Resources

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Best Practices](https://docs.sentry.io/product/sentry-basics/guides/integrate-frontend/best-practices/)

## 🎉 Next Steps

1. ✅ Configure Sentry DSN
2. ✅ Add logging to your other API routes
3. ✅ Set up Sentry alerts
4. ✅ Test in production
5. ✅ Monitor your dashboard

---

**Need Help?** Check the example implementation in `/src/app/api/generate/route.ts`
