import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useUserType } from './UserTypeContext';
import { UserType, FeatureAccess, PermissionLevel } from '../types/UserTypes';

import { debugLog } from '../utils/auditLogger';

// Enhanced dashboard configuration types
export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  component: React.ComponentType<any>;
  width: 'full' | 'half' | 'third' | 'quarter';
  height: 'small' | 'medium' | 'large';
  priority: number;
  permissions: {
    feature: keyof FeatureAccess;
    minimumLevel: PermissionLevel;
  };
  userTypes: UserType[];
  specificRoles?: string[];
  data?: any;
}

export interface DashboardAction {
  id: string;
  label: string;
  icon?: string;
  color: string;
  action: () => void;
  permissions: {
    feature: keyof FeatureAccess;
    minimumLevel: PermissionLevel;
  };
  userTypes: UserType[];
  specificRoles?: string[];
  isPrimary: boolean;
}

export interface DashboardConfig {
  id: string;
  title: string;
  subtitle: string;
  layout: 'standard' | 'compact' | 'detailed';
  theme: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
  };
  widgets: DashboardWidget[];
  actions: DashboardAction[];
  navigation: {
    showSidebar: boolean;
    showTopActions: boolean;
    customMenuItems?: any[];
  };
  userTypes: UserType[];
  specificRoles?: string[];
}

export interface RoleDashboardContextType {
  currentDashboard: DashboardConfig | null;
  availableDashboards: DashboardConfig[];
  switchDashboard: (dashboardId: string) => void;
  getVisibleWidgets: () => DashboardWidget[];
  getAvailableActions: () => DashboardAction[];
  hasWidgetPermission: (widget: DashboardWidget) => boolean;
  hasActionPermission: (action: DashboardAction) => boolean;
  getDashboardForUserType: (userType: UserType, specificRole?: string) => DashboardConfig | null;
  refreshDashboard: () => void;
  loading: boolean;
}

const RoleDashboardContext = createContext<RoleDashboardContextType>({
  currentDashboard: null,
  availableDashboards: [],
  switchDashboard: () => {},
  getVisibleWidgets: () => [],
  getAvailableActions: () => [],
  hasWidgetPermission: () => false,
  hasActionPermission: () => false,
  getDashboardForUserType: () => null,
  refreshDashboard: () => {},
  loading: true,
});

interface RoleDashboardProviderProps {
  children: ReactNode;
}

