import React, { useState, useEffect } from 'react';
import {
  Portfolio,
  PortfolioSummary,
  PortfolioAsset,
  PortfolioAssetType,
} from '../types/portfolio';
import { PlusIcon, DocumentChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import PortfolioListView from '../components/portfolio/PortfolioListView';

// Mock data (can be moved to a separate file later)
const mockPortfolioSummaries: PortfolioSummary[] = [
  {
    id: '1',
    name: 'My Equipment Portfolio',
    totalValue: 1250000,
    assetCount: 5,
    lastUpdated: '2025-05-28',
  },
  {
    id: '2',
    name: 'Real Estate Holdings',
    totalValue: 3500000,
    assetCount: 2,
    lastUpdated: '2025-05-25',
  },
  { id: '3', name: 'Vehicle Fleet', totalValue: 450000, assetCount: 12, lastUpdated: '2025-05-29' },
];

const mockPortfolios: Record<string, Portfolio> = {
  '1': {
    id: '1',
    userId: 'user123',
    name: 'My Equipment Portfolio',
    totalValue: 1250000,
    assets: [
      {
        id: 'a1',
        name: 'Excavator X100',
        type: PortfolioAssetType.EQUIPMENT,
        value: 350000,
        purchaseDate: '2023-01-15',
      },
      {
        id: 'a2',
        name: 'Crane Y20',
        type: PortfolioAssetType.EQUIPMENT,
        value: 500000,
        purchaseDate: '2022-06-01',
      },
      {
        id: 'a3',
        name: 'Loader Z5',
        type: PortfolioAssetType.EQUIPMENT,
        value: 150000,
        purchaseDate: '2023-05-10',
      },
      {
        id: 'a4',
        name: 'Truck T300',
        type: PortfolioAssetType.VEHICLE,
        value: 80000,
        purchaseDate: '2023-03-20',
      },
      {
        id: 'a5',
        name: 'Generator G70',
        type: PortfolioAssetType.EQUIPMENT,
        value: 170000,
        purchaseDate: '2022-11-05',
      },
    ],
    createdAt: '2023-01-01',
    updatedAt: '2025-05-28',
    description: 'Heavy machinery and vehicles for construction projects.',
  },
  '2': {
    id: '2',
    userId: 'user123',
    name: 'Real Estate Holdings',
    totalValue: 3500000,
    assets: [
      {
        id: 'r1',
        name: 'Downtown Office Building',
        type: PortfolioAssetType.REAL_ESTATE,
        value: 2800000,
        purchaseDate: '2020-07-10',
      },
      {
        id: 'r2',
        name: 'Suburban Warehouse',
        type: PortfolioAssetType.REAL_ESTATE,
        value: 700000,
        purchaseDate: '2021-11-20',
      },
    ],
    createdAt: '2020-07-01',
    updatedAt: '2025-05-25',
    description: 'Commercial real estate properties.',
  },
  '3': {
    id: '3',
    userId: 'user123',
    name: 'Vehicle Fleet',
    totalValue: 450000,
    assets: [
      {
        id: 'v1',
        name: 'Delivery Van #1',
        type: PortfolioAssetType.VEHICLE,
        value: 35000,
        purchaseDate: '2024-01-10',
      },
      {
        id: 'v2',
        name: 'Delivery Van #2',
        type: PortfolioAssetType.VEHICLE,
        value: 35000,
        purchaseDate: '2024-01-10',
      },
      // ... more vehicles
    ],
    createdAt: '2024-01-01',
    updatedAt: '2025-05-29',
    description: 'Fleet of vehicles for delivery operations.',
  },
};

const PortfolioDashboard: React.FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioSummary[]>(mockPortfolioSummaries);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(
    mockPortfolioSummaries[0]?.id || null
  );
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedPortfolioId) {
      // Simulate API call
      setIsLoading(true);
      setTimeout(() => {
        setSelectedPortfolio(mockPortfolios[selectedPortfolioId] || null);
        setIsLoading(false);
      }, 300);
    } else {
      setSelectedPortfolio(null);
    }
  }, [selectedPortfolioId]);

  const handleSelectPortfolio = (portfolioId: string) => {
    setSelectedPortfolioId(portfolioId);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Portfolio Navigator</h1>
          <button
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
            // onClick={() => {/* Open create portfolio modal */}}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Portfolio
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PortfolioListView
            portfolios={portfolios}
            selectedPortfolioId={selectedPortfolioId || undefined}
            onSelectPortfolio={handleSelectPortfolio}
          />
        </div>

        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="text-center p-10 bg-white rounded-lg shadow">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading portfolio details...</p>
            </div>
          ) : selectedPortfolio ? (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-700 mb-1">{selectedPortfolio.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{selectedPortfolio.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <CurrencyDollarIcon className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-sm text-blue-700">Total Value</p>
                  <p className="text-2xl font-bold text-blue-900">
                    ${selectedPortfolio.totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <DocumentChartBarIcon className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-sm text-green-700">Number of Assets</p>
                  <p className="text-2xl font-bold text-green-900">
                    {selectedPortfolio.assets.length}
                  </p>
                </div>
                {/* Add more summary cards here (e.g., Overall Return, Last Update) */}
              </div>

              <h3 className="text-lg font-semibold text-gray-700 mb-3">Assets</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {selectedPortfolio.assets.map(asset => (
                  <div
                    key={asset.id}
                    className="bg-gray-50 p-3 rounded-md shadow-sm flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{asset.name}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        Type: {asset.type} - Purchased: {asset.purchaseDate}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">
                      ${asset.value.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-10 bg-white rounded-lg shadow">
              <DocumentChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">No Portfolio Selected</h3>
              <p className="text-gray-500">
                Please select a portfolio from the list to view its details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioDashboard;
