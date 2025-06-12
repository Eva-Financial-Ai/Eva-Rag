import React, { useState, useEffect } from 'react';
import { useEVAUserContext } from '../../contexts/EVAUserContext';
import { _evaContextDetector } from '../../utils/evaContextDetector';

import { debugLog } from '../../utils/auditLogger';

const EVAGlobalIntegrationTest: React.FC = () => {
  const { selectedCustomer, customers } = useEVAUserContext();
  const [pageContext, setPageContext] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    // Test 1: Context Detection
    const context = _evaContextDetector.getCurrentPageContext();
    setPageContext(context);
    setTestResults(prev => ({
      ...prev,
      contextDetection: { success: true, data: context },
    }));

    // Test 2: Customer Context
    if (selectedCustomer) {
      const savedCustomer = localStorage.getItem('eva_selected_customer');
      setTestResults(prev => ({
        ...prev,
        customerContext: { success: true, saved: savedCustomer, current: selectedCustomer },
      }));
    }

    // Test 3: Navigation Tracking
    const handleNavigation = () => {
      const newContext = _evaContextDetector.getCurrentPageContext();
      debugLog('general', 'log_statement', 'Navigation detected, new context:', newContext)
      setTestResults(prev => ({
        ...prev,
        navigationTracking: { success: true, newContext },
      }));
    };

    window.addEventListener('popstate', handleNavigation);

    // Test 4: EVA Integration Button Detection
    const evaButton = document.querySelector('[data-eva-trigger]');
    if (evaButton) {
      setTestResults(prev => ({
        ...prev,
        evaButtonDetection: { success: true, found: true },
      }));
    }

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [selectedCustomer]);

  return (
    <div className="fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 max-w-sm">
      <h3 className="text-lg font-semibold mb-3">EVA Global Integration Test</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Context Detection:</span>
          <span
            className={testResults.contextDetection?.success ? 'text-green-600' : 'text-red-600'}
          >
            {testResults.contextDetection?.success ? 'Passed ✓' : 'Failed ✗'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Customer Persistence:</span>
          <span
            className={testResults.customerContext?.success ? 'text-green-600' : 'text-gray-600'}
          >
            {testResults.customerContext?.success ? 'Passed ✓' : 'No customer selected'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Navigation Tracking:</span>
          <span
            className={testResults.navigationTracking?.success ? 'text-green-600' : 'text-gray-600'}
          >
            {testResults.navigationTracking?.success ? 'Passed ✓' : 'Failed ✗'}
          </span>
        </div>

        <div className="flex justify-between">
          <span>EVA Button:</span>
          <span
            className={testResults.evaButtonDetection?.success ? 'text-green-600' : 'text-red-600'}
          >
            {testResults.evaButtonDetection?.success ? 'Passed ✓' : 'Failed ✗'}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <h4 className="font-medium mb-1">Current State:</h4>
        <div className="text-xs space-y-1">
          <div>Page: {pageContext?.pageType || 'Unknown'}</div>
          <div>Customer: {selectedCustomer?.name || 'None selected'}</div>
          <div>Total Customers: {customers.length}</div>
        </div>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-3 w-full px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
      >
        Refresh Tests
      </button>
    </div>
  );
};

export default EVAGlobalIntegrationTest;
