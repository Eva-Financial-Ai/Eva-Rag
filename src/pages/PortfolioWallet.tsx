import React from 'react';
import { useUserPermissions } from '../hooks/useUserPermissions';
import PortfolioDashboard from '../components/portfolio/PortfolioDashboard';

const PortfolioWallet: React.FC = () => {
  const { currentRole } = useUserPermissions();

  return (
    <div className="container mx-auto px-4 py-6">
      <PortfolioDashboard userRole={currentRole} />
    </div>
  );
};

export default PortfolioWallet;
