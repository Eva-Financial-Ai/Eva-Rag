import React, { useState } from 'react';
import SsnSignature from '../../common/Form/SsnSignature';
import CreditConsentDisclaimer from '../../common/Form/CreditConsentDisclaimer';
import { validateSSN, validateDateOfBirth } from '../../../utils/formValidation';
import { formatSSNInput } from '../../../utils/formatters';

interface PersonalFinanceStatementProps {
  onSubmit: (data: any) => void;
  onSave: (data: any) => void;
}

const PersonalFinanceStatement: React.FC<PersonalFinanceStatementProps> = ({
  onSubmit,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    // Personal Information (matches SBA Form 413 exactly)
    name: '',
    businessName: '',
    homeAddress: '',
    businessAddress: '',
    homePhone: '',
    businessPhone: '',
    email: '',
    businessType: '',
    dateOfBirth: '',
    ssn: '',
    signatureData: null as string | null,
    
    // Consent and Authorization
    authorizations: {
      accuracyConfirmation: false,
      creditRequestAuthorization: false,
      backgroundCheckConsent: false,
    },

    // Section 1: Assets (exact SBA 413 format)
    assets: {
      cashOnHandAndBanks: 0,
    savingsAccounts: 0,
    irasAndOtherRetirement: 0,
    accountsReceivable: 0,
    lifeInsuranceCashValue: 0,
    stocksAndBonds: 0,
    realEstate: 0,
    automobiles: 0,
    otherPersonalProperty: 0,
    otherAssets: 0,
    },

    // Section 1: Liabilities (exact SBA 413 format)
    liabilities: {
    accountsPayable: 0,
      notesPayableToBanksAndOthers: 0,
      installmentAccountAuto: 0,
      installmentAccountOther: 0,
      loanAgainstLifeInsurance: 0,
      mortgagesOnRealEstate: 0,
    unpaidTaxes: 0,
    otherLiabilities: 0,
    },

    // Monthly payments for installment accounts
    monthlyPayments: {
      autoPayment: 0,
      otherInstallmentPayment: 0,
    },

    // Section 1: Sources of Income (SBA 413 format)
    income: {
    salary: 0,
    netInvestmentIncome: 0,
    realEstateIncome: 0,
    otherIncome: 0,
    },

    // Section 1: Contingent Liabilities (SBA 413 format)
    contingentLiabilities: {
      asEndorserOrCoMaker: 0,
      legalClaimsAndJudgments: 0,
      provisionForFederalIncomeTax: 0,
      otherSpecialDebt: 0,
    },

    // Additional detail sections (SBA 413 sections 2-8)
    detailSections: {
      notesPayableDetails: [],
      stocksAndBondsDetails: [],
      realEstateDetails: [],
      personalPropertyDetails: [],
      unpaidTaxesDetails: [],
      otherLiabilitiesDetails: [],
      lifeInsuranceDetails: [],
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // SSN validation
    if (formData.ssn) {
      const ssnValidation = validateSSN(formData.ssn);
      if (!ssnValidation.isValid) {
        newErrors.ssn = ssnValidation.message;
      }
    }

    // Date of birth validation
    if (formData.dateOfBirth) {
      const dobValidation = validateDateOfBirth(formData.dateOfBirth);
      if (!dobValidation.isValid) {
        newErrors.dateOfBirth = dobValidation.message;
      }
    }

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    let formattedValue = value;

    // Format SSN as user types
    if (name === 'ssn') {
      formattedValue = formatSSNInput(value);
    }

    // Handle nested object updates
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => {
        const sectionValue = prev[section as keyof typeof prev];
        // Ensure we have an object to spread
        const sectionObject = typeof sectionValue === 'object' && sectionValue !== null ? sectionValue : {};
        
        return {
          ...prev,
          [section]: {
            ...sectionObject,
            [field]: type === 'checkbox' 
              ? (e.target as HTMLInputElement).checked
              : type === 'number' || field.includes('Amount') || field.includes('Payment') || field.includes('Income')
                ? parseFloat(formattedValue) || 0
                : formattedValue,
          },
        };
      });
    } else {
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number' ||
              name.includes('amount') ||
              name.includes('value') ||
              name.includes('income') ||
                name.includes('payment')
              ? parseFloat(formattedValue) || 0
              : formattedValue,
    }));
    }
  };

  // Handle signature data update
  const handleSignatureEnd = (signatureData: string | null) => {
    setFormData({
      ...formData,
      signatureData,
    });
  };

  // Handle authorization checkbox changes
  const handleAuthorizationChange = (fieldName: string, checked: boolean) => {
    setFormData({
      ...formData,
      authorizations: {
        ...formData.authorizations,
        [fieldName]: checked,
      },
    });
  };

  // Calculate totals (exact SBA 413 calculations)
  const calculateTotalAssets = () => {
    const { assets } = formData;
    return Object.values(assets).reduce((sum, value) => sum + value, 0);
  };

  const calculateTotalLiabilities = () => {
    const { liabilities } = formData;
    return Object.values(liabilities).reduce((sum, value) => sum + value, 0);
  };

  const calculateNetWorth = () => {
    return calculateTotalAssets() - calculateTotalLiabilities();
  };

  const calculateTotalIncome = () => {
    const { income } = formData;
    return Object.values(income).reduce((sum, value) => sum + value, 0);
  };

  const calculateTotalContingentLiabilities = () => {
    const { contingentLiabilities } = formData;
    return Object.values(contingentLiabilities).reduce((sum, value) => sum + value, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
    onSubmit(formData);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Personal Financial Statement
        </h1>
        <p className="text-gray-600 text-sm">
          Complete your personal financial information. All fields marked with * are required.
      </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Address*
              </label>
              <input
                type="text"
                name="homeAddress"
                value={formData.homeAddress}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <input
                type="text"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Home Phone*
              </label>
              <input
                type="tel"
                name="homePhone"
                value={formData.homePhone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Phone
              </label>
              <input
                type="tel"
                name="businessPhone"
                value={formData.businessPhone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth*
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Social Security Number*
              </label>
              <input
                type="text"
                name="ssn"
                value={formData.ssn}
                onChange={handleChange}
                placeholder="XXX-XX-XXXX"
                maxLength={11}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              {errors.ssn && <p className="text-red-500 text-sm mt-1">{errors.ssn}</p>}
            </div>
          </div>
        </div>

        {/* Assets Section - Exact SBA 413 Format */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Assets</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                Cash on hand and in banks
                  </label>
                    <input
                      type="number"
                name="assets.cashOnHandAndBanks"
                value={formData.assets.cashOnHandAndBanks}
                      onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                Savings accounts
                  </label>
                    <input
                      type="number"
                name="assets.savingsAccounts"
                value={formData.assets.savingsAccounts}
                      onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                IRA or other retirement account
                  </label>
                    <input
                      type="number"
                name="assets.irasAndOtherRetirement"
                value={formData.assets.irasAndOtherRetirement}
                      onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                Accounts and notes receivable
                  </label>
                    <input
                      type="number"
                name="assets.accountsReceivable"
                value={formData.assets.accountsReceivable}
                      onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                Life insurance - cash surrender value only
                  </label>
                    <input
                      type="number"
                name="assets.lifeInsuranceCashValue"
                value={formData.assets.lifeInsuranceCashValue}
                      onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                Stocks and bonds
                  </label>
                    <input
                      type="number"
                name="assets.stocksAndBonds"
                value={formData.assets.stocksAndBonds}
                      onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
            </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                Real estate
                  </label>
                    <input
                      type="number"
                name="assets.realEstate"
                value={formData.assets.realEstate}
                      onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Automobile - present value
              </label>
                  <input
                type="number"
                name="assets.automobiles"
                value={formData.assets.automobiles}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other personal property
              </label>
                  <input
                type="number"
                name="assets.otherPersonalProperty"
                value={formData.assets.otherPersonalProperty}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other assets
              </label>
                  <input
                type="number"
                name="assets.otherAssets"
                value={formData.assets.otherAssets}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
                </div>
              </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Assets:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(calculateTotalAssets())}
              </span>
            </div>
          </div>
        </div>

        {/* Continue with rest of sections... */}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={() => onSave(formData)}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
          >
            Save Draft
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Submit Personal Financial Statement
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalFinanceStatement;
