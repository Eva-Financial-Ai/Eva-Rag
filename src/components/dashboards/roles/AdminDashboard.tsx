import React from 'react';

interface AdminDashboardProps {
  metrics: any;
  alerts: any[];
  quickActions: any[];
  selectedCustomer?: any;
  activeCustomer?: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  metrics,
  alerts,
  quickActions,
  selectedCustomer,
  activeCustomer,
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900">System Administration Dashboard</h3>
        <p className="text-gray-600">
          This specialized dashboard for system administrators is under development. It will include
          user management, system monitoring, compliance oversight, and platform analytics tools.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
