import React, { useState, useContext, useEffect, useCallback } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useUserType } from '../../contexts/UserTypeContext';

// Types for verification status and steps
type VerificationStatus = 'pending' | 'in_progress' | 'verified' | 'failed';
type VerificationStep =
  | 'welcome'
  | 'basic-info'
  | 'phone-verification'
  | 'review'
  | 'remember-me'
  | 'complete'
  | 'failed';

interface KYCVerificationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (success: boolean) => void;
  transactionId?: string;
  autoAdvanceOnComplete?: boolean;
}

const KYCVerificationFlow: React.FC<KYCVerificationFlowProps> = ({
  isOpen,
  onClose,
  onVerificationComplete,
  transactionId,
  autoAdvanceOnComplete = false
}) => {
  const { currentTransaction, advanceStage } = useWorkflow();

  // Get user context for permissions and roles
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const userContext = useContext(UserContext);
  const { userType, hasPermission } = useUserType();

  // States for the verification flow
  const [currentStep, setCurrentStep] = useState<VerificationStep>('welcome');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending');
  const [processing, setProcessing] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  // Form data states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [documentType, setDocumentType] = useState('driver-license');
  const [documentNumber, setDocumentNumber] = useState('');

  // Verification code timer
  const [codeTimer, setCodeTimer] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [canResendCode, setCanResendCode] = useState(false);

  // Handle code timer countdown
  useEffect(() => {
    if (currentStep === 'phone-verification' && codeTimer > 0) {
      const timer = setTimeout(() => {
        setCodeTimer(prev => {
          const newValue = prev - 1;
          if (newValue === 0) {
            setCanResendCode(true);
          }
          return newValue;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, codeTimer]);

  // Auto-start verification when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('welcome');
      setVerificationStatus('pending');
      setProcessing(false);
      // Reset form data
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setAddress('');
      setPhoneNumber('');
      setVerificationCode('');
      setCodeTimer(0);
      setCanResendCode(false);
    }
  }, [isOpen]);

  // Simulated send verification code
  const handleSendVerificationCode = () => {
    if (phoneNumber.length >= 10) {
      setProcessing(true);
      setTimeout(() => {
        // Simulate code being sent
        setCodeTimer(60); // 60 second countdown
        setCanResendCode(false);
        setProcessing(false);
      }, 1500);
    }
  };

  // Resend verification code
  const handleResendCode = () => {
    setVerificationCode('');
    handleSendVerificationCode();
  };

  // Simulated verify code
  const handleVerifyCode = () => {
    if (verificationCode.length === 6) {
      setProcessing(true);
      setTimeout(() => {
        // 95% success rate for demo (more optimistic)
        const success = Math.random() < 0.95;
        if (success) {
          setCurrentStep('review');
          setVerificationStatus('in_progress');
        } else {
          setVerificationStatus('failed');
          setCurrentStep('failed');
        }
        setProcessing(false);
      }, 1500);
    }
  };

  // Submit verification after review
  const handleSubmitVerification = () => {
    setProcessing(true);
    setTimeout(() => {
      // 95% success rate for demo
      const success = Math.random() < 0.95;
      if (success) {
        setVerificationStatus('verified');
        setCurrentStep('remember-me');
      } else {
        setVerificationStatus('failed');
        setCurrentStep('failed');
      }
      setProcessing(false);
    }, 2000);
  };

  // Complete verification process
  const handleVerificationComplete = useCallback(() => {
    setCurrentStep('complete');
    setProcessing(false);

    // Update local storage
    localStorage.setItem('kycVerified', 'true');
    localStorage.setItem('kycVerifiedAt', new Date().toISOString());
    if (transactionId) {
      localStorage.setItem(`kyc_${transactionId}`, 'verified');
    }

    // Auto-advance workflow if enabled
    if (autoAdvanceOnComplete && currentTransaction) {
      advanceStage('document_collection', currentTransaction.id);
    }

    // Notify parent component
    onVerificationComplete(true);
  }, [onVerificationComplete, transactionId, autoAdvanceOnComplete, currentTransaction, advanceStage]);

  // Retry verification if failed
  const handleRetry = () => {
    setVerificationStatus('pending');
    setCurrentStep('basic-info');
    setProcessing(false);
    setVerificationCode('');
    setCodeTimer(0);
  };

  // Handle next step navigation with improved validation
  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('basic-info');
        break;
      case 'basic-info':
        if (firstName.trim() && lastName.trim() && dateOfBirth && address.trim()) {
          setCurrentStep('phone-verification');
          // Auto-send verification code when moving to phone verification
          if (phoneNumber.length >= 10) {
            setTimeout(() => {
              handleSendVerificationCode();
            }, 500);
          }
        }
        break;
      case 'phone-verification':
        if (verificationCode.length === 6) {
        handleVerifyCode();
        } else if (phoneNumber.length >= 10 && codeTimer === 0) {
          handleSendVerificationCode();
        }
        break;
      case 'review':
        handleSubmitVerification();
        break;
      case 'remember-me':
        handleVerificationComplete();
        break;
      case 'complete':
        onClose();
        break;
      case 'failed':
        handleRetry();
        break;
      default:
        break;
    }
  };

  // Handle back navigation
  const handleBack = () => {
    switch (currentStep) {
      case 'basic-info':
        setCurrentStep('welcome');
        break;
      case 'phone-verification':
        setCurrentStep('basic-info');
        setCodeTimer(0);
        setVerificationCode('');
        break;
      case 'review':
        setCurrentStep('phone-verification');
        break;
      case 'remember-me':
        setCurrentStep('review');
        break;
      case 'complete':
        onClose();
        break;
      default:
        break;
    }
  };

  // Check if current step is valid to proceed
  const canProceed = () => {
    switch (currentStep) {
      case 'welcome':
        return true;
      case 'basic-info':
        return firstName.trim() && lastName.trim() && dateOfBirth && address.trim() && phoneNumber.length >= 10;
      case 'phone-verification':
        return verificationCode.length === 6 || (phoneNumber.length >= 10 && codeTimer === 0);
      case 'review':
        return true;
      case 'remember-me':
        return true;
      default:
        return false;
    }
  };

  // Render progress indicator
  const renderProgressIndicator = () => {
    const steps = [
      { key: 'welcome', label: 'Welcome', number: 1 },
      { key: 'basic-info', label: 'Basic Info', number: 2 },
      { key: 'phone-verification', label: 'Verify', number: 3 },
      { key: 'review', label: 'Review', number: 4 },
      { key: 'complete', label: 'Complete', number: 5 },
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStep);

    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.key}>
              <div
                className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium ${
                  currentStep === step.key
                    ? 'bg-primary-600 text-white'
                    : index < currentIndex
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index < currentIndex ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              {index < steps.length - 1 && (
                <div className="w-12 h-1 mx-2 bg-gray-200 rounded">
                  <div
                    className={`h-1 rounded transition-all duration-300 ${
                      index < currentIndex ? 'w-full bg-green-500' : 'w-0 bg-primary-600'
                    }`}
                  ></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center">
            <div className="h-20 w-20 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to KYC Verification</h3>
            <p className="text-sm text-gray-600 mb-6">
              To comply with financial regulations and ensure security, we need to verify your
              identity. This process will take approximately 2-3 minutes to complete.
            </p>

            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-100 mb-6">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-yellow-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-yellow-800">
                  Please have your identification documents ready and ensure you're in a well-lit
                  area.
                </p>
              </div>
            </div>

            <h4 className="text-sm font-medium text-gray-700 mb-2">
              The verification process includes:
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Basic personal information
              </li>
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Phone number verification
              </li>
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                ID document verification
              </li>
              <li className="flex items-center">
                <svg
                  className="h-4 w-4 text-green-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Information review and confirmation
              </li>
            </ul>
          </div>
        );

      case 'basic-info':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <p className="text-sm text-gray-600 mb-6">
              Please provide your basic personal information.
            </p>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={dateOfBirth}
                  onChange={e => setDateOfBirth(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Home Address
                </label>
                <input
                  type="text"
                  id="address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street address, city, state, zip code"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="documentType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ID Document Type
                </label>
                <select
                  id="documentType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={documentType}
                  onChange={e => setDocumentType(e.target.value)}
                  required
                >
                  <option value="driver-license">Driver's License</option>
                  <option value="passport">Passport</option>
                  <option value="state-id">State ID</option>
                  <option value="military-id">Military ID</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="documentNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Document Number
                </label>
                <input
                  type="text"
                  id="documentNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={documentNumber}
                  onChange={e => setDocumentNumber(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'phone-verification':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Phone Verification</h3>
            <p className="text-sm text-gray-600 mb-6">
              We'll send a 6-digit verification code to your phone number to confirm it's yours.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="(555) 123-4567"
                    required
                  />
              </div>

              {codeTimer > 0 && (
                <div>
                  <label
                    htmlFor="verificationCode"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="verificationCode"
                    maxLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-lg tracking-widest"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    required
                  />
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Code sent to {phoneNumber}
                    </p>
                    <div className="flex items-center space-x-2">
                      {codeTimer > 0 ? (
                        <span className="text-xs text-gray-500">
                          Resend in {codeTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendCode}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          disabled={processing}
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!codeTimer && phoneNumber.length >= 10 && (
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={processing}
                  className="w-full bg-primary-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Sending...' : 'Send Verification Code'}
                </button>
              )}
            </div>

              {verificationStatus === 'failed' && (
              <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
                  <div className="flex">
                    <svg
                      className="h-5 w-5 text-red-400 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833-.23 2.5 1.732 2.5z"
                      />
                    </svg>
                    <p className="text-sm text-red-800">
                    Verification failed. Please check your code and try again.
                    </p>
                  </div>
                </div>
              )}
          </div>
        );

      case 'review':
        return (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Review Information</h3>
            <p className="text-sm text-gray-600 mb-6">
              Please review your information before completing verification.
            </p>

            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-700">Full Name</dt>
                  <dd className="text-sm text-gray-900">{firstName} {lastName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Date of Birth</dt>
                  <dd className="text-sm text-gray-900">{dateOfBirth}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Address</dt>
                  <dd className="text-sm text-gray-900">{address}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Phone Number</dt>
                  <dd className="text-sm text-gray-900">{phoneNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-700">Document Type</dt>
                  <dd className="text-sm text-gray-900 capitalize">{documentType.replace('-', ' ')}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-blue-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-blue-800">
                  By proceeding, you confirm that all information provided is accurate and complete.
                </p>
              </div>
            </div>
          </div>
        );

      case 'remember-me':
        return (
          <div className="text-center">
            <div className="h-20 w-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Successful!</h3>
            <p className="text-sm text-gray-600 mb-6">
              Your identity has been verified successfully. Would you like us to remember this device for future verification?
            </p>

            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  className="mt-0.5 mr-3 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  checked={rememberDevice}
                  onChange={e => setRememberDevice(e.target.checked)}
                />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Remember this device</span>
                  <p className="text-gray-600 mt-1">
                    You won't need to complete verification again on this device for 30 days.
              </p>
                </div>
              </label>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center">
            <div className="h-20 w-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Complete!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your identity verification is now complete. You can proceed with your transaction.
            </p>
            <div className="bg-green-50 p-4 rounded-md border border-green-200">
              <p className="text-sm text-green-800">
                {autoAdvanceOnComplete 
                  ? "You will automatically be taken to the next step in a moment..."
                  : "You can now continue with your application."
                }
              </p>
            </div>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center">
            <div className="h-20 w-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Failed</h3>
            <p className="text-sm text-gray-600 mb-6">
              We were unable to verify your identity. This could be due to incorrect information or technical issues.
            </p>

            <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Common issues:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Incorrect personal information</li>
                  <li>Invalid phone number</li>
                  <li>Wrong verification code</li>
                  <li>Expired verification code</li>
              </ul>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Please try again or contact support if you continue to experience issues.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // Enhanced footer with proper validation and error handling
  const renderFooter = () => (
    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
      {/* Back Button */}
      {currentStep !== 'welcome' && currentStep !== 'complete' && currentStep !== 'failed' && (
        <button
          onClick={handleBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          disabled={processing}
        >
          Back
        </button>
      )}

      {/* Spacer for alignment when no back button */}
      {(currentStep === 'welcome' || currentStep === 'complete' || currentStep === 'failed') && <div></div>}

      {/* Status and Next/Action Buttons */}
      <div className="flex items-center space-x-3">
        {processing && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
      )}

      {currentStep === 'complete' ? (
        <button
          onClick={onClose}
            className="px-6 py-2 bg-green-600 text-sm text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Close
        </button>
      ) : currentStep === 'failed' ? (
        <button
          onClick={handleRetry}
            className="px-6 py-2 bg-primary-600 text-sm text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      ) : (
        <button
          onClick={handleNext}
            className="px-6 py-2 bg-primary-600 text-sm text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canProceed() || processing}
          >
            {processing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : currentStep === 'remember-me' ? (
              'Complete Verification'
            ) : currentStep === 'phone-verification' && verificationCode.length === 6 ? (
              'Verify Code'
            ) : currentStep === 'phone-verification' && phoneNumber.length >= 10 && codeTimer === 0 ? (
              'Send Code'
            ) : (
              'Continue'
            )}
        </button>
      )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md z-10 relative overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-primary-700">Identity Verification</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {['welcome', 'basic-info', 'phone-verification', 'review', 'remember-me'].includes(
            currentStep
          ) && renderProgressIndicator()}
          {renderStepContent()}
        </div>

        {renderFooter()}
      </div>
    </div>
  );
};

export default KYCVerificationFlow;
