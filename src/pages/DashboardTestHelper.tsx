import React from 'react';
import { useUserPermissions } from '../hooks/useUserPermissions';

const DashboardTestHelper: React.FC = () => {
  const { currentRole, getRoleDisplayName, getBaseUserType } = useUserPermissions();
  const baseUserType = getBaseUserType(currentRole);

  const getExpectedContent = () => {
    switch (currentRole) {
      // Borrower roles
      case 'borrower-owner':
      case 'borrower-cfo':
        return {
          metrics: [
            'Total Loan Amount ($2.5M)',
            'Active Applications (3)',
            'Approval Rate (85%)',
            'Avg Processing Time (12 days)',
          ],
          transactions: ['Equipment Loan - Manufacturing Line', 'Working Capital Expansion'],
          quickActions: ['New Application', 'Upload Documents'],
        };
      case 'borrower-controller':
      case 'borrower-accounting':
        return {
          metrics: ['Pending Documents (5)', 'Active Applications (3)'],
          transactions: ['Equipment Loan - Manufacturing Line', 'Working Capital Expansion'],
          quickActions: ['New Application', 'Upload Documents'],
        };
      case 'borrower-operations':
      case 'borrower-admin':
        return {
          metrics: ['My Tasks (8)'],
          transactions: [],
          quickActions: ['New Application', 'Upload Documents'],
        };

      // Lender roles
      case 'lender-cco':
      case 'lender-senior-underwriter':
        return {
          metrics: [
            'Portfolio Value ($125M)',
            'Applications in Review (24)',
            'Default Rate (1.2%)',
            'Avg Loan Size ($850K)',
          ],
          transactions: [
            'ABC Manufacturing - Equipment',
            'XYZ Logistics - Fleet Expansion',
            'Tech Startup - Growth Capital',
          ],
          quickActions: ['Risk Assessment', 'Portfolio'],
        };
      case 'lender-underwriter':
        return {
          metrics: ['My Reviews (12)', 'Pending Analysis (8)', 'Completed Today (5)'],
          transactions: [
            'ABC Manufacturing - Equipment',
            'XYZ Logistics - Fleet Expansion',
            'Tech Startup - Growth Capital',
          ],
          quickActions: ['Risk Assessment', 'Portfolio'],
        };
      case 'lender-processor':
      case 'lender-csr':
      case 'lender-admin':
        return {
          metrics: ['Assigned Tasks (15)'],
          transactions: [],
          quickActions: ['Risk Assessment', 'Portfolio'],
        };

      // Broker roles
      case 'broker-principal':
      case 'broker-managing':
        return {
          metrics: [
            'Commission YTD ($425K)',
            'Active Deals (18)',
            'Success Rate (72%)',
            'Lender Network (45)',
          ],
          transactions: ['Restaurant Chain - Multi-Location', 'Medical Practice - Equipment'],
          quickActions: ['Smart Match', 'Customers'],
        };
      case 'broker-senior-officer':
      case 'broker-officer':
      case 'broker-processor':
      case 'broker-admin':
        return {
          metrics: ['My Deals (6)', 'In Progress (4)'],
          transactions: ['Restaurant Chain - Multi-Location', 'Medical Practice - Equipment'],
          quickActions: ['Smart Match', 'Customers'],
        };

      // Vendor roles
      case 'vendor-owner':
      case 'vendor-sales-director':
        return {
          metrics: [
            'Sales Volume ($3.2M)',
            'Active Listings (42)',
            'Conversion Rate (28%)',
            'Avg Deal Size ($125K)',
          ],
          transactions: ['Industrial Printer Package', 'Fleet Vehicle Deal - 10 Units'],
          quickActions: ['List Asset', 'Marketplace'],
        };
      case 'vendor-sales-manager':
      case 'vendor-senior-sales':
      case 'vendor-junior-sales':
      case 'vendor-support':
        return {
          metrics: ['My Listings (8)', 'Inquiries (12)'],
          transactions: ['Industrial Printer Package', 'Fleet Vehicle Deal - 10 Units'],
          quickActions: ['List Asset', 'Marketplace'],
        };

      // System/Admin roles
      case 'system-admin':
      case 'eva-admin':
      case 'compliance-officer':
      case 'support-rep':
        return {
          metrics: [
            'Total Users (1,234)',
            'System Health (99.9%)',
            'Active Sessions (342)',
            'Pending Issues (3)',
          ],
          transactions: [],
          quickActions: [],
        };

      default:
        return {
          metrics: ['Unknown role'],
          transactions: [],
          quickActions: [],
        };
    }
  };

  const expectedContent = getExpectedContent();

  return (
    <div className="fixed bottom-20 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md z-50 border-2 border-blue-500">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Dashboard Test Helper</h3>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700">Current Role:</p>
        <p className="text-sm text-blue-600">{getRoleDisplayName(currentRole)}</p>
        <p className="text-xs text-gray-500">Base Type: {baseUserType}</p>
      </div>

      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700">Expected Metrics:</p>
        <ul className="text-xs text-gray-600 list-disc list-inside">
          {expectedContent.metrics.map((metric, index) => (
            <li key={index}>{metric}</li>
          ))}
        </ul>
      </div>

      {expectedContent.transactions.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700">Expected Transactions:</p>
          <ul className="text-xs text-gray-600 list-disc list-inside">
            {expectedContent.transactions.map((transaction, index) => (
              <li key={index}>{transaction}</li>
            ))}
          </ul>
        </div>
      )}

      {expectedContent.quickActions.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700">Expected Quick Actions:</p>
          <ul className="text-xs text-gray-600 list-disc list-inside">
            {expectedContent.quickActions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Switch user types using the selector in the top navigation to see different dashboards.
        </p>
      </div>
    </div>
  );
};

export default DashboardTestHelper;
