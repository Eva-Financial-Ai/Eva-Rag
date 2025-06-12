import React, { useState, useEffect } from 'react';
import { XMarkIcon, LockClosedIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import CreditsService from '../../services/CreditsService';
import { RiskMapType } from './RiskMapNavigator';

import { debugLog } from '../../utils/auditLogger';

// Define the pricing structure for smart match
const PRICING = {
  unsecured: {
    price: 250.0,
    title: 'Smart Match - Lender Matching for General Application Type',
  },
  equipment: {
    price: 275.0,
    title: 'Smart Match - Lender Matching for Equipment & Vehicles Application Type',
  },
  realestate: {
    price: 295.0,
    title: 'Smart Match - Lender Matching for Real Estate Application Type',
  },
};

// Define credit package options
const CREDIT_PACKAGES = {
  single: { credits: 1, price: 250, discount: 0 },
  standard: { credits: 5, price: 1125, discount: 10 },
  premium: { credits: 15, price: 2925, discount: 22 },
};

// Available payment methods
const PAYMENT_METHODS = [
  {
    id: 'credits',
    name: 'Account Credits',
    icon: '💰',
    description: 'Use your pre-purchased credits',
  },
  {
    id: 'credit_card',
    name: 'Credit Card',
    icon: '💳',
    description: 'Pay with a credit or debit card',
  },
];

// Define payment types
type PaymentMethod = 'credit_card' | 'credits';
type PaymentStep = 'select_method' | 'card_details' | 'success';
type CreditPackage = 'single' | 'standard' | 'premium';

interface SmartMatchPaywallProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  riskMapType: RiskMapType;
}