export const RoleDashboardProvider: React.FC<RoleDashboardProviderProps> = ({ children }) => {
  const { userType, specificRole, hasPermission, permissions } = useUserType();
  const [currentDashboard, setCurrentDashboard] = useState<DashboardConfig | null>(null);
  const [availableDashboards, setAvailableDashboards] = useState<DashboardConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Dashboard configurations for each user type and role
  const dashboardConfigs: DashboardConfig[] = useMemo(() => [
    // LENDER DASHBOARDS
    {
      id: 'lender-portfolio-manager',
      title: 'Portfolio Management Dashboard',
      subtitle: 'Comprehensive portfolio oversight and risk management',
      layout: 'detailed',
      theme: {
        primaryColor: '#3B82F6',
        accentColor: '#10B981',
        backgroundColor: '#F8FAFC',
      },
      widgets: [
        {
          id: 'portfolio-value',
          type: 'metric-card',
          title: 'Total Portfolio Value',
          component: () => null, // Will be replaced with actual components
          width: 'quarter',
          height: 'small',
          priority: 1,
          permissions: { feature: 'analytics', minimumLevel: PermissionLevel.VIEW },
          userTypes: [UserType.LENDER],
          specificRoles: ['portfolio_manager', 'lending_director'],
        },
        {
          id: 'risk-analysis',
          type: 'risk-dashboard',
          title: 'Risk Analysis',
          component: () => null,
          width: 'half',
          height: 'large',
          priority: 2,
          permissions: { feature: 'analytics', minimumLevel: PermissionLevel.INTERACT },
          userTypes: [UserType.LENDER],
          specificRoles: ['portfolio_manager', 'underwriter', 'lending_director'],
        },
        {
          id: 'active-deals',
          type: 'deals-table',
          title: 'Active Deals',
          component: () => null,
          width: 'full',
          height: 'large',
          priority: 3,
          permissions: { feature: 'transactions', minimumLevel: PermissionLevel.VIEW },
          userTypes: [UserType.LENDER],
        },
      ],
      actions: [
        {
          id: 'new-loan-application',
          label: 'Review Applications',
          icon: '📋',
          color: 'blue',
          action: () => debugLog('general', 'log_statement', 'Navigate to applications'),
          permissions: { feature: 'transactions', minimumLevel: PermissionLevel.INTERACT },
          userTypes: [UserType.LENDER],
          isPrimary: true,
        },
        {
          id: 'generate-portfolio-report',
          label: 'Generate Portfolio Report',
          icon: '📊',
          color: 'green',
          action: () => debugLog('general', 'log_statement', 'Generate report'),
          permissions: { feature: 'reporting', minimumLevel: PermissionLevel.INTERACT },
          userTypes: [UserType.LENDER],
          specificRoles: ['portfolio_manager', 'lending_director'],
          isPrimary: false,
        },
      ],
      navigation: {
        showSidebar: true,
        showTopActions: true,
      },
      userTypes: [UserType.LENDER],
      specificRoles: ['portfolio_manager', 'lending_director', 'underwriter'],
    },

    // BROKER DASHBOARDS
    {
      id: 'broker-client-management',
      title: 'Client Management Dashboard',
      subtitle: 'Track clients, deals, and commission opportunities',
      layout: 'standard',
      theme: {
        primaryColor: '#8B5CF6',
        accentColor: '#F59E0B',
        backgroundColor: '#FAFAFA',
      },
      widgets: [
        {
          id: 'client-pipeline',
          type: 'pipeline-chart',
          title: 'Client Pipeline',
          component: () => null,
          width: 'half',
          height: 'medium',
          priority: 1,
          permissions: { feature: 'smartMatch', minimumLevel: PermissionLevel.VIEW },
          userTypes: [UserType.BROKERAGE],
        },
        {
          id: 'commission-forecast',
          type: 'commission-chart',
          title: 'Commission Forecast',
          component: () => null,
          width: 'half',
          height: 'medium',
          priority: 2,
          permissions: { feature: 'analytics', minimumLevel: PermissionLevel.VIEW },
          userTypes: [UserType.BROKERAGE],
        },
        {
          id: 'smart-matches',
          type: 'smart-match-widget',
          title: 'Smart Lender Matches',
          component: () => null,
          width: 'full',
          height: 'large',
          priority: 3,
          permissions: { feature: 'smartMatch', minimumLevel: PermissionLevel.INTERACT },
          userTypes: [UserType.BROKERAGE],
        },
      ],
      actions: [
        {
          id: 'find-lender-match',
          label: 'Find Lender Match',
          icon: '🎯',
          color: 'purple',
          action: () => debugLog('general', 'log_statement', 'Open smart matching'),
          permissions: { feature: 'smartMatch', minimumLevel: PermissionLevel.INTERACT },
          userTypes: [UserType.BROKERAGE],
          isPrimary: true,
        },
        {
          id: 'client-acquisition',
          label: 'Add New Client',
          icon: '👥',
          color: 'green',
          action: () => debugLog('general', 'log_statement', 'Add client'),
          permissions: { feature: 'transactions', minimumLevel: PermissionLevel.MODIFY },
          userTypes: [UserType.BROKERAGE],
          isPrimary: false,
        },
      ],
      navigation: {
        showSidebar: true,
        showTopActions: true,
      },
      userTypes: [UserType.BROKERAGE],
    },

    // BUSINESS (BORROWER) DASHBOARDS
    {
      id: 'business-application-tracking',
      title: 'Application Tracking Dashboard',
      subtitle: 'Monitor your financing applications and requirements',
      layout: 'compact',
      theme: {
        primaryColor: '#059669',
        accentColor: '#3B82F6',
        backgroundColor: '#F0FDF4',
      },
      widgets: [
        {
          id: 'application-progress',
          type: 'progress-tracker',
          title: 'Application Progress',
          component: () => null,
          width: 'full',
          height: 'medium',
          priority: 1,
          permissions: { feature: 'transactions', minimumLevel: PermissionLevel.VIEW },
          userTypes: [UserType.BUSINESS],
        },
        {
          id: 'document-checklist',
          type: 'document-status',
          title: 'Document Checklist',
          component: () => null,
          width: 'half',
          height: 'medium',
          priority: 2,
          permissions: { feature: 'documents', minimumLevel: PermissionLevel.VIEW },
          userTypes: [UserType.BUSINESS],
        },
        {
          id: 'financing-options',
          type: 'financing-widget',
          title: 'Available Financing Options',
          component: () => null,
          width: 'half',
          height: 'medium',
          priority: 3,
          permissions: { feature: 'smartMatch', minimumLevel: PermissionLevel.VIEW },
          userTypes: [UserType.BUSINESS],
        },
      ],
      actions: [
        {
          id: 'start-application',
          label: 'Start New Application',
          icon: '📝',
          color: 'green',
          action: () => debugLog('general', 'log_statement', 'Start application'),
          permissions: { feature: 'transactions', minimumLevel: PermissionLevel.INTERACT },
          userTypes: [UserType.BUSINESS],
          isPrimary: true,
        },
        {
          id: 'upload-documents',
          label: 'Upload Documents',
          icon: '📁',
          color: 'blue',
          action: () => debugLog('general', 'log_statement', 'Upload documents'),
          permissions: { feature: 'documents', minimumLevel: PermissionLevel.MODIFY },
          userTypes: [UserType.BUSINESS],
          isPrimary: false,
        },
      ],
      navigation: {
        showSidebar: false,
        showTopActions: true,
      },
      userTypes: [UserType.BUSINESS],
    },

    // VENDOR DASHBOARDS
    {
      id: 'vendor-inventory-management',
      title: 'Vendor Inventory Dashboard',
      subtitle: 'Manage inventory and financing partnerships',
      layout: 'standard',
      theme: {
        primaryColor: '#DC2626',
        accentColor: '#7C2D12',
        backgroundColor: '#FEF2F2',
      },
      widgets: [
        {
          id: 'inventory-overview',
          type: 'inventory-grid',
          title: 'Inventory Overview',
          component: () => null,
          width: 'full',
          height: 'large',
          priority: 1,
          permissions: { feature: 'dashboard', minimumLevel: PermissionLevel.VIEW },
          userTypes: [UserType.VENDOR],
        },
        {
          id: 'financing-partnerships',
          type: 'partnership-widget',
          title: 'Financing Partnerships',
          component: () => null,
          width: 'half',
          height: 'medium',
          priority: 2,
          permissions: { feature: 'smartMatch', minimumLevel: PermissionLevel.VIEW },
          userTypes: [UserType.VENDOR],
        },
        {
          id: 'pending-approvals',
          type: 'approvals-list',
          title: 'Pending Approvals',
          component: () => null,
          width: 'half',
          height: 'medium',
          priority: 3,
          permissions: { feature: 'transactions', minimumLevel: PermissionLevel.VIEW },
          userTypes: [UserType.VENDOR],
        },
      ],
      actions: [
        {
          id: 'add-inventory',
          label: 'Add Inventory Item',
          icon: '📦',
          color: 'red',
          action: () => debugLog('general', 'log_statement', 'Add inventory'),
          permissions: { feature: 'dashboard', minimumLevel: PermissionLevel.MODIFY },
          userTypes: [UserType.VENDOR],
          isPrimary: true,
        },
        {
          id: 'partner-lenders',
          label: 'Find Partner Lenders',
          icon: '🤝',
          color: 'blue',
          action: () => debugLog('general', 'log_statement', 'Find partners'),
          permissions: { feature: 'smartMatch', minimumLevel: PermissionLevel.INTERACT },
          userTypes: [UserType.VENDOR],
          isPrimary: false,
        },
      ],
      navigation: {
        showSidebar: true,
        showTopActions: true,
      },
      userTypes: [UserType.VENDOR],
    },

    // ADMIN DASHBOARDS
    {
      id: 'admin-system-management',
      title: 'System Administration Dashboard',
      subtitle: 'Platform management and system oversight',
      layout: 'detailed',
      theme: {
        primaryColor: '#1F2937',
        accentColor: '#EF4444',
        backgroundColor: '#F9FAFB',
      },
      widgets: [
        {
          id: 'system-health',
          type: 'system-status',
          title: 'System Health',
          component: () => null,
          width: 'full',
          height: 'medium',
          priority: 1,
          permissions: { feature: 'admin', minimumLevel: PermissionLevel.VIEW },
          userTypes: [UserType.ADMIN, UserType.DEVELOPER],
        },
        {
          id: 'user-management',
          type: 'user-admin',
          title: 'User Management',
          component: () => null,
          width: 'half',
          height: 'large',
          priority: 2,
          permissions: { feature: 'admin', minimumLevel: PermissionLevel.MODIFY },
          userTypes: [UserType.ADMIN],
        },
        {
          id: 'platform-analytics',
          type: 'platform-metrics',
          title: 'Platform Analytics',
          component: () => null,
          width: 'half',
          height: 'large',
          priority: 3,
          permissions: { feature: 'analytics', minimumLevel: PermissionLevel.VIEW },
          userTypes: [UserType.ADMIN, UserType.DEVELOPER],
        },
      ],
      actions: [
        {
          id: 'manage-users',
          label: 'Manage Users',
          icon: '👥',
          color: 'gray',
          action: () => debugLog('general', 'log_statement', 'User management'),
          permissions: { feature: 'admin', minimumLevel: PermissionLevel.MODIFY },
          userTypes: [UserType.ADMIN],
          isPrimary: true,
        },
        {
          id: 'system-config',
          label: 'System Configuration',
          icon: '⚙️',
          color: 'red',
          action: () => debugLog('general', 'log_statement', 'System config'),
          permissions: { feature: 'admin', minimumLevel: PermissionLevel.ADMIN },
          userTypes: [UserType.ADMIN],
          isPrimary: false,
        },
      ],
      navigation: {
        showSidebar: true,
        showTopActions: true,
      },
      userTypes: [UserType.ADMIN, UserType.DEVELOPER],
    },
  ], []);

  // Helper functions
  const hasWidgetPermission = (widget: DashboardWidget): boolean => {
    const hasUserType = widget.userTypes.includes(userType);
    const hasSpecificRole = !widget.specificRoles || 
      (specificRole && widget.specificRoles.includes(specificRole));
    const hasFeaturePermission = hasPermission(
      widget.permissions.feature, 
      widget.permissions.minimumLevel
    );

    return hasUserType && hasSpecificRole && hasFeaturePermission;
  };

  const hasActionPermission = (action: DashboardAction): boolean => {
    const hasUserType = action.userTypes.includes(userType);
    const hasSpecificRole = !action.specificRoles || 
      (specificRole && action.specificRoles.includes(specificRole));
    const hasFeaturePermission = hasPermission(
      action.permissions.feature, 
      action.permissions.minimumLevel
    );

    return hasUserType && hasSpecificRole && hasFeaturePermission;
  };

  const getDashboardForUserType = (userType: UserType, specificRole?: string): DashboardConfig | null => {
    return dashboardConfigs.find(config => {
      const hasUserType = config.userTypes.includes(userType);
      const hasSpecificRole = !config.specificRoles || 
        (specificRole && config.specificRoles.includes(specificRole));
      
      return hasUserType && hasSpecificRole;
    }) || null;
  };

  const getVisibleWidgets = (): DashboardWidget[] => {
    if (!currentDashboard) return [];
    
    return currentDashboard.widgets
      .filter(hasWidgetPermission)
      .sort((a, b) => a.priority - b.priority);
  };

  const getAvailableActions = (): DashboardAction[] => {
    if (!currentDashboard) return [];
    
    return currentDashboard.actions.filter(hasActionPermission);
  };

  const switchDashboard = (dashboardId: string): void => {
    const dashboard = dashboardConfigs.find(config => config.id === dashboardId);
    if (dashboard) {
      setCurrentDashboard(dashboard);
      localStorage.setItem('currentDashboardId', dashboardId);
    }
  };

  const refreshDashboard = (): void => {
    // Trigger dashboard refresh logic
    const dashboard = getDashboardForUserType(userType, specificRole);
    setCurrentDashboard(dashboard);
  };

  // Initialize and update dashboard based on user type changes
  useEffect(() => {
    setLoading(true);
    
    // Get available dashboards for current user
    const available = dashboardConfigs.filter(config => 
      config.userTypes.includes(userType) &&
      (!config.specificRoles || !specificRole || config.specificRoles.includes(specificRole))
    );
    
    setAvailableDashboards(available);

    // Set current dashboard
    const savedDashboardId = localStorage.getItem('currentDashboardId');
    let dashboard = null;

    if (savedDashboardId) {
      dashboard = available.find(config => config.id === savedDashboardId);
    }

    if (!dashboard && available.length > 0) {
      dashboard = available[0];
    }

    setCurrentDashboard(dashboard);
    setLoading(false);
  }, [userType, specificRole, dashboardConfigs]);

  const value = {
    currentDashboard,
    availableDashboards,
    switchDashboard,
    getVisibleWidgets,
    getAvailableActions,
    hasWidgetPermission,
    hasActionPermission,
    getDashboardForUserType,
    refreshDashboard,
    loading,
  };

  return (
    <RoleDashboardContext.Provider value={value}>
      {children}
    </RoleDashboardContext.Provider>
  );
};

export const useRoleDashboard = () => {
  const context = useContext(RoleDashboardContext);
  if (!context) {
    throw new Error('useRoleDashboard must be used within a RoleDashboardProvider');
  }
  return context;
};

export default RoleDashboardContext; 