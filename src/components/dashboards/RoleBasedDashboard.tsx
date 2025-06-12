import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserContext } from '../../contexts/UserContext';
import { debugLog } from '../../utils/auditLogger';

import {
  UserProfile,
  UserRole,
  UserRoleTypeString,
  mapUserRoleTypeToUserRole,
} from '../../types/user';

interface DashboardFeature {
  id: string;
  name: string;
  icon: string;
  description: string;
  allowedRoles: UserRole[];
  route: string;
  priority: number;
  isComingSoon?: boolean;
  isNew?: boolean;
  category: 'primary' | 'secondary' | 'analytics';
  // Add performance metrics for lender view
  performance?: {
    usageRate: number;
    efficiencyScore: number;
    userSatisfaction: number;
    completionRate: number;
  };
}

interface RoleBasedDashboardProps {
  currentUser?: UserProfile;
  onFeatureClick?: (featureId: string) => void;
}

interface RealTimeMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  format: 'currency' | 'percentage' | 'number' | 'text';
}

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// Enhanced feature performance metrics for lender dashboard
interface FeaturePerformanceMetric {
  featureName: string;
  usageCount: number;
  successRate: number;
  avgCompletionTime: string;
  userSatisfaction: number;
  trend: 'up' | 'down' | 'stable';
  category: 'high_performance' | 'moderate_performance' | 'needs_attention';
}

// Enhanced KPI interface for 12 key lending metrics
interface LenderKPI {
  id: string;
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  format: 'currency' | 'percentage' | 'number' | 'text' | 'days';
  category: 'portfolio' | 'risk' | 'efficiency' | 'customer';
  description: string;
  benchmark?: string;
}

// Enhanced KPI interface for 15 key admin/SaaS metrics
interface AdminSaaSKPI {
  id: string;
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  format: 'currency' | 'percentage' | 'number' | 'text' | 'days';
  category: 'revenue' | 'costs' | 'efficiency' | 'features' | 'margins';
  description: string;
  benchmark?: string;
}

// Revenue Forecasting Simulator Interfaces
interface RevenueForecastModel {
  name: string;
  description: string;
  monthlyProjections: MonthlyProjection[];
  annualProjections: AnnualProjection[];
  confidence: number;
  factors: string[];
}

interface MonthlyProjection {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
  marginPercent: number;
  confidence: number;
}

interface AnnualProjection {
  year: number;
  revenue: number;
  growth: number;
  costs: number;
  profit: number;
  marginPercent: number;
}

interface ForecastingInputs {
  pipelineValue: number;
  pipelineConversionRate: number;
  backlogValue: number;
  averageDealSize: number;
  monthlyCapacity: number;
  historicalGrowthRate: number;
  seasonalityFactor: number;
  marketConditions: 'optimistic' | 'realistic' | 'conservative';
}

// Mock user data for demonstration (DEV/STAGING ONLY)
const mockUsers: UserProfile[] = [
  {
    id: 'user-001',
    name: 'John Smith',
    role: 'borrower',
    entityType: 'business',
    permissions: ['apply_credit', 'upload_documents', 'view_applications', 'track_progress'],
    lastLogin: '2024-01-20T10:30:00Z',
    isActive: true,
  },
  {
    id: 'user-002',
    name: 'Sarah Johnson',
    role: 'lender',
    entityType: 'corporation',
    permissions: [
      'review_applications',
      'risk_assessment',
      'approve_loans',
      'manage_portfolio',
      'view_analytics',
    ],
    lastLogin: '2024-01-20T09:15:00Z',
    isActive: true,
  },
  {
    id: 'user-003',
    name: 'Mike Rodriguez',
    role: 'broker',
    entityType: 'llc',
    permissions: [
      'facilitate_transactions',
      'manage_clients',
      'view_commissions',
      'document_management',
    ],
    lastLogin: '2024-01-20T08:45:00Z',
    isActive: true,
  },
  {
    id: 'user-004',
    name: 'Lisa Chen',
    role: 'vendor',
    entityType: 'business',
    permissions: [
      'provide_services',
      'manage_contracts',
      'billing_management',
      'client_communication',
    ],
    lastLogin: '2024-01-19T16:20:00Z',
    isActive: true,
  },
  {
    id: 'user-005',
    name: 'Alex Thompson',
    role: 'admin',
    entityType: 'corporation',
    permissions: [
      'full_system_access',
      'user_management',
      'system_configuration',
      'analytics_access',
    ],
    lastLogin: '2024-01-20T07:00:00Z',
    isActive: true,
  },
];

