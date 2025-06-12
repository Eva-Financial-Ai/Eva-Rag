import React from 'react';
import { useUserPermissions, UserRole } from '../../hooks/useUserPermissions';

export interface CustomerData {
  id: string;
  name: string;
  type: 'business' | 'individual' | 'vendor' | 'broker';
  status: 'active' | 'prospect' | 'inactive' | 'at-risk';

  // Financial data
  creditScore?: number;
  annualRevenue?: number;
  loanBalance?: number;
  paymentHistory?: 'excellent' | 'good' | 'fair' | 'poor';

  // Risk data
  riskScore?: 'low' | 'medium' | 'high';
  defaultProbability?: number;

  // Relationship data
  relationshipLength?: number; // in months
  totalTransactions?: number;
  totalVolume?: number;
  lastContactDate?: string;

  // Vendor specific
  assetType?: string;
  inventoryValue?: number;
  avgDealSize?: number;

  // Broker specific
  dealsSubmitted?: number;
  approvalRate?: number;
  avgCommission?: number;

  // Contact info
  primaryContact?: string;
  email?: string;
  phone?: string;
  address?: string;

  // User classification for filtering
  category?:
    | 'borrower'
    | 'vendor'
    | 'broker'
    | 'lender'
    | 'service_provider'
    | 'broker_lender_hybrid';
}

interface RoleBasedCustomerViewProps {
  customer: CustomerData;
  onAction?: (action: string, customerId: string) => void;
}

