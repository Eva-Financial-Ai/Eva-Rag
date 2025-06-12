import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Core Contexts & Providers
import { AuthProvider } from './contexts/AuthContext';
import { EVACustomerProvider } from './contexts/EVACustomerContext';
import { RoleDashboardProvider } from './contexts/RoleDashboardContext';
import { TransactionContextProvider } from './contexts/TransactionContextProvider';
import { UserProvider } from './contexts/UserContext';
import { WorkflowProvider } from './contexts/WorkflowContext';

// Critical Error Boundary
import CriticalErrorBoundary from './components/common/CriticalErrorBoundary';

// Import LazyRouter for comprehensive routing
import LazyRouter from './components/routing/LazyRouter';

// Auth & Layout Components
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
// import ModularLoading from './components/common/ModularLoading';
import SafeFallback from './components/common/SafeFallback';
import { UnifiedErrorBoundary } from './components/common/UnifiedErrorBoundary';
import EnhancedTopNavigation from './components/layout/EnhancedTopNavigation';
import SideNavigation from './components/layout/SideNavigation';

// EVA Components
import EVAMultiChatManager from './components/EVAMultiChatManager';
import MockWebSocketControl from './components/dev/MockWebSocketControl';

// Global Styles
import './styles/index.css';

// Query Client Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

// Environment configurations with safe access
const isDevelopment = (() => {
  try {
    return process?.env?.NODE_ENV === 'development' || 
           !process?.env?.NODE_ENV ||
           import.meta?.env?.DEV === true;
  } catch {
    return true; // Default to development if access fails
  }
})();

const isDemo = (() => {
  try {
    return process?.env?.REACT_APP_DEMO_MODE === 'true' || 
           import.meta?.env?.VITE_DEMO_MODE === 'true' ||
           isDevelopment;
  } catch {
    return true; // Default to demo mode if access fails
  }
})();

const showMockWS = (() => {
  try {
    return process?.env?.REACT_APP_SHOW_MOCK_WS === 'true' || 
           import.meta?.env?.VITE_SHOW_MOCK_WS === 'true' ||
           isDevelopment;
  } catch {
    return false; // Default to hidden if access fails
  }
})();

// Hide navigation for full-screen routes
const fullScreenRoutes = ['/login', '/onboarding'];
const currentPath = window.location.pathname;
const hideNavigation = fullScreenRoutes.includes(currentPath);

function App() {
  return (
    <CriticalErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <UnifiedErrorBoundary>
          <ErrorBoundary fallback={({ error: _error, retry: _retry }) => (
            <div className="p-4 text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Application Error</h2>
              <p className="text-gray-600 mb-4">Something went wrong. Please reload the page.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          )}>
        <AuthProvider>
          <UserProvider>
            <WorkflowProvider>
              <EVACustomerProvider>
                <RoleDashboardProvider>
                  <TransactionContextProvider>
                  <div className="bg-background-primary flex h-screen overflow-hidden">
                    {!hideNavigation && <SideNavigation />}
                    <div className="flex flex-1 flex-col overflow-hidden">
                      {!hideNavigation && <EnhancedTopNavigation />}
                      <main
                        className="bg-background-primary flex-1 overflow-auto"
                        style={{
                          marginTop: hideNavigation ? '0' : '128px',
                          paddingTop: '1rem',
                        }}
                      >
                        <ErrorBoundary>
                          <Suspense
                            fallback={<SafeFallback message="Loading Eva AI Platform..." />}
                          >
                            {isDevelopment || isDemo ? (
                              <LazyRouter />
                            ) : (
                              <Routes>
                                <Route path="/login" element={<Navigate to="/" replace />} />
                                <Route
                                  path="/*"
                                  element={
                                    <ProtectedRoute>
                                      <LazyRouter />
                                    </ProtectedRoute>
                                  }
                                />
                              </Routes>
                            )}
                          </Suspense>
                        </ErrorBoundary>
                      </main>
                    </div>
                  </div>
                  <EVAMultiChatManager currentTransaction={undefined} currentCustomer={undefined} />
                  {showMockWS && isDevelopment && <MockWebSocketControl />}
                  </TransactionContextProvider>
                </RoleDashboardProvider>
              </EVACustomerProvider>
            </WorkflowProvider>
          </UserProvider>
        </AuthProvider>
        </ErrorBoundary>
      </UnifiedErrorBoundary>
      <ToastContainer position="top-right" />
    </QueryClientProvider>
    </CriticalErrorBoundary>
  );
}

export default App;
