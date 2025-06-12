/**
 * Navigation Service - Modular Microservices Architecture
 * Ensures all navigation routes are properly configured and accessible
 * Follows microservices design pattern for future team separation
 */

export interface NavigationRoute {
  id: string;
  name: string;
  path: string;
  component: string;
  module: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  requiresAuth: boolean;
  userTypes?: string[];
  children?: NavigationRoute[];
}

export interface NavigationModule {
  id: string;
  name: string;
  description: string;
  routes: NavigationRoute[];
  isActive: boolean;
  team?: string; // Future team assignment
  repository?: string; // Future repository separation
}

// Define all navigation modules as microservices
export const navigationModules: NavigationModule[] = [
  {
    id: 'dashboard',
    name: 'Dashboard Module',
    description: 'Role-based dashboards and analytics',
    isActive: true,
    team: 'platform-core',
    repository: 'eva-dashboard-service',
    routes: [
      {
        id: 'dashboard-main',
        name: 'Dashboard',
        path: '/dashboard',
        component: 'RoleBasedDashboard',
        module: 'dashboard',
        icon: 'HomeIcon',
        description: 'Main role-based dashboard',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'borrower', 'broker', 'vendor'],
      },
    ],
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant Module',
    description: 'EVA AI Assistant and conversation management',
    isActive: true,
    team: 'ai-team',
    repository: 'eva-ai-service',
    routes: [
      {
        id: 'ai-assistant-main',
        name: 'EVA AI Assistant',
        path: '/ai-assistant',
        component: 'AIAssistantPage',
        module: 'ai-assistant',
        icon: 'BrainIcon',
        description: 'AI-powered assistant with multiple agents',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'borrower', 'broker', 'vendor'],
      },
    ],
  },
  {
    id: 'credit-application',
    name: 'Credit Application Module',
    description: 'Credit application processing and origination',
    isActive: true,
    team: 'credit-team',
    repository: 'eva-credit-service',
    routes: [
      {
        id: 'credit-application-main',
        name: 'Credit Application',
        path: '/credit-application',
        component: 'CreditApplication',
        module: 'credit-application',
        icon: 'DocumentIcon',
        description: 'Main credit application interface',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'borrower', 'broker'],
      },
      {
        id: 'auto-originations',
        name: 'Auto Originations',
        path: '/auto-originations',
        component: 'AutoOriginationsPage',
        module: 'credit-application',
        icon: 'LightningIcon',
        description: 'Automated origination workflows',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
      {
        id: 'transaction-summary',
        name: 'Transaction Summary',
        path: '/transaction-summary',
        component: 'TransactionSummary',
        module: 'credit-application',
        icon: 'TableIcon',
        description: 'Transaction pipeline and summary view',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
    ],
  },
  {
    id: 'customer-retention',
    name: 'Customer Retention Module',
    description: 'Customer relationship management and retention',
    isActive: true,
    team: 'crm-team',
    repository: 'eva-crm-service',
    routes: [
      {
        id: 'customer-retention-main',
        name: 'Customer Retention',
        path: '/customer-retention',
        component: 'CustomerRetention',
        module: 'customer-retention',
        icon: 'UsersIcon',
        description: 'Customer retention dashboard',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
      {
        id: 'customer-retention-customers',
        name: 'Customers',
        path: '/customer-retention/customers',
        component: 'CustomerRetentionCustomers',
        module: 'customer-retention',
        icon: 'UserGroupIcon',
        description: 'Customer management interface',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
      {
        id: 'customer-retention-contacts',
        name: 'Contacts',
        path: '/customer-retention/contacts',
        component: 'CustomerRetentionContacts',
        module: 'customer-retention',
        icon: 'PhoneIcon',
        description: 'Contact management system',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
      {
        id: 'customer-retention-commitments',
        name: 'Commitments',
        path: '/customer-retention/commitments',
        component: 'CustomerRetentionCommitments',
        module: 'customer-retention',
        icon: 'ClipboardIcon',
        description: 'Customer commitment tracking',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
      {
        id: 'calendar-integration',
        name: 'Calendar Integration',
        path: '/calendar-integration',
        component: 'CalendarIntegration',
        module: 'customer-retention',
        icon: 'CalendarIcon',
        description: 'Calendar and scheduling integration',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
      {
        id: 'post-closing',
        name: 'Post Closing',
        path: '/post-closing',
        component: 'PostClosingCustomers',
        module: 'customer-retention',
        icon: 'CheckCircleIcon',
        description: 'Post-closing customer management',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
    ],
  },
  {
    id: 'document-management',
    name: 'Document Management Module',
    description: 'Filelock Drive and document processing',
    isActive: true,
    team: 'document-team',
    repository: 'eva-document-service',
    routes: [
      {
        id: 'documents-main',
        name: 'Documents',
        path: '/documents',
        component: 'Documents',
        module: 'document-management',
        icon: 'FolderIcon',
        description: 'Document management center',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'borrower', 'broker'],
      },
      {
        id: 'shield-vault',
        name: 'Shield Vault',
        path: '/shield-vault',
        component: 'ShieldVault',
        module: 'document-management',
        icon: 'ShieldIcon',
        description: 'Secure document vault',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'borrower', 'broker'],
      },
      {
        id: 'safe-forms',
        name: 'Safe Forms',
        path: '/forms',
        component: 'FormsList',
        module: 'document-management',
        icon: 'DocumentTextIcon',
        description: 'Secure form management',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'borrower', 'broker'],
      },
    ],
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment Module',
    description: 'Risk analysis and assessment tools',
    isActive: true,
    team: 'risk-team',
    repository: 'eva-risk-service',
    routes: [
      {
        id: 'risk-assessment-main',
        name: 'Risk Assessment',
        path: '/risk-assessment',
        component: 'RiskAssessment',
        module: 'risk-assessment',
        icon: 'ExclamationTriangleIcon',
        description: 'Risk assessment dashboard',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
      {
        id: 'eva-risk-report',
        name: 'EVA Risk Report',
        path: '/risk-assessment/eva-report',
        component: 'EVARiskReport',
        module: 'risk-assessment',
        icon: 'ChartBarIcon',
        description: 'EVA AI risk report and scoring',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
      {
        id: 'risk-lab',
        name: 'RiskLab',
        path: '/risk-assessment/lab',
        component: 'RiskLab',
        module: 'risk-assessment',
        icon: 'BeakerIcon',
        description: 'Risk analysis laboratory',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
    ],
  },
  {
    id: 'deal-structuring',
    name: 'Deal Structuring Module',
    description: 'Deal structuring and transaction execution',
    isActive: true,
    team: 'deals-team',
    repository: 'eva-deals-service',
    routes: [
      {
        id: 'deal-structuring-main',
        name: 'Deal Structuring',
        path: '/deal-structuring',
        component: 'DealStructuring',
        module: 'deal-structuring',
        icon: 'CogIcon',
        description: 'Deal structuring interface',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
      {
        id: 'smart-match',
        name: 'Smart Match',
        path: '/deal-structuring/smart-match',
        component: 'SmartMatchPage',
        module: 'deal-structuring',
        icon: 'LightBulbIcon',
        description: 'AI-powered deal matching',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
      {
        id: 'transaction-execution',
        name: 'Transaction Execution',
        path: '/transaction-execution',
        component: 'TransactionExecutionPage',
        module: 'deal-structuring',
        icon: 'ArrowRightIcon',
        description: 'Transaction execution and closing',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
    ],
  },
  {
    id: 'asset-press',
    name: 'Asset Press Module',
    description: 'Asset marketplace and commercial market',
    isActive: true,
    team: 'marketplace-team',
    repository: 'eva-marketplace-service',
    routes: [
      {
        id: 'asset-press-main',
        name: 'Asset Press',
        path: '/asset-press',
        component: 'EnhancedAssetPress',
        module: 'asset-press',
        icon: 'BuildingOfficeIcon',
        description: 'Asset press and listings',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker', 'vendor'],
      },
      {
        id: 'commercial-market',
        name: 'Commercial Market',
        path: '/commercial-market',
        component: 'CommercialMarket',
        module: 'asset-press',
        icon: 'BuildingStorefrontIcon',
        description: 'Commercial asset marketplace',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker', 'vendor'],
      },
    ],
  },
  {
    id: 'portfolio-management',
    name: 'Portfolio Management Module',
    description: 'Portfolio tracking and asset management',
    isActive: true,
    team: 'portfolio-team',
    repository: 'eva-portfolio-service',
    routes: [
      {
        id: 'portfolio-wallet',
        name: 'Portfolio Wallet',
        path: '/portfolio-wallet',
        component: 'PortfolioWalletPage',
        module: 'portfolio-management',
        icon: 'BriefcaseIcon',
        description: 'Portfolio wallet and tracking',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
      {
        id: 'asset-portfolio',
        name: 'Asset Portfolio',
        path: '/asset-portfolio',
        component: 'PortfolioNavigatorPage',
        module: 'portfolio-management',
        icon: 'ChartPieIcon',
        description: 'Asset portfolio navigator',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender', 'broker'],
      },
    ],
  },
  {
    id: 'team-management',
    name: 'Team Management Module',
    description: 'Team and user management',
    isActive: true,
    team: 'admin-team',
    repository: 'eva-admin-service',
    routes: [
      {
        id: 'team-management-main',
        name: 'Team Management',
        path: '/team-management',
        component: 'TeamManagement',
        module: 'team-management',
        icon: 'UserGroupIcon',
        description: 'Team and user management',
        isActive: true,
        requiresAuth: true,
        userTypes: ['lender'], // Admin only
      },
    ],
  },
];

// Navigation service class
export class NavigationService {
  private static instance: NavigationService;
  private modules: NavigationModule[];

  private constructor() {
    this.modules = navigationModules;
  }

  public static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  // Get all active routes
  public getActiveRoutes(): NavigationRoute[] {
    return this.modules
      .filter(module => module.isActive)
      .flatMap(module => module.routes.filter(route => route.isActive));
  }

  // Get routes by user type
  public getRoutesByUserType(userType: string): NavigationRoute[] {
    return this.getActiveRoutes().filter(
      route => !route.userTypes || route.userTypes.includes(userType)
    );
  }

  // Get routes by module
  public getRoutesByModule(moduleId: string): NavigationRoute[] {
    const module = this.modules.find(m => m.id === moduleId);
    return module ? module.routes.filter(route => route.isActive) : [];
  }

  // Validate route exists
  public validateRoute(path: string): boolean {
    return this.getActiveRoutes().some(route => route.path === path);
  }

  // Get route by path
  public getRouteByPath(path: string): NavigationRoute | undefined {
    return this.getActiveRoutes().find(route => route.path === path);
  }

  // Get module by route path
  public getModuleByPath(path: string): NavigationModule | undefined {
    const route = this.getRouteByPath(path);
    return route ? this.modules.find(m => m.id === route.module) : undefined;
  }

  // Check if route requires authentication
  public requiresAuth(path: string): boolean {
    const route = this.getRouteByPath(path);
    return route ? route.requiresAuth : true; // Default to requiring auth
  }

  // Get navigation hierarchy for sidebar
  public getNavigationHierarchy(userType: string): NavigationModule[] {
    return this.modules
      .filter(module => module.isActive)
      .map(module => ({
        ...module,
        routes: module.routes.filter(
          route => route.isActive && (!route.userTypes || route.userTypes.includes(userType))
        ),
      }))
      .filter(module => module.routes.length > 0);
  }

  // Validate all routes are properly configured
  public validateConfiguration(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const allRoutes = this.getActiveRoutes();
    const paths = new Set<string>();

    // Check for duplicate paths
    allRoutes.forEach(route => {
      if (paths.has(route.path)) {
        errors.push(`Duplicate path found: ${route.path}`);
      }
      paths.add(route.path);
    });

    // Check for missing required fields
    allRoutes.forEach(route => {
      if (!route.id) errors.push(`Route missing ID: ${route.path}`);
      if (!route.name) errors.push(`Route missing name: ${route.path}`);
      if (!route.component) errors.push(`Route missing component: ${route.path}`);
      if (!route.module) errors.push(`Route missing module: ${route.path}`);
    });

    // Check modules have valid routes
    this.modules.forEach(module => {
      if (module.isActive && module.routes.filter(r => r.isActive).length === 0) {
        errors.push(`Active module has no active routes: ${module.id}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Get microservice information for future separation
  public getMicroserviceInfo(): Array<{
    module: string;
    team: string;
    repository: string;
    routes: string[];
  }> {
    return this.modules
      .filter(module => module.isActive)
      .map(module => ({
        module: module.id,
        team: module.team || 'unassigned',
        repository: module.repository || 'eva-platform-frontend',
        routes: module.routes.filter(r => r.isActive).map(r => r.path),
      }));
  }
}

// Export singleton instance
export const _navigationService = NavigationService.getInstance();
