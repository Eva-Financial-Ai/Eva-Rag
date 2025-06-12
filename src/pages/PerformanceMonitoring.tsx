import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import PerformanceMonitoringDashboard from '../components/common/PerformanceMonitoringDashboard';
import { useUserPermissions } from '../hooks/useUserPermissions';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const PerformanceMonitoring: React.FC = () => {
  const { hasPermission } = useUserPermissions();

  // Only system admins and EVA admins should see performance monitoring
  if (!hasPermission('system', 'admin')) {
    return (
      <PageLayout title="Performance Monitoring">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view performance monitoring.
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Performance Monitoring">
      <div className="w-full">
        <PerformanceMonitoringDashboard />
      </div>
    </PageLayout>
  );
};

export default PerformanceMonitoring;