// Enhanced feature set with comprehensive performance metrics for ALL features
const dashboardFeatures: DashboardFeature[] = [
  // Borrower-specific features
  {
    id: 'credit-application',
    name: 'Credit Application',
    icon: '📋',
    description: 'Apply for business credit and loans',
    allowedRoles: ['borrower'],
    route: '/credit-application',
    priority: 1,
    category: 'primary',
    performance: {
      usageRate: 78.3,
      efficiencyScore: 71.2,
      userSatisfaction: 4.1,
      completionRate: 68.7,
    },
  },
  {
    id: 'document-upload',
    name: 'Document Center',
    icon: '📁',
    description: 'Upload and manage required documents',
    allowedRoles: ['borrower'],
    route: '/documents',
    priority: 2,
    category: 'primary',
    performance: {
      usageRate: 85.6,
      efficiencyScore: 79.4,
      userSatisfaction: 4.2,
      completionRate: 82.1,
    },
  },
  {
    id: 'application-status',
    name: 'Application Status',
    icon: '📊',
    description: 'Track your loan application progress',
    allowedRoles: ['borrower'],
    route: '/application-status',
    priority: 3,
    category: 'analytics',
    performance: {
      usageRate: 92.1,
      efficiencyScore: 88.7,
      userSatisfaction: 4.5,
      completionRate: 89.3,
    },
  },
  {
    id: 'borrower-analytics',
    name: 'My Analytics',
    icon: '📈',
    description: 'View your credit profile and funding trends',
    allowedRoles: ['borrower'],
    route: '/borrower-analytics',
    priority: 4,
    category: 'analytics',
    isNew: true,
    performance: {
      usageRate: 67.8,
      efficiencyScore: 74.2,
      userSatisfaction: 4.3,
      completionRate: 71.5,
    },
  },

  // Lender-specific features with comprehensive performance metrics
  {
    id: 'loan-portfolio',
    name: 'Loan Portfolio',
    icon: '💼',
    description: 'Manage your lending portfolio',
    allowedRoles: ['lender', 'admin'],
    route: '/loan-portfolio',
    priority: 1,
    category: 'primary',
    performance: {
      usageRate: 94.2,
      efficiencyScore: 87.5,
      userSatisfaction: 4.6,
      completionRate: 91.8,
    },
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    icon: '⚖️',
    description: 'Evaluate borrower risk profiles',
    allowedRoles: ['lender', 'admin'],
    route: '/risk-assessment',
    priority: 2,
    category: 'primary',
    performance: {
      usageRate: 88.7,
      efficiencyScore: 82.3,
      userSatisfaction: 4.4,
      completionRate: 85.2,
    },
  },
  {
    id: 'auto-originations',
    name: 'Auto Originations',
    icon: '🤖',
    description: 'Automated loan processing and approval',
    allowedRoles: ['lender', 'admin'],
    route: '/auto-originations',
    priority: 3,
    category: 'primary',
    performance: {
      usageRate: 67.4,
      efficiencyScore: 73.1,
      userSatisfaction: 4.3,
      completionRate: 69.8,
    },
  },
  {
    id: 'performance-analytics',
    name: 'Performance Analytics',
    icon: '📈',
    description: 'Advanced portfolio performance insights',
    allowedRoles: ['lender', 'admin'],
    route: '/performance-analytics',
    priority: 4,
    category: 'analytics',
    isNew: true,
    performance: {
      usageRate: 92.1,
      efficiencyScore: 89.3,
      userSatisfaction: 4.7,
      completionRate: 87.6,
    },
  },
  {
    id: 'risk-map-navigator',
    name: 'Risk Map Navigator',
    icon: '🗺️',
    description: 'Interactive risk assessment tools',
    allowedRoles: ['lender', 'admin'],
    route: '/risk-map',
    priority: 5,
    category: 'analytics',
    performance: {
      usageRate: 76.3,
      efficiencyScore: 78.9,
      userSatisfaction: 4.2,
      completionRate: 74.7,
    },
  },
  {
    id: 'underwriting-automation',
    name: 'Underwriting Automation',
    icon: '🔍',
    description: 'AI-powered underwriting decisions',
    allowedRoles: ['lender', 'admin'],
    route: '/underwriting',
    priority: 6,
    category: 'primary',
    performance: {
      usageRate: 81.5,
      efficiencyScore: 84.2,
      userSatisfaction: 4.5,
      completionRate: 78.9,
    },
  },
  {
    id: 'compliance-monitor',
    name: 'Compliance Monitor',
    icon: '⚖️',
    description: 'Regulatory compliance tracking',
    allowedRoles: ['lender', 'admin'],
    route: '/compliance',
    priority: 7,
    category: 'secondary',
    performance: {
      usageRate: 73.2,
      efficiencyScore: 76.8,
      userSatisfaction: 4.1,
      completionRate: 72.4,
    },
  },
  {
    id: 'deal-structuring',
    name: 'Deal Structuring',
    icon: '🏗️',
    description: 'Advanced deal structuring tools',
    allowedRoles: ['lender', 'admin'],
    route: '/deal-structuring',
    priority: 8,
    category: 'secondary',
    performance: {
      usageRate: 68.9,
      efficiencyScore: 71.3,
      userSatisfaction: 4.0,
      completionRate: 66.7,
    },
  },

  // Broker-specific features
  {
    id: 'commission-tracking',
    name: 'Commission Tracking',
    icon: '💰',
    description: 'Track commissions and earnings',
    allowedRoles: ['broker'],
    route: '/commissions',
    priority: 1,
    category: 'primary',
    performance: {
      usageRate: 89.3,
      efficiencyScore: 85.7,
      userSatisfaction: 4.4,
      completionRate: 87.2,
    },
  },
  {
    id: 'client-management',
    name: 'Client Management',
    icon: '👥',
    description: 'Manage client relationships and deals',
    allowedRoles: ['broker'],
    route: '/clients',
    priority: 2,
    category: 'primary',
    performance: {
      usageRate: 91.7,
      efficiencyScore: 88.1,
      userSatisfaction: 4.5,
      completionRate: 89.6,
    },
  },
  {
    id: 'deal-pipeline',
    name: 'Deal Pipeline',
    icon: '📊',
    description: 'Manage your deal pipeline and progress',
    allowedRoles: ['broker'],
    route: '/pipeline',
    priority: 3,
    category: 'analytics',
    performance: {
      usageRate: 85.4,
      efficiencyScore: 82.6,
      userSatisfaction: 4.3,
      completionRate: 81.9,
    },
  },

  // Vendor-specific features
  {
    id: 'service-contracts',
    name: 'Service Contracts',
    icon: '📝',
    description: 'Manage service agreements and contracts',
    allowedRoles: ['vendor'],
    route: '/contracts',
    priority: 1,
    category: 'primary',
    performance: {
      usageRate: 82.6,
      efficiencyScore: 79.4,
      userSatisfaction: 4.2,
      completionRate: 77.8,
    },
  },
  {
    id: 'billing-management',
    name: 'Billing Management',
    icon: '🧾',
    description: 'Invoice and payment management',
    allowedRoles: ['vendor'],
    route: '/billing',
    priority: 2,
    category: 'primary',
    performance: {
      usageRate: 87.1,
      efficiencyScore: 83.5,
      userSatisfaction: 4.3,
      completionRate: 84.7,
    },
  },

  // Shared features (available to multiple roles)
  {
    id: 'smart-match',
    name: 'Smart Match',
    icon: '🔗',
    description: 'AI-powered matching system',
    allowedRoles: ['lender', 'broker', 'borrower'],
    route: '/smart-match',
    priority: 9,
    category: 'secondary',
    performance: {
      usageRate: 82.4,
      efficiencyScore: 79.6,
      userSatisfaction: 4.5,
      completionRate: 78.1,
    },
  },
  {
    id: 'eva-assistant',
    name: 'EVA Assistant',
    icon: '🤖',
    description: 'AI-powered assistant for lending tasks',
    allowedRoles: ['lender', 'broker', 'borrower', 'vendor', 'admin'],
    route: '/eva-assistant',
    priority: 10,
    category: 'secondary',
    performance: {
      usageRate: 95.8,
      efficiencyScore: 92.1,
      userSatisfaction: 4.8,
      completionRate: 93.7,
    },
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: '🔔',
    description: 'Real-time notifications and alerts',
    allowedRoles: ['lender', 'broker', 'borrower', 'vendor', 'admin'],
    route: '/notifications',
    priority: 11,
    category: 'secondary',
    performance: {
      usageRate: 87.3,
      efficiencyScore: 84.7,
      userSatisfaction: 4.3,
      completionRate: 85.9,
    },
  },
  {
    id: 'document-verification',
    name: 'Document Verification',
    icon: '✅',
    description: 'Automated document verification system',
    allowedRoles: ['lender', 'broker', 'admin'],
    route: '/document-verification',
    priority: 12,
    category: 'secondary',
    performance: {
      usageRate: 78.9,
      efficiencyScore: 81.3,
      userSatisfaction: 4.2,
      completionRate: 76.5,
    },
  },

  // Admin-specific features
  {
    id: 'user-management',
    name: 'User Management',
    icon: '👤',
    description: 'Manage platform users and permissions',
    allowedRoles: ['admin'],
    route: '/admin/users',
    priority: 1,
    category: 'primary',
    performance: {
      usageRate: 91.2,
      efficiencyScore: 88.7,
      userSatisfaction: 4.4,
      completionRate: 89.3,
    },
  },
  {
    id: 'system-analytics',
    name: 'System Analytics',
    icon: '📊',
    description: 'Platform-wide analytics and insights',
    allowedRoles: ['admin'],
    route: '/admin/analytics',
    priority: 2,
    category: 'analytics',
    performance: {
      usageRate: 86.5,
      efficiencyScore: 85.1,
      userSatisfaction: 4.6,
      completionRate: 83.8,
    },
  },
];

