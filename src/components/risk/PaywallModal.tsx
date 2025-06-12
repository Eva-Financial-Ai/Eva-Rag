import React, { useState, useEffect } from 'react';
import { XMarkIcon, CreditCardIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import '../../styles/paywall.css';
import { addDemoCredits } from '../../utils/initDemoCredits';
import CreditsService from '../../services/CreditsService';

import { debugLog } from '../../utils/auditLogger';

// Define the pricing structure based on risk report type
const PRICING = {
  unsecured: {
    price: 300.0,
    title:
      'Risk Score & Report/Map w/ Blended Biz & Personal Credit Scores - General Application Type - Not Collateralized',
  },
  equipment: {
    price: 335.0,
    title:
      'Risk Score & Report/Map w/ Blended Biz & Personal Credit Scores - Equipment & Vehicles Application Type',
  },
  realestate: {
    price: 335.0,
    title:
      'Risk Score & Report/Map w/ Blended Biz & Personal Credit Scores - Real Estate Application Type',
  },
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
    id: 'wire',
    name: 'Wire Transfer',
    icon: '🔄',
    description: 'Manual wire transfer to our account',
  },
  { id: 'coinbase', name: 'Coinbase (USDC)', icon: '₿', description: 'Pay with USDC stablecoin' },
];

// Define the PaymentMethod type to include all payment methods
type PaymentMethod = 'wire_transfer' | 'coinbase_crypto' | 'credits';

// Define PaymentStep type
type PaymentStep = 'select_method' | 'wire_info' | 'crypto_payment' | 'success';

// Define CreditPackage type
type CreditPackage = 'single' | 'standard' | 'premium';

// Define the credit packages
const CREDIT_PACKAGES = {
  single: { credits: 1, price: 350, discount: 0 },
  standard: { credits: 5, price: 1750, discount: 15 },
  premium: { credits: 30, price: 9000, discount: 20 },
};

// Wire transfer information
const WIRE_INSTRUCTIONS = {
  bankName: 'First National Bank',
  accountName: 'EVA Financial Analytics, Inc.',
  accountNumber: '1234567890',
  routingNumber: '987654321',
  swift: 'FNBAUS12',
  reference: 'EVA-RISK-23456',
};

