/**
 * WebView Error Handler
 * Handles errors and manages error logging
 */

import type {
  ErrorInfo,
  ErrorLevel,
  ErrorContext,
  ErrorLog
} from './types.js';

export class WebViewErrorHandler {
  private errorLogs: ErrorInfo[];
  private maxLogs: number;
  private listeners: Set<(error: ErrorInfo) => void>;
  private sessionId: string;
  private isInitialized: boolean;

  constructor(maxLogs: number = 100) {
    this.errorLogs = [];
    this.maxLogs = maxLogs;
    this.listeners = new Set();
    this.sessionId = this.generateSessionId();
    this.isInitialized = false;
  }

  /**
   * Initialize error handler
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.setupGlobalErrorHandlers();
    this.isInitialized = true;

    console.info('[ErrorHandler] Initialized with session:', this.sessionId);
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event: ErrorEvent) => {
        this.captureError(
          event.error || new Error(event.message),
          'error',
          {
            component: 'window.onerror',
            metadata: {
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno
            }
          }
        );
      });

      window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
        this.captureError(
          event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
          'error',
          {
            component: 'unhandledRejection'
          }
        );
      });
    }
  }

  /**
   * Capture error
   */
  captureError(
    error: Error | string,
    level: ErrorLevel = 'error',
    context?: ErrorContext
  ): ErrorInfo {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      level,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      context: {
        sessionId: this.sessionId,
        ...context
      },
      originalError: typeof error === 'string' ? undefined : error
    };

    this.addLog(errorInfo);
    this.notifyListeners(errorInfo);
    this.logToConsole(errorInfo);

    return errorInfo;
  }

  /**
   * Add log
   */
  private addLog(errorInfo: ErrorInfo): void {
    this.errorLogs.push(errorInfo);

    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(-this.maxLogs);
    }
  }

  /**
   * Log to console
   */
  private logToConsole(errorInfo: ErrorInfo): void {
    const logFn = this.getLevelLogFunction(errorInfo.level);
    logFn(
      `[${errorInfo.level.toUpperCase()}] ${errorInfo.message}`,
      {
        id: errorInfo.id,
        stack: errorInfo.stack,
        context: errorInfo.context
      }
    );
  }

  /**
   * Get log function for level
   */
  private getLevelLogFunction(level: ErrorLevel): (...args: unknown[]) => void {
    switch (level) {
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
      case 'fatal':
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Subscribe to errors
   */
  subscribe(callback: (error: ErrorInfo) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(errorInfo: ErrorInfo): void {
    for (const listener of this.listeners) {
      try {
        listener(errorInfo);
      } catch (error) {
        console.error('[ErrorHandler] Error in listener:', error);
      }
    }
  }

  /**
   * Get error logs
   */
  getLogs(): ErrorLog {
    return {
      errors: [...this.errorLogs],
      totalCount: this.errorLogs.length,
      lastError: this.errorLogs[this.errorLogs.length - 1] ?? null
    };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(count: number = 10): ErrorInfo[] {
    return this.errorLogs.slice(-count);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.errorLogs = [];
  }

  /**
   * Clear logs by level
   */
  clearLogsByLevel(level: ErrorLevel): void {
    this.errorLogs = this.errorLogs.filter(log => log.level !== level);
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.getLogs(), null, 2);
  }

  /**
   * Generate error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get error statistics
   */
  getStats(): {
    total: number;
    byLevel: Record<ErrorLevel, number>;
    oldestError: ErrorInfo | null;
    newestError: ErrorInfo | null;
  } {
    const byLevel: Record<ErrorLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0
    };

    for (const error of this.errorLogs) {
      byLevel[error.level]++;
    }

    return {
      total: this.errorLogs.length,
      byLevel,
      oldestError: this.errorLogs[0] ?? null,
      newestError: this.errorLogs[this.errorLogs.length - 1] ?? null
    };
  }
}
