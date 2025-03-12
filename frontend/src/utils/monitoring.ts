/**
 * Simple frontend monitoring and error tracking utility
 */

interface ErrorReport {
  message: string;
  stack?: string;
  context: Record<string, any>;
  timestamp: string;
  url: string;
  userId?: string;
}

class MonitoringService {
  private static instance: MonitoringService;
  private errorQueue: ErrorReport[] = [];
  private isReportingErrors = false;
  private flushInterval: NodeJS.Timeout | null = null;
  private errorEndpoint = '/api/log/error';

  private constructor() {
    // Initialize error listener
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleGlobalError.bind(this));
      window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
      
      // Set up flush interval
      this.flushInterval = setInterval(() => this.flushErrors(), 10000);
    }
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  /**
   * Handle global JavaScript errors
   */
  private handleGlobalError(event: ErrorEvent): void {
    this.reportError(event.error || new Error(event.message), {
      source: event.filename,
      line: event.lineno,
      column: event.colno
    });
  }

  /**
   * Handle unhandled promise rejections
   */
  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    this.reportError(error, { 
      type: 'unhandled_promise_rejection'
    });
  }

  /**
   * Log an error to the monitoring service
   */
  public reportError(error: Error, context: Record<string, any> = {}): void {
    try {
      // Get user ID from session if available
      let userId: string | undefined = undefined;
      if (typeof window !== 'undefined') {
        try {
          // Try to get user ID from localStorage or sessionStorage if available
          userId = localStorage.getItem('userId') || sessionStorage.getItem('userId') || undefined;
        } catch (e) {
          // Ignore storage access errors
        }
      }

      // Create error report
      const errorReport: ErrorReport = {
        message: error.message || 'Unknown error',
        stack: error.stack,
        context: {
          ...context,
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        },
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : '',
        userId
      };

      // Add to queue
      this.errorQueue.push(errorReport);
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logged to monitoring service:', errorReport);
      }

      // Trigger immediate flush if first error
      if (this.errorQueue.length === 1 && !this.isReportingErrors) {
        this.flushErrors();
      }
    } catch (e) {
      // Last resort error handling
      console.error('Error in monitoring service:', e);
    }
  }

  /**
   * Log a message with the specified level
   */
  public log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console[level](message, data || '');
    }

    // For errors, use the error reporting mechanism
    if (level === 'error' && message) {
      this.reportError(new Error(message), { data });
    }
    
    // For warnings and info, we could send to the server if needed
  }

  /**
   * Send queued errors to the backend
   */
  private async flushErrors(): Promise<void> {
    if (this.errorQueue.length === 0 || this.isReportingErrors) return;
    
    this.isReportingErrors = true;
    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // Don't report errors in development mode
      if (process.env.NODE_ENV === 'development') {
        this.isReportingErrors = false;
        return;
      }

      // In production, send to your error logging API
      const response = await fetch(this.errorEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ errors }),
        // Don't wait more than 3 seconds to report errors
        signal: AbortSignal.timeout(3000)
      });

      if (!response.ok) {
        // If error reporting fails, add back to queue for retry
        this.errorQueue.push(...errors);
        console.error('Error reporting failed:', await response.text());
      }
    } catch (e) {
      // If error reporting fails, add back to queue for retry
      this.errorQueue.push(...errors);
      console.error('Error reporting failed:', e);
    } finally {
      this.isReportingErrors = false;
    }
  }

  /**
   * Clean up when the service is no longer needed
   */
  public cleanup(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('error', this.handleGlobalError.bind(this));
      window.removeEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
    }

    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    // Flush any remaining errors
    this.flushErrors();
  }
}

// Export a singleton instance
export const monitoring = MonitoringService.getInstance();

// Helper functions
export const logInfo = (message: string, data?: any) => monitoring.log('info', message, data);
export const logWarning = (message: string, data?: any) => monitoring.log('warn', message, data);
export const logError = (message: string, data?: any) => monitoring.log('error', message, data);
export const reportError = (error: Error, context?: Record<string, any>) => monitoring.reportError(error, context);
