import React, { useState } from 'react';
import { useUserType } from '../contexts/UserTypeContext';
import { UserType } from '../types/UserTypes';
import TopNavigation from '../components/layout/TopNavigation';
import {
  CpuChipIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface TokenizationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface AssetForTokenization {
  id: string;
  name: string;
  type: string;
  value: number;
  description: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  documents: string[];
}

const AssetTokenization: React.FC = () => {
  const { userType } = useUserType();
  const [selectedAsset, setSelectedAsset] = useState<AssetForTokenization | null>(null);
  const [tokenizationProcess, setTokenizationProcess] = useState<TokenizationStep[]>([
    {
      id: 'asset-selection',
      title: 'Asset Selection',
      description: 'Choose the asset you want to tokenize',
      completed: false,
      current: true,
    },
    {
      id: 'verification',
      title: 'Asset Verification',
      description: 'Verify asset ownership and documentation',
      completed: false,
      current: false,
    },
    {
      id: 'valuation',
      title: 'Asset Valuation',
      description: 'Professional valuation and pricing',
      completed: false,
      current: false,
    },
    {
      id: 'legal-structure',
      title: 'Legal Structure',
      description: 'Set up legal framework and compliance',
      completed: false,
      current: false,
    },
    {
      id: 'smart-contract',
      title: 'Smart Contract Creation',
      description: 'Deploy smart contract on blockchain',
      completed: false,
      current: false,
    },
    {
      id: 'token-minting',
      title: 'Token Minting',
      description: 'Mint tokens representing asset ownership',
      completed: false,
      current: false,
    },
  ]);

  const mockAssets: AssetForTokenization[] = [
    {
      id: '1',
      name: 'Downtown Office Building',
      type: 'Real Estate',
      value: 2500000,
      description: '50,000 sq ft commercial office building in downtown district',
      verificationStatus: 'verified',
      documents: ['Deed', 'Appraisal', 'Insurance', 'Legal Opinion'],
    },
    {
      id: '2',
      name: 'Art Collection - Monet Series',
      type: 'Fine Art',
      value: 850000,
      description: 'Collection of 3 Monet paintings with provenance',
      verificationStatus: 'verified',
      documents: ['Authenticity Certificate', 'Appraisal', 'Insurance'],
    },
    {
      id: '3',
      name: 'Luxury Yacht - Sea Explorer',
      type: 'Luxury Asset',
      value: 1200000,
      description: '85ft luxury yacht with full amenities',
      verificationStatus: 'pending',
      documents: ['Registration', 'Survey Report', 'Insurance'],
    },
    {
      id: '4',
      name: 'Vintage Wine Collection',
      type: 'Collectibles',
      value: 450000,
      description: 'Rare vintage wine collection from Bordeaux',
      verificationStatus: 'verified',
      documents: ['Provenance', 'Storage Records', 'Appraisal'],
    },
  ];

  const handleAssetSelection = (asset: AssetForTokenization) => {
    setSelectedAsset(asset);
    // Move to next step
    setTokenizationProcess(prev => 
      prev.map((step, index) => ({
        ...step,
        completed: index === 0,
        current: index === 1,
      }))
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'unverified': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {tokenizationProcess.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step.completed 
                ? 'bg-green-500 border-green-500' 
                : step.current 
                  ? 'bg-blue-500 border-blue-500' 
                  : 'bg-gray-200 border-gray-300'
            }`}>
              {step.completed ? (
                <CheckCircleIcon className="w-6 h-6 text-white" />
              ) : (
                <span className={`text-sm font-medium ${
                  step.current ? 'text-white' : 'text-gray-500'
                }`}>
                  {index + 1}
                </span>
              )}
            </div>
            <div className="ml-3 text-sm">
              <p className={`font-medium ${step.current ? 'text-blue-600' : step.completed ? 'text-green-600' : 'text-gray-500'}`}>
                {step.title}
              </p>
              <p className="text-gray-500">{step.description}</p>
            </div>
            {index < tokenizationProcess.length - 1 && (
              <ArrowRightIcon className="w-5 h-5 text-gray-400 mx-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAssetSelection = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Select Asset to Tokenize</h2>
        <p className="text-gray-600">Choose an asset from your portfolio to begin the tokenization process</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockAssets.map(asset => (
          <div 
            key={asset.id} 
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
            onClick={() => handleAssetSelection(asset)}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-medium text-gray-900">{asset.name}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(asset.verificationStatus)}`}>
                {asset.verificationStatus.toUpperCase()}
              </span>
            </div>
            
            <p className="text-gray-600 mb-3">{asset.description}</p>
            
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">Type: {asset.type}</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(asset.value)}</span>
            </div>
            
            <div className="border-t pt-3">
              <p className="text-sm text-gray-500 mb-1">Documents:</p>
              <div className="flex flex-wrap gap-1">
                {asset.documents.map(doc => (
                  <span key={doc} className="px-2 py-1 bg-gray-100 text-xs rounded">
                    {doc}
                  </span>
                ))}
              </div>
            </div>
            
            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              Select for Tokenization
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSelectedAssetDetails = () => {
    if (!selectedAsset) return null;

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Selected Asset</h2>
          <button 
            onClick={() => setSelectedAsset(null)}
            className="text-blue-600 hover:text-blue-800"
          >
            Change Selection
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedAsset.name}</h3>
            <p className="text-gray-600 mb-4">{selectedAsset.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium">{selectedAsset.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Value:</span>
                <span className="font-medium">{formatCurrency(selectedAsset.value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedAsset.verificationStatus)}`}>
                  {selectedAsset.verificationStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Tokenization Benefits</h4>
            <ul className="space-y-2">
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                Fractional ownership opportunities
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                Enhanced liquidity
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                Transparent ownership records
              </li>
              <li className="flex items-center text-sm text-gray-600">
                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                Global market access
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderInfoSection = () => (
    <div className="bg-blue-50 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <InformationCircleIcon className="w-6 h-6 text-blue-600 mr-3 mt-1" />
        <div>
          <h3 className="text-lg font-medium text-blue-900 mb-2">Asset Tokenization</h3>
          <p className="text-blue-800 mb-4">
            Transform your physical and digital assets into blockchain-based tokens, enabling fractional ownership, 
            enhanced liquidity, and transparent trading on decentralized markets.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <CpuChipIcon className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">Blockchain Security</span>
            </div>
            <div className="flex items-center">
              <ShieldCheckIcon className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">Verified Ownership</span>
            </div>
            <div className="flex items-center">
              <DocumentTextIcon className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm text-blue-800">Legal Compliance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <TopNavigation title="Asset Tokenization" />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Asset Tokenization</h1>
            <p className="text-gray-600">Convert your assets into blockchain tokens for enhanced liquidity and ownership management</p>
          </div>
          <div className="flex items-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Beta
            </span>
          </div>
        </div>
      </div>

      {renderInfoSection()}
      {renderProgressBar()}
      {renderSelectedAssetDetails()}
      
      {!selectedAsset ? (
        renderAssetSelection()
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Next Steps</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800 mb-2">Asset Verification Required</h3>
                <p className="text-yellow-700 mb-4">
                  Before proceeding with tokenization, we need to complete the asset verification process. 
                  This includes document review, ownership confirmation, and compliance checks.
                </p>
                <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                  Start Verification Process
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetTokenization; 