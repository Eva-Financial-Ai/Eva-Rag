import {
  BanknotesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CpuChipIcon,
  CreditCardIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import SessionManager from '../../services/sessionManager';
import BusinessTaxReturns from './BusinessTaxReturns';
import CreditRequestTermsDetails from './CreditRequestTermsDetails';
import DynamicFinancialStatements from './DynamicFinancialStatements';
import FinancialDocumentParser from './FinancialDocumentParser';
import PlaidIntegration from './PlaidIntegration';
import CreditApplication from './SafeForms/CreditApplication';

import { debugLog } from '../../utils/auditLogger';

interface CreditApplicationFlowProps {
  applicationId?: string;
  onComplete?: (data: any) => void;
  initialData?: any;
}

interface StepIndicatorProps {
  steps: Array<{
    id: number;
    name: string;
    description: string;
    icon: React.ReactNode;
    status: 'complete' | 'current' | 'upcoming';
    isClickable: boolean;
  }>;
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="border-b border-gray-200 bg-white px-4 py-6">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-center space-x-2 md:space-x-4">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className="relative flex flex-1 flex-col items-center text-center">
              <button
                type="button"
                className={`group relative flex flex-col items-center text-left transition-opacity ${step.isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} ${!step.isClickable && step.status === 'upcoming' ? 'opacity-50' : ''}`}
                onClick={() => step.isClickable && onStepClick(step.id)}
                disabled={!step.isClickable}
                aria-label={`Go to step ${step.id}: ${step.name}`}
                title={step.isClickable ? `Click to go to ${step.name}` : 'Complete previous steps first'}
              >
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
                    step.status === 'complete'
                      ? 'bg-green-600 group-hover:bg-green-700 group-hover:scale-110'
                      : step.status === 'current'
                        ? 'border-2 border-blue-600 bg-blue-50 group-hover:bg-blue-100 group-hover:scale-110'
                        : step.isClickable
                          ? 'border-2 border-gray-300 bg-white group-hover:border-blue-400 group-hover:bg-blue-50 group-hover:scale-110'
                          : 'border-2 border-gray-300 bg-white'
                  }`}
                >
                  {step.status === 'complete' ? (
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  ) : (
                    <span
                      className={`h-5 w-5 ${
                        step.status === 'current' ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {step.icon}
                    </span>
                  )}
                </div>

                {/* Step name */}
                <div className="mt-3">
                  <span
                    className={`block text-xs font-medium ${
                      step.status === 'complete'
                        ? 'text-green-600'
                        : step.status === 'current'
                          ? 'text-blue-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              </button>

              {/* Step connector line */}
              {stepIdx < steps.length - 1 && (
                <div
                  className={`absolute left-1/2 top-5 h-0.5 w-full pointer-events-none ${
                    step.status === 'complete' ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  style={{ transform: 'translateX(2.5rem)' }}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
};

interface ApplicationData {
  businessInformation: any;
  plaidAccounts: any[];
  taxDocuments: any[];
  financialDocuments: any[];
  accountingIntegrations: any[];
  termsRequest: any;
  signatures: {
    applicant: string;
    witness?: string;
  };
}

// Session persistence utilities using Cloudflare-compatible caching
const SESSION_STORAGE_KEY = 'eva_credit_application';
const SESSION_EXPIRY_HOURS = 24; // 24 hour session retention

const saveToSession = (data: any, step: number) => {
  try {
    const sessionData = {
      data,
      step,
      timestamp: Date.now(),
      expiresAt: Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000,
      userAgent: navigator.userAgent,
      ipFingerprint: window.location.hostname,
    };

    // Save to localStorage for immediate access
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));

    // Also save to session storage for tab-specific persistence
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));

    debugLog('general', 'log_statement', '[Session] Data saved to session storage:', {
      step,
      timestamp: sessionData.timestamp,
    })
  } catch (error) {
    console.error('[Session] Failed to save session data:', error);
  }
};

const loadFromSession = (): { data: any; step: number } | null => {
  try {
    // Try localStorage first, then sessionStorage
    const storedData =
      localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!storedData) return null;

    const sessionData = JSON.parse(storedData);

    // Check if session has expired
    if (Date.now() > sessionData.expiresAt) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      debugLog('general', 'log_statement', '[Session] Session expired, cleared storage')
      return null;
    }

    debugLog('general', 'log_statement', '[Session] Loaded data from session:', {
      step: sessionData.step,
      age: Math.round((Date.now() - sessionData.timestamp) / 1000 / 60) + ' minutes',
    });

    return { data: sessionData.data, step: sessionData.step };
  } catch (error) {
    console.error('[Session] Failed to load session data:', error);
    return null;
  }
};

const clearSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  debugLog('general', 'log_statement', '[Session] Session data cleared')
};

const CreditApplicationFlow: React.FC<CreditApplicationFlowProps> = ({
  applicationId = `APP-${Date.now()}`,
  onComplete,
  initialData,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    businessInformation: {},
    plaidAccounts: [],
    taxDocuments: [],
    financialDocuments: [],
    accountingIntegrations: [],
    termsRequest: {},
    signatures: {
      applicant: '',
      witness: '',
    },
  });
  const [associatedUsers, setAssociatedUsers] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle',
  );

  const sessionManager = SessionManager.getInstance();

  // Define steps early and memoize
  const steps = useMemo(
    () => [
      {
        id: 1,
        name: 'Business Information',
        description: 'Basic company details',
        icon: <DocumentTextIcon className="h-5 w-5" />,
        status: 'upcoming',
        component: 'businessInfo',
      },
      {
        id: 2,
        name: 'Credit Terms',
        description: 'Loan requirements',
        icon: <BanknotesIcon className="h-5 w-5" />,
        component: 'termsRequest',
      },
      {
        id: 3,
        name: 'Bank Accounts',
        description: 'Plaid verification',
        icon: <CreditCardIcon className="h-5 w-5" />,
        component: 'plaidIntegration',
      },
      {
        id: 4,
        name: 'Accounting',
        description: 'Financial systems',
        icon: <ChartBarIcon className="h-5 w-5" />,
        component: 'accountingIntegration',
      },
      {
        id: 5,
        name: 'Tax Returns',
        description: 'IRS documents',
        icon: <DocumentArrowUpIcon className="h-5 w-5" />,
        component: 'taxReturns',
      },
      {
        id: 6,
        name: 'Documents',
        description: 'Financial statements',
        icon: <ClipboardDocumentCheckIcon className="h-5 w-5" />,
        component: 'financialDocuments',
      },
      {
        id: 7,
        name: 'Team Members',
        description: 'Associate users',
        icon: <UserGroupIcon className="h-5 w-5" />,
        component: 'associateUsers',
      },
      {
        id: 8,
        name: 'AI Review',
        description: 'Automated verification',
        icon: <CpuChipIcon className="h-5 w-5" />,
        component: 'aiReview',
      },
      {
        id: 9,
        name: 'Review & Sign',
        description: 'Complete application',
        icon: <PencilSquareIcon className="h-5 w-5" />,
        component: 'review',
      },
    ],
    [],
  ); // Dependencies for useMemo would include anything dynamic that recreates steps

  // Moved handleApplicationComplete up
  const handleApplicationComplete = useCallback(async () => {
    setIsSubmitting(true);
    setAutoSaveStatus('saving');
    debugLog('general', 'log_statement', '[CreditApplication] Application completion initiated.')

    // Final save to session
    try {
      if (sessionId) {
        await sessionManager.updateSession(sessionId, {
          creditApplicationState: {
            currentStep,
            formData: applicationData,
            status: 'completed',
            completedAt: Date.now(),
          },
        });
        debugLog('general', 'log_statement', '[CreditApplication] Final application state saved to session:', sessionId)
      }
      localStorage.setItem(
        'credit_application_final_' + applicationId,
        JSON.stringify(applicationData),
      );
      clearSession(); // Clear the session storage after successful completion
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('[CreditApplication] Error saving final application state:', error);
      setAutoSaveStatus('error');
    }

    if (onComplete) {
      onComplete(applicationData);
    } else {
      // Fallback navigation if onComplete is not provided
      navigate('/credit/application-submitted', { state: { applicationId } });
    }

    setIsSubmitting(false);
    debugLog('general', 'log_statement', '[CreditApplication] Application successfully submitted and completed.')
  }, [
    applicationId,
    applicationData,
    onComplete,
    navigate,
    sessionId,
    currentStep,
    sessionManager,
  ]);

  // Initialize session and load previous progress
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Check for existing session
        const existingSessionId = localStorage.getItem('eva_credit_application_session');

        if (existingSessionId) {
          const existingSession = await sessionManager.getSession(existingSessionId);
          if (existingSession?.creditApplicationState) {
            // Resume previous session
            const { currentStep: savedStep, formData: savedFormData } =
              existingSession.creditApplicationState;
            setCurrentStep(savedStep || 1);
            setApplicationData(savedFormData || {});
            setCompletedSteps(
              new Set(Array.from({ length: (savedStep || 1) - 1 }, (_, i) => i + 1)),
            );
            setSessionId(existingSessionId);
            debugLog('general', 'log_statement', '[CreditApplication] Resumed existing session:', existingSessionId)
            return;
          }
        }

        // Create new session
        const newSessionId = await sessionManager.createSession(
          'temp_user', // Replace with actual user ID when auth is implemented
          'borrower',
          { creditApplicationStarted: Date.now() },
        );

        setSessionId(newSessionId);
        localStorage.setItem('eva_credit_application_session', newSessionId);
        debugLog('general', 'log_statement', '[CreditApplication] Created new session:', newSessionId)
      } catch (error) {
        console.error('[CreditApplication] Session initialization failed:', error);
      }
    };

    initializeSession();
  }, [sessionManager]);

  // Auto-save progress every time form data or step changes
  useEffect(() => {
    if (!sessionId) return;

    const autoSave = async () => {
      setAutoSaveStatus('saving');
      try {
        await sessionManager.saveCreditApplicationProgress(sessionId, currentStep, applicationData);
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('[CreditApplication] Auto-save failed:', error);
        setAutoSaveStatus('error');
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }
    };

    const debounceTimer = setTimeout(autoSave, 1000); // Debounce auto-save
    return () => clearTimeout(debounceTimer);
  }, [currentStep, applicationData, sessionId, sessionManager]);

  // Effect to check for application completion
  useEffect(() => {
    if (currentStep > steps.length && !isSubmitting) {
      // Now steps.length is available
      handleApplicationComplete();
    }
  }, [currentStep, steps.length, handleApplicationComplete, isSubmitting]);

  // Update step status based on currentStep and completedSteps
  const updatedSteps = useMemo(
    () =>
      steps.map(step => ({
        ...step,
        status: completedSteps.has(step.id)
          ? ('complete' as const)
          : step.id === currentStep
            ? ('current' as const)
            : ('upcoming' as const),
        isClickable: completedSteps.has(step.id) || step.id <= currentStep,
      })),
    [steps, currentStep, completedSteps],
  );

  // Handle step navigation
  const handleStepClick = (stepNumber: number) => {
    debugLog('general', 'log_statement', `[Navigation] Step clicked: ${stepNumber}`)
    const step = updatedSteps.find(s => s.id === stepNumber);
    debugLog('general', 'log_statement', `[Navigation] Step found:`, { step, isClickable: step?.isClickable })
    if (step && step.isClickable) {
      setCurrentStep(stepNumber);
      debugLog('general', 'log_statement', `[Navigation] Moved to step ${stepNumber}: ${step.name}`)
    } else {
      debugLog('general', 'log_statement', `[Navigation] Step ${stepNumber} is not clickable or not found`)
    }
  };

  // Handle step completion
  const handleStepComplete = useCallback(
    (stepData: any) => {
      debugLog('general', 'log_statement', `[CreditApplicationFlow] Step ${currentStep} completed:`, stepData)

      setApplicationData(prev => {
        const updatedData = { ...prev };

        switch (currentStep) {
          case 1:
            updatedData.businessInformation = stepData;
            break;
          case 2:
            updatedData.termsRequest = stepData;
            break;
          case 3:
            updatedData.plaidAccounts = stepData;
            break;
          case 4:
            updatedData.accountingIntegrations = stepData;
            break;
          case 5:
            updatedData.taxDocuments = stepData;
            break;
          case 6:
            updatedData.financialDocuments = stepData;
            break;
          case 7:
            // Associate users data handled separately
            break;
          case 8:
            updatedData.signatures = stepData;
            break;
        }

        return updatedData;
      });

      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentStep]));

      // Advance to next step or complete
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleApplicationComplete();
      }
    },
    [currentStep, steps.length, handleApplicationComplete],
  );

  // Navigation handlers
  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Enhanced Continue Without functionality
  const handleContinueWithoutData = (stepData: any = {}) => {
    debugLog('general', 'log_statement', `[CreditApplicationFlow] Continuing step ${currentStep} without data`)
    handleStepComplete(stepData);
  };

  // Render current step component
  const renderStepComponent = () => {
    const currentStepData = steps[currentStep - 1];

    switch (currentStepData.component) {
      case 'businessInfo':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Business Information</h2>
              <p className="text-gray-600">Provide basic company details and entity information</p>
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-700">
                  💡 <strong>Shares vs Percentage:</strong> You can enter ownership as either shares
                  or percentage. Use the toggle in the ownership section to switch between input
                  methods.
                </p>
              </div>
            </div>
            <CreditApplication
              onSubmit={handleStepComplete}
              onSave={data => {
                setApplicationData(prev => ({ ...prev, businessInformation: data }));
                saveToSession({ ...applicationData, businessInformation: data }, currentStep);
              }}
              initialData={applicationData.businessInformation}
            />
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => handleContinueWithoutData(applicationData.businessInformation)}
                className="rounded-md border border-blue-600 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
              >
                Continue with Current Info
              </button>
            </div>
          </div>
        );

      case 'termsRequest':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Credit Terms Request</h2>
              <p className="text-gray-600">Specify your funding requirements and preferred terms</p>
            </div>
            <CreditRequestTermsDetails
              onSubmit={handleStepComplete}
              initialData={applicationData.termsRequest}
            />
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => handleContinueWithoutData(applicationData.termsRequest)}
                className="rounded-md border border-blue-600 px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
              >
                Skip for Now
              </button>
            </div>
          </div>
        );

      case 'plaidIntegration':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Bank Account Verification</h2>
              <p className="text-gray-600">
                Securely connect your bank accounts for instant verification
              </p>
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-700">
                  🏦 Connect your accounts for faster processing and better loan terms
                </p>
              </div>
            </div>
            <PlaidIntegration applicationId="temp-app-id" onAccountsLinked={handleStepComplete} />
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => handleContinueWithoutData(applicationData.plaidAccounts)}
                className="rounded-md border border-gray-300 px-6 py-2 text-gray-600 transition-colors hover:bg-gray-50"
              >
                Continue Without Bank Connection
              </button>
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Manual Entry Instead
              </button>
            </div>
          </div>
        );

      case 'accountingIntegration':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Accounting & Payment Integration
              </h2>
              <p className="text-gray-600">
                Connect QuickBooks, Stripe, NetSuite for automated financial data
              </p>
              <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
                <p className="text-sm text-purple-700">
                  💼 Integration with your existing systems speeds up the approval process
                </p>
              </div>
            </div>
            <DynamicFinancialStatements
              onDocumentsGenerated={handleStepComplete}
              userType="borrower"
            />
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => handleContinueWithoutData(applicationData.accountingIntegrations)}
                className="rounded-md border border-gray-300 px-6 py-2 text-gray-600 transition-colors hover:bg-gray-50"
              >
                Continue Without Integration
              </button>
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="rounded-md bg-purple-600 px-6 py-2 text-white transition-colors hover:bg-purple-700"
              >
                Manual Upload Instead
              </button>
            </div>
          </div>
        );

      case 'taxReturns':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Tax Returns & IRS Integration
              </h2>
              <p className="text-gray-600">
                Upload tax documents or connect directly to IRS for verification
              </p>
              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-700">
                  📋 Tax returns are typically required for loan amounts over $100,000
                </p>
              </div>
            </div>
            <BusinessTaxReturns
              transactionAmount={applicationData.termsRequest?.requestedAmount || 0}
              financialInstrument={applicationData.termsRequest?.financialInstrument || ''}
              entityType={applicationData.businessInformation?.businessEntityType || ''}
              onTaxDocumentsChange={handleStepComplete}
            />
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => handleContinueWithoutData(applicationData.taxDocuments)}
                className="rounded-md border border-gray-300 px-6 py-2 text-gray-600 transition-colors hover:bg-gray-50"
              >
                Continue Without Tax Documents
              </button>
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="rounded-md bg-yellow-600 px-6 py-2 text-white transition-colors hover:bg-yellow-700"
              >
                Upload Later
              </button>
            </div>
          </div>
        );

      case 'financialDocuments':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Financial Document Upload</h2>
              <p className="text-gray-600">
                Upload financial statements, bank statements, and other supporting documents
              </p>
              <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-sm text-indigo-700">
                  📄 Upload your most recent financial statements for faster processing
                </p>
              </div>
            </div>
            <FinancialDocumentParser onParsingComplete={handleStepComplete} />
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => handleContinueWithoutData(applicationData.financialDocuments)}
                className="rounded-md border border-gray-300 px-6 py-2 text-gray-600 transition-colors hover:bg-gray-50"
              >
                Continue Without Additional Documents
              </button>
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="rounded-md bg-indigo-600 px-6 py-2 text-white transition-colors hover:bg-indigo-700"
              >
                Submit What I Have
              </button>
            </div>
          </div>
        );

      case 'associateUsers':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Associate Users & Team Members
              </h2>
              <p className="text-gray-600">Add team members and stakeholders to this application</p>
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm text-emerald-700">
                  👥 Team members can view application status and provide additional documentation
                </p>
              </div>
            </div>

            {/* Enhanced User Association Component */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Team Member Email
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="team@company.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Role & Permissions
                    </label>
                    <select className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select Role</option>
                      <option value="admin">Administrator - Full Access</option>
                      <option value="viewer">Viewer - Read Only</option>
                      <option value="contributor">Contributor - Can Edit</option>
                      <option value="signer">Authorized Signer</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Department/Title
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CFO, Finance Manager, etc."
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notify-user"
                      className="mr-2 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="notify-user" className="text-sm text-gray-600">
                      Send notification email to user
                    </label>
                  </div>
                  <button
                    type="button"
                    className="rounded-md bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
                  >
                    Add Team Member
                  </button>
                </div>
              </div>

              {/* Added Users List */}
              <div className="mt-6 border-t pt-4">
                <h4 className="mb-3 text-sm font-medium text-gray-700">Added Team Members</h4>
                <div className="text-sm text-gray-500">
                  No team members added yet. Team members will appear here after being added.
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => handleContinueWithoutData({})}
                className="rounded-md border border-gray-300 px-6 py-2 text-gray-600 transition-colors hover:bg-gray-50"
              >
                Continue Without Team Members
              </button>
              <button
                onClick={() => handleStepComplete(associatedUsers)}
                className="rounded-md bg-emerald-600 px-6 py-2 text-white transition-colors hover:bg-emerald-700"
              >
                Continue to AI Review
              </button>
            </div>
          </div>
        );

      case 'aiReview':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">AI Review & Verification</h2>
              <p className="text-gray-600">
                Our AI system performs automated verification and risk assessment
              </p>
              <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-4">
                <p className="text-sm text-purple-700">
                  🤖 EVA AI is analyzing your application for completeness and accuracy
                </p>
              </div>
            </div>

            {/* AI Review Component */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">AI Verification Progress</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                      <svg
                        className="h-5 w-5 text-white"
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
                    <div>
                      <h4 className="font-medium text-green-800">Business Information</h4>
                      <p className="text-sm text-green-600">Verified and complete</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-700">✓ Complete</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                      <svg
                        className="h-5 w-5 text-white"
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
                    <div>
                      <h4 className="font-medium text-green-800">Financial Data</h4>
                      <p className="text-sm text-green-600">Bank accounts and documents verified</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-700">✓ Complete</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                      <svg
                        className="h-5 w-5 animate-spin text-white"
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
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800">Risk Assessment</h4>
                      <p className="text-sm text-blue-600">Analyzing credit risk and compliance</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-blue-700">⏳ Processing</span>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-medium text-gray-800">AI Insights</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Strong financial position with consistent cash flow</li>
                  <li>• Industry risk level: Moderate</li>
                  <li>• Documentation completeness: 95%</li>
                  <li>• Recommended for fast-track processing</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={() => handleContinueWithoutData({})}
                className="rounded-md border border-gray-300 px-6 py-2 text-gray-600 transition-colors hover:bg-gray-50"
              >
                Skip AI Review
              </button>
              <button
                onClick={() => {
                  // Simulate AI review completion
                  setTimeout(() => {
                    handleStepComplete({ aiReviewComplete: true, riskScore: 85 });
                  }, 2000);
                }}
                className="rounded-md bg-purple-600 px-6 py-2 text-white transition-colors hover:bg-purple-700"
              >
                Proceed to Final Review
              </button>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">
                Review & Electronic Signature
              </h2>
              <p className="text-gray-600">
                Review your application and provide electronic signatures
              </p>
            </div>

            {/* Application Summary with Session Info */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Application Summary</h3>
                <div className="text-xs text-gray-500">
                  Session saved • Auto-saved{' '}
                  {Math.round(
                    (Date.now() - (loadFromSession()?.data?.timestamp || Date.now())) / 1000 / 60,
                  )}{' '}
                  min ago
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <span className="font-medium">Company:</span>{' '}
                  {applicationData.businessInformation?.legalBusinessName || 'Not provided'}
                </div>
                <div>
                  <span className="font-medium">Requested Amount:</span> $
                  {applicationData.termsRequest?.requestedAmount?.toLocaleString() ||
                    'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Term Length:</span>{' '}
                  {applicationData.termsRequest?.requestedTermMonths || 'Not specified'} months
                </div>
                <div>
                  <span className="font-medium">Financial Instrument:</span>{' '}
                  {applicationData.termsRequest?.financialInstrument || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Bank Accounts Connected:</span>{' '}
                  {applicationData.plaidAccounts?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Tax Documents:</span>{' '}
                  {applicationData.taxDocuments?.length || 0} uploaded
                </div>
                <div>
                  <span className="font-medium">Financial Documents:</span>{' '}
                  {applicationData.financialDocuments?.length || 0} uploaded
                </div>
                <div>
                  <span className="font-medium">Team Members:</span> {associatedUsers?.length || 0}{' '}
                  added
                </div>
              </div>

              {/* Completion Status */}
              <div className="mt-4 rounded-lg bg-blue-50 p-3">
                <div className="flex items-center">
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Application is {Math.round((completedSteps.size / steps.length) * 100)}%
                    complete
                  </span>
                </div>
              </div>
            </div>

            {/* Electronic Signature Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Electronic Signature & Authorization</h3>

              <div className="mb-6 space-y-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 font-medium text-gray-800">
                    By signing this application, you certify that:
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>
                      • All information provided is true and accurate to the best of your knowledge
                    </li>
                    <li>• You authorize EVA AI Platform to verify the information provided</li>
                    <li>
                      • You consent to credit checks and background investigations as necessary
                    </li>
                    <li>• You understand this is a legal document with binding obligations</li>
                  </ul>
                </div>
              </div>

              <div className="mb-4 rounded-md border border-gray-300 bg-gray-50 p-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Electronic Signature *
                </label>
                <SignaturePad
                  canvasProps={{
                    width: 400,
                    height: 150,
                    className: 'signature-canvas bg-white rounded border',
                  }}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Sign above using your mouse, trackpad, or touch screen
                </p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50"
                  onClick={() => {
                    // Clear signature logic here
                  }}
                >
                  Clear Signature
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // Save as draft
                      saveToSession(applicationData, currentStep);
                      alert('Application saved as draft! You can return later to complete it.');
                    }}
                    className="rounded-md border border-blue-600 px-6 py-2 text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    Save as Draft
                  </button>
                  <button
                    onClick={() => {
                      const signatureData = {
                        applicant: 'signature-data-here',
                        timestamp: new Date().toISOString(),
                        ipAddress: window.location.hostname,
                        userAgent: navigator.userAgent,
                      };
                      handleStepComplete(signatureData);
                    }}
                    disabled={isSubmitting}
                    className="rounded-md bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="-ml-1 mr-3 inline h-4 w-4 animate-spin text-white"
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
                        Submitting Application...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="py-12 text-center">
            <div className="text-gray-500">Step not found</div>
            <button
              onClick={() => setCurrentStep(1)}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Return to Start
            </button>
          </div>
        );
    }
  };

  const handleUsersComplete = async (users: any[]) => {
    debugLog('general', 'log_statement', 'Users associated:', users)
    setAssociatedUsers(users);

    // Complete the flow and submit to backend
    const completeData = {
      applicationId,
      application: applicationData,
      associatedUsers: users,
      submittedAt: new Date().toISOString(),
    };

    try {
      // Submit the complete application to backend
      const response = await fetch('/api/credit-applications/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit credit application');
      }

      const result = await response.json();
      debugLog('general', 'log_statement', 'Credit application submitted successfully:', result)

      // Show success message
      alert('Credit application submitted successfully!');

      onComplete?.(result);
    } catch (error) {
      console.error('Error submitting credit application:', error);
      // Still call onComplete with local data
      onComplete?.(completeData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <StepIndicator
            steps={updatedSteps}
            currentStep={currentStep}
            onStepClick={handleStepClick}
          />
          <div className="mt-4 text-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.name}
            </h1>
            <p className="mt-1 text-gray-600">{steps[currentStep - 1]?.description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {renderStepComponent()}
        </div>

        {/* Navigation */}
        {currentStep > 1 && currentStep < steps.length && (
          <div className="mt-6 flex justify-between">
            <button
              onClick={goToPreviousStep}
              className="rounded-md border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Previous Step
            </button>
            <button
              onClick={goToNextStep}
              className="rounded-md bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Next Step
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditApplicationFlow;
