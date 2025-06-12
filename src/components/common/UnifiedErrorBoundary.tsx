import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

export class UnifiedErrorBoundary extends React.Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substring(2)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console with component context
    console.error(`[${this.props.componentName || 'UnknownComponent'}] Error caught:`, error);

    // Handle chunk loading errors with automatic retry
    if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.warn(
          `[${this.props.componentName}] Chunk load error, retrying... (${this.retryCount}/${this.maxRetries})`
        );

        setTimeout(() => {
          this.setState({ hasError: false, error: null, errorId: '' });
        }, 1000 * this.retryCount); // Progressive delay
        return;
      } else {
        console.error(`[${this.props.componentName}] Max chunk load retries exceeded`);
      }
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.retryCount = 0;
    this.setState({ hasError: false, error: null, errorId: '' });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      // Determine error type for better UX
      const isChunkError =
        this.state.error?.name === 'ChunkLoadError' ||
        this.state.error?.message?.includes('Loading chunk');
      const isNetworkError =
        this.state.error?.message?.includes('fetch') ||
        this.state.error?.message?.includes('NetworkError');

      // Default fallback UI with context-aware messaging
      return (
        <div className="min-h-64 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg m-4">
          <div className="text-center p-6 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-medium text-red-800 mb-2">
              {isChunkError
                ? 'Loading Failed'
                : isNetworkError
                  ? 'Connection Error'
                  : `Error in ${this.props.componentName || 'Application'}`}
            </h3>

            <p className="text-sm text-red-600 mb-4">
              {isChunkError
                ? 'Failed to load application resources. This may be due to a network issue or recent update.'
                : isNetworkError
                  ? 'Unable to connect to the server. Please check your internet connection.'
                  : this.state.error.message || 'An unexpected error occurred'}
            </p>

            <div className="space-x-3">
              <button
                onClick={this.handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleRefresh}
                className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-red-700 hover:text-red-800">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-3 bg-red-100 rounded text-xs overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper for app-level error boundary
export const AppErrorBoundary: React.FC<{
  children: React.ReactNode;
  componentName?: string;
}> = ({ children, componentName = 'Application' }) => (
  <UnifiedErrorBoundary
    componentName={componentName}
    onError={(error, errorInfo) => {
      console.error(`Global error in ${componentName}:`, error, errorInfo);

      // In production, you would send this to your error reporting service
      if (process.env.NODE_ENV === 'production') {
        // Example: Sentry.captureException(error, { contexts: { errorInfo } });
      }
    }}
  >
    {children}
  </UnifiedErrorBoundary>
);

export default UnifiedErrorBoundary;
