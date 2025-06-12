import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import {
  SmartMatchingInstrument,
  InstrumentType,
  CollateralType,
  RiskToleranceLevel,
  VALIDATION_CONSTANTS,
  DEFAULT_EQUIPMENT_INSTRUMENT,
  DEFAULT_REAL_ESTATE_INSTRUMENT,
  DEFAULT_GENERAL_INSTRUMENT,
} from '../../types/SmartMatchingTypes';
import {
  documentAutoRequestEngine,
  DocumentRequirements,
  ApplicationData,
} from '../../services/DocumentAutoRequestEngine';
import DocumentRequirementsSection from '../../components/documents/DocumentRequirementsSection';
import {
  BookmarkIcon as SaveIcon,
  XMarkIcon as XIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  DocumentIcon,
  LightBulbIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

interface RequirementNotification {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  documents?: string[];
  timestamp: Date;
}

const SmartMatchingInstrumentForm: React.FC = () => {
  const { instrumentId } = useParams<{ instrumentId?: string }>();
  const { hasPermission } = useUserPermissions();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get instrument type from URL params for new instruments
  const searchParams = new URLSearchParams(location.search);
  const typeParam = searchParams.get('type') as InstrumentType;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState<string>('basic');
  const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirements | null>(
    null
  );
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, any>>({});
  const [notifications, setNotifications] = useState<RequirementNotification[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Get instrument type from URL params for new instruments

  // Form state
  const [formData, setFormData] = useState<Partial<SmartMatchingInstrument>>(() => {
    if (instrumentId) {
      // TODO: Load existing instrument data
      return {};
    } else {
      // Return default based on type
      switch (typeParam) {
        case InstrumentType.EQUIPMENT:
          return { ...DEFAULT_EQUIPMENT_INSTRUMENT, instrumentType: typeParam };
        case InstrumentType.REAL_ESTATE:
          return { ...DEFAULT_REAL_ESTATE_INSTRUMENT, instrumentType: typeParam };
        case InstrumentType.GENERAL:
          return { ...DEFAULT_GENERAL_INSTRUMENT, instrumentType: typeParam };
        default:
          return { ...DEFAULT_EQUIPMENT_INSTRUMENT, instrumentType: InstrumentType.EQUIPMENT };
      }
    }
  });

  // Sample application data for preview
  const [previewApplicationData, setPreviewApplicationData] = useState<Partial<ApplicationData>>({
    loanAmount: 350000,
    loanType: formData.instrumentType || InstrumentType.EQUIPMENT,
    businessAgeMonths: 24,
    currentYearGrossRevenue: 750000,
    requestedTermMonths: 60,
    debtServiceCoverageRatio: 1.35,
    hasBankruptcy: false,
    equifax: 720,
    experian: 715,
    transunion: 710,
    industryCode: '237',
    requestDate: new Date(),
  });

  useEffect(() => {
    if (!hasPermission('smartMatch', 'MODIFY')) {
      navigate('/customer-retention/customers');
      return;
    }

    if (instrumentId) {
      loadInstrument(instrumentId);
    }
  }, [instrumentId, hasPermission, navigate]);

  // Generate document requirements when form data changes
  useEffect(() => {
    if (showPreview && previewApplicationData.loanAmount) {
      try {
        const fullApplicationData: ApplicationData = {
          loanAmount: previewApplicationData.loanAmount,
          loanType: previewApplicationData.loanType || InstrumentType.EQUIPMENT,
          businessAgeMonths: previewApplicationData.businessAgeMonths || 0,
          currentYearGrossRevenue: previewApplicationData.currentYearGrossRevenue || 0,
          requestedTermMonths: previewApplicationData.requestedTermMonths || 60,
          debtServiceCoverageRatio: previewApplicationData.debtServiceCoverageRatio || 1.0,
          hasBankruptcy: previewApplicationData.hasBankruptcy || false,
          equifax: previewApplicationData.equifax || 0,
          experian: previewApplicationData.experian || 0,
          transunion: previewApplicationData.transunion || 0,
          industryCode: previewApplicationData.industryCode || '',
          requestDate: previewApplicationData.requestDate || new Date(),
          smartMatchingInstrument: formData as SmartMatchingInstrument,
          ...previewApplicationData,
        };

        const requirements = documentAutoRequestEngine.generateRequirements(fullApplicationData);
        setDocumentRequirements(requirements);

        // Generate notification for requirement changes
        if (documentRequirements) {
          generateRequirementChangeNotification(documentRequirements, requirements);
        }
      } catch (error) {
        console.error('Error generating document requirements:', error);
      }
    }
  }, [showPreview, previewApplicationData, formData, documentRequirements]);

  const generateRequirementChangeNotification = (
    oldRequirements: DocumentRequirements,
    newRequirements: DocumentRequirements
  ) => {
    // Calculate differences between old and new requirements
    const oldDocs = new Set(oldRequirements.required.map(doc => doc.id));
    const newDocs = new Set(newRequirements.required.map(doc => doc.id));
    
    const added = newRequirements.required.filter(doc => !oldDocs.has(doc.id)).map(doc => doc.name);
    const removed = oldRequirements.required.filter(doc => !newDocs.has(doc.id)).map(doc => doc.name);
    
    if (added.length > 0) {
      const notification: RequirementNotification = {
        id: `req-added-${Date.now()}`,
        type: 'info',
        title: 'New Document Requirements',
        message: `${added.length} new document(s) will be required based on these instrument settings.`,
        documents: added,
        timestamp: new Date(),
      };
      setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5
    }

    if (removed.length > 0) {
      const notification: RequirementNotification = {
        id: `req-removed-${Date.now()}`,
        type: 'success',
        title: 'Requirements Reduced',
        message: `${removed.length} document(s) are no longer required.`,
        documents: removed,
        timestamp: new Date(),
      };
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    }
  };

  const loadInstrument = async (id: string) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const instrument = await smartMatchingService.getInstrument(id);
      // setFormData(instrument);
    } catch (error) {
      console.error('Failed to load instrument:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNestedInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));

    const errorKey = `${section}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const handlePreviewDataChange = (field: string, value: any) => {
    setPreviewApplicationData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.instrumentName?.trim()) {
      newErrors['instrumentName'] = 'Instrument name is required';
    }

    // Deal killers validation
    if (
      !formData.dealKillers?.minimumBusinessRevenue ||
      formData.dealKillers.minimumBusinessRevenue < VALIDATION_CONSTANTS.MIN_REVENUE
    ) {
      newErrors['dealKillers.minimumBusinessRevenue'] = 'Minimum business revenue is required';
    }

    if (
      !formData.dealKillers?.debtServiceCoverageRatio ||
      formData.dealKillers.debtServiceCoverageRatio < VALIDATION_CONSTANTS.MIN_DSCR
    ) {
      newErrors['dealKillers.debtServiceCoverageRatio'] = 'DSCR must be at least 0.1';
    }

    // Risk weights validation
    if (formData.riskWeights) {
      const totalWeight = Object.values(formData.riskWeights).reduce(
        (sum, weight) => sum + weight,
        0
      );
      if (Math.abs(totalWeight - VALIDATION_CONSTANTS.WEIGHT_TOTAL) > 0.1) {
        newErrors['riskWeights'] = 'Risk weights must sum to 100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (instrumentId) {
        // TODO: Update existing instrument
        // await smartMatchingService.updateInstrument(instrumentId, formData);
      } else {
        // TODO: Create new instrument
        // await smartMatchingService.createInstrument(formData);
      }

      navigate('/customer-retention/smart-matching');
    } catch (error) {
      console.error('Failed to save instrument:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = (documentType: string, file: File) => {
    // Mock upload functionality
    const mockUploadedDoc = {
      id: `${documentType}-${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      status: 'uploaded' as const,
    };

    setUploadedDocuments(prev => ({
      ...prev,
      [documentType]: mockUploadedDoc,
    }));

    // Add success notification
    const notification: RequirementNotification = {
      id: `upload-${Date.now()}`,
      type: 'success',
      title: 'Document Uploaded',
      message: `${file.name} has been uploaded successfully.`,
      timestamp: new Date(),
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
  };

  const handleDocumentRemove = (documentType: string) => {
    setUploadedDocuments(prev => {
      const updated = { ...prev };
      delete updated[documentType];
      return updated;
    });
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const sections = [
    { id: 'basic', name: 'Basic Info', icon: '📋' },
    { id: 'dealKillers', name: 'Deal Killers', icon: '🚫' },
    { id: 'creditScores', name: 'Credit Scores', icon: '📊' },
    { id: 'preferences', name: 'Preferences', icon: '⚙️' },
    { id: 'riskWeights', name: 'Risk Weights', icon: '⚖️' },
    { id: 'documents', name: 'Document Preview', icon: '📄' },
  ];

  return (
    <PageLayout title={instrumentId ? 'Edit Instrument' : 'Create Instrument'}>
      <div className="w-full">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 max-w-6xl">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {instrumentId ? 'Edit Instrument' : 'Create New Instrument'}
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Configure underwriting preferences and risk parameters
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate('/customer-retention/smart-matching')}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <XIcon className="h-4 w-4 mr-2 inline" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    <SaveIcon className="h-4 w-4 mr-2 inline" />
                    {loading ? 'Saving...' : 'Save Instrument'}
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="mb-6 space-y-3">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`rounded-lg border p-4 ${
                      notification.type === 'info'
                        ? 'bg-blue-50 border-blue-200'
                        : notification.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex">
                        <BellIcon
                          className={`h-5 w-5 mt-0.5 mr-3 ${
                            notification.type === 'info'
                              ? 'text-blue-600'
                              : notification.type === 'warning'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                          }`}
                        />
                        <div>
                          <h4
                            className={`font-medium ${
                              notification.type === 'info'
                                ? 'text-blue-900'
                                : notification.type === 'warning'
                                  ? 'text-yellow-900'
                                  : 'text-green-900'
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <p
                            className={`text-sm mt-1 ${
                              notification.type === 'info'
                                ? 'text-blue-800'
                                : notification.type === 'warning'
                                  ? 'text-yellow-800'
                                  : 'text-green-800'
                            }`}
                          >
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="mb-8">
              <nav className="flex space-x-8" aria-label="Tabs">
                {sections.map(section => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`${
                      activeSection === section.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Form Sections */}
            <div className="bg-white shadow rounded-lg">
              {/* Basic Info Section */}
              {activeSection === 'basic' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instrument Name *
                      </label>
                      <input
                        type="text"
                        value={formData.instrumentName || ''}
                        onChange={e => handleInputChange('instrumentName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Equipment Financing - Heavy Machinery"
                      />
                      {errors['instrumentName'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['instrumentName']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instrument Type
                      </label>
                      <select
                        value={formData.instrumentType || InstrumentType.EQUIPMENT}
                        onChange={e => handleInputChange('instrumentType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={InstrumentType.EQUIPMENT}>Equipment Financing</option>
                        <option value={InstrumentType.REAL_ESTATE}>Real Estate</option>
                        <option value={InstrumentType.GENERAL}>General Credit</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isActive !== false}
                          onChange={e => handleInputChange('isActive', e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Active (instrument will participate in matching)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Deal Killers Section */}
              {activeSection === 'dealKillers' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Deal Killer Variables</h3>
                    <InformationCircleIcon
                      className="h-5 w-5 text-gray-400 ml-2"
                      title="These are hard requirements that must be met"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Business Revenue *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={formData.dealKillers?.minimumBusinessRevenue || ''}
                          onChange={e =>
                            handleNestedInputChange(
                              'dealKillers',
                              'minimumBusinessRevenue',
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="100000"
                        />
                      </div>
                      {errors['dealKillers.minimumBusinessRevenue'] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors['dealKillers.minimumBusinessRevenue']}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Business Age (months) *
                      </label>
                      <input
                        type="number"
                        value={formData.dealKillers?.minimumBusinessAge || ''}
                        onChange={e =>
                          handleNestedInputChange(
                            'dealKillers',
                            'minimumBusinessAge',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="12"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Debt Service Coverage Ratio *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.dealKillers?.debtServiceCoverageRatio || ''}
                        onChange={e =>
                          handleNestedInputChange(
                            'dealKillers',
                            'debtServiceCoverageRatio',
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1.25"
                      />
                      {errors['dealKillers.debtServiceCoverageRatio'] && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors['dealKillers.debtServiceCoverageRatio']}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bankruptcy Acceptance
                      </label>
                      <select
                        value={formData.dealKillers?.bankruptcyAcceptance ? 'true' : 'false'}
                        onChange={e =>
                          handleNestedInputChange(
                            'dealKillers',
                            'bankruptcyAcceptance',
                            e.target.value === 'true'
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="false">No - Reject bankruptcy history</option>
                        <option value="true">Yes - Accept bankruptcy history</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Geographic Lending Coverage (State Codes)
                      </label>
                      <input
                        type="text"
                        value={formData.dealKillers?.geographicLendingCoverage?.join(', ') || ''}
                        onChange={e =>
                          handleNestedInputChange(
                            'dealKillers',
                            'geographicLendingCoverage',
                            e.target.value.split(',').map(s => s.trim())
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="CA, TX, FL, NY"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Enter state codes separated by commas
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Weights Section */}
              {activeSection === 'riskWeights' && (
                <div className="p-6">
                  <div className="flex items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Risk Score Weights</h3>
                    <InformationCircleIcon
                      className="h-5 w-5 text-gray-400 ml-2"
                      title="Weights must sum to 100%"
                    />
                  </div>

                  {errors['riskWeights'] && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                        <p className="ml-2 text-sm text-red-600">{errors['riskWeights']}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credit Worthiness Weight (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.riskWeights?.creditWorthinessWeight || ''}
                        onChange={e =>
                          handleNestedInputChange(
                            'riskWeights',
                            'creditWorthinessWeight',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Financial Ratio Weight (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.riskWeights?.financialRatioWeight || ''}
                        onChange={e =>
                          handleNestedInputChange(
                            'riskWeights',
                            'financialRatioWeight',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cash Flow Weight (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.riskWeights?.cashFlowWeight || ''}
                        onChange={e =>
                          handleNestedInputChange(
                            'riskWeights',
                            'cashFlowWeight',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compliance Weight (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.riskWeights?.complianceWeight || ''}
                        onChange={e =>
                          handleNestedInputChange(
                            'riskWeights',
                            'complianceWeight',
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {formData.instrumentType === InstrumentType.EQUIPMENT && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Equipment Weight (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.riskWeights?.equipmentWeight || ''}
                          onChange={e =>
                            handleNestedInputChange(
                              'riskWeights',
                              'equipmentWeight',
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {formData.instrumentType === InstrumentType.REAL_ESTATE && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Property Weight (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.riskWeights?.propertyWeight || ''}
                          onChange={e =>
                            handleNestedInputChange(
                              'riskWeights',
                              'propertyWeight',
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Weight Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Weight Summary</h4>
                    <div className="text-sm">
                      <p>
                        Total:{' '}
                        {Object.values(formData.riskWeights || {}).reduce(
                          (sum, weight) => sum + (weight || 0),
                          0
                        )}
                        %
                        {Object.values(formData.riskWeights || {}).reduce(
                          (sum, weight) => sum + (weight || 0),
                          0
                        ) === 100 && <span className="ml-2 text-green-600">✓</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Preview Section */}
              {activeSection === 'documents' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <DocumentIcon className="h-5 w-5 mr-2 text-blue-600" />
                        Document Requirements Preview
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        See what documents will be required based on your instrument settings
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        showPreview
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  </div>

                  {showPreview && (
                    <div className="space-y-6">
                      {/* Sample Application Data */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <LightBulbIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-medium text-yellow-900 mb-3">
                              Sample Application Data
                            </h4>
                            <p className="text-sm text-yellow-800 mb-4">
                              Adjust these sample values to see how document requirements change:
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-yellow-900 mb-1">
                                  Loan Amount
                                </label>
                                <input
                                  type="number"
                                  value={previewApplicationData.loanAmount || ''}
                                  onChange={e =>
                                    handlePreviewDataChange('loanAmount', parseInt(e.target.value))
                                  }
                                  className="w-full px-3 py-1 text-sm border border-yellow-300 rounded bg-white"
                                  placeholder="350000"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-yellow-900 mb-1">
                                  Business Revenue
                                </label>
                                <input
                                  type="number"
                                  value={previewApplicationData.currentYearGrossRevenue || ''}
                                  onChange={e =>
                                    handlePreviewDataChange(
                                      'currentYearGrossRevenue',
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="w-full px-3 py-1 text-sm border border-yellow-300 rounded bg-white"
                                  placeholder="750000"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-yellow-900 mb-1">
                                  Business Age (months)
                                </label>
                                <input
                                  type="number"
                                  value={previewApplicationData.businessAgeMonths || ''}
                                  onChange={e =>
                                    handlePreviewDataChange(
                                      'businessAgeMonths',
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="w-full px-3 py-1 text-sm border border-yellow-300 rounded bg-white"
                                  placeholder="24"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Document Requirements Display */}
                      {documentRequirements && (
                        <DocumentRequirementsSection
                          requirements={documentRequirements}
                          uploadedDocuments={uploadedDocuments}
                          loanAmount={previewApplicationData.loanAmount || 0}
                          onUpload={handleDocumentUpload}
                          onRemoveDocument={handleDocumentRemove}
                        />
                      )}

                      {!documentRequirements && (
                        <div className="text-center py-8 text-gray-500">
                          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p>Enter loan amount above to see document requirements</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default SmartMatchingInstrumentForm;
