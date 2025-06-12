import {
  ArrowPathIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTransactionStore } from '../../hooks/useTransactionStore';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import { DemoContextType, UserRoleTypeString, UserSpecificRoleType } from '../../types/user';
import RoleBasedDashboard from './RoleBasedDashboard';
import { UserRole } from './RoleBasedHeader';

// Import recharts components directly with ignore comment to bypass TypeScript error
// @ts-ignore
// Import using require to bypass TypeScript module resolution issues
const ReactBeautifulDnd = require('react-beautiful-dnd');
const { Draggable } = ReactBeautifulDnd;

interface Application {
  id: string;
  borrowerName: string;
  borrowerId?: string;
  businessName: string;
  amount: number;
  status:
    | 'new_application'
    | 'documents_pending'
    | 'under_review'
    | 'approved'
    | 'funded'
    | 'rejected';
  date: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  vehicleInfo?: {
    type: string;
    make: string;
    model: string;
    year: number;
  };
  lastActivity: string;
  completedSteps: string[];
  type?: string;
  createdAt?: string;
  createdBy?: string;
  lastUpdated?: string;
  documentStatus?: string;
  creditScore?: number;
  timeInBusiness?: string;
  eva_recommendation?: string;
  risk_score?: number;
}

// Define different application statuses
const STATUSES = {
  NEW_APPLICATION: 'new_application',
  DOCUMENTS_PENDING: 'documents_pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  FUNDED: 'funded',
  REJECTED: 'rejected',
};

