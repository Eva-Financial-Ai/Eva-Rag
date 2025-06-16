import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';

interface PlaidAccountConnectorProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit?: (err?: any, metadata?: any) => void;
  creditAmount?: number;
  requestDate?: Date;
  uploadedDocuments?: any[];
  hasAccountingSoftwareData?: boolean;
}

const PlaidAccountConnector: React.FC<PlaidAccountConnectorProps> = ({
  onSuccess,
  onExit,
  creditAmount = 0,
  requestDate = new Date(),
  uploadedDocuments = [],
  hasAccountingSoftwareData = false
}) => {
  const [linkToken, setLinkToken] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAdditionalAccountPrompt, setShowAdditionalAccountPrompt] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [transactionMonths, setTransactionMonths] = useState(4);
  const [canSkipPlaid, setCanSkipPlaid] = useState(false);

  // Check if Plaid can be skipped
  useEffect(() => {
    const hasAccountingDocs = uploadedDocuments.some(doc => 
      doc.source === 'accounting_software' || 
      doc.documentType?.includes('accounting') ||
      doc.fileName?.toLowerCase().includes('quickbooks') ||
      doc.fileName?.toLowerCase().includes('netsuite') ||
      doc.fileName?.toLowerCase().includes('xero')
    );

    const hasBankStatements = uploadedDocuments.some(doc =>
      doc.documentType?.includes('bank_statement') ||
      doc.fileName?.toLowerCase().includes('statement')
    );

    // Can skip if under $250k AND has accounting software data OR sufficient bank statements
    const skipCondition = creditAmount < 250000 && (hasAccountingSoftwareData || hasAccountingDocs || hasBankStatements);
    setCanSkipPlaid(skipCondition);
  }, [creditAmount, uploadedDocuments, hasAccountingSoftwareData]);

  // Calculate required transaction months based on loan amount
  useEffect(() => {
    if (canSkipPlaid) return; // Don't calculate if skipping

    const currentDate = requestDate;
    const dayOfMonth = currentDate.getDate();
    
    let baseMonths = 4; // Default minimum
    
    // Adjust based on loan amount
    if (creditAmount >= 900000) {
      baseMonths = 12;
    } else if (creditAmount >= 600000) {
      baseMonths = 9;
    }
    
    // Add month-to-date if after 13th
    if (dayOfMonth > 13) {
      baseMonths += 1; // Add current month for month-to-date statements
    }
    
    setTransactionMonths(baseMonths);
  }, [creditAmount, requestDate, canSkipPlaid]);

  // Create link token with proper transaction requirements
  useEffect(() => {
    if (canSkipPlaid) return; // Don't create token if skipping
    
    const createLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            products: ['transactions', 'auth', 'identity'],
            country_codes: ['US'],
            user: {
              client_user_id: `user_${Date.now()}`
            },
            transactions: {
              days_requested: Math.min(transactionMonths * 30, 730) // Max 730 days (24 months)
            }
          }),
        });
        
        const data = await response.json() as { link_token: string };
        setLinkToken(data.link_token);
      } catch (error) {
        // Handle error silently or use proper error reporting
        setLinkToken('');
      }
    };

    createLinkToken();
  }, [transactionMonths, canSkipPlaid]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken, metadata) => {
      setConnectedAccounts(prev => [...prev, ...metadata.accounts.map((acc: any) => acc.name)]);
      setShowAdditionalAccountPrompt(true);
      onSuccess(publicToken, metadata);
    },
    onExit: (err, metadata) => {
      if (onExit) onExit(err, metadata);
    },
  });

  const handleConnect = () => {
    setIsConnecting(true);
    open();
  };

  const handleConnectAnother = () => {
    setShowAdditionalAccountPrompt(false);
    setIsConnecting(true);
    open();
  };

  const handleFinish = () => {
    setShowAdditionalAccountPrompt(false);
    setIsConnecting(false);
  };

  const getTransactionRequirementText = () => {
    const currentDate = requestDate;
    const dayOfMonth = currentDate.getDate();
    
    let text = `${transactionMonths} months of transaction history`;
    
    if (dayOfMonth > 13) {
      text += ` (including current month-to-date)`;
    }
    
    if (creditAmount >= 900000) {
      text += ` - Required for loans over $900K`;
    } else if (creditAmount >= 600000) {
      text += ` - Required for loans over $600K`;
    }
    
    return text;
  };

  // Conditional rendering for skip scenario
  if (canSkipPlaid) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-green-900 text-center mb-2">
            Bank Connection Not Required
          </h3>
          
          <p className="text-green-800 text-sm text-center mb-4">
            Since your credit request is under $250,000 and you've provided accounting software data or bank statements, 
            you can skip the bank connection step.
          </p>

          <div className="bg-white border border-green-200 rounded-md p-4">
            <h4 className="font-medium text-gray-900 mb-2">
              📊 Documents Detected:
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {hasAccountingSoftwareData && <li>• Accounting software integration</li>}
              {uploadedDocuments.filter(doc => doc.source === 'accounting_software').length > 0 && (
                <li>• {uploadedDocuments.filter(doc => doc.source === 'accounting_software').length} accounting files</li>
              )}
              {uploadedDocuments.filter(doc => doc.documentType?.includes('bank_statement')).length > 0 && (
                <li>• {uploadedDocuments.filter(doc => doc.documentType?.includes('bank_statement')).length} bank statements</li>
              )}
            </ul>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-xs text-blue-700">
                💡 <strong>Optional:</strong> You can still connect your bank account for potentially better terms and faster processing.
              </p>
            </div>
          </div>
        </div>
        
        {/* Optional connection button */}
        <div className="text-center">
          <button
            onClick={() => setCanSkipPlaid(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Connect Bank Account Anyway
          </button>
          <p className="text-gray-600 text-sm mt-2">
            Optional: Connect for potentially better terms
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transaction Requirements Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Bank Statement Requirements
        </h3>
        <p className="text-blue-800 text-sm mb-2">
          {getTransactionRequirementText()}
        </p>
        <p className="text-blue-700 text-xs">
          We'll automatically retrieve the required transaction history when you connect your accounts.
        </p>
      </div>

      {/* Main Connection Button */}
      {!showAdditionalAccountPrompt && (
        <div className="text-center">
          <button
            onClick={handleConnect}
            disabled={!ready || isConnecting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isConnecting ? 'Connecting...' : 'Connect Bank Account'}
          </button>
          <p className="text-gray-600 text-sm mt-2">
            Securely connect your bank account to verify income and cash flow
          </p>
        </div>
      )}

      {/* Additional Account Prompt */}
      {showAdditionalAccountPrompt && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-green-900 text-center mb-2">
            Account Connected Successfully!
          </h3>
          
          <div className="space-y-3 mb-4">
            <p className="text-green-800 text-sm text-center">
              Connected accounts: {connectedAccounts.join(', ')}
            </p>
          </div>

          <div className="bg-white border border-green-200 rounded-md p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">
              💡 Want Better Terms?
            </h4>
            <p className="text-gray-700 text-sm mb-3">
              Connect additional business banking or credit card accounts to show more cash flow and credit history. 
              <strong className="text-green-700"> More cash flow and credit = better terms!</strong>
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={handleConnectAnother}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
              >
                Connect Another Account
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors text-sm"
              >
                Continue with Current Accounts
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-600 text-center">
            We've automatically retrieved {transactionMonths} months of transaction history as required.
          </p>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Bank-Level Security</h4>
            <p className="text-xs text-gray-600 mt-1">
              Your banking credentials are encrypted and never stored. We use read-only access to retrieve your transaction history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaidAccountConnector; 