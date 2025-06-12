import React from 'react';

const CRPDashboardTest: React.FC = () => {
  return (
    <div className="bg-white p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">🤝 CRP Dashboard Test</h1>
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-6">
          <h2 className="mb-2 text-xl font-semibold text-green-800">✅ Success!</h2>
          <p className="text-green-700">
            This is a standalone CRP Dashboard test component. If you can see this, the CRP
            Dashboard components are working properly.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 font-semibold text-blue-800">Customer Management</h3>
            <p className="text-sm text-blue-600">247 active customers</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="mb-2 font-semibold text-green-800">Retention Rate</h3>
            <p className="text-sm text-green-600">94% retention</p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h3 className="mb-2 font-semibold text-purple-800">Scheduled Activities</h3>
            <p className="text-sm text-purple-600">42 calls pending</p>
          </div>
        </div>

        <div className="bg-gray-50 mt-8 rounded-lg border border-gray-200 p-4">
          <h3 className="mb-2 font-semibold text-gray-800">Debug Information</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Component: CRPDashboardTest</li>
            <li>• Status: Rendered successfully</li>
            <li>• Time: {new Date().toISOString()}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CRPDashboardTest;
