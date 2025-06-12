import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface CreditRequestTermsDetailsProps {
  onSubmit: (data: CreditRequestTermsData) => void;
  initialData?: Partial<CreditRequestTermsData>;
}

export interface CreditRequestTermsData {
  requestedAmount: number;
  budgetedDownPayment: number;
  budgetedDownPaymentPercentage: number;
  primaryAssetClass: string;
  secondaryCollateralizedAssets: string[];
  financialInstrument: string;
  requestedTermMonths: number;
  estimatedInterestRate: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  balloonPayment: boolean;
  balloonPaymentAmount?: number;
  balloonPaymentMonths?: number;
  prepaymentPenalty: boolean;
  prepaymentPenaltyTerms?: string;
}

// Available financial instruments
const financialInstruments = [
  { value: 'term_loan', label: 'Term Loan' },
  { value: 'equipment_finance', label: 'Equipment Finance' },
  { value: 'commercial_mortgage', label: 'Commercial Mortgage' },
  { value: 'line_of_credit', label: 'Line of Credit' },
  { value: 'sba_loan', label: 'SBA Loan' },
  { value: 'working_capital', label: 'Working Capital' },
  { value: 'invoice_factoring', label: 'Invoice Factoring' },
  { value: 'merchant_cash_advance', label: 'Merchant Cash Advance' },
];

// Asset class options
const assetClassOptions = [
  { value: 'cash_equivalents', label: 'Cash & Cash Equivalents' },
  { value: 'commercial_paper', label: 'Commercial Paper (Secured by Collateral)' },
  { value: 'government_bonds', label: 'Government Bonds' },
  { value: 'corporate_bonds', label: 'Corporate Bonds' },
  { value: 'equities', label: 'Equities (Stocks & Shares)' },
  { value: 'mutual_funds', label: 'Mutual Funds / ETFs' },
  { value: 'real_estate', label: 'Real Estate (REITs & Property Holdings)' },
  { value: 'commodities', label: 'Commodities (Gold, Oil, Raw Materials)' },
  { value: 'crypto', label: 'Crypto & Blockchain Assets' },
  { value: 'derivatives', label: 'Derivatives (Futures, Options, Swaps)' },
  { value: 'private_equity', label: 'Private Equity / Venture Capital' },
  { value: 'forex', label: 'Forex (Foreign Exchange Currency Holdings)' },
  { value: 'equipment', label: 'Equipment & Machinery' },
  { value: 'motor_vehicles', label: 'Motor Vehicles & Aircraft' },
  {
    value: 'unsecured_paper',
    label: 'Unsecured Commercial Paper (Non-Collateralized Debt Holdings)',
  },
  { value: 'ip', label: 'Patents, Trademarks, & Intellectual Property' },
  {
    value: 'digital_assets',
    label: 'Digital Assets (Non-Crypto) - Media, Podcasts, SaaS Licenses',
  },
];

