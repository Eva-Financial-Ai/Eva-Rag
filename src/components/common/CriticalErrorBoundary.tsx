import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * CRITICAL FIX #8: Enhanced Error Boundary
 * Prevents white screen by catching all React errors and showing fallback UI
 */
class CriticalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    console.error('CriticalErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Report to error reporting service if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      });
    }

    // Check if it's a chunk loading error and try to recover
    if (error.message?.includes('Loading chunk') || error.message?.includes('Loading CSS chunk')) {
      console.warn('Chunk loading error detected, attempting recovery...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  private handleRetry = () => {
    // Clear the error state and retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            background: '#f5f5f5',
            padding: '1rem',
          }}
        >
          <div 
            style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              maxWidth: '600px',
              width: '100%',
            }}
          >
            <div 
              style={{
                fontSize: '3rem',
                marginBottom: '1rem',
              }}
            >
              ⚠️
            </div>
            <h1 
              style={{
                color: '#dc2626',
                marginBottom: '1rem',
                fontSize: '1.5rem',
                margin: '0 0 1rem 0',
              }}
            >
              Eva AI Application Error
            </h1>
            <p 
              style={{
                color: '#666',
                marginBottom: '1.5rem',
                lineHeight: '1.5',
              }}
            >
              Something went wrong while loading the Eva AI platform. This might be due to a temporary network issue or a recent update.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  background: '#059669',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                }}
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details 
                style={{
                  marginTop: '2rem',
                  textAlign: 'left',
                  background: '#f9f9f9',
                  padding: '1rem',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Error Details (Development)
                </summary>
                <div style={{ color: '#dc2626', marginBottom: '1rem' }}>
                  <strong>Error:</strong> {this.state.error.message}
                </div>
                {this.state.errorInfo && (
                  <div style={{ color: '#7f1d1d' }}>
                    <strong>Component Stack:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem', overflow: 'auto' }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CriticalErrorBoundary; 