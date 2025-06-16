import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

// Loading component for suspense fallback
const Loading = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
    <p className="ml-3 text-primary-600">Loading...</p>
  </div>
);

// Error Boundary for chunk loading errors
class ChunkErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    // Check if it's a chunk loading error
    if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
      return { hasError: true, error };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Log chunk loading errors
    if (error?.name === 'ChunkLoadError' || error?.message?.includes('Loading chunk')) {
      console.warn('Chunk loading failed, attempting to reload...', error);
      // Attempt to reload the page as a fallback
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Loading Error</h2>
            <p className="mb-4 text-gray-600">There was an issue loading this page.</p>
            <button
              onClick={() => window.location.reload()}
              className="text-white rounded bg-primary-600 px-4 py-2 hover:bg-primary-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Function to create lazy component with enhanced retry logic
const retry = (
  fn: () => Promise<any>,
  retriesLeft = 3,
  interval = 500,
  attempt = 1,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch(error => {
        const isChunkError =
          error?.name === 'ChunkLoadError' ||
          error?.message?.includes('Loading chunk') ||
          error?.message?.includes('Loading CSS chunk') ||
          error?.message?.includes('Failed to fetch');

        if (isChunkError) {
          const hasRefreshed = JSON.parse(
            sessionStorage.getItem('chunk-load-refreshed') || 'false',
          );

          if (!hasRefreshed && attempt <= 1) {
            // Only reload once
            console.warn(`Chunk loading failed (attempt ${attempt}), reloading page...`, error);
            sessionStorage.setItem('chunk-load-refreshed', 'true');
            window.location.reload();
          } else if (retriesLeft > 1) {
            console.warn(
              `Chunk loading failed (attempt ${attempt}), retrying... (${retriesLeft - 1} attempts left)`,
              error,
            );
            setTimeout(() => {
              retry(fn, retriesLeft - 1, interval * 1.5, attempt + 1).then(resolve, reject);
            }, interval);
          } else {
            console.error('Chunk loading failed after multiple retries:', error);
            reject(error); // Failed after retries
          }
        } else {
          reject(error); // Not a chunk error, reject immediately
        }
      });
  });
};

const lazyWithRetry = (importFunc: () => Promise<any>) => {
  // Reset the refresh flag on successful load of any lazy component
  // This ensures that if a user navigates away and back, a new error can trigger a refresh
  const promise = retry(importFunc);
  promise.then(() => {
    sessionStorage.setItem('chunk-load-refreshed', 'false');
  });
  return lazy(() => promise);
};

// Define RouteConfig interface
export interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

