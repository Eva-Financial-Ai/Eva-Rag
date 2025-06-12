import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreditRequestTermsDetails from '../components/credit/CreditRequestTermsDetails';

import { debugLog } from '../utils/auditLogger';

const TermRequestDetailsEquipment: React.FC = () => {
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
          financialInstrument: formData.financialInstrument || 'equipment_finance',
          // Set defaults appropriate for equipment/vehicle financing
          primaryAssetClass: 'equipment',
          requestedTermMonths: 60, // Longer terms for equipment
          estimatedInterestRate: 6.5, // Typically lower rates for secured equipment
          paymentFrequency: 'monthly' as const,
          balloonPayment: false,
          prepaymentPenalty: true, // Common for equipment financing
          budgetedDownPaymentPercentage: 15, // Typical equipment down payment
        });
      } catch (error) {
        console.error('Error parsing saved form data:', error);
      }
    }
  }, []);

  const handleSubmit = (data: any) => {
    debugLog('general', 'log_statement', 'Equipment application term request submitted:', data)

    // Save the term request data
    localStorage.setItem(
      'termRequestData',
      JSON.stringify({
        ...data,
        applicationType: 'equipment',
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
            Equipment & Vehicle Financing Terms
          </h1>
          <p className="text-gray-600 mt-1">
            Specify details for your equipment or vehicle financing requirements
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Application Type Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <h3 className="text-green-800 font-medium">Equipment & Vehicle Financing</h3>
              <p className="text-green-700 text-sm">
                Machinery, vehicles, technology, and business equipment financing
              </p>
            </div>
          </div>
        </div>

        {/* Equipment-Specific Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Type</label>
              <select className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                <option value="">Select Equipment Type</option>
                <option value="manufacturing">Manufacturing Equipment</option>
                <option value="construction">Construction Equipment</option>
                <option value="agricultural">Agricultural Equipment</option>
                <option value="medical">Medical Equipment</option>
                <option value="technology">Technology & IT Equipment</option>
                <option value="vehicles">Commercial Vehicles</option>
                <option value="office">Office Equipment</option>
                <option value="restaurant">Restaurant Equipment</option>
                <option value="other">Other Equipment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Age</label>
              <select className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                <option value="">Select Age</option>
                <option value="new">New Equipment</option>
                <option value="1-year">1 Year Old</option>
                <option value="2-years">2 Years Old</option>
                <option value="3-years">3 Years Old</option>
                <option value="4-years">4 Years Old</option>
                <option value="5-plus">5+ Years Old</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment Description
            </label>
            <textarea
              rows={3}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Describe the equipment you're financing (make, model, specifications, etc.)"
            />
          </div>
        </div>

        <CreditRequestTermsDetails onSubmit={handleSubmit} initialData={initialData} />
      </div>
    </div>
  );
};

export default TermRequestDetailsEquipment;
