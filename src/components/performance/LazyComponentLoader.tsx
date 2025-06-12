import React, { ComponentType, lazy, Suspense } from 'react';

// Performance-optimized loading spinner for lazy components
const PerformanceLoadingSpinner: React.FC<{ componentName?: string }> = ({
  componentName = 'Component',
}) => (
  <div className="flex items-center justify-center min-h-[200px] bg-gray-50 rounded-lg">
    <div className="animate-pulse flex flex-col items-center space-y-4">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-spin flex items-center justify-center">
        <div className="w-8 h-8 bg-white rounded-full"></div>
      </div>
      <div className="space-y-2 text-center">
        <div className="h-4 bg-gray-300 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <p className="text-sm text-gray-500">Loading {componentName}...</p>
      </div>
    </div>
  </div>
);

// Error boundary for lazy-loaded components
class LazyComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; componentName?: string },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; componentName?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error loading lazy component ${this.props.componentName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[200px] bg-red-50 rounded-lg border border-red-200">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600"
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
            <h3 className="text-lg font-medium text-red-800 mb-2">Component Load Error</h3>
            <p className="text-sm text-red-600 mb-4">
              Failed to load {this.props.componentName || 'component'}. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced lazy component factory with performance optimizations
export const createLazyComponent = <T extends ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>,
  componentName: string,
  preloadCondition?: () => boolean
) => {
  const LazyComponent = lazy(importFunc);

  // Preload component if condition is met
  if (preloadCondition && preloadCondition()) {
    importFunc().catch(error => {
      console.warn(`Failed to preload ${componentName}:`, error);
    });
  }

  const WrappedComponent: React.FC<any> = props => (
    <LazyComponentErrorBoundary componentName={componentName}>
      <Suspense fallback={<PerformanceLoadingSpinner componentName={componentName} />}>
        <LazyComponent {...props} />
      </Suspense>
    </LazyComponentErrorBoundary>
  );

  WrappedComponent.displayName = `Lazy(${componentName})`;

  // Add preload method for manual preloading
  (WrappedComponent as { preload?: () => Promise<{ default: T }> }).preload = () => importFunc();

  return WrappedComponent;
};

// Lazy-loaded heavy components for bundle size optimization
export const LazyDocumentVerificationSystem = createLazyComponent(
  () => import('../DocumentVerificationSystem'),
  'DocumentVerificationSystem',
  () => window.location.pathname.includes('/documents')
);

export const LazyCreditApplicationForm = createLazyComponent(
  () => import('../credit/SafeForms/CreditApplication'),
  'CreditApplicationForm',
  () =>
    window.location.pathname.includes('/credit') ||
    window.location.pathname.includes('/application')
);

// EVA Components - Archived old component
// const EVAAssistantChat = lazy(
//   () => import('../EVAAssistantChat'),
// );

export const LazyDynamicFinancialStatements = createLazyComponent(
  () => import('../credit/DynamicFinancialStatements'),
  'DynamicFinancialStatements'
);

export const LazyDocumentViewer = createLazyComponent(
  () => import('../document/DocumentViewer'),
  'DocumentViewer'
);

export const LazyFilelockDriveApp = createLazyComponent(
  () => import('../document/FilelockDriveApp'),
  'FilelockDriveApp'
);

export const LazyAutoOriginationsDashboard = createLazyComponent(
  () => import('../credit/AutoOriginationsDashboard'),
  'AutoOriginationsDashboard'
);

export const LazyRiskMapEvaReport = createLazyComponent(
  () => import('../risk/RiskMapEvaReport'),
  'RiskMapEvaReport'
);

export const LazySmartMatchEngine = createLazyComponent(
  () => import('../deal/SmartMatchEngine'),
  'SmartMatchEngine'
);

export const LazyModularRiskNavigator = createLazyComponent(
  () => import('../risk/RiskMapCore'),
  'RiskMapCore'
);

// Utility function to preload components based on user interaction
export const preloadOnHover = (componentLoader: { preload?: () => void }) => {
  return {
    onMouseEnter: () => {
      if (componentLoader.preload) {
        componentLoader.preload();
      }
    },
  };
};

// Utility function to preload components based on viewport intersection
export const preloadOnIntersection = (componentLoader: { preload?: () => void }, threshold = 0.1) => {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && componentLoader.preload) {
          componentLoader.preload();
          observer.disconnect();
        }
      });
    },
    { threshold }
  );

  return (element: Element | null) => {
    if (element) {
      observer.observe(element);
    }
  };
};

export default createLazyComponent;