const SmartMatchPaywall: React.FC<SmartMatchPaywallProps> = ({
  isOpen,
  onClose,
  onSuccess,
  riskMapType,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credits');
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>('single');
  const [currentStep, setCurrentStep] = useState<PaymentStep>('select_method');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCredits, setAvailableCredits] = useState<number>(() => {
    return CreditsService.getUserCredits().balance;
  });

  // Card details state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });

  // Get pricing information based on risk map type
  const priceInfo = PRICING[riskMapType];

  // Calculate package pricing and discounts
  const packageInfo = CREDIT_PACKAGES[selectedPackage];
  const basePrice = packageInfo.price;
  const discountPercent = packageInfo.discount;
  const discountAmount = (basePrice * discountPercent) / 100;
  const finalPrice = basePrice - discountAmount;
  const perMatchPrice = finalPrice / packageInfo.credits;

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Update credits periodically to ensure we have the latest value
  useEffect(() => {
    // Simplified implementation without subscription
    const interval = setInterval(() => {
      setAvailableCredits(CreditsService.getUserCredits().balance);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle payment method selection
  const handlePaymentMethodSelect = (methodId: PaymentMethod) => {
    setSelectedPaymentMethod(methodId);
    setError(null);
  };

  // Proceed to appropriate payment flow
  const handleProceedToPayment = () => {
    setError(null);

    if (selectedPaymentMethod === 'credits') {
      processCreditUsage();
    } else if (selectedPaymentMethod === 'credit_card') {
      setCurrentStep('card_details');
    }
  };

  // Process credit card payment
  const handleCreditCardPayment = () => {
    setIsProcessing(true);
    setError(null);

    // For demo purposes, simulate a successful payment
    setTimeout(() => {
      CreditsService.addCredits(packageInfo.credits, 'Smart Match credits purchase');
      setCurrentStep('success');
      setIsProcessing(false);

      // Auto-continue after success
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    }, 1000);
  };

  // Use existing credits
  const processCreditUsage = async () => {
    if (availableCredits <= 0) {
      setError('No credits available. Please purchase credits first.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = CreditsService.spendCreditsServiceMethod(
        1,
        'smart-match',
        'Smart Match feature usage'
      );
      if (result) {
        onSuccess();
        onClose();
      } else {
        throw new Error('Failed to use credits');
      }
    } catch (error) {
      setError('Failed to use credits. Please try again.');
      setIsProcessing(false);
    }
  };

  // Handle card input changes
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'select_method':
        return (
          <>
            {/* Smart Match Details */}
            <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
              <h3 className="text-md font-medium text-primary-800 mb-2">Smart Match Service</h3>
              <p className="text-sm text-primary-700">{priceInfo.title}</p>
              <div className="mt-2 text-xl font-bold text-primary-900">
                {formatCurrency(priceInfo.price)}
              </div>
            </div>

            {/* Credit Packages */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-800 mb-3">Select Credit Package</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(CREDIT_PACKAGES).map(([key, pkg]) => (
                  <div
                    key={key}
                    className={`p-3 border rounded-md cursor-pointer ${
                      selectedPackage === key
                        ? 'bg-primary-50 border-primary-300 shadow-sm'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPackage(key as CreditPackage)}
                  >
                    <div className="font-medium">
                      {key === 'single'
                        ? 'Single Match'
                        : key === 'standard'
                          ? 'Standard (5 Credits)'
                          : 'Premium (15 Credits)'}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm">
                        {pkg.credits} credit{pkg.credits !== 1 ? 's' : ''}
                      </span>
                      <span className="text-sm font-semibold">
                        {pkg.discount > 0 && (
                          <span className="text-green-600 mr-1">-{pkg.discount}%</span>
                        )}
                        {formatCurrency(pkg.price - (pkg.price * pkg.discount) / 100)}
                      </span>
                    </div>
                    {pkg.discount > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        Save {formatCurrency((pkg.price * pkg.discount) / 100)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Per match: {formatCurrency(perMatchPrice)}
              </div>
            </div>

            {/* Current Credits */}
            <div className="mb-6 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <span className="text-sm text-gray-600">Your available credits:</span>
                <span className="ml-2 font-semibold">{availableCredits}</span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Payment Methods */}
            <h3 className="text-md font-medium text-gray-800 mb-3">Select Payment Method</h3>
            <div className="space-y-2 mb-6">
              {PAYMENT_METHODS.map(method => {
                const paymentMethodId = method.id as PaymentMethod;
                const isDisabled = method.id === 'credits' && availableCredits <= 0;

                return (
                  <div
                    key={method.id}
                    className={`p-3 border rounded-lg flex items-center cursor-pointer ${
                      isDisabled
                        ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                        : selectedPaymentMethod === paymentMethodId
                          ? 'bg-primary-50 border-primary-300 shadow-sm'
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => !isDisabled && handlePaymentMethodSelect(paymentMethodId)}
                  >
                    <div className="flex-shrink-0 h-6 w-6 text-center mr-3">{method.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">{method.name}</span>
                        {method.id === 'credits' && (
                          <span
                            className={`text-sm ${availableCredits ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {availableCredits ? 'Sufficient Credits' : 'Insufficient Credits'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                    <div className="ml-3">
                      <div
                        className={`h-5 w-5 rounded-full border ${
                          selectedPaymentMethod === paymentMethodId
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedPaymentMethod === paymentMethodId && (
                          <div className="h-3 w-3 m-1 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit button */}
            <button
              onClick={handleProceedToPayment}
              disabled={
                isProcessing || (selectedPaymentMethod === 'credits' && availableCredits <= 0)
              }
              className={`w-full py-3 px-4 rounded-md text-white font-medium flex items-center justify-center ${
                isProcessing || (selectedPaymentMethod === 'credits' && availableCredits <= 0)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 transition-colors'
              }`}
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : selectedPaymentMethod === 'credits' ? (
                <>Use Credits</>
              ) : (
                <>Proceed with Payment</>
              )}
            </button>
          </>
        );

      case 'card_details':
        return (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Enter Payment Details</h3>
              <p className="text-sm text-gray-600 mb-6">
                You're purchasing {packageInfo.credits} Smart Match credit
                {packageInfo.credits !== 1 ? 's' : ''}.
              </p>

              <div className="space-y-4">
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={handleCardInputChange}
                    className="w-full p-2 border rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Card Holder */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Holder Name
                  </label>
                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="John Smith"
                    value={cardDetails.cardHolder}
                    onChange={handleCardInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={handleCardInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={handleCardInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setCurrentStep('select_method')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreditCardPayment}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-2 rounded-md text-white ${
                    isProcessing
                      ? 'bg-gray-400'
                      : 'bg-primary-600 hover:bg-primary-700 transition-colors'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Pay ${formatCurrency(finalPrice)}`
                  )}
                </button>
              </div>
            </div>
          </>
        );

      case 'success':
        return (
          <div className="text-center py-10">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Payment Successful</h3>
            <p className="mt-2 text-sm text-gray-500">
              {`Your payment has been processed and ${packageInfo.credits} Smart Match credit${packageInfo.credits !== 1 ? 's' : ''} have been added to your account.`}
            </p>
            <div className="mt-6">
              <button
                onClick={onSuccess}
                className="w-full bg-primary-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none transition-colors"
              >
                Continue to Smart Match Results
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-primary-50 to-primary-100">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <LockClosedIcon className="w-5 h-5 mr-2 text-primary-600" />
            {currentStep === 'select_method'
              ? 'Smart Match - Lender Matching'
              : currentStep === 'card_details'
                ? 'Credit Card Payment'
                : 'Payment Confirmation'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">{renderStepContent()}</div>

        {/* Footer */}
        {currentStep === 'select_method' && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center">
              <CreditCardIcon className="h-4 w-4 mr-1" />
              <span>Secure Payment Processing</span>
            </div>
            <div>
              Need help?{' '}
              <button
                onClick={() => debugLog('general', 'log_statement', 'Contact Support clicked')} // Placeholder action
                className="text-primary-600 hover:underline bg-transparent border-none p-0 font-medium cursor-pointer"
              >
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartMatchPaywall;