export const RoleBasedCustomerView: React.FC<RoleBasedCustomerViewProps> = ({
  customer,
  onAction,
}) => {
  const { currentRole, hasPermission, getBaseUserType, tierLevel, monetaryLimits } =
    useUserPermissions();
  const baseType = getBaseUserType(currentRole);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Render borrower view
  const renderBorrowerView = () => {
    const canViewFinancials = tierLevel <= 3; // Owner, CFO, Controller
    const canViewFullDetails = tierLevel <= 2; // Owner, CFO

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
            <p className="text-sm text-gray-500">Customer ID: {customer.id}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              customer.status === 'active'
                ? 'bg-green-100 text-green-800'
                : customer.status === 'at-risk'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
            }`}
          >
            {customer.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Basic Information - All borrower roles can see */}
          <div>
            <p className="text-sm text-gray-500">Relationship Length</p>
            <p className="font-medium">{customer.relationshipLength} months</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Primary Contact</p>
            <p className="font-medium">{customer.primaryContact || 'N/A'}</p>
          </div>

          {/* Financial Information - Restricted by tier */}
          {canViewFinancials && customer.loanBalance !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Current Loan Balance</p>
              <p className="font-medium">{formatCurrency(customer.loanBalance)}</p>
            </div>
          )}

          {canViewFullDetails && customer.creditScore !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Credit Score</p>
              <p className="font-medium">{customer.creditScore}</p>
            </div>
          )}

          {canViewFullDetails && customer.annualRevenue !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Annual Revenue</p>
              <p className="font-medium">{formatCurrency(customer.annualRevenue)}</p>
            </div>
          )}
        </div>

        {/* Actions based on permissions */}
        <div className="mt-6 flex gap-2">
          {hasPermission('loan_application', 'create') && (
            <button
              onClick={() => onAction?.('create_application', customer.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              New Application
            </button>
          )}

          {tierLevel <= 5 && ( // Not admin assistant
            <button
              onClick={() => onAction?.('view_details', customer.id)}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render vendor view
  const renderVendorView = () => {
    const canViewSalesData = tierLevel <= 4; // Not junior sales or support
    const canViewFinancials = tierLevel <= 3; // Owner, Sales Director, Sales Manager
    const canEditListings = tierLevel <= 4 && hasPermission('asset_listing', 'update');

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
            <p className="text-sm text-gray-500">
              {customer.assetType || 'General Vendor'} • ID: {customer.id}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              customer.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {customer.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Basic Information */}
          <div>
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="font-medium">{customer.totalTransactions || 0}</p>
          </div>

          {canViewSalesData && (
            <>
              <div>
                <p className="text-sm text-gray-500">Average Deal Size</p>
                <p className="font-medium">
                  {customer.avgDealSize ? formatCurrency(customer.avgDealSize) : 'N/A'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Volume</p>
                <p className="font-medium">
                  {customer.totalVolume ? formatCurrency(customer.totalVolume) : 'N/A'}
                </p>
              </div>
            </>
          )}

          {canViewFinancials && customer.inventoryValue !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Inventory Value</p>
              <p className="font-medium">{formatCurrency(customer.inventoryValue)}</p>
            </div>
          )}
        </div>

        {/* Vendor-specific metrics */}
        {canViewSalesData && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm font-medium text-gray-700 mb-2">Performance Metrics</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Conversion Rate</p>
                <p className="font-medium">24%</p>
              </div>
              <div>
                <p className="text-gray-500">Avg Response Time</p>
                <p className="font-medium">2.5 hrs</p>
              </div>
              <div>
                <p className="text-gray-500">Customer Rating</p>
                <p className="font-medium">4.8/5</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-2">
          {canEditListings && (
            <button
              onClick={() => onAction?.('manage_listings', customer.id)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Manage Listings
            </button>
          )}

          <button
            onClick={() => onAction?.('view_transactions', customer.id)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            View Transactions
          </button>
        </div>
      </div>
    );
  };

  // Render lender view
  const renderLenderView = () => {
    const canApproveLoans = tierLevel <= 3 && hasPermission('loan_application', 'execute');
    const canViewRiskData = tierLevel <= 4; // Not CSR or Admin
    const canViewFullFinancials = tierLevel <= 2; // CCO, Senior Underwriter

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
            <p className="text-sm text-gray-500">
              {customer.type === 'business' ? 'Business' : 'Individual'} • ID: {customer.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {customer.riskScore && canViewRiskData && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  customer.riskScore === 'low'
                    ? 'bg-green-100 text-green-800'
                    : customer.riskScore === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {customer.riskScore} risk
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                customer.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : customer.status === 'at-risk'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {customer.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Basic loan information */}
          <div>
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className="font-medium">
              {customer.loanBalance ? formatCurrency(customer.loanBalance) : 'No active loans'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Payment History</p>
            <p
              className={`font-medium ${
                customer.paymentHistory === 'excellent'
                  ? 'text-green-600'
                  : customer.paymentHistory === 'good'
                    ? 'text-blue-600'
                    : customer.paymentHistory === 'fair'
                      ? 'text-yellow-600'
                      : 'text-red-600'
              }`}
            >
              {customer.paymentHistory || 'N/A'}
            </p>
          </div>

          {/* Risk metrics - restricted by tier */}
          {canViewRiskData && (
            <>
              <div>
                <p className="text-sm text-gray-500">Credit Score</p>
                <p className="font-medium">{customer.creditScore || 'N/A'}</p>
              </div>

              {customer.defaultProbability !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Default Probability</p>
                  <p className="font-medium">{formatPercentage(customer.defaultProbability)}</p>
                </div>
              )}
            </>
          )}

          {/* Full financials - restricted to senior roles */}
          {canViewFullFinancials && customer.annualRevenue !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Annual Revenue</p>
              <p className="font-medium">{formatCurrency(customer.annualRevenue)}</p>
            </div>
          )}
        </div>

        {/* Underwriting summary for qualified roles */}
        {canViewRiskData && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-900 mb-2">Underwriting Summary</p>
            <div className="text-sm text-blue-800">
              <p>• Debt-to-Income Ratio: 42%</p>
              <p>• Collateral Coverage: 125%</p>
              <p>• Industry Risk: Moderate</p>
            </div>
          </div>
        )}

        {/* Actions based on role */}
        <div className="mt-6 flex gap-2">
          {canApproveLoans && customer.loanBalance && (
            <button
              onClick={() => onAction?.('review_application', customer.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Review Application
            </button>
          )}

          {canViewRiskData && (
            <button
              onClick={() => onAction?.('risk_assessment', customer.id)}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
            >
              Risk Assessment
            </button>
          )}

          <button
            onClick={() => onAction?.('view_history', customer.id)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            View History
          </button>
        </div>
      </div>
    );
  };

  // Render broker view
  const renderBrokerView = () => {
    const canSubmitApplications = hasPermission('loan_application', 'create');
    const canViewCommissions = tierLevel <= 3; // Principal, Managing, Senior Officer
    const canManageRelationships = tierLevel <= 4; // Not processor or admin

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
            <p className="text-sm text-gray-500">Client ID: {customer.id}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              customer.status === 'active'
                ? 'bg-green-100 text-green-800'
                : customer.status === 'prospect'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
            }`}
          >
            {customer.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Basic client information */}
          <div>
            <p className="text-sm text-gray-500">Deals Submitted</p>
            <p className="font-medium">{customer.dealsSubmitted || 0}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Approval Rate</p>
            <p className="font-medium">
              {customer.approvalRate ? formatPercentage(customer.approvalRate) : 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Last Contact</p>
            <p className="font-medium">
              {customer.lastContactDate
                ? new Date(customer.lastContactDate).toLocaleDateString()
                : 'Never'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Volume</p>
            <p className="font-medium">
              {customer.totalVolume ? formatCurrency(customer.totalVolume) : '$0'}
            </p>
          </div>

          {/* Commission data - restricted by tier */}
          {canViewCommissions && customer.avgCommission !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Avg Commission</p>
              <p className="font-medium">{formatCurrency(customer.avgCommission)}</p>
            </div>
          )}
        </div>

        {/* Broker-specific insights */}
        {canManageRelationships && (
          <div className="mt-4 p-3 bg-amber-50 rounded">
            <p className="text-sm font-medium text-amber-900 mb-2">Client Insights</p>
            <div className="text-sm text-amber-800">
              <p>• Preferred loan types: Equipment, Working Capital</p>
              <p>• Average loan size: $250,000</p>
              <p>• Decision timeline: 2-3 weeks</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-2">
          {canSubmitApplications && (
            <button
              onClick={() => onAction?.('create_application', customer.id)}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Submit Application
            </button>
          )}

          {canManageRelationships && (
            <button
              onClick={() => onAction?.('schedule_meeting', customer.id)}
              className="px-4 py-2 border border-amber-600 text-amber-600 rounded hover:bg-amber-50"
            >
              Schedule Meeting
            </button>
          )}

          <button
            onClick={() => onAction?.('view_deals', customer.id)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            View Deals
          </button>
        </div>
      </div>
    );
  };

  // Render admin view
  const renderAdminView = () => {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
            <p className="text-sm text-gray-500">
              {customer.type} • ID: {customer.id}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              customer.status === 'active'
                ? 'bg-green-100 text-green-800'
                : customer.status === 'at-risk'
                  ? 'bg-red-100 text-red-800'
                  : customer.status === 'inactive'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-blue-100 text-blue-800'
            }`}
          >
            {customer.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Comprehensive view for admins */}
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium capitalize">{customer.type}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Credit Score</p>
            <p className="font-medium">{customer.creditScore || 'N/A'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Annual Revenue</p>
            <p className="font-medium">
              {customer.annualRevenue ? formatCurrency(customer.annualRevenue) : 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Total Volume</p>
            <p className="font-medium">
              {customer.totalVolume ? formatCurrency(customer.totalVolume) : 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Risk Score</p>
            <p
              className={`font-medium ${
                customer.riskScore === 'low'
                  ? 'text-green-600'
                  : customer.riskScore === 'medium'
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }`}
            >
              {customer.riskScore || 'N/A'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Relationship Length</p>
            <p className="font-medium">{customer.relationshipLength || 0} months</p>
          </div>
        </div>

        {/* System information */}
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium text-gray-700 mb-2">System Information</p>
          <div className="text-sm text-gray-600">
            <p>• Created: {new Date().toLocaleDateString()}</p>
            <p>• Last Modified: {new Date().toLocaleDateString()}</p>
            <p>• Data Quality Score: 95%</p>
            <p>• Compliance Status: Verified</p>
          </div>
        </div>

        {/* Admin actions */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => onAction?.('audit_trail', customer.id)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            View Audit Trail
          </button>

          <button
            onClick={() => onAction?.('manage_permissions', customer.id)}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded hover:bg-purple-50"
          >
            Manage Access
          </button>

          <button
            onClick={() => onAction?.('export_data', customer.id)}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Export Data
          </button>
        </div>
      </div>
    );
  };

  // Render based on user type
  switch (baseType) {
    case 'borrower':
      return renderBorrowerView();
    case 'vendor':
      return renderVendorView();
    case 'lender':
      return renderLenderView();
    case 'broker':
      return renderBrokerView();
    case 'admin':
      return renderAdminView();
    default:
      return <div>Invalid user type</div>;
  }
};
