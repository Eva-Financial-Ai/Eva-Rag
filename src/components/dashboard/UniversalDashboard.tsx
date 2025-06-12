import React from 'react';
import { useRoleDashboard } from '../../contexts/RoleDashboardContext';
import { useUserType } from '../../contexts/UserTypeContext';
import { PermissionGuard } from '../PermissionGuard';
import { PermissionLevel } from '../../types/UserTypes';

// Widget Components (these would be imported from actual component files)
import { MetricCard } from './MetricCard';
import { DealsTable } from './DealsTable';
import { DueDiligenceProgress } from './DueDiligenceProgress';
import { RecentActivities } from './RecentActivities';

// Widget component mapping
const WIDGET_COMPONENTS = {
  'metric-card': MetricCard,
  'deals-table': DealsTable,
  'risk-dashboard': () => <div className="p-4 bg-red-50 rounded-lg">Risk Dashboard Widget</div>,
  'pipeline-chart': () => <div className="p-4 bg-purple-50 rounded-lg">Pipeline Chart Widget</div>,
  'commission-chart': () => <div className="p-4 bg-yellow-50 rounded-lg">Commission Chart Widget</div>,
  'smart-match-widget': () => <div className="p-4 bg-blue-50 rounded-lg">Smart Match Widget</div>,
  'progress-tracker': () => <div className="p-4 bg-green-50 rounded-lg">Progress Tracker Widget</div>,
  'document-status': () => <div className="p-4 bg-gray-50 rounded-lg">Document Status Widget</div>,
  'financing-widget': () => <div className="p-4 bg-indigo-50 rounded-lg">Financing Options Widget</div>,
  'inventory-grid': () => <div className="p-4 bg-red-50 rounded-lg">Inventory Grid Widget</div>,
  'partnership-widget': () => <div className="p-4 bg-orange-50 rounded-lg">Partnership Widget</div>,
  'approvals-list': () => <div className="p-4 bg-pink-50 rounded-lg">Approvals List Widget</div>,
  'system-status': () => <div className="p-4 bg-gray-50 rounded-lg">System Status Widget</div>,
  'user-admin': () => <div className="p-4 bg-slate-50 rounded-lg">User Admin Widget</div>,
  'platform-metrics': () => <div className="p-4 bg-cyan-50 rounded-lg">Platform Metrics Widget</div>,
};

// Dashboard loading skeleton
const DashboardSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 bg-gray-200 rounded"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="h-64 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

