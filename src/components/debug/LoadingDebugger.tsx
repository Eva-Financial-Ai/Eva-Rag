import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';

/**
 * LoadingDebugger Component
 * 
 * Helps identify why the application is stuck in loading state
 * Shows the status of all major contexts and providers
 */
const LoadingDebugger: React.FC = () => {
  const [renderTime, setRenderTime] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  // Try to access UserContext
  const userContext = useContext(UserContext);
  
  useEffect(() => {
    setRenderTime(new Date().toISOString());
    
    // Collect debug information
    const info = {
      userContext: {
        exists: !!userContext,
        user: userContext?.user,
        isAuthenticated: userContext?.isAuthenticated,
        userRole: userContext?.userRole,
        userName: userContext?.userName,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        isDevelopment: process.env.NODE_ENV === 'development',
        currentUrl: window.location.href,
        userAgent: navigator.userAgent,
      },
      dom: {
        title: document.title,
        hasRoot: !!document.getElementById('root'),
        bodyClasses: document.body.className,
      },
      performance: {
        loadEventEnd: performance.timing?.loadEventEnd || 0,
        domContentLoaded: performance.timing?.domContentLoadedEventEnd || 0,
        navigationStart: performance.timing?.navigationStart || 0,
      }
    };
    
    setDebugInfo(info);
    console.log('🔍 Loading Debug Info:', info);
  }, [userContext]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔍 Loading Debugger
          </h1>
          
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Render Time:</strong> {renderTime}
            </p>
            <p className="text-sm text-blue-800">
              <strong>Component Status:</strong> Successfully rendered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Context Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                {userContext ? '✅' : '❌'} UserContext Status
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Exists:</strong> {userContext ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>User Role:</strong> {userContext?.userRole || 'Not set'}
                </div>
                <div>
                  <strong>User Name:</strong> {userContext?.userName || 'Not set'}
                </div>
                <div>
                  <strong>Authenticated:</strong> {userContext?.isAuthenticated ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>User Object:</strong> {userContext?.user ? 'Present' : 'Null'}
                </div>
              </div>
            </div>

            {/* Environment Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">🌍 Environment</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>NODE_ENV:</strong> {debugInfo.environment?.nodeEnv || 'undefined'}
                </div>
                <div>
                  <strong>Current URL:</strong> {debugInfo.environment?.currentUrl}
                </div>
                <div>
                  <strong>Browser:</strong> {debugInfo.environment?.userAgent?.split(' ')[0]}
                </div>
              </div>
            </div>

            {/* DOM Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">🌐 DOM Status</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Title:</strong> {debugInfo.dom?.title}
                </div>
                <div>
                  <strong>Root Element:</strong> {debugInfo.dom?.hasRoot ? 'Present' : 'Missing'}
                </div>
                <div>
                  <strong>Body Classes:</strong> {debugInfo.dom?.bodyClasses || 'None'}
                </div>
              </div>
            </div>

            {/* Performance Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">⚡ Performance</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Load Complete:</strong> {debugInfo.performance?.loadEventEnd ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>DOM Ready:</strong> {debugInfo.performance?.domContentLoaded ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Navigation Start:</strong> {debugInfo.performance?.navigationStart || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Raw Debug Data */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">📊 Raw Debug Data</h3>
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* Actions */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                console.log('🔍 Full Debug Info:', debugInfo);
                console.log('🔍 UserContext:', userContext);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Log to Console
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Go to Dashboard
            </button>
          </div>

          {/* If UserContext is missing, show instructions */}
          {!userContext && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500">
              <h4 className="font-semibold text-red-800 mb-2">❌ UserContext Missing</h4>
              <p className="text-red-700 text-sm">
                The UserContext provider is not wrapping the application. This is likely causing the infinite loading.
                The UserProvider needs to be added to App.tsx.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingDebugger; 