// Lazily loaded components with retry logic
// const Dashboard = lazyWithRetry(() => import('../../pages/Dashboard'));
const Borrowers = lazyWithRetry(() => import('../../pages/Borrowers'));
const Lenders = lazyWithRetry(() => import('../../pages/Lenders'));
const Security = lazyWithRetry(() => import('../../pages/Security'));
const TransactionExecution = lazyWithRetry(() => import('../../pages/TransactionExecution'));
const TransactionExecutionPage = lazyWithRetry(
  () => import('../../pages/TransactionExecutionPage'),
);
const ProfileSettings = lazyWithRetry(() => import('../../pages/ProfileSettings'));
const TransactionExplorer = lazyWithRetry(() => import('../../pages/TransactionExplorer'));
const Contacts = lazyWithRetry(() => import('../../pages/Contacts'));
const Commitments = lazyWithRetry(() => import('../../pages/Commitments'));
const Documents = lazyWithRetry(() => import('../../pages/Documents'));
const DealStructuring = lazy(() => import('../../pages/DealStructuring'));
const DealStructureEditor = lazyWithRetry(() => import('../../pages/DealStructureEditor'));
const CreditApplication = lazyWithRetry(() => import('../../pages/CreditApplication'));
const AutoOriginationsPage = lazyWithRetry(() => import('../../pages/AutoOriginationsPage'));
const PostClosingCustomers = lazyWithRetry(() => import('../../pages/PostClosingCustomers'));
const ProductsServices = lazyWithRetry(() => import('../../pages/ProductsServices'));
const RiskAssessment = lazyWithRetry(() => import('../../pages/RiskAssessment'));
const RiskLabPage = lazyWithRetry(() => import('../../pages/RiskLabPage'));
const ShieldVault = lazyWithRetry(() => import('../../pages/ShieldVault'));
const FormsList = lazy(() => import('../../pages/FormsList'));
const FormTemplate = lazy(() => import('../../pages/FormTemplate'));
const PortfolioWallet = lazyWithRetry(() => import('../../pages/PortfolioWallet'));
// const AssetPress = lazyWithRetry(() => import('../../pages/AssetPress'));
const EnhancedAssetPress = lazyWithRetry(() => import('../../pages/EnhancedAssetPress'));
const CommercialMarket = lazyWithRetry(() => import('../../pages/CommercialMarket'));
const Transactions = lazy(() => import('../../pages/Transactions'));
const SmartMatchPage = lazy(() => import('../../pages/SmartMatchPage'));
const PortfolioNavigatorPage = lazyWithRetry(() => import('../../pages/PortfolioNavigatorPage'));
const TaxReturnsPage = lazy(() => import('../../pages/TaxReturnsPage'));
const SmartMatchingDecisionPage = lazyWithRetry(
  () => import('../../pages/SmartMatchingDecisionPage'),
);
const UniversalDashboard = lazyWithRetry(() => import('../dashboard/UniversalDashboard'));
const RoleBasedDashboard = lazyWithRetry(() => import('../dashboards/RoleBasedDashboard'));
const ContextAwareDemo = lazyWithRetry(() => import('../../pages/ContextAwareDemo'));
const TransactionWorkflowPage = lazyWithRetry(() => import('../../pages/TransactionWorkflowPage'));
const FileLockDriveTest = lazyWithRetry(() => import('../../pages/FileLockDriveTest'));
const FilelockDrive = lazyWithRetry(() => import('../../pages/FilelockDrive'));

// New Asset Press and Portfolio Navigator tools
const AssetTokenization = lazyWithRetry(() => import('../../pages/AssetTokenization'));
const AssetVerification = lazyWithRetry(() => import('../../pages/AssetVerification'));
const PortfolioAnalytics = lazyWithRetry(() => import('../../pages/PortfolioAnalytics'));
const RiskMonitoring = lazyWithRetry(() => import('../../pages/RiskMonitoring'));

// Financial Psychology Components
const PsychologyDashboard = lazyWithRetry(() => import('../psychology/PsychologyDashboard'));

// Chat History Demo
const ChatHistoryDemo = lazyWithRetry(() => import('../../pages/ChatHistoryDemo'));

// Integrated Workflow Demo
const IntegratedWorkflowDemo = lazyWithRetry(() => import('../../pages/IntegratedWorkflowDemo'));

// Debug components
const LoadingDebugger = lazyWithRetry(() => import('../debug/LoadingDebugger'));

// Customer Retention
const CustomerRetentionCalendar = lazyWithRetry(() => import('../../pages/customerRetention/CustomerRetentionCalendar'));
const CustomerRetentionCustomers = lazyWithRetry(() => import('../../pages/customerRetention/CustomerRetentionCustomers'));
const CustomerRetentionContacts = lazyWithRetry(() => import('../../pages/customerRetention/CustomerRetentionContacts'));
const CustomerRetentionCommitments = lazyWithRetry(() => import('../../pages/customerRetention/CustomerRetentionCommitments'));

// CRP Dashboard
const CRPDashboard = lazyWithRetry(() => import('../crp/CRPDashboard'));

// Primary User Dashboard
const PrimaryUserDashboard = lazyWithRetry(() => import('../dashboards/PrimaryUserDashboard'));

// Welcome Page
const WelcomePage = lazyWithRetry(() => import('../../pages/WelcomePage'));

// Remove CRM Dashboard - now using Customer Retention Platform

// Onboarding pages
const InstrumentOnboarding = lazyWithRetry(() => import('../../pages/InstrumentOnboarding'));
const LenderOnboarding = lazyWithRetry(() => import('../../pages/LenderOnboarding'));
const BrokerOnboarding = lazyWithRetry(() => import('../../pages/BrokerOnboarding'));