// Dashboard header with user type context
const DashboardHeader: React.FC = () => {
  const { currentDashboard, availableDashboards, switchDashboard } = useRoleDashboard();
  const { getUserTypeDisplayName, getSpecificRoleDisplayName } = useUserType();

  if (!currentDashboard) return null;

  return (
    <div className="bg-white shadow-sm mb-6">
      <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold text-gray-900"
              style={{ color: currentDashboard.theme.primaryColor }}
            >
              {currentDashboard.title}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{currentDashboard.subtitle}</p>
            <div className="mt-2 flex items-center space-x-2 text-xs">
              <span className="text-gray-400">Role:</span>
              <span className="font-medium text-gray-600">{getUserTypeDisplayName()}</span>
              {getSpecificRoleDisplayName() && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="font-medium text-gray-600">{getSpecificRoleDisplayName()}</span>
                </>
              )}
            </div>
          </div>

          {/* Dashboard Switcher */}
          {availableDashboards.length > 1 && (
            <div className="relative">
              <select
                value={currentDashboard.id}
                onChange={(e) => switchDashboard(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {availableDashboards.map((dashboard) => (
                  <option key={dashboard.id} value={dashboard.id}>
                    {dashboard.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Widget grid layout component
const WidgetGrid: React.FC = () => {
  const { getVisibleWidgets, currentDashboard } = useRoleDashboard();
  const widgets = getVisibleWidgets();

  if (!currentDashboard) return null;

  const getGridClasses = (width: string) => {
    switch (width) {
      case 'full': return 'col-span-1 md:col-span-4';
      case 'half': return 'col-span-1 md:col-span-2';
      case 'third': return 'col-span-1 md:col-span-1';
      case 'quarter': return 'col-span-1';
      default: return 'col-span-1';
    }
  };

  const getHeightClasses = (height: string) => {
    switch (height) {
      case 'small': return 'h-24';
      case 'medium': return 'h-64';
      case 'large': return 'h-96';
      default: return 'h-64';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {widgets.map((widget) => {
        const WidgetComponent = WIDGET_COMPONENTS[widget.type] || 
          (() => <div className="p-4 bg-gray-50 rounded-lg">Unknown Widget: {widget.type}</div>);

        return (
          <PermissionGuard
            key={widget.id}
            feature={widget.permissions.feature}
            minimumPermission={widget.permissions.minimumLevel}
          >
            <div 
              className={`${getGridClasses(widget.width)} ${getHeightClasses(widget.height)} bg-white rounded-lg shadow border`}
              style={{ 
                borderColor: currentDashboard.theme.accentColor + '20',
                backgroundColor: currentDashboard.theme.backgroundColor + '50' 
              }}
            >
              <div className="p-4 h-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{widget.title}</h3>
                <div className="h-full">
                  <WidgetComponent data={widget.data} />
                </div>
              </div>
            </div>
          </PermissionGuard>
        );
      })}
    </div>
  );
};

// Action buttons component
const DashboardActions: React.FC = () => {
  const { getAvailableActions, currentDashboard } = useRoleDashboard();
  const actions = getAvailableActions();

  if (!currentDashboard || actions.length === 0) return null;

  const primaryActions = actions.filter(action => action.isPrimary);
  const secondaryActions = actions.filter(action => !action.isPrimary);

  const getButtonClasses = (color: string, isPrimary: boolean) => {
    const baseClasses = "inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200";
    
    if (isPrimary) {
      switch (color) {
        case 'blue': return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white`;
        case 'green': return `${baseClasses} bg-green-600 hover:bg-green-700 text-white`;
        case 'purple': return `${baseClasses} bg-purple-600 hover:bg-purple-700 text-white`;
        case 'red': return `${baseClasses} bg-red-600 hover:bg-red-700 text-white`;
        case 'gray': return `${baseClasses} bg-gray-600 hover:bg-gray-700 text-white`;
        default: return `${baseClasses} bg-primary-600 hover:bg-primary-700 text-white`;
      }
    } else {
      switch (color) {
        case 'blue': return `${baseClasses} bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300`;
        case 'green': return `${baseClasses} bg-green-100 hover:bg-green-200 text-green-700 border border-green-300`;
        case 'purple': return `${baseClasses} bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-300`;
        case 'red': return `${baseClasses} bg-red-100 hover:bg-red-200 text-red-700 border border-red-300`;
        case 'gray': return `${baseClasses} bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300`;
        default: return `${baseClasses} bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300`;
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
      
      {primaryActions.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-3">
            {primaryActions.map((action) => (
              <PermissionGuard
                key={action.id}
                feature={action.permissions.feature}
                minimumPermission={action.permissions.minimumLevel}
              >
                <button
                  onClick={action.action}
                  className={getButtonClasses(action.color, true)}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </button>
              </PermissionGuard>
            ))}
          </div>
        </div>
      )}

      {secondaryActions.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-2">
            {secondaryActions.map((action) => (
              <PermissionGuard
                key={action.id}
                feature={action.permissions.feature}
                minimumPermission={action.permissions.minimumLevel}
              >
                <button
                  onClick={action.action}
                  className={getButtonClasses(action.color, false)}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </button>
              </PermissionGuard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Universal Dashboard component
const UniversalDashboard: React.FC = () => {
  const { currentDashboard, loading } = useRoleDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!currentDashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Dashboard Available</h2>
          <p className="text-gray-600">
            No dashboard configuration found for your current role. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-6"
      style={{ backgroundColor: currentDashboard.theme.backgroundColor }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <DashboardHeader />
        <WidgetGrid />
        <DashboardActions />
      </div>
    </div>
  );
};

export default UniversalDashboard; 