import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  DocumentArrowUpIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import SessionManager from '../../services/sessionManager';
import { ApplicationProgress, ApplicationSection as SectionType } from './design-system/ApplicationProgress';
import { ApplicationSection } from './design-system/ApplicationSection';
import { FormField } from './design-system/FormField';
import { OwnershipInputToggle } from './design-system/OwnershipInputToggle';
import { TruthAboutLending } from './design-system/TruthAboutLending';
import { buttonStyles, cardStyles } from './design-system/CreditApplicationStyles';
import { debugLog } from '../../utils/auditLogger';

// Import existing components
import CreditApplication from './SafeForms/CreditApplication';
import BusinessTaxReturns from './BusinessTaxReturns';
import CreditRequestTermsDetails from './CreditRequestTermsDetails';
import DynamicFinancialStatements from './DynamicFinancialStatements';
import FinancialDocumentParser from './FinancialDocumentParser';
import PlaidIntegration from './PlaidIntegration';

interface EnhancedCreditApplicationFlowProps {
  applicationId?: string;
  onComplete?: (data: any) => void;
  initialData?: any;
}

const SECTIONS: SectionType[] = [
  {
    id: 'business-info',
    name: 'Business Info',
    status: 'available',
    totalFields: 15,
  },
  {
    id: 'owners',
    name: 'Owners',
    status: 'available',
    totalFields: 10,
  },
  {
    id: 'financial-info',
    name: 'Financial Info',
    status: 'available',
    totalFields: 8,
  },
  {
    id: 'tax-returns',
    name: 'Tax Returns',
    status: 'available',
    totalFields: 3,
  },
  {
    id: 'bank-statements',
    name: 'Bank Statements',
    status: 'available',
    totalFields: 2,
  },
  {
    id: 'documents',
    name: 'Documents',
    status: 'available',
    totalFields: 5,
  },
  {
    id: 'terms',
    name: 'Terms',
    status: 'available',
    totalFields: 6,
  },
  {
    id: 'plaid',
    name: 'Bank Connect',
    status: 'available',
    totalFields: 1,
  },
  {
    id: 'review',
    name: 'Review',
    status: 'available',
    totalFields: 1,
  },
];

