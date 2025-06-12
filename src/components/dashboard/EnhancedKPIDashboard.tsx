import React, { useState, useEffect, useMemo } from 'react';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import KPIService from '../../services/kpiService';
import { BaseKPI, KPIDashboardConfig } from '../../types/kpi';
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface EnhancedKPIDashboardProps {
  roleType: 'borrower' | 'vendor' | 'broker' | 'lender';
  viewType?: 'system-admin' | 'user-admin' | 'auto';
  organizationId?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly';
  allowExport?: boolean;
  compactView?: boolean;
}

const EnhancedKPIDashboard: React.FC<EnhancedKPIDashboardProps> = ({
  roleType,
  viewType = 'auto',
  organizationId,
  timeframe = 'monthly',
  allowExport = true,
  compactView = false,
}) => {
  const { currentRole, hasPermission } = useUserPermissions();
  const [kpis, setKpis] = useState<BaseKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const kpiService = useMemo(() => KPIService.getInstance(), []);

  // Determine the actual view type based on user permissions and props
  const actualViewType = useMemo(() => {
    if (viewType !== 'auto') return viewType;

    // Auto-determine based on user role and permissions
    const isSystemAdmin =
      hasPermission('system', 'admin') ||
      currentRole?.includes('SYSTEM_ADMIN') ||
      currentRole?.includes('EVA_ADMIN');

    return isSystemAdmin ? 'system-admin' : 'user-admin';
  }, [viewType, hasPermission, currentRole]);

  // Load KPIs based on role type and view type
  useEffect(() => {
    const loadKPIs = async () => {
      setLoading(true);
      setError(null);

      try {
        const kpiData = await kpiService.getKPIs(roleType, actualViewType, organizationId);

        // Convert KPI data to BaseKPI array
        const kpiArray = Object.values(kpiData).filter(
          kpi => kpi && typeof kpi === 'object'
        ) as BaseKPI[];
        setKpis(kpiArray);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error loading KPIs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load KPIs');
      } finally {
        setLoading(false);
      }
    };

    loadKPIs();
  }, [roleType, actualViewType, organizationId, kpiService]);

  // Format KPI value based on format type
  const formatKPIValue = (kpi: BaseKPI): string => {
    if (typeof kpi.value === 'string') return kpi.value;

    switch (kpi.format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(kpi.value);
      case 'percentage':
        return `${kpi.value}%`;
      case 'number':
        return new Intl.NumberFormat('en-US').format(kpi.value);
      case 'days':
        return `${kpi.value} days`;
      default:
        return kpi.value.toString();
    }
  };

  // Get change indicator icon
  const getChangeIcon = (changeType?: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'decrease':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Get data source badge color
  const getDataSourceColor = (dataSource: string): string => {
    const colors = {
      stripe: 'bg-purple-100 text-purple-800',
      quickbooks: 'bg-blue-100 text-blue-800',
      plaid: 'bg-green-100 text-green-800',
      equifax: 'bg-red-100 text-red-800',
      transunion: 'bg-orange-100 text-orange-800',
      experian: 'bg-yellow-100 text-yellow-800',
      paynet: 'bg-indigo-100 text-indigo-800',
      google: 'bg-emerald-100 text-emerald-800',
      xero: 'bg-cyan-100 text-cyan-800',
      netsuite: 'bg-pink-100 text-pink-800',
    };
    return colors[dataSource] || 'bg-gray-100 text-gray-800';
  };

  // Export KPIs
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const blob = await kpiService.exportKPIs(kpis, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kpi-report-${roleType}-${actualViewType}-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
          <h3 className="text-lg font-medium text-red-800">Error Loading KPIs</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {actualViewType === 'system-admin' ? 'Platform-Wide' : 'Organization'} KPIs
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {roleType.charAt(0).toUpperCase() + roleType.slice(1)} performance metrics from
            integrated data sources
            {actualViewType === 'user-admin' &&
              organizationId &&
              ` for organization ${organizationId}`}
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <span className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>

          {allowExport && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExport('csv')}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                Export CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                Export JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Grid */}
      <div
        className={`grid gap-6 ${
          compactView
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        }`}
      >
        {kpis.map(kpi => (
          <div
            key={kpi.id}
            className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
              </div>
              {kpi.description && (
                <div className="group relative">
                  <InformationCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {kpi.description}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 truncate" title={kpi.label}>
                {kpi.label}
              </h3>
              <div className="mt-2 flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">{formatKPIValue(kpi)}</p>
                {kpi.change !== undefined && (
                  <div className="ml-2 flex items-center text-sm">
                    {getChangeIcon(kpi.changeType)}
                    <span
                      className={`ml-1 ${
                        kpi.changeType === 'increase'
                          ? 'text-green-600'
                          : kpi.changeType === 'decrease'
                            ? 'text-red-600'
                            : 'text-gray-600'
                      }`}
                    >
                      {Math.abs(kpi.change)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Data Source Badge */}
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDataSourceColor(kpi.dataSource)}`}
                >
                  {kpi.dataSource.charAt(0).toUpperCase() + kpi.dataSource.slice(1)}
                </span>
                {kpi.lastUpdated && (
                  <span className="text-xs text-gray-400">
                    {kpi.lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Type Indicator */}
      <div className="flex items-center justify-center pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <EyeIcon className="h-4 w-4 mr-1" />
          <span>
            Viewing {actualViewType === 'system-admin' ? 'platform-wide' : 'organization-specific'}{' '}
            metrics from integrated data sources
          </span>
          {actualViewType === 'system-admin' && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              System Admin View
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedKPIDashboard;