const RoleBasedDashboard: React.FC<RoleBasedDashboardProps> = ({ currentUser, onFeatureClick }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [featurePerformanceMetrics, setFeaturePerformanceMetrics] = useState<
    FeaturePerformanceMetric[]
  >([]);
  const [lenderKPIs, setLenderKPIs] = useState<LenderKPI[]>([]);
  const [adminSaaSKPIs, setAdminSaaSKPIs] = useState<AdminSaaSKPI[]>([]);
  const [hasError, setHasError] = useState<boolean>(false);

  // Revenue Forecasting Simulator State
  const [showForecastingSimulator, setShowForecastingSimulator] = useState<boolean>(false);
  const [forecastingInputs, setForecastingInputs] = useState<ForecastingInputs>({
    pipelineValue: 450000,
    pipelineConversionRate: 0.25,
    backlogValue: 890000,
    averageDealSize: 156.2,
    monthlyCapacity: 2000,
    historicalGrowthRate: 0.224,
    seasonalityFactor: 1.0,
    marketConditions: 'realistic',
  });
  const [forecastModels, setForecastModels] = useState<RevenueForecastModel[]>([]);

  // SYNCHRONIZED USER ROLE MANAGEMENT with fallback
  const userContext = useContext(UserContext);
  const location = useLocation();
  
  // Single source of truth for activeUser
  const [activeUser, setActiveUser] = useState<UserProfile>(getCurrentUser());
  
  // Add safety check for UserContext
  if (!userContext) {
    console.error('❌ UserContext not found - using fallback');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading Dashboard</h1>
          <p className="text-gray-600">Initializing user context...</p>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { userRole, setUserRole } = userContext;

  // ROUTE-BASED ROLE DETECTION - Automatically set role based on URL
  const detectRoleFromRoute = (): UserRoleTypeString => {
    const path = location.pathname;
    if (path.includes('/lender')) return 'lender';
    if (path.includes('/borrower')) return 'borrower';
    if (path.includes('/broker')) return 'broker';
    if (path.includes('/vendor')) return 'vendor';
    if (path.includes('/admin')) return 'admin';

    // Check localStorage as fallback
    const storedRole = localStorage.getItem('userRole');
    if (storedRole && ['borrower', 'lender', 'broker', 'vendor', 'admin'].includes(storedRole)) {
      return storedRole as UserRoleTypeString;
    }

    return 'borrower'; // Default fallback
  };

  // Enhanced user detection with better synchronization
  const getCurrentUser = (): UserProfile => {
    // Try to get from context first
    if (userContext && userContext.userRole) {
      const contextRole = userContext.userRole;
      const mappedRole = mapUserRoleTypeToUserRole(contextRole);

      // Find user by role from mock data
      const contextUser = mockUsers.find(u => u.role === mappedRole);
      if (contextUser) {
        return contextUser;
      }
    }

    // Fallback to route detection
    const routeRole = detectRoleFromRoute();
    const mappedRouteRole = mapUserRoleTypeToUserRole(routeRole);
    const routeUser = mockUsers.find(u => u.role === mappedRouteRole);

    if (routeUser) {
      return routeUser;
    }

    // Ultimate fallback to first user or default
    return currentUser || mockUsers[0];
  };

  // Event listeners for role synchronization with TopNavbar
  useEffect(() => {
    const handleRoleChange = (event?: CustomEvent) => {
      debugLog('general', 'log_statement', '🔄 Dashboard received role change event:', event?.detail)

      const newRole = event?.detail?.role || userRole;
      setUserRole(newRole);

      // Update active user immediately
      setActiveUser(getCurrentUser());
      setShowForecastingSimulator(false); // Reset forecasting simulator
    };

    const handleForceRefresh = (event?: CustomEvent) => {
      debugLog('general', 'log_statement', '🔄 Dashboard received force refresh event:', event?.detail)
      setActiveUser(getCurrentUser());

      // Ensure role is synchronized
      const currentRole = event?.detail?.role || userRole;
      if (currentRole !== userRole) {
        setUserRole(currentRole);
      }
    };

    // Add event listeners
    window.addEventListener('roleChanged', handleRoleChange as EventListener);
    window.addEventListener('forceRefresh', handleForceRefresh as EventListener);

    // Initial sync
    handleRoleChange();

    return () => {
      window.removeEventListener('roleChanged', handleRoleChange as EventListener);
      window.removeEventListener('forceRefresh', handleForceRefresh as EventListener);
    };
  }, [userRole, currentUser]); // Added currentUser dependency for better sync

  // Note: mapUserRoleTypeToUserRole is imported from unified types system

  // Generate 12 comprehensive KPIs for lender dashboard
  const generateLenderKPIs = (): LenderKPI[] => {
    return [
      {
        id: 'portfolio_value',
        label: 'Portfolio Value',
        value: '$24.8M',
        trend: 'up',
        change: 8.3,
        format: 'currency',
        category: 'portfolio',
        description: 'Total value of active loan portfolio',
        benchmark: 'Target: $25M+',
      },
      {
        id: 'pull_through_rate',
        label: 'Pull Through Rate',
        value: 72.4,
        trend: 'up',
        change: 3.2,
        format: 'percentage',
        category: 'efficiency',
        description: 'Pipeline efficiency (funded loans ÷ applications submitted)',
        benchmark: 'Industry: 60-75%',
      },
      {
        id: 'approval_rate',
        label: 'Application Approval Rate',
        value: 68.2,
        trend: 'down',
        change: -1.8,
        format: 'percentage',
        category: 'efficiency',
        description: 'Quality of application review process',
        benchmark: 'Target: 65-70%',
      },
      {
        id: 'time_to_close',
        label: 'Average Time to Close',
        value: 18,
        trend: 'down',
        change: -2.1,
        format: 'days',
        category: 'efficiency',
        description: 'Operational efficiency metric',
        benchmark: 'Target: <20 days',
      },
      {
        id: 'charge_off_rate',
        label: 'Net Charge-Off Rate',
        value: 1.8,
        trend: 'stable',
        change: 0.1,
        format: 'percentage',
        category: 'risk',
        description: 'Actual losses as percentage of portfolio',
        benchmark: 'Target: <2.0%',
      },
      {
        id: 'default_rate',
        label: 'Loan Default Rate',
        value: 2.3,
        trend: 'down',
        change: -0.4,
        format: 'percentage',
        category: 'risk',
        description: 'Risk quality indicator',
        benchmark: 'Industry: 1.5-2.5%',
      },
      {
        id: 'revenue_per_loan',
        label: 'Revenue per Loan',
        value: '$12,450',
        trend: 'up',
        change: 5.7,
        format: 'currency',
        category: 'portfolio',
        description: 'Profitability per origination',
        benchmark: 'Target: $10K+',
      },
      {
        id: 'customer_acquisition_cost',
        label: 'Customer Acquisition Cost',
        value: '$1,850',
        trend: 'down',
        change: -8.2,
        format: 'currency',
        category: 'customer',
        description: 'Marketing and sales efficiency',
        benchmark: 'Target: <$2K',
      },
      {
        id: 'net_promoter_score',
        label: 'Net Promoter Score',
        value: '+42',
        trend: 'up',
        change: 3.0,
        format: 'text',
        category: 'customer',
        description: 'Customer satisfaction and loyalty',
        benchmark: 'Excellent: >40',
      },
      {
        id: 'pipeline_value',
        label: 'Pipeline Value',
        value: '$8.2M',
        trend: 'up',
        change: 12.4,
        format: 'currency',
        category: 'portfolio',
        description: 'Future business potential',
        benchmark: 'Target: $8M+',
      },
      {
        id: 'active_applications',
        label: 'Active Loan Applications',
        value: 127,
        trend: 'up',
        change: 8.5,
        format: 'number',
        category: 'efficiency',
        description: 'Current workflow volume',
        benchmark: 'Capacity: 150',
      },
      {
        id: 'monthly_origination',
        label: 'Monthly Origination Volume',
        value: '$3.2M',
        trend: 'up',
        change: 15.3,
        format: 'currency',
        category: 'portfolio',
        description: 'Production capacity',
        benchmark: 'Target: $3M+',
      },
    ];
  };

  const generateFeaturePerformanceMetrics = (features: DashboardFeature[]) => {
    // Get all features that have performance data and are accessible to lender
    const featuresWithPerformance = features.filter(
      f => f.performance && (f.allowedRoles.includes('lender') || f.allowedRoles.includes('admin'))
    );

    const getCategory = (
      score: number
    ): 'high_performance' | 'moderate_performance' | 'needs_attention' => {
      if (score >= 85) return 'high_performance';
      if (score >= 70) return 'moderate_performance';
      return 'needs_attention';
    };

    const performanceMetrics: FeaturePerformanceMetric[] = featuresWithPerformance.map(feature => {
      const performance = feature.performance!;
      return {
        featureName: feature.name,
        usageCount: Math.floor(performance.usageRate * 1.27),
        successRate: performance.completionRate + (Math.random() - 0.5) * 2,
        avgCompletionTime: `${Math.floor(Math.random() * 15 + 5)}min`,
        userSatisfaction: performance.userSatisfaction + (Math.random() - 0.5) * 0.2,
        trend: Math.random() > 0.7 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
        category: getCategory(performance.efficiencyScore),
      };
    });

    setFeaturePerformanceMetrics(performanceMetrics);
  };

  const generateQuickStats = (role: UserRole) => {
    switch (role) {
      case 'borrower':
        return {
          'Active Applications': '3',
          'Approved Amount': '$125K',
          'Credit Score': '742',
          'Available Credit': '$50K',
        };
      case 'lender':
        return {
          'Portfolio Value': '$24.8M',
          'Active Applications': '127',
          'Approval Rate': '68.2%',
          'Monthly Volume': '$3.2M',
        };
      case 'broker':
        return {
          'Active Deals': '24',
          'Monthly Commissions': '$18.5K',
          'Close Rate': '78%',
          'Pipeline Value': '$2.1M',
        };
      case 'vendor':
        return {
          'Active Contracts': '12',
          'Monthly Revenue': '$45K',
          'Client Satisfaction': '4.6/5',
          'Service Uptime': '99.8%',
        };
      case 'admin':
        return {
          'Total Users': '1,247',
          'System Uptime': '99.9%',
          'Monthly Transactions': '5,432',
          'Platform Health': '98%',
        };
      default:
        return {};
    }
  };

  const generateRealTimeMetrics = (role: UserRole) => {
    switch (role) {
      case 'lender':
        return [
          {
            label: 'Pull Through Rate',
            value: 72.4,
            change: 3.2,
            trend: 'up' as const,
            format: 'percentage' as const,
          },
          {
            label: 'Net Charge-Off Rate',
            value: 1.8,
            change: 0.1,
            trend: 'stable' as const,
            format: 'percentage' as const,
          },
          {
            label: 'Avg Time to Close',
            value: 18,
            change: -2.1,
            trend: 'down' as const,
            format: 'number' as const,
          },
          {
            label: 'Default Rate',
            value: 2.3,
            change: -0.4,
            trend: 'down' as const,
            format: 'percentage' as const,
          },
          {
            label: 'Revenue per Loan',
            value: '$12,450',
            change: 5.7,
            trend: 'up' as const,
            format: 'currency' as const,
          },
          {
            label: 'Customer Acq. Cost',
            value: '$1,850',
            change: -8.2,
            trend: 'down' as const,
            format: 'currency' as const,
          },
          {
            label: 'Net Promoter Score',
            value: '+42',
            change: 3.0,
            trend: 'up' as const,
            format: 'text' as const,
          },
          {
            label: 'Pipeline Value',
            value: '$8.2M',
            change: 12.4,
            trend: 'up' as const,
            format: 'currency' as const,
          },
        ];
      case 'borrower':
        return [
          {
            label: 'Credit Utilization',
            value: 32.5,
            change: -2.3,
            trend: 'down' as const,
            format: 'percentage' as const,
          },
          {
            label: 'Payment History',
            value: 98.7,
            change: 0.5,
            trend: 'up' as const,
            format: 'percentage' as const,
          },
          {
            label: 'Available Credit',
            value: '$67,500',
            change: 8.2,
            trend: 'up' as const,
            format: 'currency' as const,
          },
          {
            label: 'Credit Score',
            value: 742,
            change: 12,
            trend: 'up' as const,
            format: 'number' as const,
          },
        ];
      case 'broker':
        return [
          {
            label: 'Commission Rate',
            value: 2.75,
            change: 0.15,
            trend: 'up' as const,
            format: 'percentage' as const,
          },
          {
            label: 'Deal Close Rate',
            value: 78.4,
            change: 4.2,
            trend: 'up' as const,
            format: 'percentage' as const,
          },
          {
            label: 'Avg Deal Size',
            value: '$87,500',
            change: -3.1,
            trend: 'down' as const,
            format: 'currency' as const,
          },
          {
            label: 'Client Retention',
            value: 94.2,
            change: 1.8,
            trend: 'up' as const,
            format: 'percentage' as const,
          },
        ];
      case 'vendor':
        return [
          {
            label: 'Service Completion',
            value: 96.8,
            change: 2.1,
            trend: 'up' as const,
            format: 'percentage' as const,
          },
          {
            label: 'Avg Response Time',
            value: '2.3h',
            change: -15.2,
            trend: 'down' as const,
            format: 'text' as const,
          },
          {
            label: 'Client Satisfaction',
            value: 4.6,
            change: 0.2,
            trend: 'up' as const,
            format: 'number' as const,
          },
          {
            label: 'Monthly Revenue',
            value: '$45,200',
            change: 7.8,
            trend: 'up' as const,
            format: 'currency' as const,
          },
        ];
      case 'admin':
        return [
          {
            label: 'System Uptime',
            value: 99.9,
            change: 0.1,
            trend: 'up' as const,
            format: 'percentage' as const,
          },
          {
            label: 'Active Users',
            value: 1247,
            change: 34,
            trend: 'up' as const,
            format: 'number' as const,
          },
          {
            label: 'API Response Time',
            value: '145ms',
            change: -12.3,
            trend: 'down' as const,
            format: 'text' as const,
          },
          {
            label: 'Error Rate',
            value: 0.02,
            change: -0.01,
            trend: 'down' as const,
            format: 'percentage' as const,
          },
        ];
      default:
        return [];
    }
  };

  // Generate 15 comprehensive admin/SaaS KPIs for AI broker platform - WITH REAL PRICING DATA
  const generateAdminSaaSKPIs = (): AdminSaaSKPI[] => {
    return [
      // CORE AI/SAAS REVENUE METRICS - Based on Real Pricing
      {
        id: 'smart_matches_funded',
        label: 'Smart Matches Funded',
        value: 127,
        trend: 'up',
        change: 18.7,
        format: 'number',
        category: 'revenue',
        description: 'Successfully funded deals (Variable Commission %)',
        benchmark: 'Target: 150/month',
      },
      {
        id: 'assets_pressed_tokenized',
        label: 'Assets Pressed & Tokenized',
        value: 89,
        trend: 'up',
        change: 31.2,
        format: 'number',
        category: 'revenue',
        description: 'Asset tokenization operations @ $150 each',
        benchmark: 'Cost: $150 per asset',
      },
      {
        id: 'underwriting_reports_sold',
        label: 'Underwriting Reports Sold',
        value: 234,
        trend: 'up',
        change: 23.4,
        format: 'number',
        category: 'revenue',
        description: 'Risk Score & Reports ($300-$335 range)',
        benchmark: 'Avg: $317.50 per report',
      },
      {
        id: 'shield_vault_transactions',
        label: 'Shield Vault Transactions',
        value: 456,
        trend: 'up',
        change: 15.8,
        format: 'number',
        category: 'revenue',
        description: 'Document locking services @ $30 each',
        benchmark: 'Cost: $30 per transaction',
      },
      {
        id: 'leadmap_verifications',
        label: 'LeadMap Verifications',
        value: 1247,
        trend: 'up',
        change: 28.3,
        format: 'number',
        category: 'revenue',
        description: 'KYB/KYC/KYP verifications ($7.50-$117.50)',
        benchmark: 'Avg: $41.25 per verification',
      },

      // REVENUE CALCULATIONS - Based on Real Pricing
      {
        id: 'monthly_revenue_underwriting',
        label: 'Underwriting Revenue',
        value: '$74,295',
        trend: 'up',
        change: 23.4,
        format: 'currency',
        category: 'revenue',
        description: '234 reports × $317.50 avg price',
        benchmark: 'Target: $80K/month',
      },
      {
        id: 'monthly_revenue_assets',
        label: 'Asset Tokenization Revenue',
        value: '$13,350',
        trend: 'up',
        change: 31.2,
        format: 'currency',
        category: 'revenue',
        description: '89 assets × $150 per tokenization',
        benchmark: 'Target: $15K/month',
      },
      {
        id: 'monthly_revenue_vault',
        label: 'Shield Vault Revenue',
        value: '$13,680',
        trend: 'up',
        change: 15.8,
        format: 'currency',
        category: 'revenue',
        description: '456 transactions × $30 per locking',
        benchmark: 'Target: $15K/month',
      },
      {
        id: 'monthly_revenue_leadmap',
        label: 'LeadMap Revenue',
        value: '$51,440',
        trend: 'up',
        change: 28.3,
        format: 'currency',
        category: 'revenue',
        description: '1,247 verifications × $41.25 avg',
        benchmark: 'Target: $55K/month',
      },
      {
        id: 'platform_subscription_revenue',
        label: 'Platform Subscriptions',
        value: '$18,750',
        trend: 'up',
        change: 12.1,
        format: 'currency',
        category: 'revenue',
        description: 'Monthly platform access fees + CC Bar services',
        benchmark: 'First month free, then $60-100/mo',
      },

      // COST AND MARGIN ANALYSIS - Realistic Business Costs
      {
        id: 'avg_service_cost',
        label: 'Avg Service Cost',
        value: '$45.80',
        trend: 'down',
        change: -3.2,
        format: 'currency',
        category: 'costs',
        description: 'Blended cost across all services',
        benchmark: 'Target: <$50',
      },
      {
        id: 'gross_profit_margin',
        label: 'Gross Profit Margin',
        value: 78.4,
        trend: 'up',
        change: 4.1,
        format: 'percentage',
        category: 'margins',
        description: 'Revenue minus direct service costs',
        benchmark: 'Target: >75%',
      },
      {
        id: 'customer_acquisition_cost',
        label: 'Customer Acquisition Cost',
        value: '$890',
        trend: 'down',
        change: -12.6,
        format: 'currency',
        category: 'costs',
        description: 'Cost to acquire new platform users',
        benchmark: 'Target: <$1,000',
      },

      // OPERATIONAL METRICS
      {
        id: 'average_order_value',
        label: 'Average Order Value',
        value: '$156.20',
        trend: 'up',
        change: 8.7,
        format: 'currency',
        category: 'efficiency',
        description: 'Average revenue per transaction',
        benchmark: 'Target: >$150',
      },
      {
        id: 'monthly_recurring_revenue',
        label: 'Total Monthly Revenue',
        value: '$171,515',
        trend: 'up',
        change: 22.4,
        format: 'currency',
        category: 'revenue',
        description: 'Combined revenue from all services',
        benchmark: 'Target: $200K/month',
      },
    ];
  };

  // REVENUE FORECASTING SIMULATOR - Based on BigTime Models
  const generateForecastModels = (inputs: ForecastingInputs): RevenueForecastModel[] => {
    const currentDate = new Date();
    const months = [];

    // Generate next 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }

    const marketMultiplier =
      inputs.marketConditions === 'optimistic'
        ? 1.15
        : inputs.marketConditions === 'conservative'
          ? 0.85
          : 1.0;

    // 1. Pipeline Revenue Forecasting Model
    const pipelineModel: RevenueForecastModel = {
      name: 'Pipeline Model',
      description: 'Based on sales pipeline and conversion rates',
      confidence: 75,
      factors: ['Pipeline Value', 'Conversion Rate', 'Deal Velocity', 'Market Conditions'],
      monthlyProjections: months.map((month, index) => {
        const baseRevenue =
          ((inputs.pipelineValue * inputs.pipelineConversionRate) / 12) * marketMultiplier;
        const seasonality =
          1 + Math.sin(((index + 1) * Math.PI) / 6) * inputs.seasonalityFactor * 0.2;
        const revenue = baseRevenue * seasonality;
        const costs = revenue * 0.22; // 22% cost ratio from current data
        const profit = revenue - costs;

        return {
          month,
          revenue: Math.round(revenue),
          costs: Math.round(costs),
          profit: Math.round(profit),
          marginPercent: Math.round((profit / revenue) * 100),
          confidence: 75 - index * 2, // Decreasing confidence over time
        };
      }),
      annualProjections: [2025, 2026, 2027].map((year, index) => {
        const annualRevenue =
          inputs.pipelineValue *
          inputs.pipelineConversionRate *
          Math.pow(1 + inputs.historicalGrowthRate, index) *
          marketMultiplier;
        const costs = annualRevenue * 0.22;
        const profit = annualRevenue - costs;

        return {
          year,
          revenue: Math.round(annualRevenue),
          growth:
            index === 0
              ? inputs.historicalGrowthRate * 100
              : Math.round(
                  (annualRevenue /
                    (inputs.pipelineValue *
                      inputs.pipelineConversionRate *
                      Math.pow(1 + inputs.historicalGrowthRate, index - 1)) -
                    1) *
                    100
                ),
          costs: Math.round(costs),
          profit: Math.round(profit),
          marginPercent: Math.round((profit / annualRevenue) * 100),
        };
      }),
    };

    // 2. Backlog Revenue Forecasting Model
    const backlogModel: RevenueForecastModel = {
      name: 'Backlog Model',
      description: 'Based on contracted but unearned revenue',
      confidence: 90,
      factors: ['Contracted Backlog', 'Delivery Capacity', 'Project Timeline'],
      monthlyProjections: months.map((month, index) => {
        const monthlyCapacity = inputs.monthlyCapacity * marketMultiplier;
        const backlogBurn = Math.min(monthlyCapacity, inputs.backlogValue / 8); // 8-month backlog
        const revenue = backlogBurn + monthlyCapacity * 0.3; // 30% new business
        const costs = revenue * 0.22;
        const profit = revenue - costs;

        return {
          month,
          revenue: Math.round(revenue),
          costs: Math.round(costs),
          profit: Math.round(profit),
          marginPercent: Math.round((profit / revenue) * 100),
          confidence: 90 - index * 1, // High confidence, slight decrease
        };
      }),
      annualProjections: [2025, 2026, 2027].map((year, index) => {
        const annualRevenue =
          (inputs.backlogValue + inputs.monthlyCapacity * 12 * 0.3) *
          Math.pow(1 + inputs.historicalGrowthRate, index) *
          marketMultiplier;
        const costs = annualRevenue * 0.22;
        const profit = annualRevenue - costs;

        return {
          year,
          revenue: Math.round(annualRevenue),
          growth: index === 0 ? inputs.historicalGrowthRate * 100 : 22,
          costs: Math.round(costs),
          profit: Math.round(profit),
          marginPercent: Math.round((profit / annualRevenue) * 100),
        };
      }),
    };

    // 3. Resource-Driven Revenue Forecasting Model (Bottom-Up)
    const resourceModel: RevenueForecastModel = {
      name: 'Resource-Driven Model',
      description: 'Based on team capacity and utilization rates',
      confidence: 85,
      factors: ['Team Capacity', 'Utilization Rate', 'Billable Hours', 'Rate Structure'],
      monthlyProjections: months.map((month, index) => {
        const utilizationRate = 0.78; // 78% utilization from current data
        const effectiveCapacity = inputs.monthlyCapacity * utilizationRate * marketMultiplier;
        const revenue = effectiveCapacity * inputs.averageDealSize * 0.01; // Scale factor
        const costs = revenue * 0.22;
        const profit = revenue - costs;

        return {
          month,
          revenue: Math.round(revenue),
          costs: Math.round(costs),
          profit: Math.round(profit),
          marginPercent: Math.round((profit / revenue) * 100),
          confidence: 85 - index * 1.5,
        };
      }),
      annualProjections: [2025, 2026, 2027].map((year, index) => {
        const annualRevenue =
          inputs.monthlyCapacity *
          12 *
          0.78 *
          inputs.averageDealSize *
          0.01 *
          Math.pow(1 + inputs.historicalGrowthRate, index) *
          marketMultiplier;
        const costs = annualRevenue * 0.22;
        const profit = annualRevenue - costs;

        return {
          year,
          revenue: Math.round(annualRevenue),
          growth: index === 0 ? inputs.historicalGrowthRate * 100 : 22,
          costs: Math.round(costs),
          profit: Math.round(profit),
          marginPercent: Math.round((profit / annualRevenue) * 100),
        };
      }),
    };

    // 4. Historical Performance Model
    const historicalModel: RevenueForecastModel = {
      name: 'Historical Performance Model',
      description: 'Based on past performance trends and growth patterns',
      confidence: 80,
      factors: ['Historical Growth', 'Seasonal Patterns', 'Market Trends', 'Performance Data'],
      monthlyProjections: months.map((month, index) => {
        const baseRevenue = 171515; // Current monthly revenue
        const growthFactor = Math.pow(1 + inputs.historicalGrowthRate / 12, index + 1);
        const seasonality =
          1 + Math.sin(((index + 1) * Math.PI) / 6) * inputs.seasonalityFactor * 0.15;
        const revenue = baseRevenue * growthFactor * seasonality * marketMultiplier;
        const costs = revenue * 0.22;
        const profit = revenue - costs;

        return {
          month,
          revenue: Math.round(revenue),
          costs: Math.round(costs),
          profit: Math.round(profit),
          marginPercent: Math.round((profit / revenue) * 100),
          confidence: 80 - index * 1.2,
        };
      }),
      annualProjections: [2025, 2026, 2027].map((year, index) => {
        const annualRevenue =
          171515 * 12 * Math.pow(1 + inputs.historicalGrowthRate, index + 1) * marketMultiplier;
        const costs = annualRevenue * 0.22;
        const profit = annualRevenue - costs;

        return {
          year,
          revenue: Math.round(annualRevenue),
          growth: Math.round(inputs.historicalGrowthRate * 100),
          costs: Math.round(costs),
          profit: Math.round(profit),
          marginPercent: Math.round((profit / annualRevenue) * 100),
        };
      }),
    };

    return [pipelineModel, backlogModel, resourceModel, historicalModel];
  };

  // Initialize data when role changes
  useEffect(() => {
    setIsLoading(true);

    // Generate feature performance metrics for all accessible features
    generateFeaturePerformanceMetrics(dashboardFeatures);

    // Generate lender KPIs if user is lender
    if (activeUser.role === 'lender') {
      setLenderKPIs(generateLenderKPIs());
    }

    // Generate admin/SaaS KPIs if user is admin
    if (activeUser.role === 'admin') {
      setAdminSaaSKPIs(generateAdminSaaSKPIs());
    }

    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, [activeUser.role]);

  // Calculate quick stats, real-time metrics, and chart data
  const quickStats = generateQuickStats(activeUser.role);
  const realTimeMetrics = generateRealTimeMetrics(activeUser.role);

  // Filter available features based on user role
  const availableFeatures = dashboardFeatures.filter(feature =>
    feature.allowedRoles.includes(activeUser.role)
  );

  const handleFeatureClick = (feature: DashboardFeature) => {
    if (feature.isComingSoon) {
      toast.info(`${feature.name} will be available soon!`);
    } else if (onFeatureClick) {
      onFeatureClick(feature.id);
    }
  };

  const formatMetricValue = (metric: RealTimeMetric): string => {
    switch (metric.format) {
      case 'currency':
        return typeof metric.value === 'number'
          ? `$${metric.value.toLocaleString()}`
          : metric.value.toString();
      case 'percentage':
        return `${metric.value}%`;
      case 'number':
        return typeof metric.value === 'number'
          ? metric.value.toLocaleString()
          : metric.value.toString();
      case 'text':
        return metric.value.toString();
      default:
        return metric.value.toString();
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      case 'stable':
        return '➡️';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
    }
  };

  const getRoleUserName = (role: UserRole) => {
    switch (role) {
      case 'borrower':
        return 'John Smith';
      case 'lender':
        return 'Sarah Johnson';
      case 'broker':
        return 'Mike Rodriguez';
      case 'vendor':
        return 'Lisa Chen';
      case 'admin':
        return 'Alex Thompson';
      default:
        return 'Demo User';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'borrower':
        return 'from-blue-600 to-blue-800';
      case 'lender':
        return 'from-green-600 to-green-800';
      case 'broker':
        return 'from-purple-600 to-purple-800';
      case 'vendor':
        return 'from-orange-600 to-orange-800';
      case 'admin':
        return 'from-gray-600 to-gray-800';
      default:
        return 'from-blue-600 to-blue-800';
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'borrower':
        return 'Apply for loans, upload documents, track applications';
      case 'lender':
        return 'Comprehensive portfolio management with 12 KPIs and feature analytics';
      case 'broker':
        return 'Facilitate transactions, manage client relationships';
      case 'vendor':
        return 'Provide specialized services, manage contracts';
      case 'admin':
        return 'Platform administration and system analytics';
      default:
        return 'Access platform features and analytics';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'primary':
        return 'Core Features';
      case 'analytics':
        return 'Analytics & Insights';
      case 'secondary':
        return 'Additional Tools';
      default:
        return 'Features';
    }
  };

  const getPerformanceCategoryColor = (
    category: 'high_performance' | 'moderate_performance' | 'needs_attention'
  ) => {
    switch (category) {
      case 'high_performance':
        return 'border-green-200 bg-green-50';
      case 'moderate_performance':
        return 'border-yellow-200 bg-yellow-50';
      case 'needs_attention':
        return 'border-red-200 bg-red-50';
    }
  };

  const getPerformanceCategoryLabel = (
    category: 'high_performance' | 'moderate_performance' | 'needs_attention'
  ) => {
    switch (category) {
      case 'high_performance':
        return 'High Performance';
      case 'moderate_performance':
        return 'Moderate Performance';
      case 'needs_attention':
        return 'Needs Attention';
    }
  };

  // Generate chart data based on role
  const generateChartData = (role: UserRole) => {
    switch (role) {
      case 'borrower':
        return [
          { label: 'Approved', value: 65, color: '#10b981' },
          { label: 'Pending', value: 25, color: '#f59e0b' },
          { label: 'Rejected', value: 10, color: '#ef4444' },
        ];
      case 'lender':
        return [
          { label: 'Performing Loans', value: 74, color: '#10b981' },
          { label: 'Watch List (30-89 days)', value: 18, color: '#f59e0b' },
          { label: 'Non-Performing (90+ days)', value: 5, color: '#ef4444' },
          { label: 'Charge-Offs', value: 3, color: '#6b7280' },
        ];
      case 'broker':
        return [
          { label: 'Closed', value: 45, color: '#10b981' },
          { label: 'In Progress', value: 35, color: '#3b82f6' },
          { label: 'Prospect', value: 20, color: '#6366f1' },
        ];
      case 'vendor':
        return [
          { label: 'Completed', value: 80, color: '#10b981' },
          { label: 'In Progress', value: 15, color: '#f59e0b' },
          { label: 'Pending', value: 5, color: '#6b7280' },
        ];
      case 'admin':
        return [
          { label: 'Active Users', value: 70, color: '#10b981' },
          { label: 'Inactive Users', value: 20, color: '#f59e0b' },
          { label: 'Suspended', value: 10, color: '#ef4444' },
        ];
      default:
        return [];
    }
  };

  const chartData = generateChartData(activeUser.role);

  // Group features by category
  const featuresByCategory = availableFeatures.reduce(
    (acc, feature) => {
      if (!acc[feature.category]) {
        acc[feature.category] = [];
      }
      acc[feature.category].push(feature);
      return acc;
    },
    {} as Record<string, DashboardFeature[]>
  );

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
          <p className="text-gray-600 mb-4">There was an issue loading the dashboard.</p>
          <div className="space-x-4">
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 1000);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header with role-specific theming */}
        <div
          className={`bg-gradient-to-r ${getRoleColor(activeUser.role)} text-white p-6 shadow-lg transition-all duration-500`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">Welcome back, {activeUser.name}</h1>
                <p className="text-lg opacity-90 capitalize">
                  {activeUser.role} Analytics Dashboard
                  {isLoading && <span className="ml-2">🔄</span>}
                </p>
                <p className="text-sm opacity-75">{getRoleDescription(activeUser.role)}</p>
              </div>

              {/* SYNCHRONIZED USER TYPE DISPLAY - Fixed mismatch issue */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-sm font-medium">Current User Type</div>
                <div className="text-lg font-bold capitalize">{activeUser.role}</div>
                <div className="text-xs opacity-75">
                  {userRole === activeUser.role ? '✅ Synchronized' : '🔄 Updating...'}
                </div>
              </div>
            </div>

            {/* Enhanced 15 SaaS KPIs for Admin or 12 KPIs for Lender or Regular Quick Stats for Others */}
            {activeUser.role === 'admin' && !isLoading ? (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    15 Key AI/SaaS Platform KPIs - Revenue, Costs & Feature Analytics
                  </h3>
                  <button
                    onClick={() => {
                      setShowForecastingSimulator(!showForecastingSimulator);
                      if (!showForecastingSimulator) {
                        setForecastModels(generateForecastModels(forecastingInputs));
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    📊 {showForecastingSimulator ? 'Hide' : 'Show'} Revenue Forecasting Simulator
                  </button>
                </div>

                {showForecastingSimulator && (
                  <>
                    <div className="bg-white/10 rounded-lg p-6 mb-6">
                      <h4 className="text-lg font-semibold text-white mb-4">
                        🎯 Revenue Forecasting Simulator - Multiple Models
                      </h4>

                      {/* Forecasting Inputs */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <label className="block text-sm text-white/80 mb-1">Pipeline Value</label>
                          <input
                            type="number"
                            value={forecastingInputs.pipelineValue}
                            onChange={e =>
                              setForecastingInputs({
                                ...forecastingInputs,
                                pipelineValue: Number(e.target.value),
                              })
                            }
                            className="w-full p-2 rounded bg-gray-800 bg-opacity-70 text-white placeholder-white/60 border border-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/80 mb-1">
                            Conversion Rate (%)
                          </label>
                          <input
                            type="number"
                            value={forecastingInputs.pipelineConversionRate * 100}
                            onChange={e =>
                              setForecastingInputs({
                                ...forecastingInputs,
                                pipelineConversionRate: Number(e.target.value) / 100,
                              })
                            }
                            className="w-full p-2 rounded bg-gray-800 bg-opacity-70 text-white placeholder-white/60 border border-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/80 mb-1">Backlog Value</label>
                          <input
                            type="number"
                            value={forecastingInputs.backlogValue}
                            onChange={e =>
                              setForecastingInputs({
                                ...forecastingInputs,
                                backlogValue: Number(e.target.value),
                              })
                            }
                            className="w-full p-2 rounded bg-gray-800 bg-opacity-70 text-white placeholder-white/60 border border-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/80 mb-1">
                            Market Conditions
                          </label>
                          <select
                            value={forecastingInputs.marketConditions}
                            onChange={e =>
                              setForecastingInputs({
                                ...forecastingInputs,
                                marketConditions: e.target.value as
                                  | 'optimistic'
                                  | 'realistic'
                                  | 'conservative',
                              })
                            }
                            className="w-full p-2 rounded bg-gray-800 bg-opacity-70 text-white border border-gray-700"
                          >
                            <option value="optimistic">📈 Optimistic (+15%)</option>
                            <option value="realistic">⚖️ Realistic</option>
                            <option value="conservative">📉 Conservative (-15%)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <label className="block text-sm text-white/80 mb-1">
                            Monthly Capacity
                          </label>
                          <input
                            type="number"
                            value={forecastingInputs.monthlyCapacity}
                            onChange={e =>
                              setForecastingInputs({
                                ...forecastingInputs,
                                monthlyCapacity: Number(e.target.value),
                              })
                            }
                            className="w-full p-2 rounded bg-gray-800 bg-opacity-70 text-white placeholder-white/60 border border-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/80 mb-1">
                            Growth Rate (%)
                          </label>
                          <input
                            type="number"
                            value={forecastingInputs.historicalGrowthRate * 100}
                            onChange={e =>
                              setForecastingInputs({
                                ...forecastingInputs,
                                historicalGrowthRate: Number(e.target.value) / 100,
                              })
                            }
                            className="w-full p-2 rounded bg-gray-800 bg-opacity-70 text-white placeholder-white/60 border border-gray-700"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/80 mb-1">
                            Seasonality Factor
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={forecastingInputs.seasonalityFactor}
                            onChange={e =>
                              setForecastingInputs({
                                ...forecastingInputs,
                                seasonalityFactor: Number(e.target.value),
                              })
                            }
                            className="w-full p-2 rounded bg-gray-800 bg-opacity-70 text-white placeholder-white/60 border border-gray-700"
                          />
                        </div>
                        <div>
                          <button
                            onClick={() =>
                              setForecastModels(generateForecastModels(forecastingInputs))
                            }
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium mt-6 w-full"
                          >
                            🔄 Update Forecasts
                          </button>
                        </div>
                      </div>

                      {/* Forecasting Models Display */}
                      {forecastModels.length > 0 && (
                        <div className="space-y-6">
                          <h5 className="text-lg font-semibold text-white">
                            📈 Forecasting Models Results
                          </h5>

                          {/* Annual Projections Summary */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {forecastModels.map((model, index) => (
                              <div key={index} className="bg-white/10 rounded-lg p-4">
                                <h6 className="font-semibold text-white mb-2">{model.name}</h6>
                                <div className="text-sm text-white/80 mb-2">
                                  {model.description}
                                </div>
                                <div className="text-lg font-bold text-green-300">
                                  ${model.annualProjections[0]?.revenue.toLocaleString()}
                                </div>
                                <div className="text-sm text-white/70">2025 Revenue</div>
                                <div className="text-sm text-white/70">
                                  Confidence: {model.confidence}%
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Monthly Projections for Selected Model */}
                          {forecastModels.length > 0 && (
                            <div className="bg-white/10 rounded-lg p-4">
                              <h6 className="font-semibold text-white mb-4">
                                📅 Monthly Projections - {forecastModels[0].name}
                              </h6>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {forecastModels[0].monthlyProjections
                                  .slice(0, 6)
                                  .map((projection, index) => (
                                    <div key={index} className="bg-white/5 rounded p-3">
                                      <div className="text-sm font-medium text-white">
                                        {projection.month}
                                      </div>
                                      <div className="text-lg font-bold text-green-300">
                                        ${projection.revenue.toLocaleString()}
                                      </div>
                                      <div className="text-xs text-white/70">
                                        Margin: {projection.marginPercent}%
                                      </div>
                                      <div className="text-xs text-white/60">
                                        Conf: {projection.confidence}%
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* 3-Year Annual Projections */}
                          {forecastModels.length > 0 && (
                            <div className="bg-white/10 rounded-lg p-4">
                              <h6 className="font-semibold text-white mb-4">
                                🎯 3-Year Annual Projections
                              </h6>
                              <div className="overflow-x-auto">
                                <table className="w-full text-white text-sm">
                                  <thead>
                                    <tr className="border-b border-white/20">
                                      <th className="text-left p-2">Model</th>
                                      <th className="text-right p-2">2025</th>
                                      <th className="text-right p-2">2026</th>
                                      <th className="text-right p-2">2027</th>
                                      <th className="text-right p-2">Avg Growth</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {forecastModels.map((model, index) => (
                                      <tr key={index} className="border-b border-white/10">
                                        <td className="p-2 font-medium">{model.name}</td>
                                        <td className="text-right p-2">
                                          ${model.annualProjections[0]?.revenue.toLocaleString()}
                                        </td>
                                        <td className="text-right p-2">
                                          ${model.annualProjections[1]?.revenue.toLocaleString()}
                                        </td>
                                        <td className="text-right p-2">
                                          ${model.annualProjections[2]?.revenue.toLocaleString()}
                                        </td>
                                        <td className="text-right p-2 text-green-300">
                                          {Math.round(
                                            (model.annualProjections[0]?.growth +
                                              model.annualProjections[1]?.growth +
                                              model.annualProjections[2]?.growth) /
                                              3
                                          )}
                                          %
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {adminSaaSKPIs.slice(0, 15).map((kpi, index) => (
                        <div
                          key={kpi.id}
                          className="bg-white/20 rounded-lg p-3 transform transition-all duration-300 hover:scale-105"
                          title={kpi.description}
                        >
                          <div className="text-lg font-bold text-white">
                            {typeof kpi.value === 'number' && kpi.format === 'currency'
                              ? `$${kpi.value.toLocaleString()}`
                              : typeof kpi.value === 'number' && kpi.format === 'percentage'
                                ? `${kpi.value}%`
                                : typeof kpi.value === 'number' && kpi.format === 'days'
                                  ? `${kpi.value} days`
                                  : kpi.value}
                          </div>
                          <div className="text-xs text-white opacity-90">{kpi.label}</div>
                          <div className={`text-xs flex items-center ${getTrendColor(kpi.trend)}`}>
                            <span className="mr-1">{getTrendIcon(kpi.trend)}</span>
                            <span className="text-white">
                              {kpi.change > 0 ? '+' : ''}
                              {kpi.change}
                              {kpi.format === 'percentage' ? 'pp' : '%'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : activeUser.role === 'lender' && !isLoading ? (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  12 Key Lending KPIs - Comprehensive Portfolio Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {lenderKPIs.slice(0, 12).map((kpi, index) => (
                    <div
                      key={kpi.id}
                      className="bg-white/20 rounded-lg p-3 transform transition-all duration-300 hover:scale-105"
                      title={kpi.description}
                    >
                      <div className="text-lg font-bold text-white">
                        {typeof kpi.value === 'number' && kpi.format === 'currency'
                          ? `$${kpi.value.toLocaleString()}`
                          : typeof kpi.value === 'number' && kpi.format === 'percentage'
                            ? `${kpi.value}%`
                            : typeof kpi.value === 'number' && kpi.format === 'days'
                              ? `${kpi.value} days`
                              : kpi.value}
                      </div>
                      <div className="text-xs opacity-90">{kpi.label}</div>
                      <div className={`text-xs flex items-center ${getTrendColor(kpi.trend)}`}>
                        <span className="mr-1">{getTrendIcon(kpi.trend)}</span>
                        <span className="text-white">
                          {kpi.change > 0 ? '+' : ''}
                          {kpi.change}
                          {kpi.format === 'percentage' ? 'pp' : '%'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Regular Quick Stats for Other Roles */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {isLoading
                  ? // Loading skeleton
                    [1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-white/20 rounded-lg p-4 animate-pulse">
                        <div className="h-8 bg-white/30 rounded mb-2"></div>
                        <div className="h-4 bg-white/20 rounded"></div>
                      </div>
                    ))
                  : Object.entries(quickStats).map(([key, value]) => (
                      <div
                        key={`${activeUser.role}-${key}`}
                        className="bg-white/20 rounded-lg p-4 transform transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-2xl font-bold text-white">{value}</div>
                        <div className="text-sm opacity-90">{key}</div>
                      </div>
                    ))}
              </div>
            )}

            {/* Real-time Metrics Row */}
            {!isLoading && realTimeMetrics.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {realTimeMetrics.map((metric, index) => (
                  <div key={`metric-${index}`} className="bg-white/10 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-white">
                      {formatMetricValue(metric)}
                    </div>
                    <div className="text-xs opacity-80 mb-1">{metric.label}</div>
                    <div
                      className={`text-xs flex items-center justify-center ${getTrendColor(metric.trend)}`}
                    >
                      <span className="mr-1">{getTrendIcon(metric.trend)}</span>
                      <span className="text-white">
                        {metric.change > 0 ? '+' : ''}
                        {metric.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Lender-Specific Feature Performance Analytics - ENHANCED TO SHOW ALL FEATURES */}
          {!isLoading && activeUser.role === 'lender' && featurePerformanceMetrics.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All Features Performance Analytics
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({featurePerformanceMetrics.length} features monitored)
                </span>
              </h2>

              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Comprehensive Feature Performance Overview
                  </h3>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>High Performance (≥85%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                      <span>Moderate (70-85%)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span>Needs Attention (&lt;70%)</span>
                    </div>
                  </div>
                </div>

                {/* Feature Performance Grid - Shows ALL features */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {featurePerformanceMetrics.map((metric, index) => (
                    <div
                      key={`performance-${index}`}
                      className={`border rounded-lg p-4 ${getPerformanceCategoryColor(metric.category)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm">{metric.featureName}</h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getTrendIcon(metric.trend)}`}
                        >
                          {getTrendIcon(metric.trend)}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Usage Count:</span>
                          <span className="font-medium">{metric.usageCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span className="font-medium">{metric.successRate.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg. Time:</span>
                          <span className="font-medium">{metric.avgCompletionTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Satisfaction:</span>
                          <span className="font-medium">
                            {metric.userSatisfaction.toFixed(1)}/5.0
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-current/20">
                        <span className="text-xs font-medium">
                          {getPerformanceCategoryLabel(metric.category)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-800 font-semibold text-sm mb-1">
                    High Performance Features
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {
                      featurePerformanceMetrics.filter(m => m.category === 'high_performance')
                        .length
                    }
                  </div>
                  <div className="text-xs text-green-600">Above 85% efficiency</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-yellow-800 font-semibold text-sm mb-1">
                    Moderate Performance
                  </div>
                  <div className="text-2xl font-bold text-yellow-900">
                    {
                      featurePerformanceMetrics.filter(m => m.category === 'moderate_performance')
                        .length
                    }
                  </div>
                  <div className="text-xs text-yellow-600">70-85% efficiency</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800 font-semibold text-sm mb-1">Needs Attention</div>
                  <div className="text-2xl font-bold text-red-900">
                    {featurePerformanceMetrics.filter(m => m.category === 'needs_attention').length}
                  </div>
                  <div className="text-xs text-red-600">Below 70% efficiency</div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Chart Section */}
          {!isLoading && chartData.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {activeUser.role === 'borrower'
                  ? 'Application Status Distribution'
                  : activeUser.role === 'lender'
                    ? 'Portfolio Health Distribution'
                    : activeUser.role === 'broker'
                      ? 'Deal Pipeline Distribution'
                      : activeUser.role === 'vendor'
                        ? 'Service Status Distribution'
                        : 'User Status Distribution'}
              </h2>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
                  <span className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleTimeString()}
                  </span>
                </div>

                {/* Simple bar chart representation */}
                <div className="space-y-3">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-20 text-sm font-medium text-gray-700">{item.label}</div>
                      <div className="flex-1 mx-4">
                        <div className="bg-gray-200 rounded-full h-4">
                          <div
                            className="h-4 rounded-full transition-all duration-500"
                            style={{
                              width: `${item.value}%`,
                              backgroundColor: item.color,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-12 text-sm font-semibold text-gray-900">{item.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Features Grid by Category */}
          {Object.entries(featuresByCategory).map(([category, features]) => (
            <div key={category} className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {getCategoryLabel(category)}
                  {isLoading && <span className="ml-2 text-blue-600">Loading...</span>}
                </h2>
                <span className="text-sm text-gray-500">
                  {features.filter(f => !f.isComingSoon).length} available
                </span>
              </div>

              {isLoading ? (
                // Loading skeleton for features
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
                        <div className="h-5 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {features.map((feature, index) => (
                    <div
                      key={`${activeUser.role}-${feature.id}-${index}`}
                      onClick={() => handleFeatureClick(feature)}
                      className={`
                      relative bg-white rounded-lg shadow-lg p-6 cursor-pointer
                      hover:shadow-xl transform hover:scale-105 transition-all duration-200
                      ${feature.isComingSoon ? 'opacity-75' : 'hover:bg-gray-50'}
                        border-l-4 border-blue-500
                    `}
                    >
                      {feature.isComingSoon && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            Coming Soon
                          </span>
                        </div>
                      )}

                      {feature.isNew && !feature.isComingSoon && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        </div>
                      )}

                      <div className="text-center">
                        <div className="text-4xl mb-3">{feature.icon}</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.name}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>

                        {/* Lender Performance Badge */}
                        {activeUser.role === 'lender' && feature.performance && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">Performance</div>
                            <div className="flex justify-between text-xs">
                              <span>Usage: {feature.performance.usageRate.toFixed(1)}%</span>
                              <span>Satisfaction: {feature.performance.userSatisfaction}/5</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {feature.isComingSoon && (
                        <div className="mt-4 text-xs text-center text-yellow-600">
                          Available after July 15th, 2025
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && features.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No {category} features available for {activeUser.role} role
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Role-specific workflow guidance */}
          {!isLoading && (
            <div className="bg-white rounded-lg shadow p-6 transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {activeUser.role === 'borrower'
                  ? 'Your Lending Journey'
                  : activeUser.role === 'lender'
                    ? 'Comprehensive Lending Workflow'
                    : activeUser.role === 'broker'
                      ? 'Transaction Management'
                      : activeUser.role === 'vendor'
                        ? 'Service Management'
                        : 'Admin Dashboard Workflow'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeUser.role === 'borrower' && (
                  <>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-blue-600">1. Apply</div>
                      <p className="text-sm text-gray-600">
                        Complete your credit application with business details
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-yellow-600">2. Documents</div>
                      <p className="text-sm text-gray-600">
                        Upload required financial and legal documents
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-green-600">3. Approval</div>
                      <p className="text-sm text-gray-600">
                        Track status and receive funding decisions
                      </p>
                    </div>
                  </>
                )}

                {activeUser.role === 'lender' && (
                  <>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-blue-600">
                        1. Monitor 12 KPIs & All Features
                      </div>
                      <p className="text-sm text-gray-600">
                        Track comprehensive lending metrics and performance for all platform
                        features
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-yellow-600">2. Risk Assessment</div>
                      <p className="text-sm text-gray-600">
                        Evaluate portfolio risk, feature efficiency, and performance metrics
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-green-600">
                        3. Optimize Portfolio
                      </div>
                      <p className="text-sm text-gray-600">
                        Make data-driven decisions to improve returns and feature utilization
                      </p>
                    </div>
                  </>
                )}

                {activeUser.role === 'broker' && (
                  <>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-blue-600">1. Connect</div>
                      <p className="text-sm text-gray-600">Match borrowers with suitable lenders</p>
                    </div>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-yellow-600">2. Facilitate</div>
                      <p className="text-sm text-gray-600">
                        Manage documentation and communication
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-green-600">3. Close</div>
                      <p className="text-sm text-gray-600">
                        Complete transactions and earn commissions
                      </p>
                    </div>
                  </>
                )}

                {activeUser.role === 'vendor' && (
                  <>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-blue-600">1. Services</div>
                      <p className="text-sm text-gray-600">Provide specialized lending services</p>
                    </div>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-yellow-600">2. Contracts</div>
                      <p className="text-sm text-gray-600">Manage service agreements and terms</p>
                    </div>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-green-600">3. Billing</div>
                      <p className="text-sm text-gray-600">Track payments and manage invoicing</p>
                    </div>
                  </>
                )}

                {activeUser.role === 'admin' && (
                  <>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-blue-600">1. Monitor</div>
                      <p className="text-sm text-gray-600">
                        System health and user activity monitoring
                      </p>
                    </div>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-yellow-600">2. Manage</div>
                      <p className="text-sm text-gray-600">User roles and platform configuration</p>
                    </div>
                    <div className="border rounded-lg p-4 transform transition-all duration-200 hover:shadow-md">
                      <div className="text-lg font-medium text-green-600">3. Analytics</div>
                      <p className="text-sm text-gray-600">
                        Platform insights and performance metrics
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in RoleBasedDashboard component:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h1>
          <p className="text-gray-600 mb-4">There was an issue loading the dashboard.</p>
          <div className="space-x-4">
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 1000);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default RoleBasedDashboard;