// Customer Retention
// const CustomerRetentionOverview = lazyWithRetry(() => import('../../pages/customerRetention/CustomerRetentionOverview'));
// const CustomerRetentionCalendar = lazyWithRetry(() => import('../../pages/customerRetention/CustomerRetentionCalendar'));
// const CustomerRetentionCustomers = lazyWithRetry(() => import('../../pages/customerRetention/CustomerRetentionCustomers'));

// const OffshoreWorkforceTracker = lazyWithRetry(() => import('../../pages/OffshoreWorkforceTracker'));

// const PreApplicationWorkflow = lazyWithRetry(() => import('../../pages/PreApplicationWorkflow'));

// const ContactManagement = lazyWithRetry(() => import('../../pages/ContactManagement'));
// const TasksWorkflow = lazyWithRetry(() => import('../../pages/TasksWorkflow'));

// Document Components

// Define routes - all routes are now protected by the parent RouterSelector
const routes: RouteConfig[] = [
  // Welcome page for unauthenticated users
  { path: '/welcome', component: WelcomePage },
  
  // RAG Test Page
  { path: '/rag-test', component: lazy(() => import('../../pages/RAGTestPage')) },
  
  // Root route redirects to role selection or default lender dashboard
  { path: '/', component: RoleBasedDashboard },

  // SPECIFIC USER TYPE DASHBOARD ROUTES - Clear navigation for each role
  { path: '/dashboard/lender', component: RoleBasedDashboard },
  { path: '/dashboard/borrower', component: RoleBasedDashboard },
  { path: '/dashboard/broker', component: RoleBasedDashboard },
  { path: '/dashboard/vendor', component: RoleBasedDashboard },
  { path: '/dashboard/admin', component: RoleBasedDashboard },
  { path: '/dashboard/developer', component: RoleBasedDashboard },

  // CORE STAFF DASHBOARD ROUTES
  { path: '/dashboard/sales-manager', component: RoleBasedDashboard },
  { path: '/dashboard/loan-processor', component: RoleBasedDashboard },
  { path: '/dashboard/credit-underwriter', component: RoleBasedDashboard },
  { path: '/dashboard/credit-committee', component: RoleBasedDashboard },
  { path: '/dashboard/portfolio-manager', component: RoleBasedDashboard },
  { path: '/dashboard/finance-manager', component: RoleBasedDashboard },

  // Enhanced Primary Dashboard
  { path: '/primary-dashboard', component: PrimaryUserDashboard },

  // Generic dashboard routes (fallback)
  { path: '/dashboard', component: RoleBasedDashboard }, // Default dashboard
  { path: '/analytics', component: RoleBasedDashboard }, // Alternative route for analytics

  // Legacy and alternative dashboard routes (redirect these to specific routes)
  { path: '/universal-dashboard', component: UniversalDashboard }, // Legacy dashboard
  { path: '/dashboard/:userType', component: RoleBasedDashboard }, // Dynamic dashboard routes (legacy)
  { path: '/role-dashboard', component: RoleBasedDashboard }, // Direct role dashboard access
  { path: '/role-dashboard/:role', component: RoleBasedDashboard }, // Role-specific dashboard routes (dev/staging)

  // Core application routes
  { path: '/borrowers', component: Borrowers },
  { path: '/lenders', component: Lenders },
  { path: '/security', component: Security },
  { path: '/transaction-execution', component: TransactionExecution },
  {
    path: '/transactions/:transactionId/execute',
    component: TransactionExecutionPage,
  },
  { path: '/profile-settings', component: ProfileSettings },
  { path: '/transaction-explorer', component: TransactionExplorer },

  // Customer Retention Platform
  { path: '/crp-dashboard', component: CRPDashboard },
  { path: '/customer-retention', component: CRPDashboard }, // Alternative route
  { path: '/customer-retention/calendar', component: CustomerRetentionCalendar },
  { path: '/customer-retention/calendar/:provider', component: CustomerRetentionCalendar },
  { path: '/customer-retention/customers', component: CustomerRetentionCustomers },
  { path: '/customer-retention/contacts', component: CustomerRetentionContacts },
  { path: '/customer-retention/commitments', component: CustomerRetentionCommitments },

  // Simplified Products & Services routes (main access points)
  { path: '/customers', component: PostClosingCustomers }, // Generic customers list
  { path: '/contacts', component: Contacts },
  { path: '/commitments', component: Commitments },

  // Credit Application routes - Enhanced tabbed interface
  { path: '/credit-application', component: CreditApplication },
  { path: '/auto-originations', component: AutoOriginationsPage },

  // Products & Services
  { path: '/products-services', component: ProductsServices },
  { path: '/post-closing', component: PostClosingCustomers },

  // Filelock Drive routes
  { path: '/documents', component: Documents },
  { path: '/shield-vault', component: ShieldVault },
  { path: '/filelock', component: FileLockDriveTest },
  { path: '/filelock-drive', component: FilelockDrive },
  { path: '/forms', component: FormsList },
  { path: '/forms/:templateId', component: FormTemplate },

  // Risk Map Navigator routes
  { path: '/risk-assessment', component: RiskAssessment },
  { path: '/risk-assessment/standard', component: RiskAssessment },
  { path: '/risk-assessment/report', component: RiskAssessment },
  { path: '/risk-assessment/eva-report', component: RiskAssessment },
  { path: '/risk-assessment/eva-report/full', component: RiskAssessment },
  { path: '/risk-assessment/lab', component: RiskLabPage },
  { path: '/risk-assessment/score', component: RiskAssessment },

  // Transaction Structuring routes
  { path: '/deal-structuring', component: DealStructuring },
  { path: '/deal-structuring/editor', component: DealStructureEditor },
  { path: '/deal-structuring/smart-match', component: SmartMatchPage },
  { path: '/smart-matching-decision', component: SmartMatchingDecisionPage },
  { path: '/smart-matching-decision/:transactionId', component: SmartMatchingDecisionPage },
  { path: '/transactions', component: Transactions },

  // Asset Press routes with tools
  { path: '/asset-press', component: EnhancedAssetPress },
  { path: '/asset-tokenization', component: AssetTokenization },
  { path: '/asset-verification', component: AssetVerification },

  // Portfolio Navigator routes with tools
  { path: '/portfolio-wallet', component: PortfolioWallet },
  { path: '/asset-portfolio', component: PortfolioNavigatorPage },
  { path: '/portfolio-analytics', component: PortfolioAnalytics },
  { path: '/risk-monitoring', component: RiskMonitoring },

  // Onboarding routes
  { path: '/instrument-onboarding', component: InstrumentOnboarding },
  { path: '/lender-onboarding', component: LenderOnboarding },
  { path: '/broker-onboarding', component: BrokerOnboarding },

  // Customer Retention
  // { path: '/customer-retention-overview', component: CustomerRetentionOverview },
  // { path: '/offshore-workforce-tracker', component: OffshoreWorkforceTracker },
  // { path: '/pre-application-workflow', component: PreApplicationWorkflow },
  // { path: '/contact-management', component: ContactManagement },
  // { path: '/tasks-workflow', component: TasksWorkflow },

  // Commercial Market
  { path: '/commercial-market', component: CommercialMarket },

  // Tax Returns
  { path: '/tax-returns', component: TaxReturnsPage },

  // Context-Aware Demo
  { path: '/context-demo', component: ContextAwareDemo },

  // Transaction Workflow Demo
  { path: '/transaction-workflow', component: TransactionWorkflowPage },

  // Financial Psychology Dashboard
  { path: '/psychology-dashboard', component: PsychologyDashboard },

  // Chat History Demo
  { path: '/chat-history-demo', component: ChatHistoryDemo },
  
  // Integrated Workflow Demo
  { path: '/integrated-workflow-demo', component: IntegratedWorkflowDemo },
  
  // Debug routes (for troubleshooting)
  { path: '/debug-loading', component: LoadingDebugger },
];

const LazyRouter: React.FC = () => {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          {routes.map(route => {
            const Component = route.component;
            return <Route key={route.path} path={route.path} element={<Component />} />;
          })}

          {/* Catch-all route - redirect to dashboard instead of root to prevent loops */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </ChunkErrorBoundary>
  );
};

export default LazyRouter;
