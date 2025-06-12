import React, { useEffect } from 'react';

/**
 * CRITICAL FIX #9: Safe Fallback Component
 * Prevents white screen during lazy component loading
 * Enhanced with debug info and timeout protection
 */
interface SafeFallbackProps {
  message?: string;
  timeout?: number;
}

const SafeFallback: React.FC<SafeFallbackProps> = ({ 
  message = 'Loading EVA AI Platform...', 
  timeout = 10000 // 10 second timeout
}) => {
  useEffect(() => {
    console.log(`🔄 SafeFallback rendered: ${message}`);
    
    // Set up timeout to detect potential infinite loading
    const timeoutId = setTimeout(() => {
      console.warn(`⚠️ Loading timeout after ${timeout}ms: ${message}`);
      console.warn('If you see this, there might be an infinite loading issue');
      console.warn('Try navigating to /debug-loading for more information');
    }, timeout);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [message, timeout]);

  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        width: '100%',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div 
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }}
        />
        <p style={{ 
          color: '#666', 
          margin: 0,
          fontSize: '14px',
          fontWeight: 500,
        }}>
          {message}
        </p>
        
        {/* Debug button that appears after extended loading */}
        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={() => {
              console.log('🔍 Debug info requested');
              console.log('Current URL:', window.location.href);
              console.log('Message:', message);
              window.location.href = '/debug-loading';
            }}
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#6b7280',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            Debug Loading Issues
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SafeFallback; 