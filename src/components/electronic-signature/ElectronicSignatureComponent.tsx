import React, { useState, useRef, useEffect, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { v4 as uuidv4 } from 'uuid';

// Types for signature data
interface SignatureData {
  id: string;
  signerId: string;
  signerName: string;
  signerRole: string;
  signatureDataUrl: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  geoLocation?: {
    latitude: number;
    longitude: number;
  };
  complianceAcknowledgments: {
    esignAct: boolean;
    creditReportAuthorization: boolean;
    communicationConsent: boolean;
    tcpaTelephoneConsent: boolean;
    electronicDisclosures: boolean;
    privacyPolicy: boolean;
    termsOfService: boolean;
  };
  documentHash?: string;
}

interface CommunicationPreferences {
  email: {
    enabled: boolean;
    address: string;
    transactionUpdates: boolean;
    marketingCommunications: boolean;
    documentDelivery: boolean;
  };
  sms: {
    enabled: boolean;
    phoneNumber: string;
    transactionUpdates: boolean;
    reminders: boolean;
    securityAlerts: boolean;
  };
  autoDialer: {
    consent: boolean;
    phoneNumber: string;
  };
}

interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  ownershipPercentage: number;
  signatureRequired: boolean;
  signatureCompleted: boolean;
  notificationSent: boolean;
}

interface ElectronicSignatureProps {
  owners: Owner[];
  documentId: string;
  documentTitle: string;
  transactionId: string;
  onSignatureComplete: (signatureData: SignatureData) => void;
  onAllSignaturesComplete: (allSignatures: SignatureData[]) => void;
  onCommunicationPreferencesUpdate: (preferences: CommunicationPreferences) => void;
  currentUserId: string;
  currentUserRole: 'borrower' | 'guarantor' | 'officer' | 'admin';
}

