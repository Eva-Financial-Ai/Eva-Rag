import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    console.error('[ErrorBoundary] Error caught:', error);
    
    // Check if it's a chunk loading error
    if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
      console.warn('[ErrorBoundary] Chunk loading error detected, will attempt reload');
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Component did catch:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Handle chunk loading errors with automatic reload
    if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
      console.warn('[ErrorBoundary] Chunk loading failed, attempting to reload in 2 seconds...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      const { error } = this.state;
      
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={error!} retry={this.handleRetry} />;
      }

      // Check if it's a chunk loading error
      const isChunkError = error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk');
      
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
            <div className="mb-6">
              {isChunkError ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Update</h2>
                  <p className="text-gray-600 mb-4">
                    The application is updating. Please wait while we refresh...
                  </p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                  <p className="text-gray-600 mb-4">
                    There was an unexpected error. Please try refreshing the page.
                  </p>
                  <details className="text-left bg-gray-100 p-3 rounded text-sm mb-4">
                    <summary className="cursor-pointer font-medium">Error Details</summary>
                    <pre className="mt-2 overflow-auto">
                      {error?.message}
                      {process.env.NODE_ENV === 'development' && (
                        <>
                          {'\n\nStack trace:\n'}
                          {error?.stack}
                        </>
                      )}
                    </pre>
                  </details>
                </>
              )}
            </div>
            
            {!isChunkError && (
              <div className="space-x-3">
                <button
                  onClick={this.handleRetry}
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Reload Page
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