// Sample crypto addresses
const CRYPTO_ADDRESSES = {
  usdc: '0x1234567890abcdef1234567890abcdef12345678',
  btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
};

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reportType: 'unsecured' | 'equipment' | 'realestate';
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, onSuccess, reportType }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credits');
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage>('single');
  const [currentStep, setCurrentStep] = useState<PaymentStep>('select_method');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCredits, setAvailableCredits] = useState<number>(() => {
    return CreditsService.getCredits();
  });

  // Check if we need to add demo credits to ensure the user has at least one credit
  useEffect(() => {
    if (availableCredits < 1 && process.env.NODE_ENV === 'development') {
      // Add 1 credit to ensure the user has credits available
      const newTotal = addDemoCredits(1);
      setAvailableCredits(newTotal);
      debugLog('general', 'log_statement', 'Added 1 demo credit for testing')
    }
  }, [availableCredits]);

  // Get the price info for the selected report type
  const priceInfo = PRICING[reportType];

  // Calculate the price based on package and discounts
  const packageInfo = CREDIT_PACKAGES[selectedPackage];
  const basePrice = packageInfo.price;
  const discountPercent = packageInfo.discount;
  const discountAmount = (basePrice * discountPercent) / 100;
  const finalPrice = basePrice - discountAmount;

  // Calculate the per-report price
  const perReportPrice = finalPrice / packageInfo.credits;

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Handle method selection and proceed to appropriate payment flow
  const handleProceedToPayment = () => {
    setError(null);
    setIsProcessing(false);

    switch (selectedPaymentMethod) {
      case 'wire_transfer':
        setCurrentStep('wire_info');
        break;
      case 'coinbase_crypto':
        setCurrentStep('crypto_payment');
        break;
      case 'credits':
        handleUseCredits();
        break;
      default:
        // Handle unexpected case
        console.error(`Unhandled payment method: ${selectedPaymentMethod}`);
        setError('Invalid payment method selected. Please try again.');
    }
  };

  // Handle wire transfer details
  const handleWireTransfer = () => {
    setIsProcessing(true);
    setError(null);

    // In a real app, this would generate a payment and monitor for confirmation
    setTimeout(() => {
      handlePaymentSuccess();
    }, 1000);
  };

  // Handle crypto payment
  const handleCryptoPayment = () => {
    setIsProcessing(true);
    setError(null);

    // In a real app, this would generate a payment and monitor for confirmation
    setTimeout(() => {
      handlePaymentSuccess();
    }, 1000);
  };

  // Common success handler
  const handlePaymentSuccess = () => {
    setCurrentStep('success');

    // Use the RiskMapService to add credits
    const creditsToAdd = packageInfo.credits;
    CreditsService.addCredits(creditsToAdd);

    // Update state
    setAvailableCredits(CreditsService.getCredits());
    setIsProcessing(false);

    // After 1.5 seconds, automatically close and call onSuccess
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 1500);
  };

  // Handle using credits to generate report
  const handleUseCredits = () => {
    const availableCredits = CreditsService.getCredits();

    if (availableCredits > 0) {
      // Use the service to deduct a credit
      CreditsService.spendCredit()
        .then(() => {
          // Update our state to reflect the change
          setAvailableCredits(CreditsService.getCredits());

          // Proceed with report generation
          onSuccess();
          onClose();
        })
        .catch(() => {
          setError('Failed to use credit. Please try again.');
        });
    } else {
      setError('No credits available. Please purchase credits first.');
    }
  };

  // This function is used to handle payment method selection
  const updateSelectedPaymentMethod = (methodId: PaymentMethod) => {
    debugLog('general', 'log_statement', `Selected payment method: ${methodId}`)
    setSelectedPaymentMethod(methodId);
    setError(null);
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'select_method':
        return (
          <>
            {/* Report Details */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-md font-medium text-blue-800 mb-2">Report Details</h3>
              <p className="text-sm text-blue-700">{priceInfo.title}</p>
              <div className="mt-2 text-xl font-bold text-blue-900">
                ${priceInfo.price.toFixed(2)}
              </div>
            </div>

            {/* Credit Packages */}
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-800 mb-3">Select Credit Package</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(CREDIT_PACKAGES).map(([key, pkg]) => (
                  <div
                    key={key}
                    className={`p-3 border rounded-md cursor-pointer ${
                      selectedPackage === key
                        ? 'bg-blue-50 border-blue-300'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPackage(key as CreditPackage)}
                  >
                    <div className="font-medium">
                      {key === 'single'
                        ? 'Single Report'
                        : key === 'standard'
                          ? 'Standard (5 Credits)'
                          : 'Premium (30 Credits)'}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm">{pkg.credits} credits</span>
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
                Per report: {formatCurrency(perReportPrice)}
              </div>
            </div>

            {/* Current Credits */}
            <div className="mb-6 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <span className="text-sm text-gray-600">Your available credits:</span>
                <span className="ml-2 font-semibold">{availableCredits}</span>
              </div>
              <button
                onClick={() => setCurrentStep('select_method')}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium"
              >
                Buy More Credits
              </button>
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
                // Ensure we're properly identifying payment methods that match our PaymentMethod type
                const paymentMethodId =
                  method.id === 'wire'
                    ? 'wire_transfer'
                    : method.id === 'coinbase'
                      ? 'coinbase_crypto'
                      : (method.id as PaymentMethod);

                const isDisabled = method.id === 'credits' && availableCredits <= 0;

                return (
                  <div
                    key={method.id}
                    className={`p-3 border rounded-lg flex items-center cursor-pointer payment-method ${
                      isDisabled
                        ? 'payment-method-disabled'
                        : selectedPaymentMethod === paymentMethodId
                          ? 'payment-method-selected'
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => !isDisabled && updateSelectedPaymentMethod(paymentMethodId)}
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
              className={`btn-primary w-full py-3 px-4 rounded-md text-white font-medium flex items-center justify-center ${
                isProcessing || (selectedPaymentMethod === 'credits' && availableCredits <= 0)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
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

      case 'wire_info':
        return (
          <>
            <div className="py-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Wire Transfer Instructions</h3>
              <p className="text-sm text-gray-600 mb-6">
                Please send {formatCurrency(finalPrice)} to purchase {packageInfo.credits} credit
                {packageInfo.credits !== 1 ? 's' : ''}. Include your company name in the reference.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Bank Name:</span>
                    <span className="text-sm font-medium">{WIRE_INSTRUCTIONS.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Account Name:</span>
                    <span className="text-sm font-medium">{WIRE_INSTRUCTIONS.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Account Number:</span>
                    <span className="text-sm font-medium">{WIRE_INSTRUCTIONS.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Routing Number:</span>
                    <span className="text-sm font-medium">{WIRE_INSTRUCTIONS.routingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">SWIFT Code:</span>
                    <span className="text-sm font-medium">{WIRE_INSTRUCTIONS.swift}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Reference:</span>
                    <span className="text-sm font-medium">{WIRE_INSTRUCTIONS.reference}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                After sending the wire, click the button below to record your payment. We'll verify
                the transfer and add credits to your account within 1-2 business days.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setCurrentStep('select_method')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={handleWireTransfer}
                  disabled={isProcessing}
                  className={`btn-primary px-4 py-2 rounded-md text-white ${
                    isProcessing ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : "I've Sent the Wire"}
                </button>
              </div>
            </div>
          </>
        );

      case 'crypto_payment':
        return (
          <>
            <div className="py-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Crypto Payment</h3>
              <p className="text-sm text-gray-600 mb-6">
                Send {formatCurrency(finalPrice)} worth of USDC or BTC to purchase{' '}
                {packageInfo.credits} credit{packageInfo.credits !== 1 ? 's' : ''}.
              </p>

              <div className="space-y-6">
                {/* USDC Address */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-blue-400 rounded-full mr-2 flex items-center justify-center text-white font-bold text-xs">
                      U
                    </div>
                    <h4 className="text-md font-medium text-blue-900">USDC Address (ERC-20)</h4>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-100 flex items-center justify-between">
                    <code className="text-xs text-gray-700 break-all">{CRYPTO_ADDRESSES.usdc}</code>
                    <button
                      className="ml-2 text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        navigator.clipboard.writeText(CRYPTO_ADDRESSES.usdc);
                        alert('USDC address copied to clipboard');
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* BTC Address */}
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-orange-400 rounded-full mr-2 flex items-center justify-center text-white font-bold text-xs">
                      ₿
                    </div>
                    <h4 className="text-md font-medium text-orange-900">Bitcoin Address</h4>
                  </div>
                  <div className="bg-white p-3 rounded border border-orange-100 flex items-center justify-between">
                    <code className="text-xs text-gray-700 break-all">{CRYPTO_ADDRESSES.btc}</code>
                    <button
                      className="ml-2 text-orange-600 hover:text-orange-800"
                      onClick={() => {
                        navigator.clipboard.writeText(CRYPTO_ADDRESSES.btc);
                        alert('Bitcoin address copied to clipboard');
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 my-6">
                After sending payment, click the button below to notify us. We'll verify the
                transaction and add credits to your account.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setCurrentStep('select_method')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={handleCryptoPayment}
                  disabled={isProcessing}
                  className={`btn-primary px-4 py-2 rounded-md text-white ${
                    isProcessing ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {isProcessing ? 'Verifying...' : "I've Sent the Payment"}
                </button>
              </div>
            </div>
          </>
        );

      case 'success':
        return (
          <div className="text-center py-10">
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
              </div>
            </div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Payment Successful</h3>
            <p className="mt-2 text-sm text-gray-500">
              {selectedPaymentMethod === 'wire_transfer'
                ? `Your wire transfer has been recorded. ${packageInfo.credits} credits will be added to your account once payment is confirmed.`
                : `Your payment has been processed and ${packageInfo.credits} credits have been added to your account.`}
            </p>
            <div className="mt-6">
              <button
                onClick={onSuccess}
                className="btn-primary w-full bg-primary-600 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none"
              >
                Continue to Report
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
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <LockClosedIcon className="w-5 h-5 mr-2 text-primary-600" />
            {currentStep === 'select_method'
              ? 'Risk Report Paywall'
              : currentStep === 'wire_info'
                ? 'Wire Transfer Details'
                : currentStep === 'crypto_payment'
                  ? 'Cryptocurrency Payment'
                  : 'Payment Confirmation'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
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
              <a href="#" className="text-primary-600 hover:underline">
                Contact Support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaywallModal;
