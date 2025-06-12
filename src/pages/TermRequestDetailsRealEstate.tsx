import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreditRequestTermsDetails from '../components/credit/CreditRequestTermsDetails';

import { debugLog } from '../utils/auditLogger';

const TermRequestDetailsRealEstate: React.FC = () => {
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
          financialInstrument: formData.financialInstrument || 'commercial_mortgage',
          // Set defaults appropriate for real estate financing
          primaryAssetClass: 'real_estate',
          requestedTermMonths: 240, // 20 years typical for commercial real estate
          estimatedInterestRate: 5.5, // Typically lower rates for real estate
          paymentFrequency: 'monthly' as const,
          balloonPayment: true, // Common for commercial real estate
          balloonPaymentMonths: 60, // 5-year balloon common
          prepaymentPenalty: true,
          prepaymentPenaltyTerms: 'Declining prepayment penalty over first 5 years',
          budgetedDownPaymentPercentage: 25, // Typical commercial real estate down payment
        });
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, []);

  const handleSubmit = (data: any) => {
    debugLog('general', 'log_statement', 'Real estate application term request submitted:', data)

    // Save the term request data
    localStorage.setItem(
      'termRequestData',
      JSON.stringify({
        ...data,
        applicationType: 'real-estate',
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
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">
            Commercial Real Estate Financing
          </h1>
          <p className="text-gray-600 mt-1">
            Specify details for your commercial real estate financing requirements
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Application Type Indicator */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-purple-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-purple-800 font-medium">Commercial Real Estate Financing</h3>
              <p className="text-purple-700 text-sm">
                Purchase, refinance, or construction of commercial properties
              </p>
            </div>
          </div>
        </div>

        {/* Real Estate-Specific Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                <option value="">Select Property Type</option>
                <option value="office">Office Building</option>
                <option value="retail">Retail Space</option>
                <option value="industrial">Industrial/Warehouse</option>
                <option value="multifamily">Multifamily (5+ units)</option>
                <option value="mixed-use">Mixed Use</option>
                <option value="hotel">Hotel/Hospitality</option>
                <option value="special-purpose">Special Purpose</option>
                <option value="land">Land/Development</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                <option value="">Select Transaction Type</option>
                <option value="purchase">Purchase</option>
                <option value="refinance">Refinance</option>
                <option value="cash-out-refinance">Cash-Out Refinance</option>
                <option value="construction">Construction</option>
                <option value="bridge">Bridge/Interim Financing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Square Footage
              </label>
              <input
                type="number"
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter square footage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
              <input
                type="number"
                className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Year built"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
            <input
              type="text"
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter property address"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Annual NOI (Net Operating Income)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Annual NOI"
              />
            </div>
          </div>
        </div>

        <CreditRequestTermsDetails onSubmit={handleSubmit} initialData={initialData} />
      </div>
    </div>
  );
};

export default TermRequestDetailsRealEstate;
