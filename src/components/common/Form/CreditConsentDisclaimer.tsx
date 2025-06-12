import React from 'react';

interface CreditConsentDisclaimerProps {
  businessName?: string;
  ownerName?: string;
  onAuthorizationChange: (fieldName: string, checked: boolean) => void;
  authorizations: {
    accuracyConfirmation: boolean;
    creditRequestAuthorization: boolean;
    backgroundCheckConsent: boolean;
  };
}

/**
 * Reusable credit consent disclaimer component with authorization checkboxes
 */
const CreditConsentDisclaimer: React.FC<CreditConsentDisclaimerProps> = ({
  businessName,
  ownerName,
  onAuthorizationChange,
  authorizations,
}) => {
  // Format display names based on what's available
  const displayName = ownerName || 'Individual';
  const displayBusiness = businessName ? ` for ${businessName}` : '';

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    onAuthorizationChange(name, checked);
  };

  return (
    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mb-4">
      <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2 text-amber-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        Credit Consent Disclaimer
      </h3>

      <div className="text-sm text-gray-700 mb-4">
        <p className="mb-2">
          During your loan, lease, or credit application process, Unisyn Technologies, LLC, and its
          subsidiaries verifies your information and creditworthiness, and shares such information
          with potential lenders and third parties to further your loan application process. This
          verification process includes, but is not limited to, obtaining a consumer credit report
          and information regarding your background, employment history, education, qualifications,
          character, personal information, criminal record, motor vehicle record, and/or credit
          standing or indebtedness.
        </p>
        <p>
          {displayName} has provided the authorization to obtain and share this information on{' '}
          {new Date().toLocaleDateString()}.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-start">
          <input
            id="accuracy_confirmation"
            name="accuracyConfirmation"
            type="checkbox"
            checked={authorizations.accuracyConfirmation}
            onChange={handleCheckboxChange}
            className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <label htmlFor="accuracy_confirmation" className="ml-2 text-sm text-gray-700">
            By filling out, you confirm the accuracy of the information provided and authorize
            verification. Your data may be shared for processing and will be protected according to
            our Privacy Policy. Submission does not guarantee approval.
          </label>
        </div>

        <div className="flex items-start">
          <input
            id="credit_request_authorization"
            name="creditRequestAuthorization"
            type="checkbox"
            checked={authorizations.creditRequestAuthorization}
            onChange={handleCheckboxChange}
            className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <label htmlFor="credit_request_authorization" className="ml-2 text-sm text-gray-700">
            I am authorized to request credit, and debt{displayBusiness}
          </label>
        </div>

        <div className="flex items-start">
          <input
            id="background_check_consent"
            name="backgroundCheckConsent"
            type="checkbox"
            checked={authorizations.backgroundCheckConsent}
            onChange={handleCheckboxChange}
            className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            required
          />
          <label htmlFor="background_check_consent" className="ml-2 text-sm text-gray-700">
            I consent for my business and myself for credit checks, background checks, and public
            records.
          </label>
        </div>
      </div>
    </div>
  );
};

export default CreditConsentDisclaimer;
