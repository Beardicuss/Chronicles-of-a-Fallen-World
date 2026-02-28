/**
 * Error Handling Type Definitions
 */

export type ErrorLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorInfo {
  id: string;
  timestamp: number;
  level: ErrorLevel;
  message: string;
  stack?: string;
  context?: ErrorContext;
  originalError?: Error;
}

export interface ErrorHandler {
  handle(error: Error | ErrorInfo): Promise<void>;
}

export interface ErrorLog {
  errors: ErrorInfo[];
  totalCount: number;
  lastError: ErrorInfo | null;
}
