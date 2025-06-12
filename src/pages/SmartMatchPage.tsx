import React, { useContext } from 'react';
import SmartMatchEngine from '../components/deal/SmartMatchEngine';
import { UserContext } from '../contexts/UserContext';
import { useWorkflow } from '../contexts/WorkflowContext';

import { debugLog } from '../utils/auditLogger';

const SmartMatchPage: React.FC = () => {
  const { currentTransaction } = useWorkflow();
  const { userRole } = useContext(UserContext);

  // Handle match selection from the new SmartMatchEngine
  const handleMatchSelected = (matchResult: any) => {
    debugLog('general', 'log_statement', 'Selected match from SmartMatchEngine:', matchResult)
    // Handle the selected match - could navigate to deal structure editor
    // or update transaction state, etc.
  };

  return (
    <div className="container mx-auto py-0">
      <div className="px-4 py-8">
        {/* Use the comprehensive SmartMatchEngine component */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <SmartMatchEngine
            userRole={
              (userRole as 'borrower' | 'lender' | 'broker' | 'vendor' | 'admin') || 'borrower'
            }
            onMatchSelected={handleMatchSelected}
          />
        </div>
      </div>
    </div>
  );
};

export default SmartMatchPage;