const ElectronicSignatureComponent: React.FC<ElectronicSignatureProps> = ({
  owners,
  documentId,
  documentTitle,
  transactionId,
  onSignatureComplete,
  onAllSignaturesComplete,
  onCommunicationPreferencesUpdate,
  currentUserId,
  currentUserRole,
}) => {
  const [currentStep, setCurrentStep] = useState<'consent' | 'communications' | 'signature' | 'complete'>('consent');
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [currentOwnerIndex, setCurrentOwnerIndex] = useState(0);
  const [hasSignature, setHasSignature] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const signatureRef = useRef<SignatureCanvas>(null);

  // Compliance acknowledgments state
  const [complianceAcknowledgments, setComplianceAcknowledgments] = useState({
    esignAct: false,
    creditReportAuthorization: false,
    communicationConsent: false,
    tcpaTelephoneConsent: false,
    electronicDisclosures: false,
    privacyPolicy: false,
    termsOfService: false,
  });

  // Communication preferences state
  const [communicationPreferences, setCommunicationPreferences] = useState<CommunicationPreferences>({
    email: {
      enabled: true,
      address: '',
      transactionUpdates: true,
      marketingCommunications: false,
      documentDelivery: true,
    },
    sms: {
      enabled: true,
      phoneNumber: '',
      transactionUpdates: true,
      reminders: true,
      securityAlerts: true,
    },
    autoDialer: {
      consent: false,
      phoneNumber: '',
    },
  });

  const currentOwner = owners[currentOwnerIndex];

  // Initialize communication preferences with current owner data
  useEffect(() => {
    if (currentOwner) {
      setCommunicationPreferences(prev => ({
        ...prev,
        email: {
          ...prev.email,
          address: currentOwner.email,
        },
        sms: {
          ...prev.sms,
          phoneNumber: currentOwner.phone,
        },
        autoDialer: {
          ...prev.autoDialer,
          phoneNumber: currentOwner.phone,
        },
      }));
    }
  }, [currentOwner]);

  // Get user's IP address and location (compliance requirement)
  const getUserMetadata = useCallback(async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        ipAddress: data.ip,
        geoLocation: {
          latitude: data.latitude,
          longitude: data.longitude,
        },
      };
    } catch (error) {
      console.error('Error getting user metadata:', error);
      return {
        ipAddress: 'unknown',
        geoLocation: undefined,
      };
    }
  }, []);

  // Handle compliance acknowledgment changes
  const handleComplianceChange = (key: keyof typeof complianceAcknowledgments) => {
    setComplianceAcknowledgments(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle communication preference changes
  const handleCommunicationChange = (
    category: 'email' | 'sms' | 'autoDialer',
    field: string,
    value: boolean | string
  ) => {
    setCommunicationPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  // Validate all required consents are checked
  const isConsentValid = () => {
    return (
      complianceAcknowledgments.esignAct &&
      complianceAcknowledgments.creditReportAuthorization &&
      complianceAcknowledgments.communicationConsent &&
      complianceAcknowledgments.electronicDisclosures &&
      complianceAcknowledgments.privacyPolicy &&
      complianceAcknowledgments.termsOfService
    );
  };

  // Clear signature canvas
  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setHasSignature(false);
    }
  };

  // Handle signature completion
  const handleSignatureEnd = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      setHasSignature(true);
    }
  };

  // Complete signature process for current owner
  const completeSignature = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      alert('Please provide your signature before proceeding.');
      return;
    }

    if (!isConsentValid()) {
      alert('Please acknowledge all required consents before proceeding.');
      return;
    }

    setIsLoading(true);

    try {
      const metadata = await getUserMetadata();
      const signatureDataUrl = signatureRef.current.toDataURL('image/png');
      
      const signatureData: SignatureData = {
        id: uuidv4(),
        signerId: currentOwner.id,
        signerName: currentOwner.name,
        signerRole: currentOwner.role,
        signatureDataUrl,
        timestamp: new Date().toISOString(),
        ipAddress: metadata.ipAddress,
        userAgent: navigator.userAgent,
        geoLocation: metadata.geoLocation,
        complianceAcknowledgments,
        documentHash: await generateDocumentHash(),
      };

      // Add signature to collection
      const updatedSignatures = [...signatures, signatureData];
      setSignatures(updatedSignatures);

      // Send notification via Cloudflare queue
      await sendSignatureNotification(signatureData);

      // Callback to parent component
      onSignatureComplete(signatureData);
      onCommunicationPreferencesUpdate(communicationPreferences);

      // Check if all signatures are complete
      const remainingOwners = owners.filter(
        owner => !updatedSignatures.some(sig => sig.signerId === owner.id)
      );

      if (remainingOwners.length === 0) {
        // All signatures complete
        onAllSignaturesComplete(updatedSignatures);
        setCurrentStep('complete');
      } else {
        // Move to next owner or complete current owner's process
        const nextOwnerIndex = owners.findIndex(
          owner => !updatedSignatures.some(sig => sig.signerId === owner.id)
        );
        
        if (nextOwnerIndex !== -1) {
          setCurrentOwnerIndex(nextOwnerIndex);
          await sendSignatureRequestToNextOwner(owners[nextOwnerIndex]);
        }
        
        setCurrentStep('complete');
      }
    } catch (error) {
      console.error('Error completing signature:', error);
      alert('An error occurred while processing your signature. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate document hash for integrity verification
  const generateDocumentHash = async (): Promise<string> => {
    const content = `${documentId}-${documentTitle}-${transactionId}-${Date.now()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Send signature completion notification via Cloudflare
  const sendSignatureNotification = async (signatureData: SignatureData) => {
    try {
      const notificationPayload = {
        type: 'signature_completed',
        signatureData,
        documentId,
        transactionId,
        timestamp: new Date().toISOString(),
      };

      // Send to Cloudflare queue for processing
      await fetch('/api/notifications/signature-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationPayload),
      });
    } catch (error) {
      console.error('Error sending signature notification:', error);
    }
  };

  // Send signature request to next owner
  const sendSignatureRequestToNextOwner = async (owner: Owner) => {
    try {
      const requestPayload = {
        type: 'signature_request',
        ownerId: owner.id,
        ownerName: owner.name,
        ownerEmail: owner.email,
        ownerPhone: owner.phone,
        documentId,
        documentTitle,
        transactionId,
        signatureUrl: `${window.location.origin}/signature/${transactionId}/${owner.id}`,
        timestamp: new Date().toISOString(),
      };

      // Send notification via Cloudflare queue
      await fetch('/api/notifications/signature-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });
    } catch (error) {
      console.error('Error sending signature request:', error);
    }
  };

  // Render consent step
  const renderConsentStep = () => (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Electronic Signature Consent</h2>
        <p className="text-gray-600">
          Please review and acknowledge the following disclosures before proceeding with your electronic signature.
        </p>
      </div>

      <div className="space-y-6">
        {/* E-SIGN Act Disclosure */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="esignAct"
              checked={complianceAcknowledgments.esignAct}
              onChange={() => handleComplianceChange('esignAct')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <div className="flex-1">
              <label htmlFor="esignAct" className="text-sm font-medium text-gray-900">
                Electronic Signature Act (E-SIGN) Consent *
              </label>
              <p className="text-sm text-gray-600 mt-1">
                I consent to the use of electronic signatures, electronic records, and electronic delivery of notices, 
                disclosures, and other documents. I understand that my electronic signature will have the same legal 
                effect as if I had physically signed the document with a pen.
              </p>
            </div>
          </div>
        </div>

        {/* Credit Report Authorization */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="creditAuth"
              checked={complianceAcknowledgments.creditReportAuthorization}
              onChange={() => handleComplianceChange('creditReportAuthorization')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <div className="flex-1">
              <label htmlFor="creditAuth" className="text-sm font-medium text-gray-900">
                Credit Report Authorization *
              </label>
              <p className="text-sm text-gray-600 mt-1">
                I authorize EVA Financial AI and its lenders to obtain credit reports and verify information 
                provided for the purpose of evaluating this credit application. This may include obtaining 
                reports from consumer reporting agencies and other sources.
              </p>
            </div>
          </div>
        </div>

        {/* Communication Consent */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="commConsent"
              checked={complianceAcknowledgments.communicationConsent}
              onChange={() => handleComplianceChange('communicationConsent')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <div className="flex-1">
              <label htmlFor="commConsent" className="text-sm font-medium text-gray-900">
                Communication Consent *
              </label>
              <p className="text-sm text-gray-600 mt-1">
                I consent to receive communications from EVA Financial AI and participating lenders 
                via email, SMS, and phone calls regarding my application and ongoing loan servicing.
              </p>
            </div>
          </div>
        </div>

        {/* TCPA Telephone Consent */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="tcpaConsent"
              checked={complianceAcknowledgments.tcpaTelephoneConsent}
              onChange={() => handleComplianceChange('tcpaTelephoneConsent')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="tcpaConsent" className="text-sm font-medium text-gray-900">
                TCPA Telephone Consumer Protection Act Consent
              </label>
              <p className="text-sm text-gray-600 mt-1">
                I consent to being contacted by EVA Financial AI and participating lenders using 
                automated telephone dialing systems, artificial or prerecorded voice messages, 
                and SMS text messages at the telephone numbers provided, even if the number is 
                on a Do Not Call list.
              </p>
            </div>
          </div>
        </div>

        {/* Electronic Disclosures */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="electronicDisclosures"
              checked={complianceAcknowledgments.electronicDisclosures}
              onChange={() => handleComplianceChange('electronicDisclosures')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <div className="flex-1">
              <label htmlFor="electronicDisclosures" className="text-sm font-medium text-gray-900">
                Electronic Delivery of Disclosures *
              </label>
              <p className="text-sm text-gray-600 mt-1">
                I consent to receive all required disclosures electronically, including but not limited to: 
                Truth in Lending disclosures, privacy notices, adverse action notices, and loan documents.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="privacyPolicy"
              checked={complianceAcknowledgments.privacyPolicy}
              onChange={() => handleComplianceChange('privacyPolicy')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <div className="flex-1">
              <label htmlFor="privacyPolicy" className="text-sm font-medium text-gray-900">
                Privacy Policy Acknowledgment *
              </label>
              <p className="text-sm text-gray-600 mt-1">
                I have read and agree to the{' '}
                <a href="/privacy-policy" target="_blank" className="text-blue-600 underline">
                  Privacy Policy
                </a>{' '}
                and understand how my personal information will be collected, used, and shared.
              </p>
            </div>
          </div>
        </div>

        {/* Terms of Service */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="termsOfService"
              checked={complianceAcknowledgments.termsOfService}
              onChange={() => handleComplianceChange('termsOfService')}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <div className="flex-1">
              <label htmlFor="termsOfService" className="text-sm font-medium text-gray-900">
                Terms of Service Agreement *
              </label>
              <p className="text-sm text-gray-600 mt-1">
                I have read and agree to the{' '}
                <a href="/terms-of-service" target="_blank" className="text-blue-600 underline">
                  Terms of Service
                </a>{' '}
                governing the use of EVA Financial AI's platform and services.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <div className="text-sm text-gray-500">
          * Required fields
        </div>
        <button
          type="button"
          onClick={() => setCurrentStep('communications')}
          disabled={!isConsentValid()}
          className={`px-6 py-2 rounded-md font-medium ${
            isConsentValid()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Communication Preferences
        </button>
      </div>
    </div>
  );

  // Render communication preferences step
  const renderCommunicationStep = () => (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Communication Preferences</h2>
        <p className="text-gray-600">
          Configure how you'd like to receive updates about your application and ongoing loan servicing.
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Preferences */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Email Communications</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={communicationPreferences.email.address}
              onChange={(e) => handleCommunicationChange('email', 'address', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailEnabled"
                checked={communicationPreferences.email.enabled}
                onChange={(e) => handleCommunicationChange('email', 'enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="emailEnabled" className="ml-2 text-sm text-gray-700">
                Enable email communications
              </label>
            </div>

            <div className="flex items-center ml-6">
              <input
                type="checkbox"
                id="emailTransactionUpdates"
                checked={communicationPreferences.email.transactionUpdates}
                onChange={(e) => handleCommunicationChange('email', 'transactionUpdates', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="emailTransactionUpdates" className="ml-2 text-sm text-gray-700">
                Transaction updates and status notifications
              </label>
            </div>

            <div className="flex items-center ml-6">
              <input
                type="checkbox"
                id="emailDocumentDelivery"
                checked={communicationPreferences.email.documentDelivery}
                onChange={(e) => handleCommunicationChange('email', 'documentDelivery', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="emailDocumentDelivery" className="ml-2 text-sm text-gray-700">
                Document delivery and electronic signatures
              </label>
            </div>

            <div className="flex items-center ml-6">
              <input
                type="checkbox"
                id="emailMarketing"
                checked={communicationPreferences.email.marketingCommunications}
                onChange={(e) => handleCommunicationChange('email', 'marketingCommunications', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="emailMarketing" className="ml-2 text-sm text-gray-700">
                Marketing communications and promotional offers
              </label>
            </div>
          </div>
        </div>

        {/* SMS Preferences */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Text Messaging</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Phone Number
            </label>
            <input
              type="tel"
              value={communicationPreferences.sms.phoneNumber}
              onChange={(e) => handleCommunicationChange('sms', 'phoneNumber', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smsEnabled"
                checked={communicationPreferences.sms.enabled}
                onChange={(e) => handleCommunicationChange('sms', 'enabled', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="smsEnabled" className="ml-2 text-sm text-gray-700">
                Enable SMS text messaging
              </label>
            </div>

            <div className="flex items-center ml-6">
              <input
                type="checkbox"
                id="smsTransactionUpdates"
                checked={communicationPreferences.sms.transactionUpdates}
                onChange={(e) => handleCommunicationChange('sms', 'transactionUpdates', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="smsTransactionUpdates" className="ml-2 text-sm text-gray-700">
                Transaction status updates
              </label>
            </div>

            <div className="flex items-center ml-6">
              <input
                type="checkbox"
                id="smsReminders"
                checked={communicationPreferences.sms.reminders}
                onChange={(e) => handleCommunicationChange('sms', 'reminders', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="smsReminders" className="ml-2 text-sm text-gray-700">
                Payment reminders and due date notifications
              </label>
            </div>

            <div className="flex items-center ml-6">
              <input
                type="checkbox"
                id="smsSecurityAlerts"
                checked={communicationPreferences.sms.securityAlerts}
                onChange={(e) => handleCommunicationChange('sms', 'securityAlerts', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="smsSecurityAlerts" className="ml-2 text-sm text-gray-700">
                Security alerts and fraud notifications
              </label>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Message and data rates may apply. You can opt out at any time by replying STOP.
            </p>
          </div>
        </div>

        {/* Auto-Dialer Consent */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Automated Telephone Communications</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number for Automated Calls
            </label>
            <input
              type="tel"
              value={communicationPreferences.autoDialer.phoneNumber}
              onChange={(e) => handleCommunicationChange('autoDialer', 'phoneNumber', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="autoDialerConsent"
              checked={communicationPreferences.autoDialer.consent}
              onChange={(e) => handleCommunicationChange('autoDialer', 'consent', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="autoDialerConsent" className="text-sm font-medium text-gray-900">
                Automated Calling System Consent
              </label>
              <p className="text-sm text-gray-600 mt-1">
                I consent to receive automated phone calls, including those made using an automated telephone 
                dialing system, artificial or prerecorded voice messages, and text messages from EVA Financial AI 
                and participating lenders at the phone number(s) provided above. I understand that consent is not 
                required as a condition of purchasing any property, goods, or services.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep('consent')}
          className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Consents
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep('signature')}
          className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          Continue to Signature
        </button>
      </div>
    </div>
  );

  // Render signature step
  const renderSignatureStep = () => (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Electronic Signature</h2>
        <p className="text-gray-600">
          Sign below to complete your application for "{documentTitle}"
        </p>
        
        {currentOwner && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Signing as:</strong> {currentOwner.name} ({currentOwner.role})
            </p>
            <p className="text-sm text-blue-600">
              Ownership: {currentOwner.ownershipPercentage}%
            </p>
          </div>
        )}
      </div>

      <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Electronic Signature
        </label>
        <div className="bg-white border border-gray-300 rounded">
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              width: 600,
              height: 200,
              className: 'signature-canvas w-full cursor-crosshair',
            }}
            onEnd={handleSignatureEnd}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <button
            type="button"
            onClick={clearSignature}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Signature
          </button>
          {hasSignature && (
            <div className="text-sm text-green-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Signature Captured
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Legal Agreement</h3>
        <p className="text-sm text-gray-600">
          By signing electronically, I agree that my electronic signature is the legally binding equivalent 
          of my manual signature on this document. I consent to be legally bound by this electronic signature 
          and the terms of this agreement.
        </p>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep('communications')}
          className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Communication Preferences
        </button>
        <button
          type="button"
          onClick={completeSignature}
          disabled={!hasSignature || isLoading}
          className={`px-6 py-2 rounded-md font-medium ${
            hasSignature && !isLoading
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Processing...' : 'Complete Signature'}
        </button>
      </div>
    </div>
  );

  // Render completion step
  const renderCompleteStep = () => (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Signature Complete!</h2>
        <p className="text-gray-600 mb-6">
          Your electronic signature has been successfully captured and processed.
        </p>

        {signatures.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Signature Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Signer:</strong> {signatures[signatures.length - 1].signerName}</p>
              <p><strong>Date & Time:</strong> {new Date(signatures[signatures.length - 1].timestamp).toLocaleString()}</p>
              <p><strong>Document:</strong> {documentTitle}</p>
              <p><strong>Transaction ID:</strong> {transactionId}</p>
            </div>
          </div>
        )}

        {owners.length > signatures.length && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Next Steps:</strong> Additional signatures are required from other owners. 
              They will receive email and SMS notifications with signature requests.
            </p>
          </div>
        )}

        <div className="space-x-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-6 py-2 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Print Confirmation
          </button>
          <button
            type="button"
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {currentStep === 'consent' && renderConsentStep()}
      {currentStep === 'communications' && renderCommunicationStep()}
      {currentStep === 'signature' && renderSignatureStep()}
      {currentStep === 'complete' && renderCompleteStep()}
    </div>
  );
};

export default ElectronicSignatureComponent; 