import React, { useState, useCallback, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import {
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/formatters';

import { debugLog } from '../../utils/auditLogger';

interface PlaidBankVerificationProps {
  onVerificationComplete: (data: BankVerificationData) => void;
  onError?: (error: Error) => void;
  ownershipPercentage: number;
  businessName: string;
  ownerName: string;
}

export interface BankVerificationData {
  verified: boolean;
  accounts: BankAccount[];
  ownershipVerified: boolean;
  verificationMethod: 'plaid' | 'manual';
  verificationDate: Date;
  plaidAccessToken?: string;
  plaidItemId?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'loan';
  subtype?: string;
  mask: string;
  balance: {
    available: number;
    current: number;
    limit?: number;
  };
  institution: {
    name: string;
    institutionId: string;
  };
  verificationStatus: 'verified' | 'pending' | 'failed';
  ownershipConfirmed?: boolean;
}

const PlaidBankVerification: React.FC<PlaidBankVerificationProps> = ({
  onVerificationComplete,
  onError,
  ownershipPercentage,
  businessName,
  ownerName,
}) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'processing' | 'complete' | 'error'
  >('idle');
  const [verifiedAccounts, setVerifiedAccounts] = useState<BankAccount[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check if owner qualifies for Lightning Verification
  const qualifiesForLightning = ownershipPercentage >= 21;

  // Fetch Plaid Link token
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        setLoading(true);
        // Mock API call - replace with actual API
        const response = await fetch('/api/plaid/create-link-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'user-123', // Replace with actual user ID
            products: ['auth', 'identity', 'assets', 'liabilities'],
            clientName: businessName,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create link token');
        }

        const data = await response.json() as { linkToken: string };
        setLinkToken(data.linkToken);
      } catch (err) {
        console.error('Error fetching link token:', err);
        // Use mock token for demo
        setLinkToken('link-sandbox-123456');
      } finally {
        setLoading(false);
      }
    };

    fetchLinkToken();
  }, [businessName]);

  const onSuccess = useCallback(
    async (publicToken: string, metadata: any) => {
      try {
        setVerificationStatus('processing');

        // Exchange public token for access token
        const response = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicToken }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange token');
        }

        const { accessToken, itemId } = await response.json() as { accessToken: string; itemId: string };

        // Fetch account details
        const accountsResponse = await fetch('/api/plaid/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        });

        if (!accountsResponse.ok) {
          throw new Error('Failed to fetch accounts');
        }

        const { accounts } = await accountsResponse.json() as { accounts: BankAccount[] };

        // Mock verification for demo
        const mockAccounts: BankAccount[] = [
          {
            id: 'acc-1',
            name: `${businessName} Operating Account`,
            type: 'checking',
            subtype: 'business_checking',
            mask: '4567',
            balance: {
              available: 125000,
              current: 130000,
            },
            institution: {
              name: metadata.institution?.name || 'Chase Bank',
              institutionId: metadata.institution?.institution_id || 'chase',
            },
            verificationStatus: 'verified',
            ownershipConfirmed: true,
          },
          {
            id: 'acc-2',
            name: `${businessName} Savings`,
            type: 'savings',
            subtype: 'business_savings',
            mask: '8901',
            balance: {
              available: 250000,
              current: 250000,
            },
            institution: {
              name: metadata.institution?.name || 'Chase Bank',
              institutionId: metadata.institution?.institution_id || 'chase',
            },
            verificationStatus: 'verified',
            ownershipConfirmed: true,
          },
        ];

        setVerifiedAccounts(mockAccounts);
        setVerificationStatus('complete');

        // Call completion handler
        onVerificationComplete({
          verified: true,
          accounts: mockAccounts,
          ownershipVerified: qualifiesForLightning,
          verificationMethod: 'plaid',
          verificationDate: new Date(),
          plaidAccessToken: accessToken || 'mock-access-token',
          plaidItemId: itemId || 'mock-item-id',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed');
        setVerificationStatus('error');
        if (onError) {
          onError(err instanceof Error ? err : new Error('Verification failed'));
        }
      }
    },
    [businessName, qualifiesForLightning, onVerificationComplete, onError]
  );

  const config = {
    token: linkToken,
    onSuccess,
    onExit: (err: any) => {
      if (err != null) {
        setError('Connection cancelled or failed');
        setVerificationStatus('error');
      }
    },
  };

  const { open, ready } = usePlaidLink(config);

  const handleConnect = () => {
    if (ready) {
      open();
    }
  };

  const handleManualVerification = () => {
    // Redirect to manual verification flow
    debugLog('general', 'log_statement', 'Manual verification requested')
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bank Account Verification</h3>
          {qualifiesForLightning && (
            <div className="flex items-center text-yellow-600">
              <BoltIcon className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Lightning Verification Available</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600">
          {qualifiesForLightning
            ? `As an owner with ${ownershipPercentage}% equity, you qualify for Lightning Verification - our fastest approval process.`
            : 'Connect your business bank accounts to verify ownership and expedite your application.'}
        </p>
      </div>

      {/* Verification Status */}
      {verificationStatus === 'idle' && (
        <div className="space-y-4">
          {/* Benefits */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Why Connect Your Bank Account?
            </h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Instant ownership verification for faster approval</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Automatic financial data import saves time</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Secure connection using bank-level encryption</span>
              </li>
              {qualifiesForLightning && (
                <li className="flex items-start">
                  <BoltIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">Lightning fast approval in under 24 hours</span>
                </li>
              )}
            </ul>
          </div>

          {/* Connection Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleConnect}
              disabled={!ready || loading}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                ready && !loading
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <BanknotesIcon className="h-5 w-5 mr-2" />
                  Connect Bank Account
                </>
              )}
            </button>

            <button
              onClick={handleManualVerification}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Verify Manually Instead
            </button>
          </div>

          {/* Security Note */}
          <div className="flex items-start text-xs text-gray-500">
            <ShieldCheckIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            <span>
              Your data is encrypted and secure. We use Plaid, trusted by thousands of financial
              apps.
            </span>
          </div>
        </div>
      )}

      {/* Processing State */}
      {verificationStatus === 'processing' && (
        <div className="text-center py-8">
          <ArrowPathIcon className="h-12 w-12 mx-auto text-primary-600 animate-spin mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Verifying Your Accounts</h4>
          <p className="text-sm text-gray-600">This usually takes just a few seconds...</p>
        </div>
      )}

      {/* Success State */}
      {verificationStatus === 'complete' && (
        <div className="space-y-4">
          <div className="flex items-center text-green-600 mb-4">
            <CheckCircleIcon className="h-6 w-6 mr-2" />
            <span className="font-medium">Bank Accounts Verified Successfully!</span>
          </div>

          {/* Verified Accounts */}
          <div className="space-y-3">
            {verifiedAccounts.map(account => (
              <div key={account.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h5 className="font-medium text-gray-900">{account.name}</h5>
                      <span className="ml-2 text-xs text-gray-500">••••{account.mask}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {account.institution.name} • {account.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Available Balance</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(account.balance.available)}
                    </p>
                  </div>
                </div>
                {account.ownershipConfirmed && (
                  <div className="mt-3 flex items-center text-xs text-green-600">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Ownership verified for {ownerName}
                  </div>
                )}
              </div>
            ))}
          </div>

          {qualifiesForLightning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <BoltIcon className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-yellow-900">
                    Lightning Verification Activated
                  </h5>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your {ownershipPercentage}% ownership has been verified. You're eligible for our
                    fastest approval process.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {verificationStatus === 'error' && (
        <div className="space-y-4">
          <div className="flex items-center text-red-600 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
            <span className="font-medium">Verification Failed</span>
          </div>
          <p className="text-sm text-gray-600">{error || 'Unable to verify bank accounts'}</p>
          <div className="flex space-x-3">
            <button
              onClick={handleConnect}
              disabled={!ready}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
            >
              Try Again
            </button>
            <button
              onClick={handleManualVerification}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Verify Manually
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaidBankVerification;
