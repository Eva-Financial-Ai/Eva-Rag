import axios from 'axios';
import React, { Component, ComponentType, ErrorInfo } from 'react';

// Configuration (fallback defaults for development)
const MONITOR_URL = process.env.REACT_APP_MONITOR_URL || 'http://localhost:3456';
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const APP_VERSION = process.env.REACT_APP_VERSION || '1.0.0';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
export interface ErrorReport {
  message: string;
  stack?: string;
  componentName?: string;
  context?: any;
  timestamp: string;
  environment: string;
  appVersion: string;
  userAgent: string;
  url: string;
}

export interface MetricReport {
  name: string;
  value: number;
  unit?: string;
  context?: any;
  componentName?: string;
}

export interface FeedbackReport {
  text: string;
  type: 'bug' | 'feature' | 'feedback';
  userEmail?: string;
  screenshot?: string; // Base64 encoded image
  context?: any;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
export async function reportError(error: Error, componentName?: string, context?: any) {
  const errorPayload: ErrorReport = {
    message: error.message,
    stack: error.stack,
    componentName,
    context,
    timestamp: new Date().toISOString(),
    environment: ENVIRONMENT,
    appVersion: APP_VERSION,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'node',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  };

  if (ENVIRONMENT !== 'production' && !context?.forceSend) {
    // Skip sending in dev by default
    console.warn('[EVA][ErrorReporter] Dev mode – error not reported', errorPayload);
    return { skipped: true };
  }

  try {
    const res = await axios.post(`${MONITOR_URL}/api/error`, errorPayload);
    return res.data;
  } catch (err) {
    console.error('[EVA][ErrorReporter] Failed to report error', err);
    return { failed: true };
  }
}

export async function reportMetric(
  name: string,
  value: number,
  options?: { unit?: string; context?: any; componentName?: string; forceSend?: boolean }
) {
  const metric: MetricReport = {
    name,
    value,
    unit: options?.unit,
    context: options?.context,
    componentName: options?.componentName,
  };

  if (ENVIRONMENT !== 'production' && !options?.forceSend) {
    console.debug('[EVA][Metric]', metric);
    return { skipped: true };
  }

  try {
    const res = await axios.post(`${MONITOR_URL}/api/metric`, metric);
    return res.data;
  } catch (err) {
    console.error('[EVA][ErrorReporter] Failed to report metric', err);
    return { failed: true };
  }
}

export async function submitFeedback(feedback: FeedbackReport) {
  try {
    const res = await axios.post(`${MONITOR_URL}/api/feedback`, {
      ...feedback,
      timestamp: new Date().toISOString(),
      environment: ENVIRONMENT,
      appVersion: APP_VERSION,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    });
    return res.data;
  } catch (err) {
    console.error('[EVA][ErrorReporter] Failed to submit feedback', err);
    return { failed: true };
  }
}

// -----------------------------------------------------------------------------
// High-order helpers
// -----------------------------------------------------------------------------
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  options?: { componentName?: string; context?: any; unit?: string }
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    const start = performance.now();
    try {
      return fn(...args);
    } finally {
      const duration = performance.now() - start;
      reportMetric(name, duration, {
        unit: options?.unit || 'ms',
        componentName: options?.componentName,
        context: options?.context,
      });
    }
  };
}

// -----------------------------------------------------------------------------
// Error Boundary factory
// -----------------------------------------------------------------------------
export function createErrorBoundary<P>(
  WrappedComponent: ComponentType<P>,
  componentName = WrappedComponent.displayName || WrappedComponent.name || 'Component'
) {
  class ErrorBoundary extends Component<P, { hasError: boolean; error?: Error }> {
    static displayName = `WithErrorBoundary(${componentName})`;
    state = { hasError: false, error: undefined as Error | undefined };

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
      reportError(error, componentName, { componentStack: info.componentStack });
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className="error-boundary-fallback p-4 rounded bg-red-50 text-red-800">
            <h3 className="font-semibold mb-2">Something went wrong in {componentName}</h3>
            <p className="mb-4">{this.state.error?.message || 'Unknown error'}</p>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Try again
            </button>
          </div>
        );
      }

      return <WrappedComponent {...this.props} />;
    }
  }

  return ErrorBoundary;
}

// -----------------------------------------------------------------------------
// Global handlers (browser only)
// -----------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.addEventListener('error', e => {
    reportError(e.error ?? new Error(e.message), 'window.onerror', {
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
    });
  });

  window.addEventListener('unhandledrejection', e => {
    const err = e.reason instanceof Error ? e.reason : new Error(String(e.reason));
    reportError(err, 'unhandledrejection');
  });
}

export default {
  reportError,
  reportMetric,
  submitFeedback,
  withPerformanceTracking,
  createErrorBoundary,
};