// Sample application data
const SAMPLE_APPLICATIONS = [
  {
    id: 'app-1',
    borrowerName: 'Acme Industries',
    borrowerId: 'b-1001',
    businessName: 'Acme Industries LLC',
    amount: 125000,
    type: 'Equipment Finance',
    status: STATUSES.UNDER_REVIEW as 'under_review',
    date: '2023-08-15',
    createdAt: '2023-08-15',
    createdBy: 'John Smith',
    assignedTo: 'Chris Taylor',
    lastUpdated: '2023-08-16',
    lastActivity: '2023-08-16: Documents requested',
    priority: 'High' as 'high',
    documentStatus: 'Incomplete',
    creditScore: 710,
    timeInBusiness: '5 years',
    eva_recommendation: 'Approve',
    risk_score: 82,
    completedSteps: ['application', 'basic_info'],
  },
  {
    id: 'app-2',
    borrowerName: 'Global Manufacturing Co',
    borrowerId: 'b-1002',
    businessName: 'Global Manufacturing',
    amount: 250000,
    type: 'Commercial Real Estate',
    status: STATUSES.APPROVED as 'approved',
    date: '2023-08-10',
    createdAt: '2023-08-10',
    createdBy: 'Sarah Johnson',
    assignedTo: 'Chris Taylor',
    lastUpdated: '2023-08-14',
    lastActivity: '2023-08-14: Approval granted',
    priority: 'Medium' as 'medium',
    documentStatus: 'Complete',
    creditScore: 760,
    timeInBusiness: '12 years',
    eva_recommendation: 'Approve',
    risk_score: 88,
    completedSteps: ['application', 'basic_info', 'documents', 'review'],
  },
  {
    id: 'app-3',
    borrowerName: 'Quantum Technologies',
    borrowerId: 'b-1003',
    businessName: 'Quantum Tech Inc',
    amount: 75000,
    type: 'Working Capital',
    status: STATUSES.FUNDED as 'funded',
    date: '2023-08-05',
    createdAt: '2023-08-05',
    createdBy: 'John Smith',
    assignedTo: 'Chris Taylor',
    lastUpdated: '2023-08-12',
    lastActivity: '2023-08-12: Funding completed',
    priority: 'Low' as 'low',
    documentStatus: 'Complete',
    creditScore: 740,
    timeInBusiness: '3 years',
    eva_recommendation: 'Approve',
    risk_score: 85,
    completedSteps: ['application', 'basic_info', 'documents', 'review', 'funding'],
  },
  {
    id: 'app-4',
    borrowerName: 'Sunrise Retail Solutions',
    borrowerId: 'b-1004',
    businessName: 'Sunrise Retail',
    amount: 50000,
    type: 'Equipment Finance',
    status: STATUSES.REJECTED as 'rejected',
    date: '2023-08-08',
    createdAt: '2023-08-08',
    createdBy: 'Sarah Johnson',
    assignedTo: 'Chris Taylor',
    lastUpdated: '2023-08-13',
    lastActivity: '2023-08-13: Application rejected',
    priority: 'Medium' as 'medium',
    documentStatus: 'Incomplete',
    creditScore: 620,
    timeInBusiness: '1 year',
    eva_recommendation: 'Decline',
    risk_score: 61,
    completedSteps: ['application', 'basic_info'],
  },
  {
    id: 'app-5',
    borrowerName: 'Horizon Logistics',
    borrowerId: 'b-1005',
    businessName: 'Horizon Logistics Corp',
    amount: 180000,
    type: 'Commercial Auto',
    status: STATUSES.UNDER_REVIEW as 'under_review',
    date: '2023-08-13',
    createdAt: '2023-08-13',
    createdBy: 'John Smith',
    assignedTo: 'Chris Taylor',
    lastUpdated: '2023-08-15',
    lastActivity: '2023-08-15: Underwriter assigned',
    priority: 'High' as 'high',
    documentStatus: 'Pending',
    creditScore: 690,
    timeInBusiness: '4 years',
    eva_recommendation: 'Additional Review',
    risk_score: 75,
    completedSteps: ['application', 'basic_info', 'documents'],
  },
  {
    id: 'app-6',
    borrowerName: 'Mountain View Construction',
    borrowerId: 'b-1006',
    businessName: 'Mountain View Construction LLC',
    amount: 320000,
    type: 'Commercial Real Estate',
    status: STATUSES.APPROVED as 'approved',
    date: '2023-08-07',
    createdAt: '2023-08-07',
    createdBy: 'Sarah Johnson',
    assignedTo: 'Chris Taylor',
    lastUpdated: '2023-08-14',
    lastActivity: '2023-08-14: Terms accepted',
    priority: 'High' as 'high',
    documentStatus: 'Complete',
    creditScore: 780,
    timeInBusiness: '8 years',
    eva_recommendation: 'Approve',
    risk_score: 91,
    completedSteps: ['application', 'basic_info', 'documents', 'review'],
  },
  // Add examples with new statuses
  {
    id: 'app-7',
    borrowerName: 'Innovate Solutions',
    borrowerId: 'b-1007',
    businessName: 'Innovate Solutions Inc',
    amount: 95000,
    type: 'Equipment Finance',
    status: STATUSES.NEW_APPLICATION as 'new_application',
    date: '2023-08-20',
    createdAt: '2023-08-20',
    createdBy: 'Emma Davis',
    assignedTo: '',
    lastUpdated: '2023-08-20',
    lastActivity: '2023-08-20: Application submitted',
    priority: 'Medium' as 'medium',
    documentStatus: 'Not Started',
    creditScore: 715,
    timeInBusiness: '2 years',
    eva_recommendation: 'Review',
    risk_score: 78,
    completedSteps: ['application'],
  },
  {
    id: 'app-8',
    borrowerName: 'Green Energy Co',
    borrowerId: 'b-1008',
    businessName: 'Green Energy Solutions',
    amount: 135000,
    type: 'Solar Equipment',
    status: STATUSES.DOCUMENTS_PENDING as 'documents_pending',
    date: '2023-08-18',
    createdAt: '2023-08-18',
    createdBy: 'Alex Wong',
    assignedTo: 'Chris Taylor',
    lastUpdated: '2023-08-19',
    lastActivity: '2023-08-19: Documents requested',
    priority: 'High' as 'high',
    documentStatus: 'Pending',
    creditScore: 750,
    timeInBusiness: '4 years',
    eva_recommendation: 'Approve',
    risk_score: 85,
    completedSteps: ['application', 'basic_info'],
  },
];

