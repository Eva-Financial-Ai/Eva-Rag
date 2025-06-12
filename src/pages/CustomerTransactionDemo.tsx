import React from 'react';
import CustomerTransactionSelector from '../components/common/CustomerTransactionSelector';

const CustomerTransactionDemo: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Customer & Transaction Selector Demo
        </h1>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Integrated Customer and Transaction Selector
            </h2>
            <p className="text-gray-600 mb-4">
              Select a customer to filter transactions. Only active transactions will be shown.
            </p>
            <CustomerTransactionSelector transactionSelectorPosition="relative" className="mb-4" />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Features:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Select "Johns Trucking" to see their specific transactions</li>
              <li>Dead and inactive transactions are automatically filtered out</li>
              <li>When no customer is selected, all active transactions are shown</li>
              <li>Customer selector shows different customer types (businesses, brokers, etc.)</li>
              <li>Transaction selector updates dynamically based on customer selection</li>
            </ul>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Customer Types:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-800">Businesses</div>
                <div className="text-sm text-gray-600">Regular business customers</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-800">Business Owners</div>
                <div className="text-sm text-gray-600">Individual business owners</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-800">Asset Sellers</div>
                <div className="text-sm text-gray-600">Selling business assets</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-800">Brokers & Originators</div>
                <div className="text-sm text-gray-600">Financial intermediaries</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="font-medium text-gray-800">Service Providers</div>
                <div className="text-sm text-gray-600">Business service providers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTransactionDemo;
