import React, { useState, useContext } from 'react';
import { formTemplates } from './SafeForms/FormTemplates';
import { UserContext } from '../../contexts/UserContext';

interface SafeFormsSidebarProps {
  onSelectForm?: (formType: string, templateId?: string) => void;
  currentForm?: string;
  userType?: string; // Optional prop to override context user type
}

const SafeFormsSidebar: React.FC<SafeFormsSidebarProps> = ({
  onSelectForm,
  currentForm,
  userType: propUserType,
}) => {
  const { userRole } = useContext(UserContext) || { userRole: 'borrower' };
  const userType = propUserType || userRole;

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'credit-application': true,
    'additional-owner-individual': false,
    'additional-owner-business': false,
    'additional-owner-trust': false,
    'business-debt-schedule': false,
    'personal-finance-statement': false,
    'lender-payment-instructions': false,
    'nyca-lender-disclosure': false,
  });

  // Format the form type to display name
  const formatFormType = (formType: string): string => {
    return formType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const toggleExpand = (formType: string) => {
    setExpanded(prev => ({
      ...prev,
      [formType]: !prev[formType],
    }));
  };

  // Get all form types from the templates
  const formTypes = Object.keys(formTemplates);

  const handleFormSelect = (formType: string, templateId?: string) => {
    if (onSelectForm) {
      onSelectForm(formType, templateId);
    }
  };

  // Define which forms are visible based on user type
  const getVisibleForms = (): string[] => {
    // Credit application is visible to all users
    const baseForms = ['credit-application'];

    // Add forms based on user type
    if (userType === 'borrower') {
      return [
        ...baseForms,
        'additional-owner-individual',
        'additional-owner-business',
        'additional-owner-trust',
        'business-debt-schedule',
        'personal-finance-statement',
      ];
    } else if (userType === 'broker') {
      return [
        ...baseForms,
        'additional-owner-individual',
        'additional-owner-business',
        'additional-owner-trust',
        'business-debt-schedule',
        'personal-finance-statement',
        'nyca-lender-disclosure',
      ];
    } else if (userType === 'lender') {
      return [
        ...baseForms,
        'additional-owner-individual',
        'additional-owner-business',
        'additional-owner-trust',
        'business-debt-schedule',
        'personal-finance-statement',
        'lender-payment-instructions',
        'nyca-lender-disclosure',
      ];
    }

    // Default - show all forms
    return formTypes;
  };

  const visibleForms = getVisibleForms();

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg w-full max-w-xs">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Form Templates</h3>
        <div className="space-y-2">
          {/* Credit Application form (always visible) */}
          {visibleForms.includes('credit-application') && (
            <div
              className={`p-2 rounded-md ${currentForm === 'credit-application' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => handleFormSelect('credit-application')}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand('credit-application')}
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Credit Application</span>
                </div>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${expanded['credit-application'] ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {expanded['credit-application'] && formTemplates['credit-application'] && (
                <div className="mt-2 pl-7 border-l border-gray-200">
                  {formTemplates['credit-application'].map(template => (
                    <div
                      key={template.id}
                      className="py-1 px-2 my-1 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        handleFormSelect('credit-application', template.id);
                      }}
                    >
                      {template.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Additional Owner (Individual) */}
          {visibleForms.includes('additional-owner-individual') && (
            <div
              className={`p-2 rounded-md ${currentForm === 'additional-owner-individual' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => handleFormSelect('additional-owner-individual')}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand('additional-owner-individual')}
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Additional Owner (Individual)
                  </span>
                </div>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${expanded['additional-owner-individual'] ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {expanded['additional-owner-individual'] &&
                formTemplates['additional-owner-individual'] && (
                  <div className="mt-2 pl-7 border-l border-gray-200">
                    {formTemplates['additional-owner-individual'].map(template => (
                      <div
                        key={template.id}
                        className="py-1 px-2 my-1 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                        onClick={e => {
                          e.stopPropagation();
                          handleFormSelect('additional-owner-individual', template.id);
                        }}
                      >
                        {template.name}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* Additional Owner (Business) */}
          {visibleForms.includes('additional-owner-business') && (
            <div
              className={`p-2 rounded-md ${currentForm === 'additional-owner-business' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => handleFormSelect('additional-owner-business')}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand('additional-owner-business')}
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Additional Owner (Business)
                  </span>
                </div>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${expanded['additional-owner-business'] ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {expanded['additional-owner-business'] &&
                formTemplates['additional-owner-business'] && (
                  <div className="mt-2 pl-7 border-l border-gray-200">
                    {formTemplates['additional-owner-business'].map(template => (
                      <div
                        key={template.id}
                        className="py-1 px-2 my-1 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                        onClick={e => {
                          e.stopPropagation();
                          handleFormSelect('additional-owner-business', template.id);
                        }}
                      >
                        {template.name}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          {/* Additional Owner (Trust) */}
          {visibleForms.includes('additional-owner-trust') && (
            <div
              className={`p-2 rounded-md ${currentForm === 'additional-owner-trust' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => handleFormSelect('additional-owner-trust')}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand('additional-owner-trust')}
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 mr-2"
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
                  <span className="text-sm font-medium text-gray-700">
                    Additional Owner (Trust)
                  </span>
                </div>
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${expanded['additional-owner-trust'] ? 'transform rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {expanded['additional-owner-trust'] && formTemplates['additional-owner-trust'] && (
                <div className="mt-2 pl-7 border-l border-gray-200">
                  {formTemplates['additional-owner-trust']?.map(template => (
                    <div
                      key={template.id}
                      className="py-1 px-2 my-1 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        handleFormSelect('additional-owner-trust', template.id);
                      }}
                    >
                      {template.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Business Debt Schedule */}
          {visibleForms.includes('business-debt-schedule') && (
            <div
              className={`p-2 rounded-md ${currentForm === 'business-debt-schedule' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => handleFormSelect('business-debt-schedule')}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">Business Debt Schedule</span>
              </div>
            </div>
          )}

          {/* Personal Finance Statement */}
          {visibleForms.includes('personal-finance-statement') && (
            <div
              className={`p-2 rounded-md ${currentForm === 'personal-finance-statement' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => handleFormSelect('personal-finance-statement')}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Personal Finance Statement
                </span>
              </div>
            </div>
          )}

          {/* Lender Payment Instructions */}
          {visibleForms.includes('lender-payment-instructions') && (
            <div
              className={`p-2 rounded-md ${currentForm === 'lender-payment-instructions' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => handleFormSelect('lender-payment-instructions')}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Lender Payment Instructions
                </span>
              </div>
            </div>
          )}

          {/* NYCA Lender Disclosure */}
          {visibleForms.includes('nyca-lender-disclosure') && (
            <div
              className={`p-2 rounded-md ${currentForm === 'nyca-lender-disclosure' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}
              onClick={() => handleFormSelect('nyca-lender-disclosure')}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 mr-2"
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
                <span className="text-sm font-medium text-gray-700">NYCA Lender Disclosure</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafeFormsSidebar;