// Sample vendor equipment data (for vendor view)

// Add vendor financing metrics data

// Sample broker commissions (for broker view)

// Sample borrower loans (for borrower view)

interface ApplicationCardProps {
  application: any;
  index: number;
}

// Application Card Component

// Equipment Card for Vendor View

// Commission Card for Broker View

// Loan Card for Borrower View

// Conversation Agent Type
interface AgentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  primaryColor: string;
  capabilities: string[];
}

// User persona type
interface UserPersona {
  id: string;
  role: string;
  name: string;
  goals: string[];
  painPoints: string[];
  userStory: string;
  preferredAgents: string[];
}

// Sample user personas

// Sample agent types

// Create some mock team members
// Add mock team data for each user type

// Sample broker clients (for broker view)

// Sample lender portfolio data

// Create broker metrics

// Lender metrics

// Client card for broker view

// Portfolio card for lender view

// Add enhanced role hierarchy definition
// Define role hierarchy for permissions - higher number means higher permissions

// Define role display names with proper capitalization

// Define view types for each role
const ROLE_VIEW_TYPES = {
  sales_manager: ['macro', 'micro'],
  loan_processor: ['macro', 'micro'],
  credit_underwriter: ['macro', 'micro'],
  credit_committee: ['macro', 'micro'],
  portfolio_manager: ['macro', 'micro'],
  portfolio_servicer: ['macro', 'micro'],
  portfolio_monitor: ['macro', 'micro'],
  developer: ['system', 'logs', 'integration'],
  admin: ['system', 'users', 'permissions', 'audit'],
};

// Add role-specific KPI definitions

// Enhanced KPI card component with visual indicators

// Create a view mode selector component (Macro/Micro)

