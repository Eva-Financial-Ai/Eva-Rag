import React, { useState } from 'react';
import SsnSignature from './common/Form/SsnSignature';

import { debugLog } from '../utils/auditLogger';

const TestSignature: React.FC = () => {
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const handleSignatureEnd = (data: string | null) => {
    debugLog('general', 'log_statement', 'Signature data:', data)
    setSignatureData(data);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">Test Signature Component</h1>

      <div className="mb-4">
        <p>This is a test component to verify the signature functionality. Try signing below:</p>
      </div>

      <SsnSignature
        ownerName="Test User"
        businessName="Test Business"
        onSignatureEnd={handleSignatureEnd}
        signatureData={signatureData}
      />

      {signatureData && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Signature Data:</h2>
          <p className="text-sm text-gray-500">Signature captured successfully!</p>
        </div>
      )}
    </div>
  );
};

export default TestSignature;
