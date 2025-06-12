import React, { Suspense, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Core Contexts & Providers
import { AuthProvider } from './contexts/AuthContext';
import { EVACustomerProvider } from './contexts/EVACustomerContext';
import { RoleDashboardProvider } from './contexts/RoleDashboardContext';
import { TransactionContextProvider } from './contexts/TransactionContextProvider';
import { UserProvider, UserContext } from './contexts/UserContext';
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

// Route Components
import BorrowerAnalyticsDashboard from './components/dashboard/BorrowerAnalyticsDashboard';
import { EnhancedCreditApplicationFlow } from './components/credit/EnhancedCreditApplicationFlow';
import FilelockDriveApp from './components/document/FilelockDriveApp';

// Create placeholder components for missing routes
const CustomerManagement = () => <div className="p-8"><h1 className="text-2xl font-bold">Customer Management</h1><p>Coming soon...</p></div>;
const RiskMapNavigator = () => <div className="p-8"><h1 className="text-2xl font-bold">Risk Map Navigator</h1><p>Coming soon...</p></div>;
const DealStructuring = () => <div className="p-8"><h1 className="text-2xl font-bold">Deal Structuring</h1><p>Coming soon...</p></div>;
const AssetPools = () => <div className="p-8"><h1 className="text-2xl font-bold">Asset Pools</h1><p>Coming soon...</p></div>;
const PortfolioNavigator = () => <div className="p-8"><h1 className="text-2xl font-bold">Portfolio Navigator</h1><p>Coming soon...</p></div>;
const EVAAssistant = () => <div className="p-8"><h1 className="text-2xl font-bold">EVA Assistant</h1><p>Coming soon...</p></div>;
const LoginPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Login</h1><p>Coming soon...</p></div>;
const OnboardingFlow = () => <div className="p-8"><h1 className="text-2xl font-bold">Onboarding</h1><p>Coming soon...</p></div>;
const WelcomePage = () => <div className="p-8"><h1 className="text-2xl font-bold">Welcome</h1><p>Coming soon...</p></div>;

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
const fullScreenRoutes = ['/login', '/onboarding', '/welcome'];
const currentPath = window.location.pathname;
const hideNavigation = fullScreenRoutes.includes(currentPath);

// Inner component that can access UserContext
const AppContent: React.FC = () => {
  const { sidebarCollapsed } = useContext(UserContext);
  
  return (
    <div className="bg-background-primary flex h-screen overflow-hidden">
      {!hideNavigation && <SideNavigation />}
      <div className={`flex flex-1 flex-col overflow-hidden ${
        !hideNavigation ? (sidebarCollapsed ? 'ml-20' : 'ml-64') : ''
      }`}>
        {!hideNavigation && <EnhancedTopNavigation />}
        <main
          className="bg-background-primary flex-1 overflow-auto"
          style={{
            paddingTop: '1rem',
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<BorrowerAnalyticsDashboard />} />
            <Route path="/credit-application" element={<EnhancedCreditApplicationFlow />} />
            <Route path="/customer-management" element={<CustomerManagement />} />
            <Route path="/filelock-drive" element={<FilelockDriveApp />} />
            <Route path="/risk-map" element={<RiskMapNavigator />} />
            <Route path="/deal-structuring" element={<DealStructuring />} />
            <Route path="/asset-pools" element={<AssetPools />} />
            <Route path="/portfolio-navigator" element={<PortfolioNavigator />} />
            <Route path="/eva-assistant" element={<EVAAssistant />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

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
                    <AppContent />
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
