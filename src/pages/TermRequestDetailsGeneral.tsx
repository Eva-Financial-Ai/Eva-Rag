import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreditRequestTermsDetails from '../components/credit/CreditRequestTermsDetails';

import { debugLog } from '../utils/auditLogger';

const TermRequestDetailsGeneral: React.FC = () => {
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<any>({});

  useEffect(() => {
    // Load saved form data from localStorage if available
    const savedData = localStorage.getItem('creditApplicationFormData');
    if (savedData) {
      try {
        const formData = JSON.parse(savedData);
        setInitialData({
          requestedAmount: parseInt(formData.requestedAmount) || 0,
          financialInstrument: formData.financialInstrument || 'working_capital',
          // Set defaults appropriate for general applications
          primaryAssetClass: 'cash_equivalents',
          requestedTermMonths: 36,
          estimatedInterestRate: 7.5,
          paymentFrequency: 'monthly' as const,
          balloonPayment: false,
          prepaymentPenalty: false,
        });
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, []);

  const handleSubmit = (data: any) => {
    debugLog('general', 'log_statement', 'General application term request submitted:', data)

    // Save the term request data
    localStorage.setItem(
      'termRequestData',
      JSON.stringify({
        ...data,
        applicationType: 'general',
      })
    );

    // Navigate to financial statements or next step
    navigate('/financial-statements');
  };

  const handleBack = () => {
    // Navigate back to credit application step 2
    navigate('/credit-application?step=2');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Application
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">General Loan Terms</h1>
          <p className="text-gray-600 mt-1">
            Specify your general funding requirements and preferred terms
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Application Type Indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-blue-800 font-medium">General Application</h3>
              <p className="text-blue-700 text-sm">
                Working capital, general funding, and business expansion
              </p>
            </div>
          </div>
        </div>

        <CreditRequestTermsDetails onSubmit={handleSubmit} initialData={initialData} />
      </div>
    </div>
  );
};

export default TermRequestDetailsGeneral;
