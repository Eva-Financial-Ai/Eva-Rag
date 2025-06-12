import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '../contexts/WorkflowContext';
import CreditApplicationFlow from '../components/credit/CreditApplicationFlow';

import { debugLog } from '../utils/auditLogger';

const CreditApplication: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentTransaction, advanceStage } = useWorkflow();

  const handleApplicationComplete = (data: any) => {
    debugLog('general', 'log_statement', 'Credit application completed:', data)

    // Set the transaction in context
    if (setCurrentTransaction && data.applicationId) {
      setCurrentTransaction({
        id: data.applicationId,
        applicantData: {
          id: data.applicationId,
          name: data.application?.legalBusinessName || 'New Application',
        },
        amount: data.application?.requestedAmount || 0,
        type: 'Credit Application',
        status: 'active',
        createdAt: new Date().toISOString(),
        stage: 'application',
        data: data.application,
        currentStage: 'application',
      });
    }

    // Advance to next stage
    if (data.applicationId) {
      advanceStage(data.applicationId, 'risk_assessment');
      // Navigate to risk assessment after completion
      setTimeout(() => {
        navigate('/risk-assessment');
      }, 1500);
    }
  };

  return (
    <CreditApplicationFlow
      onComplete={handleApplicationComplete}
    />
  );
};

export default CreditApplication;
