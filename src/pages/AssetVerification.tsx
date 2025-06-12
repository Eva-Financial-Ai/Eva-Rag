import React, { useState } from 'react';
import { useUserType } from '../contexts/UserTypeContext';
import { UserType } from '../types/UserTypes';
import TopNavigation from '../components/layout/TopNavigation';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CameraIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';

interface VerificationDocument {
  id: string;
  name: string;
  type: 'ownership' | 'identity' | 'valuation' | 'legal' | 'financial';
  status: 'uploaded' | 'verified' | 'rejected' | 'pending';
  uploadDate: string;
  fileSize: string;
  fileName: string;
}

interface AssetVerificationItem {
  id: string;
  name: string;
  type: string;
  value: number;
  submissionDate: string;
  status: 'pending' | 'in-review' | 'verified' | 'rejected';
  verificationScore: number;
  documents: VerificationDocument[];
  blockchain?: {
    address: string;
    network: string;
    verified: boolean;
  };
}

const AssetVerification: React.FC = () => {
  const { userType } = useUserType();
  const [activeTab, setActiveTab] = useState<'submit' | 'track' | 'verified'>('submit');
  const [selectedAsset, setSelectedAsset] = useState<AssetVerificationItem | null>(null);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const mockAssets: AssetVerificationItem[] = [
    {
      id: '1',
      name: 'Downtown Office Building',
      type: 'Real Estate',
      value: 2500000,
      submissionDate: '2024-12-01',
      status: 'verified',
      verificationScore: 95,
      documents: [
        {
          id: 'd1',
          name: 'Property Deed',
          type: 'ownership',
          status: 'verified',
          uploadDate: '2024-12-01',
          fileSize: '2.4 MB',
          fileName: 'property_deed.pdf',
        },
        {
          id: 'd2',
          name: 'Professional Appraisal',
          type: 'valuation',
          status: 'verified',
          uploadDate: '2024-12-01',
          fileSize: '1.8 MB',
          fileName: 'appraisal_report.pdf',
        },
      ],
      blockchain: {
        address: '0x1234...abcd',
        network: 'Ethereum',
        verified: true,
      },
    },
    {
      id: '2',
      name: 'Art Collection - Van Gogh',
      type: 'Fine Art',
      value: 1200000,
      submissionDate: '2024-12-15',
      status: 'in-review',
      verificationScore: 78,
      documents: [
        {
          id: 'd3',
          name: 'Authenticity Certificate',
          type: 'ownership',
          status: 'verified',
          uploadDate: '2024-12-15',
          fileSize: '3.1 MB',
          fileName: 'authenticity_cert.pdf',
        },
        {
          id: 'd4',
          name: 'Provenance Documentation',
          type: 'legal',
          status: 'pending',
          uploadDate: '2024-12-15',
          fileSize: '2.7 MB',
          fileName: 'provenance.pdf',
        },
      ],
    },
    {
      id: '3',
      name: 'Classic Ferrari 250 GTO',
      type: 'Luxury Vehicle',
      value: 850000,
      submissionDate: '2024-12-20',
      status: 'pending',
      verificationScore: 45,
      documents: [
        {
          id: 'd5',
          name: 'Vehicle Title',
          type: 'ownership',
          status: 'uploaded',
          uploadDate: '2024-12-20',
          fileSize: '1.2 MB',
          fileName: 'vehicle_title.pdf',
        },
      ],
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'in-review': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'in-review': return <ClockIcon className="w-5 h-5 text-blue-600" />;
      case 'pending': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'rejected': return <XCircleIcon className="w-5 h-5 text-red-600" />;
      default: return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderSubmitTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Asset for Verification</h2>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-blue-900 mb-2">Verification Process</h3>
              <p className="text-blue-800 mb-3">
                Our comprehensive verification process ensures the authenticity, ownership, and value of your assets 
                through advanced AI analysis, expert review, and blockchain technology.
              </p>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Document authenticity verification using AI</li>
                <li>• Expert review by certified professionals</li>
                <li>• Blockchain-based ownership records</li>
                <li>• Real-time verification status updates</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asset Name</label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter asset name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="">Select asset type</option>
              <option value="real-estate">Real Estate</option>
              <option value="fine-art">Fine Art</option>
              <option value="luxury-goods">Luxury Goods</option>
              <option value="vehicles">Vehicles</option>
              <option value="equipment">Equipment</option>
              <option value="intellectual-property">Intellectual Property</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Value</label>
            <input
              type="number"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter estimated value"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Asset Description</label>
          <textarea
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Provide detailed description of the asset"
          />
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documentation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-sm font-medium text-gray-900 mb-1">Ownership Documents</h4>
              <p className="text-xs text-gray-500">Deed, Title, Certificate of Ownership</p>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-sm font-medium text-gray-900 mb-1">Visual Documentation</h4>
              <p className="text-xs text-gray-500">High-resolution photos, 360° views</p>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-sm font-medium text-gray-900 mb-1">Valuation Reports</h4>
              <p className="text-xs text-gray-500">Professional appraisal, market analysis</p>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <QrCodeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-sm font-medium text-gray-900 mb-1">Authenticity Proof</h4>
              <p className="text-xs text-gray-500">Certificates, provenance, blockchain records</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Submit for Verification
          </button>
        </div>
      </div>
    </div>
  );

  const renderTrackTab = () => (
    <div className="space-y-6">
      {mockAssets.filter(asset => asset.status !== 'verified').map(asset => (
        <div key={asset.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {getStatusIcon(asset.status)}
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">{asset.name}</h3>
                <p className="text-sm text-gray-500">{asset.type} • Submitted {asset.submissionDate}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                {asset.status.toUpperCase()}
              </span>
              <p className="text-sm text-gray-500 mt-1">{formatCurrency(asset.value)}</p>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Verification Score</span>
              <span className={`text-sm font-bold ${getScoreColor(asset.verificationScore)}`}>
                {asset.verificationScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  asset.verificationScore >= 90 ? 'bg-green-500' :
                  asset.verificationScore >= 70 ? 'bg-blue-500' :
                  asset.verificationScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${asset.verificationScore}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Documents Status</h4>
              <div className="space-y-2">
                {asset.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{doc.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => setSelectedAsset(asset)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
              <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                Upload Additional Documents
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderVerifiedTab = () => (
    <div className="space-y-6">
      {mockAssets.filter(asset => asset.status === 'verified').map(asset => (
        <div key={asset.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">{asset.name}</h3>
                <p className="text-sm text-gray-500">{asset.type} • Verified</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                VERIFIED
              </span>
              <p className="text-sm text-gray-500 mt-1">{formatCurrency(asset.value)}</p>
            </div>
          </div>

          {asset.blockchain && (
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <div className="flex items-center mb-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Blockchain Verified</span>
              </div>
              <div className="text-sm text-green-700">
                <p>Network: {asset.blockchain.network}</p>
                <p>Address: {asset.blockchain.address}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              View Certificate
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
              Download Records
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
              Share Verification
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <TopNavigation title="Asset Verification" />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Asset Verification</h1>
            <p className="text-gray-600">Verify the authenticity and ownership of your assets with blockchain security</p>
          </div>
          <div className="flex items-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Beta
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('submit')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'submit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Submit for Verification
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'track'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Track Progress
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'verified'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Verified Assets
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'submit' && renderSubmitTab()}
      {activeTab === 'track' && renderTrackTab()}
      {activeTab === 'verified' && renderVerifiedTab()}
    </div>
  );
};

export default AssetVerification; 