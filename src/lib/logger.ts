import * as Sentry from '@sentry/nextjs';

// Edge Runtime detection
const isEdgeRuntime = () => {
  try {
    return process.env.NEXT_RUNTIME === 'edge' ||
           typeof window !== 'undefined';
  } catch {
    return true; // Assume edge runtime if we can't detect
  }
};

const isServerSide = () => {
  try {
    return typeof window === 'undefined' && 
           typeof process !== 'undefined' &&
           process.versions &&
           process.versions.node;
  } catch {
    return false;
  }
};

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Logger interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: any;
  userId?: string;
  traceId?: string;
}

// Create log entry
const createLogEntry = (
  level: LogLevel,
  message: string,
  metadata?: any,
  userId?: string
): LogEntry => {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    metadata,
    userId,
    traceId: generateTraceId()
  };
};

// Generate simple trace ID
const generateTraceId = (): string => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Write to file (Server-side only, completely safe for client-side)
const writeToFile = async (logEntry: LogEntry): Promise<void> => {
  // Complete safety guards - return early if not in proper server environment
  try {
    if (typeof window !== 'undefined') return; // Browser
    if (typeof process === 'undefined') return; // No process object
    if (!process.versions || !process.versions.node) return; // Not Node.js
    if (process.env.NEXT_RUNTIME === 'edge') return; // Edge runtime
    if (isEdgeRuntime()) return; // Edge runtime check
    
    // Dynamically require only in safe server environment
    const fs = eval('require')('fs/promises');
    const path = eval('require')('path');
    
    const logsDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    
    // Ensure logs directory exists
    try {
      await fs.access(logsDir);
    } catch {
      await fs.mkdir(logsDir, { recursive: true });
    }
    
    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.appendFile(logFile, logLine);
  } catch (error) {
    // Silently ignore all errors to prevent logging loops
  }
};

// Core logging functions
export const logError = async (
  message: string,
  error?: Error | any,
  userId?: string,
  metadata?: any
): Promise<void> => {
  const logEntry = createLogEntry(LogLevel.ERROR, message, { 
    error: error?.message || error,
    stack: error?.stack,
    ...metadata 
  }, userId);

  // Console logging (works in both runtimes)
  console.error(`[ERROR] ${message}`, error, metadata);

  // File logging (Server-side Node.js only) - Safe for all environments
  if (typeof window === 'undefined' && isServerSide() && !isEdgeRuntime()) {
    await writeToFile(logEntry);
  }

  // Sentry logging (works in both runtimes)
  try {
    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: { userId },
        extra: { message, metadata }
      });
    } else {
      Sentry.captureMessage(message, 'error');
    }
  } catch (sentryError) {
    console.error('Sentry logging failed:', sentryError);
  }
};

export const logWarn = async (
  message: string,
  metadata?: any,
  userId?: string
): Promise<void> => {
  const logEntry = createLogEntry(LogLevel.WARN, message, metadata, userId);

  console.warn(`[WARN] ${message}`, metadata);

  if (typeof window === 'undefined' && isServerSide() && !isEdgeRuntime()) {
    await writeToFile(logEntry);
  }

  try {
    Sentry.captureMessage(message, 'warning');
  } catch (sentryError) {
    console.error('Sentry logging failed:', sentryError);
  }
};

export const logInfo = async (
  message: string,
  metadata?: any,
  userId?: string
): Promise<void> => {
  const logEntry = createLogEntry(LogLevel.INFO, message, metadata, userId);

  console.info(`[INFO] ${message}`, metadata);

  if (typeof window === 'undefined' && isServerSide() && !isEdgeRuntime()) {
    await writeToFile(logEntry);
  }
};

export const logDebug = async (
  message: string,
  metadata?: any,
  userId?: string
): Promise<void> => {
  if (process.env.NODE_ENV === 'production') return;

  const logEntry = createLogEntry(LogLevel.DEBUG, message, metadata, userId);

  console.debug(`[DEBUG] ${message}`, metadata);

  if (typeof window === 'undefined' && isServerSide() && !isEdgeRuntime()) {
    await writeToFile(logEntry);
  }
};

// Specific logging functions
export const logUserAction = async (
  action: string,
  userId: string,
  metadata?: any
): Promise<void> => {
  await logInfo(`User action: ${action}`, metadata, userId);
};

export const logApiRequest = async (
  method: string,
  path: string,
  userId?: string,
  duration?: number,
  statusCode?: number
): Promise<void> => {
  await logInfo(`API ${method} ${path}`, {
    method,
    path,
    duration,
    statusCode
  }, userId);
};

export const logCreditOperation = async (
  operation: string,
  userId: string,
  amount: number,
  balance?: number
): Promise<void> => {
  await logInfo(`Credit operation: ${operation}`, {
    operation,
    userId,
    amount,
    balance
  }, userId);
};

export const logPaymentEvent = async (
  event: string,
  userId: string,
  amount?: number,
  metadata?: any
): Promise<void> => {
  await logInfo(`Payment event: ${event}`, {
    event,
    amount,
    ...metadata
  }, userId);
};

// Database operation logging
export const logDatabaseOperation = async (
  operation: string,
  table: string,
  userId?: string,
  metadata?: any
): Promise<void> => {
  await logInfo(`Database ${operation} on ${table}`, {
    operation,
    table,
    ...metadata
  }, userId);
};

// Performance logging
export const logPerformance = async (
  operation: string,
  duration: number,
  metadata?: any
): Promise<void> => {
  if (duration > 1000) {
    await logWarn(`Slow operation: ${operation} took ${duration}ms`, {
      operation,
      duration,
      ...metadata
    });
  } else {
    await logInfo(`Performance: ${operation} completed in ${duration}ms`, {
      operation,
      duration,
      ...metadata
    });
  }
};

export default {
  error: logError,
  warn: logWarn,
  info: logInfo,
  debug: logDebug,
  userAction: logUserAction,
  apiRequest: logApiRequest,
  creditOperation: logCreditOperation,
  paymentEvent: logPaymentEvent,
  databaseOperation: logDatabaseOperation,
  performance: logPerformance
};