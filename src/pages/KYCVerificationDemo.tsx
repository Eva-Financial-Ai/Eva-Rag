import React, { useState, useEffect } from 'react';
import KYCVerificationFlow from '../components/security/KYCVerificationFlow';
// import { UserContext } from '../contexts/UserContext';
import { useWorkflow } from '../contexts/WorkflowContext';

import { debugLog } from '../utils/auditLogger';

const KYCVerificationDemo: React.FC = () => {
  const [isKYCModalOpen, setIsKYCModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'pending' | 'complete' | 'failed'>('none');
  const { currentTransaction, advanceStage } = useWorkflow();

  // Check verification status on component mount
  useEffect(() => {
    const kycVerified = localStorage.getItem('kycVerified');
    if (kycVerified === 'true') {
      setIsVerified(true);
      setVerificationStatus('complete');
    }
  }, []);

  const handleOpenKYC = () => {
    setIsKYCModalOpen(true);
    setVerificationStatus('pending');
  };

  const handleCloseKYC = () => {
    setIsKYCModalOpen(false);
    if (verificationStatus === 'pending') {
      setVerificationStatus('none');
    }
  };

  const handleVerificationComplete = (success: boolean) => {
    setIsVerified(success);
    setVerificationStatus(success ? 'complete' : 'failed');
    
    // Store verification status
    if (success) {
      localStorage.setItem('kycVerified', 'true');
      localStorage.setItem('kycVerifiedAt', new Date().toISOString());
      
      // Auto-advance workflow if transaction exists
      if (currentTransaction) {
        setTimeout(() => {
          advanceStage('document_collection', currentTransaction.id);
        }, 2000);
      }
    }
    
    // debugLog('general', 'log_statement', 'Verification completed with status:', success)
  };

  const resetVerification = () => {
    localStorage.removeItem('kycVerified');
    localStorage.removeItem('kycVerifiedAt');
    setIsVerified(false);
    setVerificationStatus('none');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="w-5 h-5 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">KYC Verification Demo</h1>
        <p className="text-gray-600 mb-6">
          This page demonstrates the enhanced KYC (Know Your Customer) verification flow that integrates
          seamlessly with transaction processes to verify user identity in compliance with financial
          regulations.
        </p>

        {/* Current Status Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Current Verification Status</h2>
          <div className="flex items-center space-x-3">
            {getStatusIcon(verificationStatus)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verificationStatus)}`}>
              {verificationStatus === 'none' && 'Not Verified'}
              {verificationStatus === 'pending' && 'Verification in Progress'}
              {verificationStatus === 'complete' && 'Verified Successfully'}
              {verificationStatus === 'failed' && 'Verification Failed'}
            </span>
          </div>
          
          {isVerified && (
            <div className="mt-3 text-sm text-gray-600">
              <p>✅ Identity verified on {new Date(localStorage.getItem('kycVerifiedAt') || '').toLocaleString()}</p>
              {currentTransaction && (
                <p className="mt-1">📋 Transaction: {currentTransaction.applicantData?.name || 'Unknown'}</p>
              )}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">✨ Enhanced Features</h3>
            <ul className="space-y-2 text-blue-700">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Auto-advance workflow integration
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Improved step navigation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Better error handling & retry logic
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Device memory for convenience
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Transaction context integration
              </li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-3">🛡️ Security Features</h3>
            <ul className="space-y-2 text-green-700">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Multi-factor authentication
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Phone number verification
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Identity document validation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Secure data storage
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Compliance with financial regulations
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
        <button
          onClick={handleOpenKYC}
            disabled={isKYCModalOpen}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verificationStatus === 'none' ? 'Start Verification' : 'Retry Verification'}
          </button>

          {isVerified && (
            <button
              onClick={resetVerification}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition duration-200"
        >
              Reset Verification
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition duration-200"
          >
            Refresh Page
        </button>
      </div>

        {/* Current Transaction Info */}
        {currentTransaction && (
          <div className="mt-6 bg-indigo-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">Current Transaction Context</h3>
            <div className="text-sm text-indigo-700">
              <p><strong>Transaction ID:</strong> {currentTransaction.id}</p>
              <p><strong>Applicant:</strong> {currentTransaction.applicantData?.name || 'Unknown'}</p>
              <p><strong>Amount:</strong> ${currentTransaction.amount?.toLocaleString() || 'N/A'}</p>
              <p><strong>Stage:</strong> {currentTransaction.stage}</p>
              <p><strong>Status:</strong> {currentTransaction.status}</p>
          </div>
          </div>
        )}
        </div>

      {/* Verification Process Steps */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Verification Process</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: 1, title: 'Welcome', desc: 'Introduction to verification process' },
            { step: 2, title: 'Basic Info', desc: 'Personal information collection' },
            { step: 3, title: 'Phone Verify', desc: 'SMS code verification' },
            { step: 4, title: 'Review & Complete', desc: 'Final confirmation' }
          ].map((item) => (
            <div key={item.step} className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">
                {item.step}
              </div>
              <h3 className="font-medium text-gray-800 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
          ))}
        </div>
      </div>

      {/* KYC Verification Modal */}
      <KYCVerificationFlow
        isOpen={isKYCModalOpen}
        onClose={handleCloseKYC}
        onVerificationComplete={handleVerificationComplete}
        autoAdvanceOnComplete={true}
      />
    </div>
  );
};

export default KYCVerificationDemo;
