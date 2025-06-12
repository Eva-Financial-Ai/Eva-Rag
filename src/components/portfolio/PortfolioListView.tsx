import React from 'react';
import { PortfolioSummary } from '../../types/portfolio';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

interface PortfolioListProps {
  portfolios: PortfolioSummary[];
  selectedPortfolioId?: string;
  onSelectPortfolio: (id: string) => void;
}

const PortfolioListView: React.FC<PortfolioListProps> = ({
  portfolios,
  selectedPortfolioId,
  onSelectPortfolio,
}) => {
  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow">
        <p className="text-gray-500">No portfolios found. Create a new one to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <h2 className="text-lg font-medium text-gray-900 px-6 py-4 border-b border-gray-200">
        My Portfolios
      </h2>
      <ul role="list" className="divide-y divide-gray-200">
        {portfolios.map(portfolio => (
          <li key={portfolio.id}>
            <button
              onClick={() => onSelectPortfolio(portfolio.id)}
              className={`w-full text-left block hover:bg-gray-50 transition-colors ${
                selectedPortfolioId === portfolio.id ? 'bg-primary-50' : ''
              }`}
            >
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium truncate ${
                      selectedPortfolioId === portfolio.id ? 'text-primary-700' : 'text-gray-900'
                    }`}
                  >
                    {portfolio.name}
                  </p>
                  <p
                    className={`text-xs flex items-center mt-1 ${
                      selectedPortfolioId === portfolio.id ? 'text-primary-600' : 'text-gray-500'
                    }`}
                  >
                    {portfolio.assetCount} assets • Last updated: {portfolio.lastUpdated}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                  <p
                    className={`text-lg font-semibold ${
                      selectedPortfolioId === portfolio.id ? 'text-primary-700' : 'text-gray-900'
                    }`}
                  >
                    ${portfolio.totalValue.toLocaleString()}
                  </p>
                  <ChevronRightIcon
                    className={`h-5 w-5 mt-1 ${
                      selectedPortfolioId === portfolio.id ? 'text-primary-600' : 'text-gray-400'
                    }`}
                  />
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PortfolioListView;