// User Type Specific KPI Definitions
const USER_TYPE_KPIS = {
  lender: {
    primary: [
      { key: 'portfolio_value', label: 'Portfolio Value', icon: CurrencyDollarIcon, color: 'blue' },
      {
        key: 'applications_pending',
        label: 'Applications Pending',
        icon: ClockIcon,
        color: 'yellow',
      },
      { key: 'approval_rate', label: 'Approval Rate', icon: CheckCircleIcon, color: 'green' },
      {
        key: 'avg_processing_time',
        label: 'Avg Processing Time',
        icon: ChartBarIcon,
        color: 'purple',
      },
    ],
    secondary: [
      { key: 'monthly_volume', label: 'Monthly Volume' },
      { key: 'default_rate', label: 'Default Rate' },
      { key: 'yield_rate', label: 'Portfolio Yield' },
      { key: 'risk_distribution', label: 'Risk Distribution' },
    ],
  },
  borrower: {
    primary: [
      {
        key: 'active_applications',
        label: 'Active Applications',
        icon: DocumentIcon,
        color: 'blue',
      },
      {
        key: 'approved_amount',
        label: 'Approved Amount',
        icon: CurrencyDollarIcon,
        color: 'green',
      },
      { key: 'avg_rate', label: 'Average Rate', icon: ArrowTrendingUpIcon, color: 'orange' },
      {
        key: 'credit_utilization',
        label: 'Credit Utilization',
        icon: ChartBarIcon,
        color: 'purple',
      },
    ],
    secondary: [
      { key: 'payment_history', label: 'Payment History' },
      { key: 'credit_score_trend', label: 'Credit Score Trend' },
      { key: 'available_credit', label: 'Available Credit' },
      { key: 'next_payment', label: 'Next Payment Due' },
    ],
  },
  broker: {
    primary: [
      {
        key: 'monthly_commissions',
        label: 'Monthly Commissions',
        icon: CurrencyDollarIcon,
        color: 'green',
      },
      { key: 'active_deals', label: 'Active Deals', icon: DocumentIcon, color: 'blue' },
      {
        key: 'conversion_rate',
        label: 'Conversion Rate',
        icon: ArrowTrendingUpIcon,
        color: 'orange',
      },
      {
        key: 'client_satisfaction',
        label: 'Client Satisfaction',
        icon: UserGroupIcon,
        color: 'purple',
      },
    ],
    secondary: [
      { key: 'pipeline_value', label: 'Pipeline Value' },
      { key: 'avg_deal_size', label: 'Avg Deal Size' },
      { key: 'time_to_close', label: 'Time to Close' },
      { key: 'referral_rate', label: 'Referral Rate' },
    ],
  },
  vendor: {
    primary: [
      {
        key: 'equipment_financed',
        label: 'Equipment Financed',
        icon: CurrencyDollarIcon,
        color: 'blue',
      },
      { key: 'pending_approvals', label: 'Pending Approvals', icon: ClockIcon, color: 'yellow' },
      { key: 'partner_network', label: 'Partner Network', icon: UserGroupIcon, color: 'green' },
      {
        key: 'avg_financing_rate',
        label: 'Avg Financing Rate',
        icon: ChartBarIcon,
        color: 'purple',
      },
    ],
    secondary: [
      { key: 'equipment_categories', label: 'Equipment Categories' },
      { key: 'seasonal_trends', label: 'Seasonal Trends' },
      { key: 'geographic_spread', label: 'Geographic Spread' },
      { key: 'financing_success_rate', label: 'Financing Success Rate' },
    ],
  },
  internal_employee: {
    primary: [
      { key: 'workload', label: 'Current Workload', icon: DocumentIcon, color: 'blue' },
      {
        key: 'productivity',
        label: 'Productivity Score',
        icon: ArrowTrendingUpIcon,
        color: 'green',
      },
      { key: 'quality_score', label: 'Quality Score', icon: CheckCircleIcon, color: 'purple' },
      { key: 'team_performance', label: 'Team Performance', icon: UserGroupIcon, color: 'orange' },
    ],
    secondary: [
      { key: 'tasks_completed', label: 'Tasks Completed' },
      { key: 'avg_resolution_time', label: 'Avg Resolution Time' },
      { key: 'customer_feedback', label: 'Customer Feedback' },
      { key: 'training_progress', label: 'Training Progress' },
    ],
  },
};