const CreditRequestTermsDetails: React.FC<CreditRequestTermsDetailsProps> = ({
  onSubmit,
  initialData = {},
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreditRequestTermsData>({
    requestedAmount: initialData.requestedAmount || 0,
    budgetedDownPayment: initialData.budgetedDownPayment || 0,
    budgetedDownPaymentPercentage: initialData.budgetedDownPaymentPercentage || 20,
    primaryAssetClass: initialData.primaryAssetClass || '',
    secondaryCollateralizedAssets: initialData.secondaryCollateralizedAssets || [],
    financialInstrument: initialData.financialInstrument || '',
    requestedTermMonths: initialData.requestedTermMonths || 60,
    estimatedInterestRate: initialData.estimatedInterestRate || 5.99,
    paymentFrequency: initialData.paymentFrequency || 'monthly',
    balloonPayment: initialData.balloonPayment || false,
    balloonPaymentAmount: initialData.balloonPaymentAmount,
    balloonPaymentMonths: initialData.balloonPaymentMonths,
    prepaymentPenalty: initialData.prepaymentPenalty || false,
    prepaymentPenaltyTerms: initialData.prepaymentPenaltyTerms,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('');

  // Calculate down payment percentage when amount changes
  useEffect(() => {
    if (formData.requestedAmount > 0 && formData.budgetedDownPayment > 0) {
      const percentage = (formData.budgetedDownPayment / formData.requestedAmount) * 100;
      setFormData(prev => ({
        ...prev,
        budgetedDownPaymentPercentage: Number(percentage.toFixed(2)),
      }));
    }
  }, [formData.requestedAmount, formData.budgetedDownPayment]);

  // Update down payment amount when percentage changes
  const handleDownPaymentPercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percentage = parseFloat(e.target.value);
    if (!isNaN(percentage) && formData.requestedAmount > 0) {
      const amount = (percentage / 100) * formData.requestedAmount;
      setFormData(prev => ({
        ...prev,
        budgetedDownPaymentPercentage: percentage,
        budgetedDownPayment: Number(amount.toFixed(2)),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        budgetedDownPaymentPercentage: percentage || 0,
      }));
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: isChecked,
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle secondary asset selection
  const handleSecondaryAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedValues: string[] = [];

    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }

    setFormData(prev => ({
      ...prev,
      secondaryCollateralizedAssets: selectedValues,
    }));
  };

  // Handle primary asset selection
  const handlePrimaryAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAssetClass(e.target.value);
    setFormData(prev => ({
      ...prev,
      primaryAssetClass: e.target.value,
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.requestedAmount || formData.requestedAmount <= 0) {
      newErrors.requestedAmount = 'Please enter a valid amount';
    }

    if (!formData.financialInstrument) {
      newErrors.financialInstrument = 'Please select a financial instrument';
    }

    if (!formData.primaryAssetClass) {
      newErrors.primaryAssetClass = 'Please select a primary asset class';
    }

    if (formData.requestedTermMonths <= 0) {
      newErrors.requestedTermMonths = 'Please enter a valid term in months';
    }

    if (formData.balloonPayment) {
      if (!formData.balloonPaymentAmount || formData.balloonPaymentAmount <= 0) {
        newErrors.balloonPaymentAmount = 'Please enter a valid balloon payment amount';
      }

      if (!formData.balloonPaymentMonths || formData.balloonPaymentMonths <= 0) {
        newErrors.balloonPaymentMonths = 'Please enter valid balloon payment months';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Loan Request Details</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Requested Amount */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="requestedAmount"
            >
              Requested Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="requestedAmount"
                name="requestedAmount"
                value={formData.requestedAmount}
                onChange={handleChange}
                className={`w-full pl-7 pr-3 py-2 border ${errors.requestedAmount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                placeholder="0.00"
                min="0"
                step="1000"
                required
              />
            </div>
            {errors.requestedAmount && (
              <p className="mt-1 text-sm text-red-500">{errors.requestedAmount}</p>
            )}
          </div>

          {/* Financial Instrument */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="financialInstrument"
            >
              Financial Instrument <span className="text-red-500">*</span>
            </label>
            <select
              id="financialInstrument"
              name="financialInstrument"
              value={formData.financialInstrument}
              onChange={handleChange}
              className={`w-full py-2 px-3 border ${errors.financialInstrument ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              required
            >
              <option value="">Select Instrument</option>
              {financialInstruments.map(instrument => (
                <option key={instrument.value} value={instrument.value}>
                  {instrument.label}
                </option>
              ))}
            </select>
            {errors.financialInstrument && (
              <p className="mt-1 text-sm text-red-500">{errors.financialInstrument}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Budgeted Down Payment */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="budgetedDownPayment"
            >
              Budgeted Down Payment
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="budgetedDownPayment"
                name="budgetedDownPayment"
                value={formData.budgetedDownPayment}
                onChange={handleChange}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
                min="0"
                step="100"
              />
            </div>
          </div>

          {/* Budgeted Down Payment (LTV %) */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="budgetedDownPaymentPercentage"
            >
              Budgeted Down Payment (LTV %)
            </label>
            <div className="relative">
              <input
                type="number"
                id="budgetedDownPaymentPercentage"
                name="budgetedDownPaymentPercentage"
                value={formData.budgetedDownPaymentPercentage}
                onChange={handleDownPaymentPercentageChange}
                className="w-full pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g. 20"
                min="0"
                max="100"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">Loan-to-Value ratio for this request</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Primary Asset Class */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="primaryAssetClass"
            >
              Primary Asset Class <span className="text-red-500">*</span>
            </label>
            <select
              id="primaryAssetClass"
              name="primaryAssetClass"
              value={formData.primaryAssetClass}
              onChange={handlePrimaryAssetChange}
              className={`w-full py-2 px-3 border ${errors.primaryAssetClass ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              required
            >
              <option value="">Select Primary Asset</option>
              {assetClassOptions.map(asset => (
                <option key={asset.value} value={asset.value}>
                  {asset.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Main collateral for this request</p>
            {errors.primaryAssetClass && (
              <p className="mt-1 text-sm text-red-500">{errors.primaryAssetClass}</p>
            )}
          </div>

          {/* Secondary Collateralized Assets */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="secondaryCollateralizedAssets"
            >
              Secondary Collateralized Assets
            </label>
            <select
              id="secondaryCollateralizedAssets"
              name="secondaryCollateralizedAssets"
              multiple
              value={formData.secondaryCollateralizedAssets}
              onChange={handleSecondaryAssetChange}
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              size={3}
            >
              {assetClassOptions.map(asset => (
                <option key={asset.value} value={asset.value}>
                  {asset.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Select additional collateral (optional)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Requested Term */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="requestedTermMonths"
            >
              Requested Term (Months) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="requestedTermMonths"
              name="requestedTermMonths"
              value={formData.requestedTermMonths}
              onChange={handleChange}
              className={`w-full py-2 px-3 border ${errors.requestedTermMonths ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
              placeholder="e.g. 60"
              min="1"
              max="360"
              required
            />
            {errors.requestedTermMonths && (
              <p className="mt-1 text-sm text-red-500">{errors.requestedTermMonths}</p>
            )}
          </div>

          {/* Estimated Interest Rate */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="estimatedInterestRate"
            >
              Estimated Interest Rate
            </label>
            <div className="relative">
              <input
                type="number"
                id="estimatedInterestRate"
                name="estimatedInterestRate"
                value={formData.estimatedInterestRate}
                onChange={handleChange}
                className="w-full pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g. 5.99"
                min="0"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>

          {/* Payment Frequency */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="paymentFrequency"
            >
              Payment Frequency
            </label>
            <select
              id="paymentFrequency"
              name="paymentFrequency"
              value={formData.paymentFrequency}
              onChange={handleChange}
              className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semi-annual">Semi-Annual</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Balloon Payment */}
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="balloonPayment"
                name="balloonPayment"
                checked={formData.balloonPayment}
                onChange={e => setFormData(prev => ({ ...prev, balloonPayment: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="balloonPayment"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Include Balloon Payment
              </label>
            </div>

            {formData.balloonPayment && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label
                    className="block text-xs font-medium text-gray-700 mb-1"
                    htmlFor="balloonPaymentAmount"
                  >
                    Balloon Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      id="balloonPaymentAmount"
                      name="balloonPaymentAmount"
                      value={formData.balloonPaymentAmount || ''}
                      onChange={handleChange}
                      className={`w-full pl-7 pr-3 py-2 border ${errors.balloonPaymentAmount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      placeholder="0.00"
                      min="0"
                    />
                  </div>
                  {errors.balloonPaymentAmount && (
                    <p className="mt-1 text-xs text-red-500">{errors.balloonPaymentAmount}</p>
                  )}
                </div>

                <div>
                  <label
                    className="block text-xs font-medium text-gray-700 mb-1"
                    htmlFor="balloonPaymentMonths"
                  >
                    Due After (Months) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="balloonPaymentMonths"
                    name="balloonPaymentMonths"
                    value={formData.balloonPaymentMonths || ''}
                    onChange={handleChange}
                    className={`w-full py-2 px-3 border ${errors.balloonPaymentMonths ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                    placeholder="e.g. 36"
                    min="1"
                  />
                  {errors.balloonPaymentMonths && (
                    <p className="mt-1 text-xs text-red-500">{errors.balloonPaymentMonths}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Prepayment Penalty */}
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="prepaymentPenalty"
                name="prepaymentPenalty"
                checked={formData.prepaymentPenalty}
                onChange={e =>
                  setFormData(prev => ({ ...prev, prepaymentPenalty: e.target.checked }))
                }
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="prepaymentPenalty"
                className="ml-2 block text-sm font-medium text-gray-700"
              >
                Include Prepayment Penalty
              </label>
            </div>

            {formData.prepaymentPenalty && (
              <div className="pt-2">
                <label
                  className="block text-xs font-medium text-gray-700 mb-1"
                  htmlFor="prepaymentPenaltyTerms"
                >
                  Penalty Terms
                </label>
                <input
                  type="text"
                  id="prepaymentPenaltyTerms"
                  name="prepaymentPenaltyTerms"
                  value={formData.prepaymentPenaltyTerms || ''}
                  onChange={handleChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. 3-2-1 (3% year 1, 2% year 2, 1% year 3)"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Back
          </button>

          <button
            type="submit"
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreditRequestTermsDetails;
