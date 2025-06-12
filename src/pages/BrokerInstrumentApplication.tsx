/**
 * Broker Instrument Application Page
 * Allows brokers to apply for access to specific lender instruments
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { useUserPermissions } from '../hooks/useUserPermissions';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  BuildingOffice2Icon,
  UserIcon,
  EnvelopeIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface BrokerApplicationForm {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  website?: string;
  yearsInBusiness: number;
  annualVolume: number;
  licenses: string[];
  references: {
    name: string;
    company: string;
    phone: string;
    relationship: string;
  }[];
  businessDescription: string;
  experienceDescription: string;
}

const BrokerInstrumentApplication: React.FC = () => {
  const { instrumentId } = useParams<{ instrumentId: string }>();
  const navigate = useNavigate();
  const { getBaseUserType, currentRole } = useUserPermissions();
  const [userType, setUserType] = useState<'broker' | 'lender'>('broker');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<BrokerApplicationForm>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    yearsInBusiness: 0,
    annualVolume: 0,
    licenses: [],
    references: [
      { name: '', company: '', phone: '', relationship: '' },
      { name: '', company: '', phone: '', relationship: '' },
      { name: '', company: '', phone: '', relationship: '' },
    ],
    businessDescription: '',
    experienceDescription: '',
  });

  // Mock instrument data
  const instrumentData = {
    id: instrumentId,
    lenderName: 'Capital Equipment Finance',
    instrumentName: 'Commercial Equipment Financing',
    requirements: {
      minimumVolume: 2000000,
      yearsInBusiness: 3,
      requiredLicenses: ['NMLS'],
    },
  };

  useEffect(() => {
    const baseType = getBaseUserType(currentRole);
    if (baseType !== 'broker') {
      navigate('/dashboard');
      return;
    }
    setUserType(baseType as 'broker');
  }, [currentRole, navigate, getBaseUserType]);

  const handleInputChange = (
    field: keyof BrokerApplicationForm,
    value: string | number | string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReferenceChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => (i === index ? { ...ref, [field]: value } : ref)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitted(true);
    } catch (error) {
      console.error('Application submission failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (submitted) {
    return (
      <PageLayout title="Application Submitted">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Application Submitted</h2>
            <p className="mt-2 text-gray-600">
              Your application to access {instrumentData.instrumentName} from{' '}
              {instrumentData.lenderName} has been submitted successfully.
            </p>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900">What happens next?</h3>
              <ul className="mt-2 text-sm text-blue-800 space-y-1">
                <li>• Your application will be reviewed within 5-7 business days</li>
                <li>• You'll receive an email notification with the decision</li>
                <li>• If approved, you'll gain access to submit deals to this instrument</li>
                <li>• If additional information is needed, we'll contact you directly</li>
              </ul>
            </div>
            <div className="mt-6 flex space-x-4 justify-center">
              <button
                onClick={() => navigate('/instrument-profile-manager')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Instruments
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Broker Application">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Broker Application</h1>
              <p className="mt-2 text-lg text-gray-600">{instrumentData.instrumentName}</p>
              <p className="text-sm text-gray-500">{instrumentData.lenderName}</p>
            </div>
          </div>

          {/* Requirements Overview */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-900">
                  Minimum Requirements for this Instrument
                </h3>
                <div className="mt-2 text-sm text-yellow-800 space-y-1">
                  <p>
                    • Minimum annual volume:{' '}
                    {formatCurrency(instrumentData.requirements.minimumVolume)}
                  </p>
                  <p>• Years in business: {instrumentData.requirements.yearsInBusiness}+ years</p>
                  <p>
                    • Required licenses: {instrumentData.requirements.requiredLicenses.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BuildingOffice2Icon className="h-6 w-6 mr-2 text-blue-600" />
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={e => handleInputChange('companyName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={e => handleInputChange('contactPerson', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={e => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years in Business *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.yearsInBusiness}
                  onChange={e => handleInputChange('yearsInBusiness', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Volume (USD) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.annualVolume}
                  onChange={e => handleInputChange('annualVolume', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Business References */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <UserIcon className="h-6 w-6 mr-2 text-blue-600" />
              Business References
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Please provide at least 3 business references that can verify your experience and
              track record.
            </p>
            {formData.references.map((reference, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reference {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={reference.name}
                      onChange={e => handleReferenceChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={reference.company}
                      onChange={e => handleReferenceChange(index, 'company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={reference.phone}
                      onChange={e => handleReferenceChange(index, 'phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship *
                    </label>
                    <select
                      required
                      value={reference.relationship}
                      onChange={e => handleReferenceChange(index, 'relationship', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select relationship</option>
                      <option value="client">Client</option>
                      <option value="vendor">Vendor</option>
                      <option value="partner">Partner</option>
                      <option value="lender">Lender</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <DocumentTextIcon className="h-6 w-6 mr-2 text-blue-600" />
              Additional Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.businessDescription}
                  onChange={e => handleInputChange('businessDescription', e.target.value)}
                  placeholder="Describe your business, target markets, and typical deal sizes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Financing Experience *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.experienceDescription}
                  onChange={e => handleInputChange('experienceDescription', e.target.value)}
                  placeholder="Describe your experience with equipment financing, including years of experience and types of deals you typically handle..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default BrokerInstrumentApplication;