// Mock KPI Data Generator
const generateKPIData = (userType: string, transactions: any[]) => {
  const totalValue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = transactions.filter(
    t =>
      (t as any).details?.status === 'submitted' || (t as any).details?.status === 'under_review',
  ).length;
  const approvedCount = transactions.filter(t => (t as any).details?.status === 'approved').length;
  const totalCount = transactions.length;

  switch (userType) {
    case 'lender':
      return {
        portfolio_value: { value: totalValue, change: 15.2, trend: 'up' },
        applications_pending: { value: pendingCount, change: -8.5, trend: 'down' },
        approval_rate: {
          value: totalCount > 0 ? (approvedCount / totalCount) * 100 : 0,
          change: 5.3,
          trend: 'up',
        },
        avg_processing_time: { value: 4.2, change: -12.8, trend: 'down' },
        monthly_volume: { value: 2.8, change: 22.1, trend: 'up' },
        default_rate: { value: 1.2, change: -0.3, trend: 'down' },
        yield_rate: { value: 8.5, change: 0.8, trend: 'up' },
        risk_distribution: { value: 'Balanced', change: 0, trend: 'stable' },
      };
    case 'borrower':
      return {
        active_applications: { value: pendingCount, change: 1, trend: 'up' },
        approved_amount: { value: totalValue * 0.7, change: 25.5, trend: 'up' },
        avg_rate: { value: 7.8, change: -0.5, trend: 'down' },
        credit_utilization: { value: 45.2, change: -3.2, trend: 'down' },
        payment_history: { value: 98.5, change: 0.2, trend: 'up' },
        credit_score_trend: { value: 720, change: 15, trend: 'up' },
        available_credit: { value: 150000, change: 12.5, trend: 'up' },
        next_payment: { value: '2024-01-15', change: 0, trend: 'stable' },
      };
    case 'broker':
      return {
        monthly_commissions: { value: 45000, change: 18.7, trend: 'up' },
        active_deals: { value: pendingCount + 3, change: 2, trend: 'up' },
        conversion_rate: { value: 68.5, change: 8.2, trend: 'up' },
        client_satisfaction: { value: 4.7, change: 0.3, trend: 'up' },
        pipeline_value: { value: 850000, change: 15.8, trend: 'up' },
        avg_deal_size: { value: 125000, change: 8.2, trend: 'up' },
        time_to_close: { value: 18.5, change: -4.2, trend: 'down' },
        referral_rate: { value: 35.8, change: 12.1, trend: 'up' },
      };
    case 'vendor':
      return {
        equipment_financed: { value: totalValue * 0.8, change: 28.3, trend: 'up' },
        pending_approvals: { value: pendingCount, change: -15.2, trend: 'down' },
        partner_network: { value: 45, change: 5, trend: 'up' },
        avg_financing_rate: { value: 6.8, change: -0.8, trend: 'down' },
        equipment_categories: { value: 12, change: 2, trend: 'up' },
        seasonal_trends: { value: 'Peak Season', change: 0, trend: 'stable' },
        geographic_spread: { value: 8, change: 1, trend: 'up' },
        financing_success_rate: { value: 85.2, change: 5.8, trend: 'up' },
      };
    default:
      return {
        workload: { value: 12, change: -2, trend: 'down' },
        productivity: { value: 94.2, change: 3.8, trend: 'up' },
        quality_score: { value: 97.5, change: 1.2, trend: 'up' },
        team_performance: { value: 88.7, change: 5.2, trend: 'up' },
        tasks_completed: { value: 127, change: 8, trend: 'up' },
        avg_resolution_time: { value: 2.8, change: -0.5, trend: 'down' },
        customer_feedback: { value: 4.6, change: 0.2, trend: 'up' },
        training_progress: { value: 78.5, change: 12.5, trend: 'up' },
      };
  }
};

