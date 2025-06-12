import React from 'react';

interface VendorDashboardProps {
  metrics: any;
  alerts: any[];
  quickActions: any[];
  selectedCustomer?: any;
  activeCustomer?: any;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({
  metrics,
  alerts,
  quickActions,
  selectedCustomer,
  activeCustomer,
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Vendor Services Dashboard</h3>
        <p className="text-gray-600">
          This specialized dashboard for vendor services is under development. It will include asset
          valuation tools, inspection report management, vendor network coordination, and service
          request tracking.
        </p>
      </div>
    </div>
  );
};

export default VendorDashboard;