export const EnhancedCreditApplicationFlow: React.FC<EnhancedCreditApplicationFlowProps> = ({
  applicationId,
  onComplete,
  initialData,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData || {});
  const [sections, setSections] = useState<SectionType[]>(SECTIONS);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      try {
        const sessionManager = SessionManager.getInstance();
        const id = await sessionManager.createSession('user-id', 'borrower', { applicationId });
        setSessionId(id);
        
        // Load saved progress
        const savedData = await sessionManager.getCreditApplicationProgress(id);
        if (savedData) {
          setFormData(savedData);
          updateSectionStatuses(savedData);
        }
      } catch (error) {
        debugLog('error', 'session_init_failed', 'Failed to initialize session', error);
      }
    };
    initSession();
  }, [applicationId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      handleSave();
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  const updateSectionStatuses = (data: any) => {
    const updatedSections = [...sections];
    
    // Check each section's completion
    updatedSections.forEach((section, index) => {
      // Logic to determine section completion based on data
      const completedFields = calculateCompletedFields(section.id, data);
      updatedSections[index] = {
        ...section,
        completedFields,
        status: completedFields === section.totalFields ? 'completed' : 
                completedFields > 0 ? 'in-progress' : 'available',
      };
    });

    setSections(updatedSections);
  };

  const calculateCompletedFields = (sectionId: string, data: any): number => {
    // Implement logic to count completed fields per section
    // This is a simplified example
    switch (sectionId) {
      case 'business-info':
        let count = 0;
        if (data.businessName) count++;
        if (data.dba) count++;
        if (data.taxId) count++;
        // ... add more field checks
        return count;
      default:
        return 0;
    }
  };

  const handleSave = async () => {
    if (!sessionId) return;
    
    setIsSaving(true);
    try {
      const sessionManager = SessionManager.getInstance();
      await sessionManager.saveCreditApplicationProgress(sessionId, currentStep, formData);
      setLastSaved(new Date());
      debugLog('info', 'application_saved', 'Credit application progress saved');
    } catch (error) {
      debugLog('error', 'save_failed', 'Failed to save application progress', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to any available or completed section
    const targetSection = sections[stepIndex];
    if (targetSection.status !== 'locked') {
      setCurrentStep(stepIndex);
    }
  };

  const handleNext = () => {
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Convert ApplicationProgress status to ApplicationSection status
  const convertStatus = (status: 'completed' | 'in-progress' | 'locked' | 'available'): 'not-started' | 'in-progress' | 'completed' | 'error' => {
    switch (status) {
      case 'completed':
        return 'completed';
      case 'in-progress':
        return 'in-progress';
      case 'available':
        return 'not-started';
      case 'locked':
        return 'not-started';
      default:
        return 'not-started';
    }
  };

  const renderStepContent = () => {
    const currentSection = sections[currentStep];

    switch (currentSection.id) {
      case 'business-info':
        return (
          <div className="space-y-6">
            {/* EVA Truth About Lending */}
            <TruthAboutLending variant="expandable" />

            <ApplicationSection
              title="Business Information"
              description="Tell us about your business"
              icon={<BuildingOfficeIcon className="h-6 w-6" />}
              status={convertStatus(currentSection.status)}
              completedFields={currentSection.completedFields}
              totalFields={currentSection.totalFields}
              errors={validationErrors['business-info']}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Legal Business Name"
                  name="businessName"
                  value={formData.businessName || ''}
                  onChange={(value) => setFormData({ ...formData, businessName: value })}
                  required
                  placeholder="Enter your legal business name"
                  helpText="As registered with the state"
                />
                <FormField
                  label="DBA (Doing Business As)"
                  name="dba"
                  value={formData.dba || ''}
                  onChange={(value) => setFormData({ ...formData, dba: value })}
                  placeholder="Enter DBA if different from legal name"
                />
                <FormField
                  label="Federal Tax ID (EIN)"
                  name="taxId"
                  value={formData.taxId || ''}
                  onChange={(value) => setFormData({ ...formData, taxId: value })}
                  required
                  placeholder="XX-XXXXXXX"
                  helpText="9-digit Employer Identification Number"
                />
                <FormField
                  label="Business Phone"
                  name="businessPhone"
                  type="tel"
                  value={formData.businessPhone || ''}
                  onChange={(value) => setFormData({ ...formData, businessPhone: value })}
                  required
                  placeholder="(555) 123-4567"
                />
              </div>
            </ApplicationSection>

            <ApplicationSection
              title="Business Address"
              description="Primary business location"
              icon={<BuildingOfficeIcon className="h-6 w-6" />}
              status="not-started"
              totalFields={5}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <FormField
                    label="Street Address"
                    name="streetAddress"
                    value={formData.streetAddress || ''}
                    onChange={(value) => setFormData({ ...formData, streetAddress: value })}
                    required
                    placeholder="123 Main Street"
                  />
                </div>
                <FormField
                  label="City"
                  name="city"
                  value={formData.city || ''}
                  onChange={(value) => setFormData({ ...formData, city: value })}
                  required
                  placeholder="New York"
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="State"
                    name="state"
                    type="select"
                    value={formData.state || ''}
                    onChange={(value) => setFormData({ ...formData, state: value })}
                    required
                    options={[
                      { value: 'NY', label: 'New York' },
                      { value: 'CA', label: 'California' },
                      { value: 'TX', label: 'Texas' },
                      // Add more states
                    ]}
                  />
                  <FormField
                    label="ZIP Code"
                    name="zipCode"
                    value={formData.zipCode || ''}
                    onChange={(value) => setFormData({ ...formData, zipCode: value })}
                    required
                    placeholder="10001"
                  />
                </div>
              </div>
            </ApplicationSection>
          </div>
        );

      case 'owners':
        return (
          <ApplicationSection
            title="Business Ownership"
            description="Tell us about the business owners"
            icon={<UserGroupIcon className="h-6 w-6" />}
            status={convertStatus(currentSection.status)}
            completedFields={currentSection.completedFields}
            totalFields={currentSection.totalFields}
          >
            <div className="space-y-6">
              {/* Ownership Toggle Demo */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Owner 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Owner Name"
                    name="owner1Name"
                    value={formData.owner1Name || ''}
                    onChange={(value) => setFormData({ ...formData, owner1Name: value })}
                    required
                  />
                  <OwnershipInputToggle
                    mode={formData.ownershipMode || 'percentage'}
                    onModeChange={(mode) => setFormData({ ...formData, ownershipMode: mode })}
                    value={formData.owner1Ownership || 0}
                    onChange={(value) => setFormData({ ...formData, owner1Ownership: value })}
                    totalShares={formData.totalShares || 1000}
                    onTotalSharesChange={(total) => setFormData({ ...formData, totalShares: total })}
                    required
                  />
                </div>
              </div>
            </div>
          </ApplicationSection>
        );

      // For other sections, use existing components wrapped in new design
      case 'financial-info':
        return (
          <ApplicationSection
            title="Financial Information"
            icon={<ChartBarIcon className="h-6 w-6" />}
            status={convertStatus(currentSection.status)}
            completedFields={currentSection.completedFields}
            totalFields={currentSection.totalFields}
          >
            <DynamicFinancialStatements />
          </ApplicationSection>
        );

      default:
        return (
          <div className={cardStyles()}>
            <p className="p-6 text-center text-gray-500">
              Section content for {currentSection.name} coming soon...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Progress Bar */}
        <div className={`${cardStyles({ variant: 'elevated' })} p-6 mb-6`}>
          <ApplicationProgress
            currentStep={currentStep}
            totalSteps={sections.length}
            sections={sections}
            onStepClick={handleStepClick}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canNavigateNext={currentStep < sections.length - 1}
            canNavigatePrevious={currentStep > 0}
            lastSaved={lastSaved}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className={buttonStyles({ variant: 'ghost', size: 'md' })}
          >
            Save & Exit
          </button>
          
          <div className="flex space-x-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={buttonStyles({ variant: 'outline', size: 'md' })}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === sections.length - 1}
              className={buttonStyles({ variant: 'primary', size: 'lg' })}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};