// Enhanced KPI Card Component
const KPICard: React.FC<{
  kpi: any;
  data: any;
  userType: string;
}> = ({ kpi, data, userType }) => {
  const IconComponent = kpi.icon;
  const colorClasses = {
    blue: 'border-blue-500 text-blue-600',
    green: 'border-green-500 text-green-600',
    yellow: 'border-yellow-500 text-yellow-600',
    purple: 'border-purple-500 text-purple-600',
    orange: 'border-orange-500 text-orange-600',
    red: 'border-red-500 text-red-600',
  };

  const formatValue = (key: string, value: any) => {
    if (key.includes('amount') || key.includes('value') || key.includes('commission')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    if (key.includes('rate') || key.includes('utilization')) {
      return `${value.toFixed(1)}%`;
    }
    if (key.includes('time') && typeof value === 'number') {
      return `${value.toFixed(1)} days`;
    }
    if (key.includes('score') && typeof value === 'number') {
      return value.toFixed(1);
    }
    return value;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  return (
    <div
      className={`rounded-lg border-l-4 bg-white p-6 shadow ${colorClasses[kpi.color]} transition-shadow duration-200 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <IconComponent className={`h-8 w-8 ${colorClasses[kpi.color]}`} />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900">{formatValue(kpi.key, data.value)}</p>
          </div>
        </div>
        <div className="flex items-center">
          {getTrendIcon(data.trend)}
          <span
            className={`ml-2 text-sm font-medium ${
              data.trend === 'up'
                ? 'text-green-600'
                : data.trend === 'down'
                  ? 'text-red-600'
                  : 'text-gray-500'
            }`}
          >
            {data.change !== 0 ? `${data.change > 0 ? '+' : ''}${data.change.toFixed(1)}%` : ''}
          </span>
        </div>
      </div>
    </div>
  );
};

// Notification Component
const NotificationBanner: React.FC<{
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onDismiss: () => void;
}> = ({ type, message, onDismiss }) => {
  const styles = {
    success: 'bg-green-50 border-green-400 text-green-800',
    error: 'bg-red-50 border-red-400 text-red-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  };

  const icons = {
    success: CheckCircleIcon,
    error: XMarkIcon,
    info: InformationCircleIcon,
    warning: ExclamationTriangleIcon,
  };

  const Icon = icons[type];

  return (
    <div className={`mb-6 border-l-4 p-4 ${styles[type]}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3">
          <p className="text-sm">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AutoOriginationsDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentRole, hasPermission } = useUserPermissions();
  const { transactions, loading: transactionsLoading, fetchTransactions } = useTransactionStore();

  // Handle notifications from URL params
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null>(null);

  useEffect(() => {
    const notificationType = searchParams.get('notification');
    if (notificationType) {
      switch (notificationType) {
        case 'application-submitted':
          setNotification({
            type: 'success',
            message:
              '🎉 Credit application submitted successfully! Your application is now in the processing queue.',
          });
          break;
        case 'application-submitted-offline':
          setNotification({
            type: 'warning',
            message:
              '⚠️ Application submitted but failed to sync. Please contact support if needed.',
          });
          break;
        default:
          break;
      }
      // Clear the notification from URL
      navigate('/auto-originations', { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Use UserContext and UserTypeContext to get role information
  // Set state based on context values
  const [currentUserType, setCurrentUserType] = useState<UserRoleTypeString>(
    (localStorage.getItem('userRole') as UserRoleTypeString) || 'lender',
  );
  const [currentSpecificRole, setCurrentSpecificRole] = useState<UserSpecificRoleType>(
    (localStorage.getItem('specificRole') as UserSpecificRoleType) || 'default_role',
  );
  const [currentDemoContext, setCurrentDemoContext] = useState<DemoContextType>('all');

  // Add new state for employee role and view mode
  const [currentEmployeeRole, setCurrentEmployeeRole] = useState<UserRole>('sales_manager');
  const [currentViewMode, setCurrentViewMode] = useState('macro');

  // Add state for the selected role from the tabs at the top
  const [selectedRoleTab, setSelectedRoleTab] = useState<string>('sales_manager');
  const [showRoleDashboard, setShowRoleDashboard] = useState<boolean>(true);

  // State for portfolio-related views (these will be handled elsewhere)
  const [isPortfolioView, setIsPortfolioView] = useState(false);
  const [portfolioViewType, setPortfolioViewType] = useState<'manager' | 'monitoring' | 'servicer'>(
    'manager',
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState(currentUserType); // Set view based on current user type
  const [isOpen, setIsOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState<Application[]>(SAMPLE_APPLICATIONS);
  const [loading, setLoading] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [activeMetricTab, setActiveMetricTab] = useState('overview');
  const [selectedPersona, setSelectedPersona] = useState<UserPersona | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [useEnhancedDashboard, setUseEnhancedDashboard] = useState(true);
  const [currentTransaction, setCurrentTransaction] = useState('TX-123');
  const [displayMode, setDisplayMode] = useState<'kanban' | 'list'>('kanban'); // Default display mode is kanban

  // Generate KPI data based on current user type and transactions
  const kpiData = generateKPIData(currentUserType, transactions);
  const userKPIs = USER_TYPE_KPIS[currentUserType] || USER_TYPE_KPIS['internal_employee'];

  // Main component render
  if (loading || transactionsLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary-600"></div>
        <p className="text-gray-600">Loading Originations Dashboard...</p>
      </div>
    );
  }

  // Portfolio views should redirect to Portfolio Navigator
  if (isPortfolioView) {
    navigate('/portfolio-navigator');
    return null;
  }

  return (
    <div className="w-full">
      <div className="min-h-screen w-full bg-gray-100">
        <div className="mx-auto w-full px-2 py-4 sm:px-4">
          {/* Notification Banner */}
          {notification && (
            <NotificationBanner
              type={notification.type}
              message={notification.message}
              onDismiss={() => setNotification(null)}
            />
          )}

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">
                  Auto Originations Dashboard
                </h1>
                <p className="text-gray-600">
                  Personalized insights and KPIs for {currentUserType.replace('_', ' ')} workflow
                  optimization
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchTransactions}
                  className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <ArrowPathIcon className="mr-2 h-5 w-5" />
                  Refresh Data
                </button>
                <button
                  onClick={() => navigate('/transaction-explorer')}
                  className="flex items-center rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
                >
                  <DocumentIcon className="mr-2 h-5 w-5" />
                  View All Transactions
                </button>
              </div>
            </div>
          </div>

          {/* Primary KPIs */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Key Performance Indicators</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {userKPIs.primary.map(kpi => (
                <KPICard
                  key={kpi.key}
                  kpi={kpi}
                  data={kpiData[kpi.key]}
                  userType={currentUserType}
                />
              ))}
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Detailed Metrics</h2>
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {userKPIs.secondary.map(metric => {
                  const data = kpiData[metric.key];
                  return (
                    <div key={metric.key} className="text-center">
                      <p className="mb-2 text-sm font-medium text-gray-500">{metric.label}</p>
                      <p className="text-lg font-bold text-gray-900">
                        {typeof data?.value === 'number' && metric.key.includes('amount')
                          ? new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(data.value)
                          : typeof data?.value === 'number' && metric.key.includes('rate')
                            ? `${data.value.toFixed(1)}%`
                            : data?.value || 'N/A'}
                      </p>
                      {data?.change !== undefined && data.change !== 0 && (
                        <p
                          className={`text-xs ${data.trend === 'up' ? 'text-green-600' : data.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}
                        >
                          {data.change > 0 ? '+' : ''}
                          {data.change}% from last period
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time Transaction Summary */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Real-time Transaction Activity
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow">
                <div className="flex items-center">
                  <DocumentIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                    <p className="text-sm text-blue-600">Live from Transaction Explorer</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-green-500 bg-white p-6 shadow">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Approved Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {transactions.filter(t => (t as any).details?.status === 'approved').length}
                    </p>
                    <p className="text-sm text-green-600">Ready for funding</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-yellow-500 bg-white p-6 shadow">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {
                        transactions.filter(
                          t =>
                            (t as any).details?.status === 'submitted' ||
                            (t as any).details?.status === 'under_review',
                        ).length
                      }
                    </p>
                    <p className="text-sm text-yellow-600">Require attention</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          {transactions.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
                <button
                  onClick={() => navigate('/transaction-explorer')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  View All →
                </button>
              </div>
              <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Application
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Applicant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {transactions.slice(0, 5).map(transaction => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                            {transaction.id}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {(transaction as any).applicantData?.name || 'Unknown'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(transaction.amount)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                (transaction as any).details?.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : (transaction as any).details?.status === 'submitted'
                                    ? 'bg-blue-100 text-blue-800'
                                    : (transaction as any).details?.status === 'under_review'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {(transaction as any).details?.status?.replace('_', ' ') || 'Unknown'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                            <button
                              onClick={() => navigate(`/transaction-explorer`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Main dashboard content */}
          {showRoleDashboard && (
            <div className="w-full">
              {/* Main dashboard by role */}
              <RoleBasedDashboard
                initialRole={currentEmployeeRole}
                initialViewMode={currentViewMode as 'macro' | 'micro'}
                useTopNavbar={false}
                currentTransaction={currentTransaction}
                currentRole={'admin'}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoOriginationsDashboard;
